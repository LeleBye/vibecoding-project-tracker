import { useState, useRef, useEffect } from 'react';
import AssigneeBadge from '../tasks/AssigneeBadge.jsx';
import NeuSelect from '../common/NeuSelect.jsx';
import { STAGES, TEAM, DEFAULT_TEAM, AI_TOOLS, CONTEXT_TEMPLATE, EMPTY_FORM, COL_ACCENTS } from '../../constants/taskConfig.js';
import { uid, todayStr, timeAgo, buildPromptContext } from '../../utils/taskUtils.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { isDesktopViewport } from '../../utils/viewport.js';

/**
 * Task add/edit/delete modal (M5, M9, M10, M12).
 * Rendered by App when modalTask !== undefined.
 * task === null  →  "new task" mode
 * task === {...} →  "edit task" mode
 */
export default function TaskModal({ task, team = DEFAULT_TEAM, onSave, onDelete, onClose, onToast }) {
  const isNew = !task?.id;
  const teamList = Array.isArray(team) && team.length > 0 ? team : DEFAULT_TEAM;
  const defaultAssignee = 'Unassigned';

  const [form, setForm] = useState(() =>
    isNew
      ? { ...EMPTY_FORM, assignee: defaultAssignee }
      : {
          title:       task.title       || '',
          description: task.description || '',
          type:        task.type        || 'feature',
          status:      task.status      || 'todo',
          assignee:    task.assignee    || defaultAssignee,
          dueDate:     task.dueDate     || '',
          context:     task.context     || CONTEXT_TEMPLATE,
          contextTool: task.contextTool || null,
        }
  );
  const [errors, setErrors]               = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied]               = useState(false);
  const titleRef                          = useRef(null);
  const deleteBtnRef                      = useRef(null);

  // Auto-focus title on open (on phones only for new tasks, so editing doesn't pop the keyboard over the task)
  useEffect(() => {
    if (titleRef.current && (isNew || isDesktopViewport())) titleRef.current.focus();
  }, [isNew]);

  // Escape to close or cancel delete confirmation
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') {
        if (confirmDelete) {
          setConfirmDelete(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [confirmDelete, onClose]);

  // Click outside delete button cancels confirmation and resets button state
  useEffect(() => {
    if (!confirmDelete) return;
    const handleClickOutside = (e) => {
      if (deleteBtnRef.current && !deleteBtnRef.current.contains(e.target)) {
        setConfirmDelete(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [confirmDelete]);

  const field = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value === '' && name === 'contextTool' ? null : e.target.value }));
    setErrors((er) => ({ ...er, [name]: null }));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      setErrors({ title: 'Title is required.' });
      return;
    }
    const contextChanged = !isNew && form.context !== task.context;
    const saved = {
      id:          isNew ? uid() : task.id,
      createdDate: isNew ? todayStr() : task.createdDate,
      title:       form.title.trim(),
      description: form.description.trim(),
      type:        form.type,
      status:      form.status,
      assignee:    form.assignee || 'Unassigned',
      dueDate:     form.dueDate || null,
      context:     form.context,
      contextTool: form.contextTool,
      contextUpdatedAt: isNew || contextChanged
        ? new Date().toISOString()
        : (task.contextUpdatedAt || null),
    };
    const prevAssignee = task?.assignee || 'Unassigned';
    const wasHandoff = !isNew && saved.assignee !== prevAssignee;
    onSave(saved);
    if (wasHandoff) {
      if (saved.assignee === 'Unassigned') {
        onToast('Task marked as unassigned.', 'handoff');
      } else {
        onToast(`Task handed off to ${saved.assignee}.`, 'handoff');
      }
    }
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete(task.id);
    onClose();
  };

  const handleCopy = () => {
    const md = buildPromptContext({ ...task, ...form });
    copyToClipboard(md)
      .then(() => {
        onToast('Context copied. Hand it off to your AI tool.', 'success');
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => onToast('Could not copy context. Check clipboard permissions and try again.', 'error'));
  };

  const typeOptions = [
    {
      value: 'feature',
      label: 'Feature',
      badge: (
        <span className="rounded border border-text-primary bg-type-feature px-1.5 py-0.5 font-mono text-[10px] font-bold text-white shadow-[1px_1px_0px_#171717]">
          ★ Feature
        </span>
      ),
    },
    {
      value: 'bug',
      label: 'Bug',
      badge: (
        <span className="rounded border border-text-primary bg-type-bug px-1.5 py-0.5 font-mono text-[10px] font-bold text-white shadow-[1px_1px_0px_#171717]">
          ✕ Bug
        </span>
      ),
    },
  ];

  const statusOptions = STAGES.map((s) => ({
    value: s.id,
    label: s.label,
    icon: (
      <span
        aria-hidden="true"
        className="inline-block h-3 w-3 rounded-full border border-text-primary shadow-[1px_1px_0px_#171717]"
        style={{ backgroundColor: COL_ACCENTS[s.id] || '#171717' }}
      />
    ),
  }));

  const assigneeOptions = [
    {
      value: 'Unassigned',
      label: 'Unassigned',
      badge: <AssigneeBadge name="Unassigned" size="sm" />,
      description: 'Leave task unassigned',
    },
    ...teamList.map((m) => ({
      value: m.name,
      label: m.name,
      badge: <AssigneeBadge name={m.name} size="sm" />,
      description: m.email || undefined,
    })),
  ];

  const toolOptions = [
    { value: '', label: '— None —', icon: '—' },
    ...AI_TOOLS.map((t) => ({
      value: t,
      label: t,
      badge: (
        <span className="rounded border border-text-primary bg-[#FFF8E8] px-1.5 py-0.5 font-mono text-[10px] font-bold text-text-primary shadow-[1px_1px_0px_#171717]">
          AI · {t}
        </span>
      ),
    })),
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[1000] bg-text-primary/65"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? 'Add task' : `Edit task: ${task.title}`}
        className="neu-sheet md:max-w-[660px]"
      >
        {/* Modal header */}
        <div className="neu-sheet-header bg-text-primary text-surface-page px-4 pb-[14px] flex items-center justify-between md:px-5 md:pb-[14px]">
          <span className="font-heading text-[16px] tracking-[0.5px]">
            {isNew ? '+ NEW TASK' : 'EDIT TASK'}
          </span>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="neu-sheet-close border-surface-page text-surface-page bg-transparent hover:bg-surface-page hover:text-text-primary transition-[transform,box-shadow,background-color,color] duration-[80ms] hover:shadow-[2px_2px_0_0_#FFF8E8]"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="neu-sheet-body p-4 md:p-5">

          {/* Title */}
          <div className="mb-[14px]">
            <label htmlFor="m-title" className="neu-label">
              Title <span aria-hidden="true" className="text-brand-primary">*</span>
            </label>
            <input
              id="m-title"
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={field('title')}
              placeholder="What needs to be done?"
              aria-required="true"
              aria-describedby={errors.title ? 'm-title-err' : undefined}
              className={`neu-input w-full ${errors.title ? 'border-type-bug' : ''}`}
            />
            {errors.title && (
              <p id="m-title-err" role="alert" className="text-type-bug text-[12px] mt-1 font-body">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-[14px]">
            <label htmlFor="m-desc" className="neu-label">Description</label>
            <textarea
              id="m-desc"
              value={form.description}
              onChange={field('description')}
              placeholder="Briefly describe what this task covers."
              rows={3}
              className="neu-input w-full resize-y leading-[1.5]"
            />
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-3 mb-[14px]">
            <div className="min-w-0">
              <label htmlFor="m-type" className="neu-label">Type</label>
              <NeuSelect
                id="m-type"
                value={form.type}
                onChange={field('type')}
                options={typeOptions}
                aria-label="Task type"
                className="w-full min-w-0"
              />
            </div>
            <div className="min-w-0">
              <label htmlFor="m-status" className="neu-label">Status</label>
              <NeuSelect
                id="m-status"
                value={form.status}
                onChange={field('status')}
                options={statusOptions}
                aria-label="Task status"
                className="w-full min-w-0"
              />
            </div>
          </div>

          {/* Assignee + Due date */}
          <div className="grid grid-cols-1 gap-3 mb-[14px] sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor={isNew ? 'm-assignee' : undefined} className="neu-label">
                Assignee
              </label>
              {isNew ? (
                <div className="flex items-center gap-2 min-w-0 w-full">
                  <AssigneeBadge name={form.assignee} size="sm" />
                  <div className="min-w-0 flex-1">
                    <NeuSelect
                      id="m-assignee"
                      value={form.assignee}
                      onChange={field('assignee')}
                      options={assigneeOptions}
                      aria-label="Assign task to a teammate or unassign"
                      className="w-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[38px] items-center gap-2 rounded border-[3px] border-text-primary bg-[#FBF9F3] px-3 py-1.5 shadow-neu-sm">
                  <AssigneeBadge name={task.assignee || 'Unassigned'} size="sm" />
                  <span className="truncate font-body text-sm font-bold text-text-primary">
                    {task.assignee || 'Unassigned'}
                  </span>
                  {teamList.find((m) => m.name === (task.assignee || 'Unassigned'))?.email && (
                    <span className="hidden truncate font-mono text-[11px] text-text-muted sm:inline">
                      ({teamList.find((m) => m.name === (task.assignee || 'Unassigned')).email})
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <label htmlFor="m-due" className="neu-label">Due date</label>
              <input id="m-due" type="date" value={form.dueDate} onChange={field('dueDate')} className="neu-input w-full min-w-0" />
            </div>
          </div>

          {/* Hand off panel (edit mode only) */}
          {!isNew && (
            <div className="mb-[14px] rounded border-[3px] border-text-primary bg-white p-[14px] shadow-[3px_3px_0_0_#FF5C7A]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <p className="font-body font-bold text-[13px] text-text-primary">⇥ Hand off / Assign to…</p>
                {form.assignee !== (task.assignee || 'Unassigned') && (
                  <span className="font-mono text-[11px] font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary px-2 py-[1px] rounded">
                    Pending assignment on Save
                  </span>
                )}
              </div>
              <div className="flex items-center gap-[10px] min-w-0">
                <AssigneeBadge name={form.assignee} size="md" />
                <div className="min-w-0 flex-1">
                  <NeuSelect
                    id="m-handoff"
                    value={form.assignee}
                    onChange={field('assignee')}
                    options={assigneeOptions}
                    aria-label="Reassign task to a teammate or unassign"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Context section ── */}
          <div>
            <h3 className="font-heading text-[12px] tracking-[1px] uppercase text-text-primary border-b-[3px] border-text-primary pb-1 mb-3 mt-5">
              Context
            </h3>

            {/* AI tool */}
            <div className="mb-3">
              <label htmlFor="m-tool" className="neu-label">AI Tool used</label>
              <NeuSelect
                id="m-tool"
                value={form.contextTool || ''}
                onChange={(e) => setForm((f) => ({ ...f, contextTool: e.target.value || null }))}
                options={toolOptions}
                aria-label="AI tool used for prompt context"
                className="w-full"
              />
            </div>

            {/* Freshness indicator — M12 */}
            {!isNew && task.contextUpdatedAt && (
              <p className="font-mono text-[11px] text-text-muted mb-2">
                ◈ Context last updated {timeAgo(task.contextUpdatedAt)}
              </p>
            )}

            {/* Markdown context textarea */}
            <label htmlFor="m-ctx" className="neu-label">
              Prompt Context
              <span className="font-normal ml-[6px] text-[12px] text-text-muted">(Markdown · paste into AI chat)</span>
            </label>
            <textarea
              id="m-ctx"
              value={form.context}
              onChange={field('context')}
              rows={10}
              className="neu-input w-full resize-y leading-[1.6] font-mono text-[13px]"
            />

            {/* Copy from modal */}
            <div className="mt-[10px]">
              <button
                onClick={handleCopy}
                className={`w-full cursor-pointer rounded border-[3px] border-text-primary px-[18px] py-2.5 font-mono text-[13px] font-bold transition-[transform,box-shadow,background-color] duration-[80ms] active:translate-x-px active:translate-y-px active:shadow-none sm:w-auto sm:py-2 ${copied ? 'bg-brand-accent text-text-primary shadow-none' : 'bg-text-primary text-surface-page shadow-neu-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-neu'}`}
              >
                {copied ? '✓ Copied to clipboard' : '⇥ Copy as Prompt Context'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="neu-sheet-footer px-4 pt-[14px] border-t-[3px] border-text-primary flex justify-between items-center gap-2 bg-surface-page md:px-5 md:gap-[10px]">
          <div>
            {!isNew && (
              <button
                ref={deleteBtnRef}
                type="button"
                onClick={handleDelete}
                aria-label={confirmDelete ? 'Confirm delete task' : 'Delete task'}
                className={`neu-button min-h-[44px] font-body text-[13px] font-bold text-text-primary px-3 py-2 transition-[transform,box-shadow,background-color] duration-[80ms] md:min-h-0 md:px-[14px] ${confirmDelete ? 'bg-type-bug' : 'bg-white'}`}
              >
                {confirmDelete ? (
                  <>! Confirm<span className="hidden sm:inline"> Delete</span></>
                ) : (
                  <>✕ Delete<span className="hidden sm:inline"> task</span></>
                )}
              </button>
            )}
          </div>
          <div className="flex gap-2 md:gap-[10px]">
            <button
              onClick={onClose}
              className="min-h-[44px] font-heading text-[13px] tracking-[0.5px] uppercase bg-white text-text-primary border-[3px] border-text-primary shadow-neu rounded px-3 py-2 cursor-pointer transition-[transform,box-shadow] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-neu-sm sm:px-[18px] md:min-h-0"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="min-h-[44px] font-heading text-[13px] tracking-[0.5px] uppercase bg-brand-primary text-white border-[3px] border-text-primary shadow-neu rounded px-4 py-2 cursor-pointer transition-[transform,box-shadow] duration-[80ms] hover:-translate-x-px hover:-translate-y-px hover:shadow-neu-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-neu-sm sm:px-[22px] md:min-h-0"
            >
              {isNew ? 'CREATE' : 'SAVE'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
