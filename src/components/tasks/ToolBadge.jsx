/**
 * Small badge showing the AI tool used for context (M12).
 * Returns null if no tool is set.
 */
export default function ToolBadge({ tool }) {
  if (!tool) return null;
  return (
    <span className="inline-flex items-center gap-[3px] bg-surface-page text-text-muted border-2 border-text-muted rounded-sm px-[6px] py-[1px] font-mono text-[10px] font-medium">
      ◈ {tool}
    </span>
  );
}
