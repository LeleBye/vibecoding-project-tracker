import { useState, useRef, useEffect } from 'react';
import { ANCHOR_ICONS } from '../../constants/taskConfig.js';
import { SEED_ANCHORS } from '../../data/seedData.js';

function normalizeAnchorUrl(value) {
  const url = value.trim();
  if (!url) return null;
  if (url.startsWith('//')) return `https:${url}`;
  if (/^[a-z][a-z\d+.-]*:/i.test(url)) return url;
  return `https://${url}`;
}

/**
 * Editable card for a single deliverable anchor (M11).
 * Clicking "Add" / "Edit" enters inline edit mode; Enter saves, Escape cancels.
 */
function AnchorCard({ anchor, onChange }) {
  const filled = Boolean(anchor.url && anchor.url.trim());
  const icon = ANCHOR_ICONS[anchor.id] || '□';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(anchor.url || '');
  const [titleDraft, setTitleDraft] = useState(anchor.label || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  // Keep drafts in sync if parent data changes (e.g. after reload or project switch).
  useEffect(() => { setDraft(anchor.url || ''); }, [anchor.url]);
  useEffect(() => { setTitleDraft(anchor.label || ''); }, [anchor.label]);

  const save = () => {
    const label = titleDraft.trim();
    if (!label) return;
    onChange({ label, url: normalizeAnchorUrl(draft) });
    setEditing(false);
  };
  const cancel = () => {
    setTitleDraft(anchor.label || '');
    setDraft(anchor.url || '');
    setEditing(false);
  };

  return (
    <div
      className={`neu-card min-w-0 overflow-hidden ${filled ? 'bg-brand-accent' : 'bg-white'}`}
    >
      {/* Header: icon + label (clickable link when filled) + status badge */}
      <div className="flex items-center gap-[6px] mb-[10px] min-w-0">
        <span aria-hidden="true" className="text-[15px] shrink-0">{icon}</span>

        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') cancel();
            }}
            aria-label={`Name for ${anchor.label}`}
            className="neu-input min-w-0 flex-1 px-2 py-1 font-heading text-[12px]"
          />
        ) : filled ? (
          <a
            href={anchor.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open ${anchor.label}`}
            className="font-heading text-[13px] text-text-primary underline overflow-hidden text-ellipsis whitespace-nowrap min-w-0"
          >
            {anchor.label}
          </a>
        ) : (
          <span className="font-heading text-[13px] text-text-primary overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
            {anchor.label}
          </span>
        )}

        {!editing && (
          <span
            className={`ml-auto shrink-0 rounded-sm border-2 border-text-primary px-[5px] py-[1px] font-mono text-[10px] font-bold ${filled ? 'bg-black/10 text-text-primary' : 'bg-[#F0EDE5] text-text-muted'}`}
          >
            <span aria-hidden="true">{filled ? '✓' : '○'}</span>
            <span className="sr-only sm:not-sr-only"> {filled ? 'LINKED' : 'EMPTY'}</span>
          </span>
        )}
      </div>

      {/* URL area */}
      {editing ? (
        <div className="flex min-w-0 flex-wrap gap-[5px] sm:flex-nowrap">
          <input
            type="url"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
            placeholder="https://..."
            aria-label={`URL for ${anchor.label}`}
            className="neu-input min-w-0 basis-full font-mono text-[11px] sm:flex-1 sm:basis-auto"
          />
          <button
            onClick={save}
            disabled={!titleDraft.trim()}
            className="neu-button min-h-[36px] flex-1 px-[10px] py-[4px] font-mono text-[11px] font-bold disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:flex-none sm:shrink-0"
          >
            Save
          </button>
          <button onClick={cancel} className="neu-button min-h-[36px] flex-1 bg-white px-[10px] py-[4px] font-mono text-[11px] font-bold sm:min-h-0 sm:flex-none sm:shrink-0">
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex min-w-0 flex-col items-stretch gap-[6px] sm:flex-row sm:items-center">
          {filled ? (
            <a
              href={anchor.url}
              target="_blank"
              rel="noopener noreferrer"
              title={anchor.url}
              className="flex-1 min-w-0 font-mono text-[11px] text-text-primary underline overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {anchor.url}
            </a>
          ) : (
            <span className="flex-1 min-w-0 font-body text-[12px] text-text-muted overflow-hidden text-ellipsis whitespace-nowrap">
              No link yet
            </span>
          )}
          <button
            onClick={() => {
              setDraft(anchor.url || '');
              setTitleDraft(anchor.label || '');
              setEditing(true);
            }}
            aria-label={`${filled ? 'Edit' : 'Add'} URL for ${anchor.label}`}
            className="neu-button min-h-[36px] shrink-0 font-mono text-[10px] font-bold px-2 py-[3px] sm:min-h-0"
          >
            {filled ? 'Edit' : '+ Add'}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Anchor Board section — four equal-width anchor cards above the Kanban (M11).
 * Phones: collapsed by default behind a toggle showing how many are linked.
 */
export default function AnchorBoard({ anchors, onAnchorChange }) {
  const safeAnchors = Array.isArray(anchors) ? anchors : SEED_ANCHORS;
  const [expanded, setExpanded] = useState(false);
  const linkedCount = safeAnchors.filter((a) => a.url && a.url.trim()).length;

  return (
    <section aria-label="Deliverable Anchor Board" className={`${expanded ? 'mb-7' : 'mb-5'} md:mb-7`}>
      <div className="flex items-center gap-[10px] mb-3">
        <h2 className="font-heading text-[13px] tracking-[1px] uppercase text-text-primary m-0">
          Deliverable Anchors
        </h2>
        <div className="flex-1 h-[3px] bg-text-primary" />
        <button
          id="toggle-anchors-btn"
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="anchor-grid"
          className="flex min-h-[36px] shrink-0 items-center gap-1.5 rounded border-2 border-text-primary bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-text-primary shadow-neu-sm active:translate-x-px active:translate-y-px active:shadow-none md:hidden"
        >
          <span className={`rounded-sm border-2 border-text-primary px-1 ${linkedCount > 0 ? 'bg-brand-accent' : 'bg-[#F0EDE5]'}`}>
            {linkedCount}/{safeAnchors.length}
          </span>
          linked
          <span className="sr-only">{expanded ? ', hide anchors' : ', show anchors'}</span>
          <span aria-hidden="true" className={`inline-block transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}>▾</span>
        </button>
      </div>
      <div
        id="anchor-grid"
        className={`${expanded ? 'grid' : 'hidden'} grid-cols-2 gap-3 md:grid lg:grid-cols-4`}
      >
        {safeAnchors.map((a) => (
          <AnchorCard key={a.id} anchor={a} onChange={(changes) => onAnchorChange(a.id, changes)} />
        ))}
      </div>
    </section>
  );
}
