import { useState, useEffect } from 'react';
import TaskCard from './TaskCard.jsx';

/**
 * Single Kanban column — renders its own header, drag-over state, task list,
 * and empty-state placeholder.
 * `tasks` arrive already filtered and sorted by KanbanBoard; `hiddenCount` is
 * how many of this stage's tasks the active filter hides. When `canReorder` is
 * false (an automatic sort is active), drops only change the stage.
 */
export default function KanbanColumn({
  stage,
  tasks,
  hiddenCount = 0,
  canReorder = true,
  onCardClick,
  onCopy,
  onMoveTask,
  draggingTaskId,
  onDragStart,
  onDragEnd,
}) {
  const accentClass = {
    todo: 'bg-text-primary text-surface-page',
    'in-progress': 'bg-brand-primary text-surface-page',
    review: 'bg-due-warning text-text-primary',
    done: 'bg-brand-accent text-text-primary',
  }[stage.id];
  // Yellow ('review') column needs dark text; all others use light cream text
  const isDark = stage.id !== 'review';
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (!draggingTaskId) {
      setIsDragOver(false);
    }
  }, [draggingTaskId]);

  const isColumnDragOver = isDragOver && Boolean(draggingTaskId);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    onDragEnd?.();
    // In sorted views a same-column drop has no visible effect; skip it to keep stored order intact.
    if (!canReorder && tasks.some((t) => t.id === taskId)) return;
    if (taskId && onMoveTask) {
      onMoveTask(taskId, stage.id);
    }
  };

  return (
    <section
      aria-label={`${stage.label} column, ${tasks.length} tasks`}
      className="flex flex-col flex-1"
    >
      {/* Column header (phones show the stage in the sticky tab bar instead) */}
      <div
        className={`hidden items-center justify-between border-b-[3px] border-text-primary px-[14px] py-[10px] md:flex ${accentClass}`}
      >
        <span className="font-heading text-[13px] tracking-[0.5px] uppercase">
          {stage.label}
        </span>
        <span
          className={`rounded-sm border-2 px-2 py-[1px] ${isDark ? 'border-white/50 bg-white/20' : 'border-text-primary bg-white/20'}`}
        >
          {tasks.length}
        </span>
      </div>

      {/* Column body — drop target */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex min-h-[160px] flex-1 flex-col gap-[10px] px-0 py-1 transition-colors duration-[120ms] md:min-h-[220px] md:p-3 ${isColumnDragOver ? 'bg-[#F7F2E7] outline outline-3 outline-dashed outline-offset-[-4px] outline-text-primary' : 'bg-surface-page'}`}
      >
        {tasks.length === 0 ? (
          <div
            className={`rounded border-2 border-dashed border-text-primary px-4 py-6 text-center font-body text-[13px] transition-colors duration-[120ms] ${isColumnDragOver ? 'bg-brand-primary/10 font-bold text-text-primary' : 'bg-transparent font-medium text-text-muted'}`}
          >
            {isColumnDragOver ? '+ Drop task here!' : hiddenCount > 0 ? (
              <>
                No matching tasks
                <span className="mt-1 block font-mono text-[11px]">
                  {hiddenCount} hidden by the current filter
                </span>
              </>
            ) : (
              <>
                Nothing here! …yet
                <span className="mt-1 block font-mono text-[11px] md:hidden">
                  Tap + Add task, or move a card here from another stage.
                </span>
              </>
            )}
          </div>
        ) : (
          <>
            {tasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onClick={onCardClick}
                onCopy={onCopy}
                isDragging={draggingTaskId === t.id}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onMoveTask={onMoveTask}
                draggingTaskId={draggingTaskId}
                canReorder={canReorder}
              />
            ))}
            {isColumnDragOver && (
              <div className="border-2 border-dashed border-text-primary rounded px-3 py-2 text-center font-mono text-[11px] font-bold text-text-primary bg-white/75">
                {canReorder ? '+ Drop to place at end of column' : `+ Drop to move to ${stage.label}`}
              </div>
            )}
            {hiddenCount > 0 && (
              <p className="m-0 text-center font-mono text-[11px] text-text-muted">
                + {hiddenCount} hidden by filter
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
