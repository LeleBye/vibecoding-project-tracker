import { useState, useRef, useEffect } from 'react';
import { createProjectObject } from '../../constants/projects.js';
import { isDesktopViewport } from '../../utils/viewport.js';

/**
 * Unified Project Management Modal.
 * Consolidates switching projects, adding new project boards,
 * and deleting project boards into a single dedicated modal.
 */
export default function ProjectsModal({
  isOpen,
  projects = [],
  activeProjectId,
  activeTasks = [],
  onSelectProject,
  onCreateProject,
  onOpenDeleteProject,
  onClose,
  onToast,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const nameInputRef = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setError(null);
      // Desktop only — on phones the keyboard would cover the board list.
      if (isDesktopViewport()) setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

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

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Project name is required.');
      return;
    }

    const isDuplicate = projects.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setError('A project board with this name already exists.');
      return;
    }

    const newProject = createProjectObject(trimmed, description, projects);
    onCreateProject(newProject);
    setName('');
    setDescription('');
    setError(null);
  };

  const getTaskCount = (proj) => {
    if (proj.id === activeProjectId) {
      return Array.isArray(activeTasks) ? activeTasks.length : 0;
    }
    const key =
      proj.id === 'vibecoding'
        ? 'vibetracker.tasks'
        : `vibetracker.project.${proj.id}.tasks`;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch {
      /* ignore */
    }
    return proj.initialTasks?.length || 0;
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
        aria-label="Manage Project Boards"
        className="neu-sheet md:max-w-[660px]"
      >
        {/* Header */}
        <div className="neu-sheet-header bg-text-primary text-surface-page px-4 pb-4 flex items-center justify-between border-b-[3px] border-text-primary md:px-6">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="font-mono text-brand-accent text-lg font-bold">⊞</span>
            <span className="font-heading text-[16px] tracking-[0.5px] uppercase">
              PROJECT BOARDS
            </span>
            <span className="font-mono text-[11px] font-bold px-2 py-[1px] rounded border border-surface-page bg-surface-page text-text-primary">
              {projects.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project modal"
            className="neu-sheet-close border-surface-page text-surface-page bg-transparent hover:bg-surface-page hover:text-text-primary transition-[transform,box-shadow,background-color,color] duration-[80ms] hover:shadow-[2px_2px_0_0_#FFF8E8]"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="neu-sheet-body p-4 space-y-6 md:p-6">
          {/* Add Board Section */}
          <section className="rounded border-[3px] border-text-primary bg-white p-4 shadow-neu md:p-5">
            <h3 className="font-heading text-[13px] tracking-[0.5px] uppercase text-text-primary mb-3.5 flex items-center gap-1.5">
              <span className="text-brand-primary font-bold">+</span> CREATE NEW PROJECT BOARD
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="modal-project-name" className="neu-label text-[11px]">
                  Board Name <span aria-hidden="true" className="text-brand-primary">*</span>
                </label>
                <input
                  id="modal-project-name"
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. Mobile App v2, Internal Tools"
                  className={`neu-input w-full text-[13px] py-2 ${error ? 'border-type-bug' : ''}`}
                />
                {error && (
                  <p role="alert" className="text-type-bug text-[11px] mt-1 font-body font-bold">
                    {error}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="modal-project-desc" className="neu-label text-[11px]">
                  Description <span className="font-normal text-text-muted lowercase">(optional)</span>
                </label>
                <input
                  id="modal-project-desc"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Coordinate launch priorities and tasks"
                  className="neu-input w-full text-[13px] py-2"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <span className="font-mono text-[11px] text-text-muted">
                  Auto-initializes 4 workflow stages & 4 deliverable anchors
                </span>
                <button
                  type="submit"
                  className="w-full font-heading text-[12px] tracking-[0.5px] uppercase bg-brand-primary text-white border-[3px] border-text-primary shadow-neu rounded px-5 py-3 cursor-pointer transition-[transform,box-shadow] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-neu-sm sm:w-auto sm:py-2.5"
                >
                  + Add Board
                </button>
              </div>
            </form>
          </section>

          {/* Current Projects List */}
          <section>
            <div className="flex flex-col items-start gap-1 mb-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-heading text-[13px] tracking-[0.5px] uppercase text-text-primary">
                AVAILABLE PROJECT BOARDS
              </h3>
              <span className="font-mono text-[11px] text-text-muted">
                Click switch to change active board
              </span>
            </div>
            <div className="space-y-3">
              {projects.map((proj) => {
                const isActive = proj.id === activeProjectId;
                const taskCount = getTaskCount(proj);
                const canDelete = projects.length > 1;

                return (
                  <div
                    key={proj.id}
                    className={`flex flex-col items-stretch gap-3 p-4 rounded border-[3px] border-text-primary shadow-neu transition-[border-color,background-color] duration-150 sm:flex-row sm:items-center sm:justify-between ${
                      isActive
                        ? 'bg-[#F2FCFA] border-l-[8px] border-l-brand-accent'
                        : 'bg-white hover:bg-[#FBF9F5]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading text-[14px] text-text-primary">
                          {proj.name}
                        </span>
                        {isActive && (
                          <span className="font-mono text-[11px] font-bold px-2 py-[2px] rounded border-2 border-text-primary bg-brand-accent text-text-primary shrink-0 shadow-[1px_1px_0px_#171717]">
                            ✓ ACTIVE
                          </span>
                        )}
                        <span className="font-mono text-[11px] font-bold px-2 py-[2px] rounded border-2 border-text-primary bg-[#F0EDE5] text-text-muted shrink-0">
                          {taskCount} task{taskCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {proj.description && (
                        <p className="font-body text-[12px] text-text-muted truncate mt-1">
                          {proj.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 items-center gap-2 shrink-0 sm:flex">
                      {/* Switch Button */}
                      {!isActive ? (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProject(proj.id);
                            onClose();
                          }}
                          aria-label={`Switch to ${proj.name}`}
                          className="min-h-[40px] font-heading text-[12px] tracking-[0.5px] uppercase px-3.5 py-1.5 rounded border-[3px] border-text-primary bg-surface-card text-text-primary shadow-neu-sm transition-[transform,box-shadow] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu active:translate-x-[1px] active:translate-y-[1px] cursor-pointer sm:min-h-0"
                        >
                          Switch
                        </button>
                      ) : (
                        <span className="font-mono font-bold text-[11px] text-brand-primary uppercase px-2 text-center">
                          Active
                        </span>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        disabled={!canDelete}
                        onClick={() => onOpenDeleteProject(proj.id)}
                        title={
                          !canDelete
                            ? 'Cannot delete the only project board'
                            : `Delete ${proj.name}`
                        }
                        aria-label={`Delete ${proj.name} board`}
                        className="min-h-[40px] font-heading text-[12px] tracking-[0.5px] uppercase px-3 py-1.5 rounded border-[3px] border-text-primary bg-white text-text-primary shadow-neu-sm transition-[transform,box-shadow,background-color] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu hover:bg-type-bug hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-neu-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer sm:min-h-0"
                      >
                        ✕ Delete
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
            type="button"
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
