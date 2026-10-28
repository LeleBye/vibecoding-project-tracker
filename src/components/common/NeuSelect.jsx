import React, { useState, useRef, useEffect, useId, useMemo } from 'react';

/**
 * Parses children (<option>, <optgroup>) into a normalized option structure
 * if the `options` prop is not passed directly.
 */
function parseChildrenToOptions(children) {
  if (!children) return [];
  const parsed = [];
  React.Children.forEach(children, (child) => {
    if (!child) return;
    if (child.type === 'optgroup') {
      const groupOptions = [];
      React.Children.forEach(child.props.children, (opt) => {
        if (!opt) return;
        groupOptions.push({
          value: opt.props.value,
          label: opt.props.children ?? opt.props.value,
          disabled: opt.props.disabled,
          title: opt.props.title,
          ...opt.props['data-meta'],
        });
      });
      parsed.push({
        group: child.props.label || 'Group',
        options: groupOptions,
      });
    } else if (child.type === 'option') {
      parsed.push({
        value: child.props.value,
        label: child.props.children ?? child.props.value,
        disabled: child.props.disabled,
        title: child.props.title,
        ...child.props['data-meta'],
      });
    }
  });
  return parsed;
}

/**
 * Normalizes input options into a consistent structure of groups or flat items.
 */
function normalizeOptions(options, children) {
  const source = options && options.length > 0 ? options : parseChildrenToOptions(children);
  return source.map((item) => {
    if (typeof item === 'string' || typeof item === 'number') {
      return { value: item, label: String(item) };
    }
    if (item.group || item.options) {
      return {
        group: item.group || item.label || 'Group',
        options: (item.options || []).map((opt) =>
          typeof opt === 'string' || typeof opt === 'number'
            ? { value: opt, label: String(opt) }
            : opt
        ),
      };
    }
    return item;
  });
}

/**
 * Flattens options into a linear list of selectable items for keyboard navigation.
 */
function flattenSelectable(items) {
  const flat = [];
  items.forEach((item) => {
    if (item.group && Array.isArray(item.options)) {
      item.options.forEach((opt) => {
        if (!opt.disabled) flat.push(opt);
      });
    } else if (!item.disabled) {
      flat.push(item);
    }
  });
  return flat;
}

/**
 * Neubrutalist Custom Dropdown Select.
 * Replaces native HTML <select> with an accessible, keyboard-operable,
 * Neubrutalist styled dropdown matching the application's visual system.
 */
export default function NeuSelect({
  id: propId,
  name,
  value,
  onChange,
  options,
  children,
  placeholder = 'Select…',
  disabled = false,
  className = '',
  menuClassName = '',
  buttonClassName = '',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  title,
  renderOption,
  renderSelected,
  onOpen,
  onClose,
  fullWidth = true,
  align = 'left',
}) {
  const reactId = useId();
  const id = propId || `neu-select-${reactId}`;
  const listboxId = `${id}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const highlightedRef = useRef(null);

  // Normalize options from props or children
  const normalizedItems = useMemo(
    () => normalizeOptions(options, children),
    [options, children]
  );

  const flatOptions = useMemo(
    () => flattenSelectable(normalizedItems),
    [normalizedItems]
  );

  // Find currently selected option object
  const selectedOption = useMemo(() => {
    return flatOptions.find((opt) => String(opt.value) === String(value)) || null;
  }, [flatOptions, value]);

  // Handle value change callback with synthetic event for compatibility
  const selectValue = (newVal, opt) => {
    if (disabled) return;
    setIsOpen(false);
    if (onClose) onClose();

    if (onChange) {
      const syntheticEvent = {
        target: { id, name, value: newVal },
        currentTarget: { id, name, value: newVal },
        value: newVal,
        option: opt,
        preventDefault: () => {},
        stopPropagation: () => {},
      };
      onChange(syntheticEvent, newVal, opt);
    }

    // Return focus to trigger button
    triggerRef.current?.focus();
  };

  // Open / Close toggle with upward flip calculation
  const toggleOpen = () => {
    if (disabled) return;
    if (isOpen) {
      setIsOpen(false);
      if (onClose) onClose();
    } else {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const shouldFlip = spaceBelow < 220 && rect.top > spaceBelow;
        setOpenUpward(shouldFlip);
      }
      const curIndex = flatOptions.findIndex((opt) => String(opt.value) === String(value));
      setHighlightedIndex(curIndex >= 0 ? curIndex : 0);
      setIsOpen(true);
      if (onOpen) onOpen();
    }
  };

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        if (onClose) onClose();
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [isOpen, onClose]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleOpen();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % flatOptions.length);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + flatOptions.length) % flatOptions.length);
        break;
      }
      case 'Home': {
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      }
      case 'End': {
        e.preventDefault();
        setHighlightedIndex(flatOptions.length - 1);
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < flatOptions.length) {
          const opt = flatOptions[highlightedIndex];
          selectValue(opt.value, opt);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setIsOpen(false);
        if (onClose) onClose();
        triggerRef.current?.focus();
        break;
      }
      case 'Tab': {
        setIsOpen(false);
        if (onClose) onClose();
        break;
      }
      default:
        break;
    }
  };

  // Render option item
  const renderOptionItem = (opt) => {
    const isSelected = String(opt.value) === String(value);
    const flatIdx = flatOptions.findIndex((o) => o.value === opt.value);
    const isHighlighted = flatIdx === highlightedIndex;

    if (renderOption) {
      return (
        <div
          key={String(opt.value)}
          ref={isHighlighted ? highlightedRef : null}
          id={`${id}-opt-${flatIdx}`}
          role="option"
          aria-selected={isSelected}
          aria-disabled={opt.disabled}
          onClick={() => !opt.disabled && selectValue(opt.value, opt)}
          onMouseEnter={() => !opt.disabled && setHighlightedIndex(flatIdx)}
          className={`cursor-pointer transition-colors ${
            opt.disabled ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          {renderOption(opt, isSelected, isHighlighted)}
        </div>
      );
    }

    return (
      <div
        key={String(opt.value)}
        ref={isHighlighted ? highlightedRef : null}
        id={`${id}-opt-${flatIdx}`}
        role="option"
        aria-selected={isSelected}
        aria-disabled={opt.disabled}
        onClick={() => !opt.disabled && selectValue(opt.value, opt)}
        onMouseEnter={() => !opt.disabled && setHighlightedIndex(flatIdx)}
        className={`group flex min-h-[40px] items-center justify-between gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer select-none border-b border-text-primary/10 last:border-b-0 ${
          opt.disabled ? 'cursor-not-allowed opacity-50' : ''
        } ${
          isSelected
            ? 'bg-brand-accent/30 font-bold text-text-primary border-l-4 border-l-brand-primary'
            : isHighlighted
            ? 'bg-surface-page text-text-primary'
            : 'bg-white text-text-primary'
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {opt.icon && (
            <span aria-hidden="true" className="shrink-0 leading-none">
              {opt.icon}
            </span>
          )}
          {opt.badge && (
            <span className="shrink-0">{opt.badge}</span>
          )}
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-body text-[13px] font-bold text-text-primary">
              {opt.label}
            </span>
            {opt.description && (
              <span className="truncate font-mono text-[10px] text-text-muted">
                {opt.description}
              </span>
            )}
          </div>
        </div>

        {isSelected && (
          <span
            aria-hidden="true"
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-text-primary bg-brand-accent font-mono text-[10px] font-black text-text-primary shadow-[1px_1px_0px_#171717]"
          >
            ✓
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${fullWidth ? 'w-full min-w-0' : ''} ${className}`}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-activedescendant={
          isOpen && highlightedIndex >= 0 ? `${id}-opt-${highlightedIndex}` : undefined
        }
        title={title}
        disabled={disabled}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        className={`neu-input flex min-h-[38px] w-full items-center justify-between gap-2 text-left font-body text-sm font-bold transition-all duration-[80ms] ${
          disabled
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer hover:shadow-neu active:translate-x-px active:translate-y-px active:shadow-none'
        } ${buttonClassName}`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 truncate">
          {renderSelected ? (
            renderSelected(selectedOption, isOpen)
          ) : selectedOption ? (
            <>
              {selectedOption.icon && (
                <span aria-hidden="true" className="shrink-0 leading-none">
                  {selectedOption.icon}
                </span>
              )}
              {selectedOption.badge && (
                <span className="shrink-0">{selectedOption.badge}</span>
              )}
              <span className="truncate">{selectedOption.label}</span>
            </>
          ) : (
            <span className="truncate font-normal text-text-muted">{placeholder}</span>
          )}
        </div>

        <span
          aria-hidden="true"
          className={`shrink-0 font-mono text-[11px] font-black transition-transform duration-100 ${
            isOpen ? 'rotate-180 text-brand-primary' : 'text-text-primary'
          }`}
        >
          ▼
        </span>
      </button>

      {/* Hidden native select for form accessibility, DOM queries & test automation */}
      <select
        id={`${id}-native`}
        name={name}
        value={value}
        onChange={(e) => selectValue(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only pointer-events-none absolute -bottom-px left-0 h-0 w-0 opacity-0"
      >
        {flatOptions.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {typeof opt.label === 'string' ? opt.label : opt.value}
          </option>
        ))}
      </select>

      {/* Neubrutalist Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel || title}
          className={`absolute z-[1050] min-w-full rounded border-[3px] border-text-primary bg-surface-card shadow-neu overflow-hidden animate-[toastIn_80ms_ease-out] ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${menuClassName}`}
        >
          <div className="max-h-[min(16rem,50vh)] sm:max-h-72 overflow-y-auto overscroll-contain touch-pan-y">
            {normalizedItems.map((item, itemIdx) => {
              if (item.group && Array.isArray(item.options)) {
                return (
                  <div key={item.group + itemIdx} role="group" aria-label={item.group}>
                    <div className="sticky top-0 z-10 flex items-center justify-between border-y-2 border-text-primary bg-surface-page px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-text-primary select-none shadow-[0_1px_0_0_#171717]">
                      <span>{item.group}</span>
                      <span className="text-[9px] text-text-muted">
                        ({item.options.length})
                      </span>
                    </div>
                    {item.options.map((opt) => renderOptionItem(opt))}
                  </div>
                );
              }
              return renderOptionItem(item);
            })}
          </div>
        </div>
      )}
    </div>
  );
}
