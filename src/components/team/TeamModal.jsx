import { useState, useRef, useEffect } from 'react';
import AssigneeBadge from '../tasks/AssigneeBadge.jsx';
import { isDesktopViewport } from '../../utils/viewport.js';

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

  // Focus name input when modal opens (desktop only — on phones it would pop the keyboard over the roster)
  useEffect(() => {
    if (isOpen && nameInputRef.current && isDesktopViewport()) {
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
        className="neu-sheet md:max-w-[660px]"
      >
        {/* Header */}
        <div className="neu-sheet-header bg-text-primary text-surface-page px-4 pb-4 flex items-center justify-between border-b-[3px] border-text-primary md:px-6">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="font-mono text-brand-primary text-lg font-bold">●</span>
            <span className="font-heading text-[16px] tracking-[0.5px] uppercase">
              TEAM MEMBERS
            </span>
            <span className="font-mono text-[11px] font-bold px-2 py-[1px] rounded border border-surface-page bg-surface-page text-text-primary">
              {team.length}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close team modal"
            className="neu-sheet-close border-surface-page text-surface-page bg-transparent hover:bg-surface-page hover:text-text-primary transition-[transform,box-shadow,background-color,color] duration-[80ms] hover:shadow-[2px_2px_0_0_#FFF8E8]"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="neu-sheet-body p-4 space-y-6 md:p-6">
          {/* Add Member Form */}
          <section className="rounded border-[3px] border-text-primary bg-white p-4 shadow-neu md:p-5">
            <h3 className="font-heading text-[13px] tracking-[0.5px] uppercase text-text-primary mb-3.5 flex items-center gap-1.5">
              <span className="text-brand-primary font-bold">+</span> ADD NEW TEAMMATE
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                    className={`neu-input w-full py-2 ${errors.name ? 'border-type-bug' : ''}`}
                  />
                  {errors.name && (
                    <p role="alert" className="text-type-bug text-[11px] mt-1 font-body font-bold">
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
                    className={`neu-input w-full py-2 ${errors.email ? 'border-type-bug' : ''}`}
                  />
                  {errors.email && (
                    <p role="alert" className="text-type-bug text-[11px] mt-1 font-body font-bold">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="w-full font-heading text-[12px] tracking-[0.5px] uppercase bg-brand-primary text-white border-[3px] border-text-primary shadow-neu rounded px-5 py-3 cursor-pointer transition-[transform,box-shadow] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-neu-sm sm:w-auto sm:py-2.5"
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
                      className="p-4 rounded border-[3px] border-text-primary bg-[#FBF9F5] shadow-neu space-y-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-[13px] tracking-[0.5px] uppercase text-text-primary">
                          EDIT TEAMMATE
                        </span>
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-text-primary bg-white text-text-muted">
                          {count} assigned task{count !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                            className={`neu-input w-full text-[13px] py-2 ${editErrors.name ? 'border-type-bug' : ''}`}
                          />
                          {editErrors.name && (
                            <p role="alert" className="text-type-bug text-[10px] mt-1 font-body font-bold">
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
                            className={`neu-input w-full text-[13px] py-2 ${editErrors.email ? 'border-type-bug' : ''}`}
                          />
                          {editErrors.email && (
                            <p role="alert" className="text-type-bug text-[10px] mt-1 font-body font-bold">
                              {editErrors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="font-heading text-[12px] tracking-[0.5px] uppercase px-4 py-2 rounded border-[3px] border-text-primary bg-white text-text-primary shadow-neu-sm transition-[transform,box-shadow] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(member)}
                          className="font-heading text-[12px] tracking-[0.5px] uppercase px-4 py-2 rounded border-[3px] border-text-primary bg-brand-primary text-white shadow-neu-sm transition-[transform,box-shadow] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
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
                    className="flex flex-col items-stretch gap-3 p-4 rounded border-[3px] border-text-primary bg-white shadow-neu transition-[border-color,background-color] duration-150 hover:bg-[#FBF9F5] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AssigneeBadge name={member.name} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-body font-bold text-[14px] text-text-primary truncate">
                            {member.name}
                          </p>
                          <span className="font-mono text-[11px] font-bold px-2 py-[2px] rounded bg-[#F0EDE5] border-2 border-text-primary text-text-muted shrink-0">
                            {count} task{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="font-mono text-[12px] text-text-muted truncate mt-0.5">
                          {member.email || 'No email registered'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 shrink-0 sm:flex sm:items-center">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(member)}
                        aria-label={`Edit ${member.name}`}
                        className="min-h-[40px] font-heading text-[12px] tracking-[0.5px] uppercase px-3.5 py-1.5 rounded border-[3px] border-text-primary bg-surface-card text-text-primary shadow-neu-sm transition-[transform,box-shadow] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu active:translate-x-[1px] active:translate-y-[1px] cursor-pointer sm:min-h-0"
                      >
                        Edit
                      </button>

                      {/* Remove Button with Double-Click Verification */}
                      <button
                        type="button"
                        disabled={isOnlyMember}
                        onClick={() => handleDelete(member)}
                        title={isOnlyMember ? 'Cannot remove the only team member' : `Delete ${member.name}`}
                        className={`min-h-[40px] font-heading text-[12px] tracking-[0.5px] uppercase px-3 py-1.5 rounded border-[3px] border-text-primary shadow-neu-sm transition-[transform,box-shadow,background-color] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-neu-sm sm:min-h-0 ${
                          isConfirmingDelete ? 'bg-type-bug text-text-primary' : 'bg-white text-text-primary hover:bg-type-bug hover:text-white'
                        }`}
                      >
                        {isConfirmingDelete ? '! Confirm Delete' : '✕ Delete'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="neu-sheet-footer px-4 pt-4 border-t-[3px] border-text-primary bg-surface-page flex justify-end md:px-6">
          <button
            onClick={onClose}
            className="w-full font-heading text-[13px] tracking-[0.5px] uppercase bg-white text-text-primary border-[3px] border-text-primary shadow-neu rounded px-6 py-3 cursor-pointer transition-[transform,box-shadow] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-neu-sm sm:w-auto sm:py-2.5"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
