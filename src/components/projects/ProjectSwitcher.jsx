export default function ProjectSwitcher({ projects, value, onChange }) {
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
    </div>
  );
}
