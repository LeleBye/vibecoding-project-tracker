import { useState, useRef, useEffect } from 'react';
import { ANCHOR_ICONS } from '../../constants/taskConfig.js';
import { SEED_ANCHORS } from '../../data/seedData.js';

/**
 * Editable card for a single deliverable anchor (M11).
 * Clicking "Add" / "Edit" enters inline edit mode; Enter saves, Escape cancels.
 */
function AnchorCard({ anchor, onChange }) {
  const filled = Boolean(anchor.url && anchor.url.trim());
  const icon = ANCHOR_ICONS[anchor.id] || '□';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(anchor.url || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  // Keep draft in sync if parent url changes (e.g. on reload)
  useEffect(() => { setDraft(anchor.url || ''); }, [anchor.url]);

  const save   = () => { onChange(draft.trim() || null); setEditing(false); };
  const cancel = () => { setDraft(anchor.url || ''); setEditing(false); };

  return (
    <div
      className={`neu-card min-w-0 overflow-hidden ${filled ? 'bg-brand-accent' : 'bg-white'}`}
    >
      {/* Header: icon + label (clickable link when filled) + status badge */}
      <div className="flex items-center gap-[6px] mb-[10px] min-w-0">
        <span aria-hidden="true" className="text-[15px] shrink-0">{icon}</span>

        {filled ? (
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

        <span
          className={`ml-auto shrink-0 rounded-sm border-2 border-text-primary px-[5px] py-[1px] font-mono text-[10px] font-bold ${filled ? 'bg-black/10 text-text-primary' : 'bg-[#F0EDE5] text-text-muted'}`}
        >
          {filled ? '✓ LINKED' : '○ EMPTY'}
        </span>
      </div>

      {/* URL area */}
      {editing ? (
        <div className="flex gap-[5px] min-w-0">
          <input
            ref={inputRef}
            type="url"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
            placeholder="https://..."
            aria-label={`URL for ${anchor.label}`}
            className="neu-input flex-1 min-w-0 font-mono text-[11px]"
          />
          <button onClick={save} className="neu-button shrink-0 font-mono text-[11px] font-bold px-[10px] py-[4px]">
            Save
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-[6px] min-w-0">
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
            onClick={() => { setDraft(anchor.url || ''); setEditing(true); }}
            aria-label={`${filled ? 'Edit' : 'Add'} URL for ${anchor.label}`}
            className="neu-button shrink-0 font-mono text-[10px] font-bold px-2 py-[3px]"
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
 */
export default function AnchorBoard({ anchors, onAnchorChange }) {
  const safeAnchors = Array.isArray(anchors) ? anchors : SEED_ANCHORS;
  return (
    <section aria-label="Deliverable Anchor Board" className="mb-7">
      <div className="flex items-center gap-[10px] mb-3">
        <h2 className="font-heading text-[13px] tracking-[1px] uppercase text-text-primary m-0">
          Deliverable Anchors
        </h2>
        <div className="flex-1 h-[3px] bg-text-primary" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {safeAnchors.map((a) => (
          <AnchorCard key={a.id} anchor={a} onChange={(url) => onAnchorChange(a.id, url)} />
        ))}
      </div>
    </section>
  );
}
