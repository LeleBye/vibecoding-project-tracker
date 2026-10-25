export default function ProjectSwitcher({
  projects,
  value,
  onChange,
  onCreateProject,
  onDeleteProject,
}) {
  const currentProject = projects.find((project) => project.id === value) || projects[0];
  const canDelete = projects.length > 1;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="project-switcher" className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-brand-accent">
        Project
      </label>
      <div className="relative">
        <select
          id="project-switcher"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Switch project"
          className="w-[190px] cursor-pointer appearance-none rounded border-[3px] border-surface-page bg-surface-page px-3 py-[9px] pr-9 font-body text-[13px] font-bold text-text-primary shadow-neu-sm transition-colors focus:border-brand-primary focus:outline-none"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
        <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-heading text-text-primary">
          ▾
        </span>
      </div>
      <button
        id="create-project-btn"
        type="button"
        onClick={onCreateProject}
        title="Create new project board"
        aria-label="Create new project board"
        className="flex items-center gap-1 rounded border-[3px] border-surface-page bg-surface-card px-2.5 py-[9px] font-heading text-[13px] tracking-[0.5px] text-text-primary shadow-neu transition-[transform,box-shadow] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-neu-sm"
      >
        <span aria-hidden="true" className="text-sm font-bold leading-none">+</span>
        <span>New</span>
      </button>
      <button
        id="delete-project-btn"
        type="button"
        onClick={onDeleteProject}
        disabled={!canDelete}
        title={!canDelete ? 'Cannot delete the only project board' : `Delete "${currentProject?.name || 'project'}" board`}
        aria-label={`Delete ${currentProject?.name || 'project'} board`}
        className="flex items-center justify-center rounded border-[3px] border-surface-page bg-surface-card px-2.5 py-[9px] font-heading text-[13px] text-text-primary shadow-neu transition-[transform,box-shadow] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-neu-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-neu"
      >
        <span aria-hidden="true" className="text-sm font-bold">✕</span>
      </button>
    </div>
  );
}

