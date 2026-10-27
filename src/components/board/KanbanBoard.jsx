import { useMemo, useRef, useState } from 'react';
import KanbanColumn from './KanbanColumn.jsx';
import BoardToolbar from './BoardToolbar.jsx';
import { STAGES, SORT_OPTIONS, FILTER_GROUPS, DEFAULT_SORT, DEFAULT_FILTER } from '../../constants/taskConfig.js';
import { filterTasks, sortTasks } from '../../utils/taskUtils.js';

// Matches the column header colours in KanbanColumn.
const STAGE_TAB_ACTIVE = {
  todo: 'bg-text-primary text-surface-page',
  'in-progress': 'bg-brand-primary text-surface-page',
  review: 'bg-due-warning text-text-primary',
  done: 'bg-brand-accent text-text-primary',
};

const STAGE_TAB_SWATCH = {
  todo: 'bg-text-primary',
  'in-progress': 'bg-brand-primary',
  review: 'bg-due-warning',
  done: 'bg-brand-accent',
};

const SWIPE_MIN_DISTANCE = 35;

/**
 * Kanban board — renders the label row and the four-column grid.
 * All drag state and task mutation callbacks are passed down from App.
 *
 * Phones (< md): all four columns stay rendered in the locked order, but only
 * the stage chosen in the sticky tab bar is visible.
 * The entire bottom-half of the page (from the top of the task board to the
 * bottom of the page) is designated as a swipable area to navigate between columns.
 * Column borders are removed on mobile so cards take up full width.
 * Tablets (md): 2 × 2 grid. Desktop (lg+): the original four-column row.
 *
 * Sort + filter (BoardToolbar) are session-only view state applied to a copy of
 * `tasks`; stored task order only changes via drag-reorder in "Manual" sort.
 */
export default function KanbanBoard({
  tasks,
  team = [],
  draggingTaskId,
  onCardClick,
  onCopy,
  onMoveTask,
  onDragStart,
  onDragEnd,
}) {
  const [activeStage, setActiveStage] = useState(STAGES[0].id);
  // Display-only view state; resets to the defaults on reload.
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const tabBarRef = useRef(null);
  const columnsRef = useRef(null);
  const touchStartRef = useRef(null);
  const lastSwipeTimeRef = useRef(0);

  // Fall back to defaults if a value is no longer valid (e.g. a filtered teammate was removed/renamed).
  const validFilters = useMemo(() => new Set([
    DEFAULT_FILTER,
    'assignee:Unassigned',
    ...FILTER_GROUPS.flatMap((group) => group.options.map((option) => option.id)),
    ...team.map((member) => `assignee:${member.name}`),
  ]), [team]);
  const activeFilter = validFilters.has(filter) ? filter : DEFAULT_FILTER;
  const activeSort = SORT_OPTIONS.some((option) => option.id === sort) ? sort : DEFAULT_SORT;
  const canReorder = activeSort === 'manual';

  const visibleTasks = useMemo(
    () => sortTasks(filterTasks(tasks, activeFilter), activeSort),
    [tasks, activeFilter, activeSort]
  );
  const isFiltered = activeFilter !== DEFAULT_FILTER;

  const selectStage = (stageId) => {
    setActiveStage(stageId);
    // If the user has scrolled down a long column, bring the new column's top into view.
    const tabBar = tabBarRef.current;
    const columns = columnsRef.current;
    if (!tabBar || !columns) return;
    const tabBottom = tabBar.getBoundingClientRect().bottom;
    const columnsTop = columns.getBoundingClientRect().top;
    if (columnsTop < tabBottom) {
      window.scrollBy({ top: columnsTop - tabBottom - 8, behavior: 'smooth' });
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      target: e.target,
    };
  };

  const handleTouchEnd = (e) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || e.changedTouches.length === 0) return;
    // Ignore swipes that start on interactive controls (e.g. the card Move select).
    if (start.target?.closest?.('select, input, textarea')) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.1) return;
    const index = STAGES.findIndex((s) => s.id === activeStage);
    const nextIndex = dx < 0 ? index + 1 : index - 1;
    if (nextIndex >= 0 && nextIndex < STAGES.length) {
      lastSwipeTimeRef.current = Date.now();
      selectStage(STAGES[nextIndex].id);
    }
  };

  const handleTouchCancel = () => {
    touchStartRef.current = null;
  };

  const handleCardClick = (task) => {
    // If a horizontal swipe just completed, prevent opening the card modal
    if (Date.now() - lastSwipeTimeRef.current < 300) return;
    onCardClick(task);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      className="-mx-4 flex flex-1 flex-col px-4 touch-pan-y pb-[calc(7rem+env(safe-area-inset-bottom))] md:mx-0 md:px-0 md:pb-0"
    >
      {/* Board label row */}
      <div className="flex items-center gap-[10px] mb-[14px]">
        <h2 className="font-heading text-[13px] tracking-[1px] uppercase text-text-primary m-0">
          Task Board
        </h2>
        <div className="flex-1 h-[3px] bg-text-primary" />
        <span aria-live="polite" className="font-mono text-[12px] text-text-muted">
          {isFiltered
            ? `${visibleTasks.length} of ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`
            : `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      <BoardToolbar
        sort={activeSort}
        filter={activeFilter}
        team={team}
        onSortChange={setSort}
        onFilterChange={setFilter}
        onReset={() => {
          setSort(DEFAULT_SORT);
          setFilter(DEFAULT_FILTER);
        }}
      />

      {/* Phone-only stage switcher */}
      <div
        ref={tabBarRef}
        className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-[700] -mx-4 mb-3 border-b-[3px] border-text-primary bg-surface-page px-4 pb-3 pt-2 md:hidden"
      >
        <div role="group" aria-label="Choose workflow stage to show" className="grid grid-cols-4 gap-1.5">
          {STAGES.map((stage) => {
            const count = visibleTasks.filter((t) => t.status === stage.id).length;
            const isActive = stage.id === activeStage;
            return (
              <button
                key={stage.id}
                id={`stage-tab-${stage.id}`}
                type="button"
                aria-pressed={isActive}
                aria-controls={`stage-panel-${stage.id}`}
                aria-label={`${stage.label}, ${count} task${count !== 1 ? 's' : ''}`}
                onClick={() => selectStage(stage.id)}
                className={`flex min-h-[52px] min-w-0 flex-col items-center justify-center gap-1 rounded border-[3px] border-text-primary px-1 py-1.5 transition-[transform,box-shadow,background-color] duration-[80ms] cursor-pointer ${
                  isActive
                    ? `${STAGE_TAB_ACTIVE[stage.id]} translate-x-[2px] translate-y-[2px] shadow-none`
                    : 'bg-surface-card text-text-primary shadow-neu-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                }`}
              >
                <span className="flex items-center gap-1 font-heading text-[10px] uppercase leading-tight tracking-[0.3px] text-center">
                  {!isActive && (
                    <span aria-hidden="true" className={`h-2 w-2 shrink-0 border-[1.5px] border-text-primary ${STAGE_TAB_SWATCH[stage.id]}`} />
                  )}
                  {stage.label}
                </span>
                <span
                  aria-hidden="true"
                  className={`rounded-sm border-2 px-1.5 font-mono text-[11px] font-bold leading-[1.3] ${
                    isActive && stage.id !== 'review' && stage.id !== 'done'
                      ? 'border-white/60 bg-white/20'
                      : 'border-text-primary bg-white/40'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <p aria-hidden="true" className="mt-2 text-center font-mono text-[10px] text-text-muted">
          ← Swipe anywhere on the board to change stage →
        </p>
      </div>

      {/* Column grid: 1 visible column on phones, 2×2 on tablets, 4 across on desktop.
          On phones, column container borders and shadows are removed so cards fill the available width,
          and containers flex-1 to cover the full height down to the bottom of the page. */}
      <div
        ref={columnsRef}
        className="flex flex-1 flex-col grid-cols-1 gap-4 md:grid md:grid-cols-2 lg:grid-cols-[repeat(4,minmax(220px,1fr))]"
      >
        {STAGES.map((stage) => (
          <div
            key={stage.id}
            id={`stage-panel-${stage.id}`}
            className={`flex-1 flex-col md:border-[3px] md:border-text-primary md:shadow-neu md:rounded md:overflow-hidden ${
              stage.id === activeStage ? 'flex' : 'hidden md:flex'
            }`}
          >
            <KanbanColumn
              stage={stage}
              tasks={visibleTasks.filter((t) => t.status === stage.id)}
              hiddenCount={isFiltered
                ? tasks.filter((t) => t.status === stage.id).length
                  - visibleTasks.filter((t) => t.status === stage.id).length
                : 0}
              canReorder={canReorder}
              onCardClick={handleCardClick}
              onCopy={onCopy}
              onMoveTask={onMoveTask}
              draggingTaskId={draggingTaskId}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
