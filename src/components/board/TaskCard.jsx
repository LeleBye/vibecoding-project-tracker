import { useState, useRef, useCallback } from 'react';
import AssigneeBadge from '../tasks/AssigneeBadge.jsx';
import TypeBadge from '../tasks/TypeBadge.jsx';
import ToolBadge from '../tasks/ToolBadge.jsx';
import DuePill from '../tasks/DuePill.jsx';
import { getDueState } from '../../utils/taskUtils.js';
import { buildPromptContext } from '../../utils/taskUtils.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { STAGES } from '../../constants/taskConfig.js';

/**
 * Individual Kanban task card.
 * Supports click-to-edit and HTML5 drag-and-drop for column movement.
 */
export default function TaskCard({
  task,
  onClick,
  onCopy,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onMoveTask,
  draggingTaskId,
}) {
  const dueState = getDueState(task.dueDate, task.status);
  const [copied, setCopied] = useState(false);
  const [isOverCard, setIsOverCard] = useState(false);
  const dueClass = {
    none: 'bg-surface-card',
    safe: 'bg-due-safe',
    warning: 'bg-due-warning',
    overdue: 'bg-due-overdue',
    neutral: 'bg-due-neutral',
  }[dueState];
  const stripeClass = task.type === 'feature' ? 'bg-type-feature' : 'bg-type-bug';
  const cursorClass = isDragging ? 'cursor-grabbing' : 'cursor-grab';
  const isDraggingRef = useRef(false);

  const handleCopy = useCallback(
    (e) => {
      e.stopPropagation();
      copyToClipboard(buildPromptContext(task))
        .then(() => {
          onCopy(task);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        })
        .catch(() => onCopy(task, 'error'));
    },
    [task, onCopy]
  );

  return (
    <article
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        isDraggingRef.current = true;
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(task.id);
      }}
      onDragEnd={() => {
        isDraggingRef.current = false;
        setIsOverCard(false);
        onDragEnd?.();
      }}
      onDragOver={(e) => {
        if (draggingTaskId && draggingTaskId !== task.id) {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'move';
          if (!isOverCard) setIsOverCard(true);
        } else if (draggingTaskId === task.id) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsOverCard(false);
        }
      }}
      onDrop={(e) => {
        if (draggingTaskId && draggingTaskId !== task.id) {
          e.preventDefault();
          e.stopPropagation();
          setIsOverCard(false);
          const droppedId = draggingTaskId;
          onDragEnd?.();
          onMoveTask?.(droppedId, task.status, task.id);
        } else if (draggingTaskId === task.id) {
          e.preventDefault();
          e.stopPropagation();
          setIsOverCard(false);
          onDragEnd?.();
        }
      }}
      onClick={() => {
        if (isDraggingRef.current) return;
        onClick(task);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(task);
        }
      }}
      aria-label={`${task.title}. ${task.type}. ${task.assignee && task.assignee !== 'Unassigned' ? `Assigned to ${task.assignee}` : 'Unassigned'}. Draggable.`}
      className={`relative flex ${cursorClass} flex-col gap-[10px] overflow-hidden rounded border-[3px] border-text-primary p-[14px] transition-[transform,box-shadow,opacity] duration-[80ms] ${dueClass} ${isDragging ? 'opacity-[0.35] shadow-none' : isOverCard ? '-translate-x-[2px] -translate-y-[2px] shadow-neu-lg outline outline-2 outline-dashed outline-offset-2' : 'shadow-neu hover:-translate-x-px hover:-translate-y-px hover:shadow-neu-lg'}`}
    >
      {/* type stripe */}
      <div
        aria-hidden="true"
        className={`absolute left-0 top-0 h-full w-[5px] ${stripeClass}`}
      />

      {/* title + assignee */}
      <div className="flex items-start justify-between gap-2 pl-[10px]">
        <h3 className="font-body font-bold text-sm text-text-primary leading-[1.3] flex-1 m-0">
          {task.title}
        </h3>
        <AssigneeBadge name={task.assignee} size="sm" />
      </div>

      {/* badges */}
      <div className="flex flex-wrap gap-[5px] pl-[10px]">
        <TypeBadge type={task.type} />
        <DuePill dueDate={task.dueDate} status={task.status} />
        {task.contextTool && <ToolBadge tool={task.contextTool} />}
        {task.status === 'done' && (
          <span className="font-mono text-[11px] text-text-muted">✓ Completed</span>
        )}
      </div>

      {/* copy button + phone-only stage mover */}
      <div className="flex flex-wrap items-center gap-2 pl-[10px]">
        <button
          onClick={handleCopy}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          aria-label="Copy as Prompt Context"
          className={`min-h-[36px] font-mono text-[11px] font-bold rounded-sm border-2 border-text-primary px-[10px] py-[4px] cursor-pointer transition-[transform,box-shadow,background-color] duration-[80ms] active:translate-x-px active:translate-y-px active:shadow-none md:min-h-0 ${copied ? 'bg-brand-accent text-text-primary shadow-none' : 'bg-text-primary text-surface-page shadow-neu-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-neu'}`}
        >
          {copied ? '✓ Copied!' : '⇥ Copy Context'}
        </button>

        {onMoveTask && (
          <label
            className="flex min-w-0 flex-1 items-center gap-1.5 md:hidden"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <span className="shrink-0 font-mono text-[11px] font-bold text-text-primary">Move</span>
            <select
              value={task.status}
              onChange={(e) => onMoveTask(task.id, e.target.value)}
              aria-label={`Move "${task.title}" to stage`}
              className="min-h-[36px] min-w-0 flex-1 cursor-pointer rounded-sm border-2 border-text-primary bg-white px-2 py-1 font-mono font-bold text-text-primary shadow-neu-sm"
            >
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
        )}
      </div>
    </article>
  );
}
