import { useState, useRef, useEffect } from 'react';

/**
 * Modal to delete a project board with GitHub-style verification.
 * Requires typing the exact project name to confirm deletion.
 */
export default function DeleteProjectModal({
  isOpen,
  projects = [],
  activeProjectId,
  onConfirmDelete,
  onClose,
  activeTasksCount = 0,
}) {
  const [selectedId, setSelectedId] = useState(activeProjectId);
  const [confirmationInput, setConfirmationInput] = useState('');
  const inputRef = useRef(null);

  // Sync selectedId when modal opens with activeProjectId
  useEffect(() => {
    if (isOpen) {
      setSelectedId(activeProjectId);
      setConfirmationInput('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, activeProjectId]);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const targetProject = projects.find((p) => p.id === selectedId) || projects[0];
  const isSingleProject = projects.length <= 1;

  // Calculate task count for target project
  const getTaskCount = () => {
    if (!targetProject) return 0;
    if (targetProject.id === activeProjectId) {
      return activeTasksCount;
    }
    const key =
      targetProject.id === 'vibecoding'
        ? 'vibetracker.tasks'
        : `vibetracker.project.${targetProject.id}.tasks`;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch {
      /* ignore */
    }
    return targetProject.initialTasks?.length || 0;
  };

  const taskCount = getTaskCount();
  const isMatch = targetProject && confirmationInput.trim() === targetProject.name.trim();

  const handleSelectProject = (newId) => {
    setSelectedId(newId);
    setConfirmationInput('');
    inputRef.current?.focus();
  };

  const handleDeleteSubmit = (e) => {
    e?.preventDefault();
    if (!isMatch || isSingleProject) return;
    onConfirmDelete(targetProject.id);
    onClose();
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
        aria-labelledby="delete-project-title"
        className="neu-sheet md:max-w-[560px]"
      >
        {/* Header */}
        <div className="neu-sheet-header bg-type-bug text-text-primary px-4 pb-4 flex items-center justify-between border-b-[3px] border-text-primary md:px-6">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="font-mono text-sm font-bold bg-white text-text-primary border-2 border-text-primary px-2 py-0.5 rounded shadow-[1px_1px_0px_#171717]">!</span>
            <h2 id="delete-project-title" className="font-heading text-[16px] tracking-[0.5px] uppercase">
              DELETE PROJECT BOARD
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="neu-sheet-close border-text-primary text-text-primary bg-white hover:bg-text-primary hover:text-white transition-[transform,box-shadow,background-color,color] duration-[80ms] hover:shadow-neu-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="neu-sheet-body p-4 space-y-5 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6">
          {isSingleProject ? (
            <div className="rounded border-[3px] border-text-primary bg-white p-5 shadow-neu space-y-2">
              <p className="font-heading text-[14px] uppercase text-text-primary">
                Cannot Delete Project
              </p>
              <p className="font-body text-[13px] text-text-muted">
                You must have at least one project board. Create another board before deleting this one.
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="font-heading text-[13px] tracking-[0.5px] uppercase bg-white text-text-primary border-[3px] border-text-primary shadow-neu rounded px-5 py-2 cursor-pointer transition-[transform,box-shadow] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-neu-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleDeleteSubmit} className="space-y-4">
              {/* Optional selector to pick which board to delete */}
              {projects.length > 2 && (
                <div>
                  <label htmlFor="delete-project-selector" className="neu-label text-[11px]">
                    Board to Delete:
                  </label>
                  <select
                    id="delete-project-selector"
                    value={targetProject.id}
                    onChange={(e) => handleSelectProject(e.target.value)}
                    className="neu-input w-full font-body text-[13px] font-bold py-2"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* GitHub-style Danger Zone Callout */}
              <div className="rounded border-[3px] border-type-bug bg-[#FFF0F0] p-4 shadow-neu space-y-2">
                <div className="flex items-center gap-2 text-type-bug font-heading text-[13px] uppercase tracking-[0.5px]">
                  <span aria-hidden="true" className="font-mono text-sm font-bold bg-type-bug text-white px-1.5 py-0.5 rounded border border-text-primary">!</span>
                  <span>Please read</span>
                </div>
                <p className="font-body text-[13px] text-text-primary leading-relaxed">
                  This action <strong className="font-bold underline">cannot</strong> be undone. This will permanently delete the{' '}
                  <strong className="font-bold underline">{targetProject.name}</strong> project board, all of its tasks ({taskCount} task{taskCount !== 1 ? 's' : ''}), and deliverable anchor links.
                </p>
              </div>

              {/* GitHub-style Verification Input */}
              <div className="space-y-2">
                <label
                  htmlFor="confirm-delete-project-input"
                  className="block font-body text-[13px] text-text-primary font-bold"
                >
                  To confirm, type{' '}
                  <span className="select-all font-mono font-bold bg-[#F0EDE5] px-2 py-0.5 rounded border-2 border-text-primary text-text-primary shadow-[1px_1px_0px_#171717]">
                    {targetProject.name}
                  </span>{' '}
                  in the box below:
                </label>
                <input
                  id="confirm-delete-project-input"
                  ref={inputRef}
                  type="text"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  placeholder={`Type "${targetProject.name}" to confirm`}
                  autoComplete="off"
                  className={`neu-input w-full font-mono text-[13px] py-2 ${confirmationInput.length > 0 && !isMatch
                    ? 'border-type-bug'
                    : isMatch
                      ? 'border-emerald-600 bg-emerald-50/30'
                      : ''
                    }`}
                />

                {/* Match indicator */}
                {confirmationInput.length > 0 && !isMatch && (
                  <p role="alert" className="text-type-bug font-body text-[11px] font-bold">
                    Board name does not match. Please type the exact name above.
                  </p>
                )}
                {isMatch && (
                  <p className="text-emerald-800 font-body text-[11px] font-bold flex items-center gap-1">
                    <span aria-hidden="true">✓</span> Board name verified. Ready to delete.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="font-heading text-[13px] tracking-[0.5px] uppercase bg-white text-text-primary border-[3px] border-text-primary shadow-neu rounded px-5 py-2.5 cursor-pointer transition-[transform,box-shadow] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-neu-sm text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isMatch}
                  className={`font-heading text-[13px] tracking-[0.5px] uppercase px-5 py-2.5 rounded border-[3px] border-text-primary transition-[transform,box-shadow,background-color] duration-[80ms] ${isMatch
                    ? 'bg-type-bug text-text-primary shadow-neu hover:-translate-x-px hover:-translate-y-px hover:shadow-neu-lg hover:bg-[#FF4A4A] cursor-pointer active:translate-x-px active:translate-y-px'
                    : 'bg-[#E5E0D8] text-text-muted border-text-muted/60 opacity-50 cursor-not-allowed shadow-none'
                    }`}
                >
                  Delete this project
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
