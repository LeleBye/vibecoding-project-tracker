const desktopActionClass =
  'flex items-center gap-2.5 rounded border-[3px] border-surface-page bg-surface-card px-4 py-[10px] font-heading text-[13px] tracking-[0.5px] uppercase text-text-primary shadow-neu transition-[transform,box-shadow] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-neu-sm cursor-pointer';

const mobileBarButtonClass =
  'flex min-h-[52px] min-w-0 flex-col items-center justify-center gap-[3px] rounded border-[3px] border-text-primary bg-surface-card px-2 py-1.5 text-text-primary shadow-neu-sm transition-[transform,box-shadow] duration-[80ms] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer';

export default function AppHeader({
  onAddTask,
  currentProject,
  onOpenProjects,
  projectCount = 0,
  teamCount = 0,
  onOpenTeam,
}) {
  const projectName = currentProject?.name || 'Default';

  return (
    <>
      <header className="sticky top-0 z-[800] flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center justify-between gap-3 border-b-4 border-text-primary bg-text-primary px-4 pt-[env(safe-area-inset-top)] md:static md:h-auto md:gap-4 md:px-8 md:py-[18px]">
        <div className="min-w-0">
          <span className="font-heading text-[20px] tracking-[2px] text-surface-page md:text-[28px] md:tracking-[3px]">
            VIBE<span className="bg-brand-primary px-1.5 text-white md:px-2">TRACKER</span>
          </span>
          <p className="mt-[3px] hidden font-body text-[13px] font-medium text-brand-accent lg:block">
            Vibecoding Project Tracker · The task tracker for vibecoders.
          </p>
        </div>

        {/* Phone: active board chip (opens the project modal) */}
        <button
          id="mobile-project-chip"
          type="button"
          onClick={onOpenProjects}
          aria-label={`Active project: ${projectName}. Manage project boards`}
          className="flex min-h-[40px] min-w-0 items-center gap-1.5 rounded border-2 border-surface-page bg-brand-accent px-2.5 py-1 font-mono text-[12px] font-bold text-text-primary shadow-[2px_2px_0_0_#FFF8E8] active:translate-x-px active:translate-y-px active:shadow-none md:hidden"
        >
          <span aria-hidden="true" className="leading-none">⊞</span>
          <span className="max-w-[40vw] truncate">{projectName}</span>
          <span aria-hidden="true" className="leading-none">▾</span>
        </button>

        {/* Tablet / desktop actions */}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <button
            id="manage-projects-btn"
            type="button"
            onClick={onOpenProjects}
            aria-label="Manage project boards"
            className={desktopActionClass}
          >
            <span aria-hidden="true" className="font-mono text-[15px] font-bold text-brand-primary leading-none">⊞</span>
            <span className="hidden lg:inline">Project</span>
            <span className="max-w-[120px] truncate rounded border-2 border-text-primary bg-brand-accent px-2 py-[1px] font-mono text-[11px] font-bold text-text-primary shadow-[1px_1px_0px_#171717] lg:max-w-[150px]">
              {projectName}
            </span>
          </button>

          <button
            id="manage-team-btn"
            type="button"
            onClick={onOpenTeam}
            aria-label="Manage team members"
            className={desktopActionClass}
          >
            <span aria-hidden="true" className="font-mono text-[15px] font-bold text-brand-primary leading-none">●</span>
            <span>Team</span>
            <span className="rounded border-2 border-text-primary bg-[#FFF8E8] px-2 py-[1px] font-mono text-[11px] font-bold text-text-primary shadow-[1px_1px_0px_#171717]">
              {teamCount}
            </span>
          </button>

          <button
            id="add-task-btn"
            type="button"
            onClick={onAddTask}
            aria-label="Add a new task"
            className="flex items-center gap-2 rounded border-[3px] border-surface-page bg-brand-primary px-[22px] py-[11px] font-heading text-[15px] tracking-[1px] text-white shadow-neu transition-[transform,box-shadow] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-neu-sm cursor-pointer"
          >
            <span aria-hidden="true" className="text-xl leading-none">+</span>
            Add task
          </button>
        </div>
      </header>

      {/* Phone: fixed bottom action bar */}
      <nav
        aria-label="Main actions"
        className="fixed inset-x-0 bottom-0 z-[800] grid grid-cols-[1fr_1.35fr_1fr] gap-2.5 border-t-[3px] border-text-primary bg-surface-page px-3 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] md:hidden"
      >
        <button
          id="mobile-projects-btn"
          type="button"
          onClick={onOpenProjects}
          aria-label={`Project boards, ${projectCount} total`}
          className={mobileBarButtonClass}
        >
          <span aria-hidden="true" className="flex items-center gap-1 font-mono text-[15px] font-bold leading-none text-brand-primary">
            ⊞
            <span className="rounded-sm border-2 border-text-primary bg-brand-accent px-1 text-[10px] text-text-primary">{projectCount}</span>
          </span>
          <span className="font-heading text-[11px] uppercase tracking-[0.5px]">Projects</span>
        </button>

        <button
          id="mobile-add-task-btn"
          type="button"
          onClick={onAddTask}
          aria-label="Add a new task"
          className="flex min-h-[52px] items-center justify-center gap-2 rounded border-[3px] border-text-primary bg-brand-primary px-3 font-heading text-[15px] tracking-[1px] text-white shadow-neu transition-[transform,box-shadow] duration-[80ms] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
        >
          <span aria-hidden="true" className="text-2xl leading-none">+</span>
          Add task
        </button>

        <button
          id="mobile-team-btn"
          type="button"
          onClick={onOpenTeam}
          aria-label={`Team members, ${teamCount} total`}
          className={mobileBarButtonClass}
        >
          <span aria-hidden="true" className="flex items-center gap-1 font-mono text-[15px] font-bold leading-none text-brand-primary">
            ●
            <span className="rounded-sm border-2 border-text-primary bg-[#FFF8E8] px-1 text-[10px] text-text-primary">{teamCount}</span>
          </span>
          <span className="font-heading text-[11px] uppercase tracking-[0.5px]">Team</span>
        </button>
      </nav>
    </>
  );
}
