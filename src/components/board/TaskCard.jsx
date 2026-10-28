import { useState, useRef, useCallback, useEffect } from 'react';
import AssigneeBadge from '../tasks/AssigneeBadge.jsx';
import TypeBadge from '../tasks/TypeBadge.jsx';
import ToolBadge from '../tasks/ToolBadge.jsx';
import DuePill from '../tasks/DuePill.jsx';
import { getDueState } from '../../utils/taskUtils.js';
import { buildPromptContext } from '../../utils/taskUtils.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { STAGES, COL_ACCENTS } from '../../constants/taskConfig.js';

const STAGE_MOVER_STYLES = {
  todo: 'bg-text-primary text-surface-page',
  'in-progress': 'bg-brand-primary text-surface-page',
  review: 'bg-due-warning text-text-primary',
  done: 'bg-brand-accent text-text-primary',
};

/**
 * Individual Kanban task card.
 * Supports click-to-edit, HTML5 drag-and-drop for column movement, and
 * a mobile-accessible horizontal stage picker below the card.
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
  canReorder = true,
}) {
  const dueState = getDueState(task.dueDate, task.status);
  const [copied, setCopied] = useState(false);
  const [isOverCard, setIsOverCard] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const moveContainerRef = useRef(null);

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

  // Automatically close mover if task status changes or drag begins
  useEffect(() => {
    setIsMoveOpen(false);
  }, [task.status, isDragging]);

  // Close mover if clicking outside
  useEffect(() => {
    if (!isMoveOpen) return;
    const handleOutsideClick = (e) => {
      if (moveContainerRef.current && !moveContainerRef.current.contains(e.target)) {
        setIsMoveOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [isMoveOpen]);

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
    <div ref={moveContainerRef} className="flex flex-col gap-1.5 md:contents">
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
          // Sorted views: let the column handle the drop (stage change only).
          if (!canReorder) return;
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
          if (!canReorder) return;
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

        {/* copy button + phone-only stage mover toggle */}
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
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMoveOpen((prev) => !prev);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') setIsMoveOpen(false);
              }}
              aria-expanded={isMoveOpen}
              aria-controls={`move-options-${task.id}`}
              aria-label={isMoveOpen ? `Close move options for "${task.title}"` : `Move "${task.title}" to another stage`}
              className={`min-h-[36px] font-mono text-[11px] font-bold rounded-sm border-2 border-text-primary px-[10px] py-[4px] cursor-pointer transition-[transform,box-shadow,background-color] duration-[80ms] active:translate-x-px active:translate-y-px active:shadow-none md:hidden ${
                isMoveOpen
                  ? 'bg-brand-accent text-text-primary shadow-none translate-x-px translate-y-px'
                  : 'bg-white text-text-primary shadow-neu-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-neu'
              }`}
            >
              {isMoveOpen ? '✕ Close' : '⤹ Move'}
            </button>
          )}
        </div>
      </article>

      {/* Mobile-only stage mover: 4 options in a horizontal row below the card */}
      {onMoveTask && isMoveOpen && (
        <div
          id={`move-options-${task.id}`}
          role="region"
          aria-label={`Move "${task.title}" to stage`}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Escape') setIsMoveOpen(false);
          }}
          className="rounded border-[3px] border-text-primary bg-surface-card p-2 shadow-neu md:hidden animate-[toastIn_80ms_ease-out]"
        >
          <div className="mb-1.5 flex items-center justify-between px-0.5">
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-text-primary">
              Move card to stage:
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMoveOpen(false);
              }}
              className="font-mono text-[10px] font-bold text-text-muted hover:text-text-primary underline cursor-pointer"
              aria-label="Cancel moving card"
            >
              ✕ Cancel
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5" role="group" aria-label={`Choose stage for "${task.title}"`}>
            {STAGES.map((stage) => {
              const isCurrent = stage.id === task.status;
              return (
                <button
                  key={stage.id}
                  type="button"
                  disabled={isCurrent}
                  aria-current={isCurrent ? 'true' : undefined}
                  aria-label={isCurrent ? `Currently in ${stage.label}` : `Move to ${stage.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveTask(task.id, stage.id);
                    setIsMoveOpen(false);
                  }}
                  className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded border-2 border-text-primary p-1 text-center transition-[transform,box-shadow,background-color] duration-[80ms] ${
                    isCurrent
                      ? 'border-dashed border-text-primary/50 bg-surface-page/60 text-text-muted opacity-70 cursor-default'
                      : `${STAGE_MOVER_STYLES[stage.id] || 'bg-surface-card text-text-primary'} shadow-neu-sm cursor-pointer hover:-translate-x-px hover:-translate-y-px hover:shadow-neu active:translate-x-px active:translate-y-px active:shadow-none`
                  }`}
                >
                  <span className="flex items-center gap-1 font-heading text-[10px] uppercase leading-none tracking-tight">
                    <span
                      aria-hidden="true"
                      className="inline-block h-2 w-2 shrink-0 rounded-full border border-text-primary"
                      style={{ backgroundColor: COL_ACCENTS[stage.id] || '#171717' }}
                    />
                    <span className="truncate">{stage.label}</span>
                  </span>
                  <span className="font-mono text-[9px] font-bold leading-none opacity-85">
                    {isCurrent ? '● Current' : 'Tap to move'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
