export default function AppHeader({ onAddTask }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b-4 border-text-primary bg-text-primary px-8 py-[18px]">
      <div>
        <span className="font-heading text-[28px] tracking-[3px] text-surface-page">
          LELE<span className="bg-brand-primary px-2 text-white">BYE</span>
        </span>
        <p className="mt-[3px] font-body text-[13px] font-medium text-brand-accent">
          Vibecoding Project Tracker · The task tracker for vibecoders.
        </p>
      </div>
      <button
        id="add-task-btn"
        onClick={onAddTask}
        aria-label="Add a new task"
        className="flex shrink-0 items-center gap-2 rounded border-[3px] border-surface-page bg-brand-primary px-[22px] py-[11px] font-heading text-[15px] tracking-[1px] text-white shadow-neu active:translate-x-[2px] active:translate-y-[2px] active:shadow-neu-sm"
      >
        <span aria-hidden="true" className="text-xl leading-none">+</span>
        Add task
      </button>
    </header>
  );
}
