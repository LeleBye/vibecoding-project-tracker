import ProjectSwitcher from '../projects/ProjectSwitcher.jsx';

export default function AppHeader({
  onAddTask,
  projects,
  projectId,
  onProjectChange,
  teamCount = 0,
  onOpenTeam,
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b-4 border-text-primary bg-text-primary px-8 py-[18px]">
      <div>
        <span className="font-heading text-[28px] tracking-[3px] text-surface-page">
          VIBE<span className="bg-brand-primary px-2 text-white">TRACKER</span>
        </span>
        <p className="mt-[3px] font-body text-[13px] font-medium text-brand-accent">
          Vibecoding Project Tracker · The task tracker for vibecoders.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <ProjectSwitcher
          projects={projects}
          value={projectId}
          onChange={onProjectChange}
        />
        <button
          id="manage-team-btn"
          type="button"
          onClick={onOpenTeam}
          aria-label="Manage team members"
          className="flex items-center gap-2 rounded border-[3px] border-surface-page bg-surface-card px-4 py-[10px] font-heading text-[14px] tracking-[0.5px] text-text-primary shadow-neu transition-[transform,box-shadow] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-neu-sm"
        >
          <span aria-hidden="true" className="text-base">👥</span>
          <span>Team ({teamCount})</span>
        </button>
        <button
          id="add-task-btn"
          onClick={onAddTask}
          aria-label="Add a new task"
          className="flex items-center gap-2 rounded border-[3px] border-surface-page bg-brand-primary px-[22px] py-[11px] font-heading text-[15px] tracking-[1px] text-white shadow-neu active:translate-x-[2px] active:translate-y-[2px] active:shadow-neu-sm"
        >
          <span aria-hidden="true" className="text-xl leading-none">+</span>
          Add task
        </button>
      </div>
    </header>
  );
}
