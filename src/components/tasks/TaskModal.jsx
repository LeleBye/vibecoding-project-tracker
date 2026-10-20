import { useState, useRef, useEffect } from 'react';
import AssigneeBadge from '../tasks/AssigneeBadge.jsx';
import { STAGES, TEAM, AI_TOOLS, CONTEXT_TEMPLATE, EMPTY_FORM } from '../../constants/taskConfig.js';
import { uid, todayStr, timeAgo, buildPromptContext } from '../../utils/taskUtils.js';
import { copyToClipboard } from '../../utils/clipboard.js';

/**
 * Task add/edit/delete modal (M5, M9, M10, M12).
 * Rendered by App when modalTask !== undefined.
 * task === null  →  "new task" mode
 * task === {...} →  "edit task" mode
 */
export default function TaskModal({ task, onSave, onDelete, onClose, onToast }) {
  const isNew = !task?.id;

  const [form, setForm] = useState(() =>
    isNew
      ? { ...EMPTY_FORM }
      : {
          title:       task.title       || '',
          description: task.description || '',
          type:        task.type        || 'feature',
          status:      task.status      || 'todo',
          assignee:    task.assignee    || TEAM[0],
          dueDate:     task.dueDate     || '',
          context:     task.context     || CONTEXT_TEMPLATE,
          contextTool: task.contextTool || null,
        }
  );
  const [errors, setErrors]               = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied]               = useState(false);
  const titleRef                          = useRef(null);

  // Auto-focus title on open
  useEffect(() => { if (titleRef.current) titleRef.current.focus(); }, []);

  // Escape to close
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

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
      assignee:    form.assignee,
      dueDate:     form.dueDate || null,
      context:     form.context,
      contextTool: form.contextTool,
      contextUpdatedAt: isNew || contextChanged
        ? new Date().toISOString()
        : (task.contextUpdatedAt || null),
    };
    const wasHandoff = !isNew && saved.assignee !== task.assignee;
    onSave(saved);
    if (wasHandoff) onToast(`Task handed off to ${saved.assignee}.`, 'handoff');
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete(task.id);
    onClose();
  };

  const handleCopy = () => {
    const md = buildPromptContext({ ...task, ...form });
    copyToClipboard(md).then(() => {
      onToast('Context copied. Hand it off to your AI tool.', 'success');
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

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
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] w-[90%] max-w-[660px] max-h-[90vh] overflow-y-auto bg-surface-page border-[3px] border-text-primary shadow-neu-lg rounded flex flex-col"
      >
        {/* Modal header */}
        <div className="bg-text-primary text-surface-page px-5 py-[14px] flex items-center justify-between shrink-0">
          <span className="font-heading text-[16px] tracking-[0.5px]">
            {isNew ? '+ NEW TASK' : 'EDIT TASK'}
          </span>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="neu-icon-button border-2 border-surface-page text-surface-page bg-transparent w-8 h-8"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1">

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
            <div>
              <label htmlFor="m-type" className="neu-label">Type</label>
              <select id="m-type" value={form.type} onChange={field('type')} className="neu-input w-full">
                <option value="feature">★ Feature</option>
                <option value="bug">✕ Bug</option>
              </select>
            </div>
            <div>
              <label htmlFor="m-status" className="neu-label">Status</label>
              <select id="m-status" value={form.status} onChange={field('status')} className="neu-input w-full">
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee + Due date */}
          <div className="grid grid-cols-2 gap-3 mb-[14px]">
            <div>
              <label htmlFor="m-assignee" className="neu-label">Assignee</label>
              <select id="m-assignee" value={form.assignee} onChange={field('assignee')} className="neu-input w-full">
                {TEAM.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="m-due" className="neu-label">Due date</label>
              <input id="m-due" type="date" value={form.dueDate} onChange={field('dueDate')} className="neu-input w-full" />
            </div>
          </div>

          {/* Hand off panel (edit mode only) */}
          {!isNew && (
            <div className="mb-[14px] rounded border-[3px] border-text-primary bg-white p-[14px] shadow-[3px_3px_0_0_#FF5C7A]">
              <p className="font-body font-bold text-[13px] mb-2 text-text-primary">⇥ Hand off to…</p>
              <div className="flex items-center gap-[10px]">
                <AssigneeBadge name={form.assignee} size="md" />
                <select
                  id="m-handoff"
                  value={form.assignee}
                  onChange={field('assignee')}
                  aria-label="Reassign task to a teammate"
                  className="neu-input flex-1"
                >
                  {TEAM.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
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
              <select
                id="m-tool"
                value={form.contextTool || ''}
                onChange={(e) => setForm((f) => ({ ...f, contextTool: e.target.value || null }))}
                className="neu-input w-full"
              >
                <option value="">— None —</option>
                {AI_TOOLS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
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
                className={`cursor-pointer rounded border-[3px] border-text-primary px-[18px] py-2 font-mono text-[13px] font-bold transition-colors duration-150 ${copied ? 'bg-brand-accent text-text-primary shadow-none' : 'bg-text-primary text-surface-page shadow-[3px_3px_0_0_#625D66]'}`}
              >
                {copied ? '✓ Copied to clipboard' : '⇥ Copy as Prompt Context'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-[14px] border-t-[3px] border-text-primary flex justify-between items-center shrink-0 gap-[10px] bg-surface-page">
          <div>
            {!isNew && (
              <button
                onClick={handleDelete}
                className={`neu-button font-body text-[13px] font-bold text-text-primary px-[14px] py-2 transition-colors duration-150 ${confirmDelete ? 'bg-type-bug' : 'bg-white'}`}
              >
                {confirmDelete ? '⚠ Confirm Delete' : '✕ Delete task'}
              </button>
            )}
          </div>
          <div className="flex gap-[10px]">
            <button onClick={onClose} className="neu-button bg-white text-text-primary font-body font-bold text-[13px] px-[18px] py-2">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="font-heading text-[13px] tracking-[0.5px] bg-brand-primary text-white border-[3px] border-text-primary shadow-neu rounded px-[22px] py-2 cursor-pointer transition-[transform,box-shadow] duration-[80ms] active:translate-x-[2px] active:translate-y-[2px] active:shadow-neu-sm"
            >
              {isNew ? 'CREATE' : 'SAVE'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
