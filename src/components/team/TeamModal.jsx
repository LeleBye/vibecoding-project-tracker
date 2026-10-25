import { useState, useRef, useEffect } from 'react';
import AssigneeBadge from '../tasks/AssigneeBadge.jsx';

/**
 * Team Management Modal (FR07, FR08).
 * Allows viewing team members, adding new members with Name and Email,
 * editing existing members, and removing members with double-click confirmation.
 */
export default function TeamModal({
  isOpen,
  team,
  tasks = [],
  onAddTeammate,
  onUpdateTeammate,
  onRemoveTeammate,
  onClose,
  onToast,
}) {
  // Add member form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const nameInputRef = useRef(null);

  // Edit member state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editErrors, setEditErrors] = useState({});
  const editNameInputRef = useRef(null);

  // Double-click delete confirmation state (matches TaskModal)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Focus name input when modal opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isOpen]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingId && editNameInputRef.current) {
      editNameInputRef.current.focus();
    }
  }, [editingId]);

  // Escape key to close or cancel edit
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (editingId) {
          setEditingId(null);
          setEditErrors({});
        } else if (confirmDeleteId) {
          setConfirmDeleteId(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, editingId, confirmDeleteId, onClose]);

  if (!isOpen) return null;

  const validateNew = () => {
    const errs = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      errs.name = 'Name is required.';
    } else if (team.some((m) => m.name.toLowerCase() === trimmedName.toLowerCase())) {
      errs.name = 'A team member with this name already exists.';
    }

    if (!trimmedEmail) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Enter a valid email address (e.g. name@example.com).';
    } else if (team.some((m) => m.email?.toLowerCase() === trimmedEmail.toLowerCase())) {
      errs.email = 'A team member with this email already exists.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!validateNew()) return;

    const newMember = {
      id: `tm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };

    onAddTeammate(newMember);
    onToast(`Added ${newMember.name} to the team!`, 'success');
    setName('');
    setEmail('');
    setErrors({});
  };

  const getTaskCountForMember = (memberName) => {
    return tasks.filter((t) => t.assignee === memberName).length;
  };

  const handleDelete = (member) => {
    if (team.length <= 1) {
      onToast('The team must have at least one member.', 'default');
      return;
    }
    // First click: prompt double-click verification (matches TaskModal confirm delete)
    if (confirmDeleteId !== member.id) {
      setConfirmDeleteId(member.id);
      return;
    }
    // Second click: execute deletion
    setConfirmDeleteId(null);
    onRemoveTeammate(member.id);
    onToast(`Removed ${member.name} from the team.`, 'default');
  };

  const handleStartEdit = (member) => {
    setEditingId(member.id);
    setEditName(member.name);
    setEditEmail(member.email || '');
    setEditErrors({});
    setConfirmDeleteId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditErrors({});
  };

  const validateEdit = (currentMemberId) => {
    const errs = {};
    const trimmedName = editName.trim();
    const trimmedEmail = editEmail.trim();

    if (!trimmedName) {
      errs.name = 'Name is required.';
    } else if (
      team.some(
        (m) => m.id !== currentMemberId && m.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      errs.name = 'A team member with this name already exists.';
    }

    if (!trimmedEmail) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Enter a valid email address.';
    } else if (
      team.some(
        (m) => m.id !== currentMemberId && m.email?.toLowerCase() === trimmedEmail.toLowerCase()
      )
    ) {
      errs.email = 'A team member with this email already exists.';
    }

    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveEdit = (member) => {
    if (!validateEdit(member.id)) return;

    const updatedMember = {
      ...member,
      name: editName.trim(),
      email: editEmail.trim().toLowerCase(),
    };

    onUpdateTeammate(member, updatedMember);
    onToast(`Updated ${updatedMember.name}.`, 'success');
    setEditingId(null);
    setEditErrors({});
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[1000] bg-text-primary/65"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Manage Team Members"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] w-[90%] max-w-[640px] max-h-[90vh] overflow-y-auto bg-surface-page border-[3px] border-text-primary shadow-neu-lg rounded flex flex-col"
      >
        {/* Header */}
        <div className="bg-text-primary text-surface-page px-5 py-[14px] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-xl">👥</span>
            <span className="font-heading text-[16px] tracking-[0.5px]">
              TEAM MEMBERS ({team.length})
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close team modal"
            className="neu-icon-button border-2 border-surface-page text-surface-page bg-transparent w-8 h-8"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 space-y-6">
          {/* Add Member Form */}
          <section className="rounded border-[3px] border-text-primary bg-white p-4 shadow-neu-sm">
            <h3 className="font-heading text-[13px] tracking-[0.5px] uppercase text-text-primary mb-3">
              + Add New Teammate
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="team-name-input" className="neu-label">
                    Full Name <span aria-hidden="true" className="text-brand-primary">*</span>
                  </label>
                  <input
                    id="team-name-input"
                    ref={nameInputRef}
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                    }}
                    placeholder="e.g. Maya Lin"
                    className={`neu-input w-full ${errors.name ? 'border-type-bug' : ''}`}
                  />
                  {errors.name && (
                    <p role="alert" className="text-type-bug text-[11px] mt-1 font-body">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="team-email-input" className="neu-label">
                    Email Address <span aria-hidden="true" className="text-brand-primary">*</span>
                  </label>
                  <input
                    id="team-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                    }}
                    placeholder="e.g. maya@example.com"
                    className={`neu-input w-full ${errors.email ? 'border-type-bug' : ''}`}
                  />
                  {errors.email && (
                    <p role="alert" className="text-type-bug text-[11px] mt-1 font-body">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="font-heading text-[12px] tracking-[0.5px] bg-brand-primary text-white border-[2px] border-text-primary shadow-neu-sm rounded px-4 py-2 cursor-pointer transition-[transform,box-shadow] duration-[80ms] active:translate-x-px active:translate-y-px"
                >
                  + Add Teammate
                </button>
              </div>
            </form>
          </section>

          {/* Current Team Roster */}
          <section>
            <h3 className="font-heading text-[13px] tracking-[0.5px] uppercase text-text-primary mb-3">
              Current Roster
            </h3>
            <div className="space-y-2">
              {team.map((member) => {
                const count = getTaskCountForMember(member.name);
                const isOnlyMember = team.length <= 1;
                const isEditing = editingId === member.id;
                const isConfirmingDelete = confirmDeleteId === member.id;

                if (isEditing) {
                  return (
                    <div
                      key={member.id || member.name}
                      className="p-3.5 rounded border-2 border-text-primary bg-[#FBF9F5] shadow-neu-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-[12px] tracking-[0.5px] uppercase text-text-primary">
                          Edit Teammate
                        </span>
                        <span className="font-mono text-[11px] text-text-muted">
                          {count} assigned task{count !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor={`edit-name-${member.id}`} className="neu-label text-[11px]">
                            Full Name <span aria-hidden="true" className="text-brand-primary">*</span>
                          </label>
                          <input
                            id={`edit-name-${member.id}`}
                            ref={editNameInputRef}
                            type="text"
                            value={editName}
                            onChange={(e) => {
                              setEditName(e.target.value);
                              if (editErrors.name) setEditErrors((prev) => ({ ...prev, name: null }));
                            }}
                            className={`neu-input w-full text-[13px] py-1.5 ${editErrors.name ? 'border-type-bug' : ''}`}
                          />
                          {editErrors.name && (
                            <p role="alert" className="text-type-bug text-[10px] mt-1 font-body">
                              {editErrors.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor={`edit-email-${member.id}`} className="neu-label text-[11px]">
                            Email Address <span aria-hidden="true" className="text-brand-primary">*</span>
                          </label>
                          <input
                            id={`edit-email-${member.id}`}
                            type="email"
                            value={editEmail}
                            onChange={(e) => {
                              setEditEmail(e.target.value);
                              if (editErrors.email) setEditErrors((prev) => ({ ...prev, email: null }));
                            }}
                            className={`neu-input w-full text-[13px] py-1.5 ${editErrors.email ? 'border-type-bug' : ''}`}
                          />
                          {editErrors.email && (
                            <p role="alert" className="text-type-bug text-[10px] mt-1 font-body">
                              {editErrors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="neu-button bg-white text-text-primary text-[12px] font-bold px-3 py-1.5"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(member)}
                          className="font-heading text-[12px] tracking-[0.5px] bg-brand-primary text-white border-[2px] border-text-primary shadow-neu-sm rounded px-3.5 py-1.5 cursor-pointer active:translate-x-px active:translate-y-px"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={member.id || member.name}
                    className="flex items-center justify-between gap-3 p-3 rounded border-2 border-text-primary bg-white shadow-neu-sm transition-[border-color,background-color] duration-150"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AssigneeBadge name={member.name} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-body font-bold text-[14px] text-text-primary truncate">
                            {member.name}
                          </p>
                          <span className="font-mono text-[11px] font-bold px-2 py-[1px] rounded bg-[#F0EDE5] border border-text-primary text-text-muted shrink-0">
                            {count} task{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="font-mono text-[12px] text-text-muted truncate">
                          {member.email || 'No email registered'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(member)}
                        aria-label={`Edit ${member.name}`}
                        className="neu-button text-[12px] font-bold px-2.5 py-1 text-text-primary bg-white"
                      >
                        ✎ Edit
                      </button>

                      {/* Remove Button with Double-Click Verification */}
                      <button
                        type="button"
                        disabled={isOnlyMember}
                        onClick={() => handleDelete(member)}
                        title={isOnlyMember ? 'Cannot remove the only team member' : `Delete ${member.name}`}
                        className={`neu-button text-[12px] font-bold px-2.5 py-1 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
                          isConfirmingDelete ? 'bg-type-bug text-text-primary' : 'bg-white text-text-primary'
                        }`}
                      >
                        {isConfirmingDelete ? '⚠ Confirm Delete' : '✕ Delete'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t-[3px] border-text-primary bg-surface-page flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="neu-button bg-white text-text-primary font-body font-bold text-[13px] px-5 py-2"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
