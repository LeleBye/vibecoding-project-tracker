import KanbanColumn from './KanbanColumn.jsx';
import { STAGES } from '../../constants/taskConfig.js';

/**
 * Kanban board — renders the label row and the four-column grid.
 * All drag state and task mutation callbacks are passed down from App.
 */
export default function KanbanBoard({
  tasks,
  draggingTaskId,
  onCardClick,
  onCopy,
  onMoveTask,
  onDragStart,
  onDragEnd,
}) {
  return (
    <div>
      {/* Board label row */}
      <div className="flex items-center gap-[10px] mb-[14px]">
        <h2 className="font-heading text-[13px] tracking-[1px] uppercase text-text-primary m-0">
          Task Board
        </h2>
        <div className="flex-1 h-[3px] bg-text-primary" />
        <span className="font-mono text-[12px] text-text-muted">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Four-column grid */}
      <div className="grid grid-cols-[repeat(4,minmax(220px,1fr))] gap-4">
        {STAGES.map((stage) => (
          <div
            key={stage.id}
            className="border-[3px] border-text-primary shadow-neu rounded overflow-hidden flex flex-col"
          >
            <KanbanColumn
              stage={stage}
              tasks={tasks.filter((t) => t.status === stage.id)}
              onCardClick={onCardClick}
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
