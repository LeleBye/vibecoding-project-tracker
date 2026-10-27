import { useMemo } from 'react';
import NeuSelect from '../common/NeuSelect.jsx';
import AssigneeBadge from '../tasks/AssigneeBadge.jsx';
import { DEFAULT_SORT, DEFAULT_FILTER } from '../../constants/taskConfig.js';

/**
 * Visually organized Sort options divided into clear Neubrutalist categories.
 */
const SORT_GROUPS = [
  {
    group: 'Date & Due Time',
    options: [
      {
        value: 'created-desc',
        label: 'Date created · newest',
        icon: '↓',
        description: 'Newest created tasks first',
      },
      {
        value: 'created-asc',
        label: 'Date created · oldest',
        icon: '↑',
        description: 'Oldest created tasks first',
      },
      {
        value: 'due-asc',
        label: 'Due date · soonest',
        icon: '!',
        description: 'Soonest deadline first (undated last)',
      },
    ],
  },
  {
    group: 'Alphabetical',
    options: [
      {
        value: 'title-asc',
        label: 'Title · A–Z',
        icon: 'AZ',
        description: 'Alphabetical task title order',
      },
      {
        value: 'assignee-asc',
        label: 'Assignee · A–Z',
        icon: '@',
        description: 'Alphabetical assignee (Unassigned last)',
      },
    ],
  },
  {
    group: 'Workflow & Custom',
    options: [
      {
        value: 'type',
        label: 'Type · features first',
        icon: '★',
        description: 'Features first, then bugs',
      },
      {
        value: 'manual',
        label: 'Manual (drag order)',
        icon: '⠿',
        description: 'Active drag-and-drop custom order',
      },
    ],
  },
];

/**
 * Task Board sort + filter controls.
 * Pure view controls: the parent owns the values; nothing here touches saved tasks.
 * Uses the Neubrutalist NeuSelect custom dropdown with grouped, badged options.
 */
export default function BoardToolbar({
  sort,
  filter,
  team = [],
  onSortChange,
  onFilterChange,
  onReset,
}) {
  const isFiltered = filter !== DEFAULT_FILTER;
  const isCustomised = isFiltered || sort !== DEFAULT_SORT;

  // Build visually organized filter options with distinct Neubrutalist badges
  const filterOptions = useMemo(() => {
    return [
      {
        value: DEFAULT_FILTER,
        label: 'All tasks',
        icon: '⊞',
        description: 'Show all tasks without any filter',
      },
      {
        group: 'Type',
        options: [
          {
            value: 'type:feature',
            label: 'Features',
            badge: (
              <span className="rounded border border-text-primary bg-type-feature px-1.5 py-0.5 font-mono text-[10px] font-bold text-white shadow-[1px_1px_0px_#171717]">
                ★ Feature
              </span>
            ),
            description: 'Filter feature tasks only',
          },
          {
            value: 'type:bug',
            label: 'Bugs',
            badge: (
              <span className="rounded border border-text-primary bg-type-bug px-1.5 py-0.5 font-mono text-[10px] font-bold text-white shadow-[1px_1px_0px_#171717]">
                ✕ Bug
              </span>
            ),
            description: 'Filter bug tasks only',
          },
        ],
      },
      {
        group: 'Due date',
        options: [
          {
            value: 'due:overdue',
            label: 'Overdue',
            badge: (
              <span className="rounded border border-text-primary bg-due-overdue px-1.5 py-0.5 font-mono text-[10px] font-bold text-text-primary shadow-[1px_1px_0px_#171717]">
                ! Overdue
              </span>
            ),
            description: 'Tasks past their deadline',
          },
          {
            value: 'due:warning',
            label: 'Due soon (< 24h)',
            badge: (
              <span className="rounded border border-text-primary bg-due-warning px-1.5 py-0.5 font-mono text-[10px] font-bold text-text-primary shadow-[1px_1px_0px_#171717]">
                ! Due soon
              </span>
            ),
            description: 'Tasks due within 24 hours',
          },
          {
            value: 'due:safe',
            label: 'On track',
            badge: (
              <span className="rounded border border-text-primary bg-due-safe px-1.5 py-0.5 font-mono text-[10px] font-bold text-text-primary shadow-[1px_1px_0px_#171717]">
                ✓ On track
              </span>
            ),
            description: 'Safe future deadlines',
          },
          {
            value: 'due:none',
            label: 'No due date',
            badge: (
              <span className="rounded border border-text-primary bg-due-neutral px-1.5 py-0.5 font-mono text-[10px] font-bold text-text-primary shadow-[1px_1px_0px_#171717]">
                — Undated
              </span>
            ),
            description: 'Tasks without any due date',
          },
        ],
      },
      {
        group: 'Assignee',
        options: [
          {
            value: 'assignee:Unassigned',
            label: 'Unassigned',
            badge: <AssigneeBadge name="Unassigned" size="sm" />,
            description: 'Tasks not yet assigned to anyone',
          },
          ...team.map((member) => ({
            value: `assignee:${member.name}`,
            label: member.name,
            badge: <AssigneeBadge name={member.name} size="sm" />,
            description: member.email || undefined,
          })),
        ],
      },
    ];
  }, [team]);

  return (
    <div
      role="group"
      aria-label="Sort and filter tasks"
      className="mb-4 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-4"
    >
      <div className="grid grid-cols-2 gap-2 md:flex md:items-center md:gap-4">
        {/* Sort Dropdown */}
        <div className="flex min-w-0 flex-col gap-1 md:flex-row md:items-center md:gap-2">
          <label
            htmlFor="board-sort-select"
            className="font-mono text-[11px] font-bold uppercase tracking-wide text-text-primary shrink-0"
          >
            <span aria-hidden="true">⇅ </span>Sort
          </label>
          <div className="min-w-0 flex-1 md:w-[220px]">
            <NeuSelect
              id="board-sort-select"
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              options={SORT_GROUPS}
              aria-label="Sort tasks"
              buttonClassName="bg-white min-h-[40px] md:min-h-[36px] font-mono text-[12px] font-bold px-2.5 py-1.5"
              menuClassName="min-w-[240px] sm:min-w-[270px]"
            />
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="flex min-w-0 flex-col gap-1 md:flex-row md:items-center md:gap-2">
          <label
            htmlFor="board-filter-select"
            className="font-mono text-[11px] font-bold uppercase tracking-wide text-text-primary shrink-0"
          >
            <span aria-hidden="true">⧩ </span>Filter
          </label>
          <div className="min-w-0 flex-1 md:w-[220px]">
            <NeuSelect
              id="board-filter-select"
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              options={filterOptions}
              align="right"
              aria-label="Filter tasks"
              buttonClassName={`${
                isFiltered ? 'bg-brand-accent' : 'bg-white'
              } min-h-[40px] md:min-h-[36px] font-mono text-[12px] font-bold px-2.5 py-1.5`}
              menuClassName="min-w-[240px] sm:min-w-[280px]"
            />
          </div>
        </div>
      </div>

      {isCustomised && (
        <button
          id="board-view-reset-btn"
          type="button"
          onClick={onReset}
          className="neu-button min-h-[40px] bg-white px-3 py-1 font-mono text-[11px] font-bold text-text-primary md:min-h-[36px] md:py-1.5"
        >
          ↺ Reset view
        </button>
      )}
    </div>
  );
}
