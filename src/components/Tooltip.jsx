import { cloneElement, isValidElement, useId, useRef, useState } from "react";

// Minimum gap kept between the tooltip bubble and the viewport edges.
const VIEWPORT_MARGIN = 16;

// Shared show/hide classes: hidden by default, revealed when the wrapper is
// hovered or anything inside it has keyboard focus.
const REVEAL_CLASSES =
  "pointer-events-none invisible opacity-0 translate-y-1 transition-all duration-300 group-hover/tooltip:visible group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 group-focus-within/tooltip:visible group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:translate-y-0";

/**
 * Hover/focus tooltip styled to match the site's dark glass + gradient look.
 * Wrap a single focusable element; it receives `aria-describedby` automatically.
 */
export const Tooltip = ({ content, children }) => {
  const tooltipId = useId();
  const wrapperRef = useRef(null);
  const bubbleRef = useRef(null);
  const [shift, setShift] = useState(0);

  // The bubble is centred on the trigger, then nudged sideways if that would
  // push it past either edge of the viewport (e.g. links near the screen edge).
  const updatePosition = () => {
    const wrapper = wrapperRef.current;
    const bubble = bubbleRef.current;
    if (!wrapper || !bubble) return;

    const triggerRect = wrapper.getBoundingClientRect();
    const bubbleWidth = bubble.offsetWidth;
    const naturalLeft =
      triggerRect.left + triggerRect.width / 2 - bubbleWidth / 2;
    const maxLeft =
      document.documentElement.clientWidth - VIEWPORT_MARGIN - bubbleWidth;
    const clampedLeft = Math.min(
      Math.max(naturalLeft, VIEWPORT_MARGIN),
      maxLeft
    );

    setShift(clampedLeft - naturalLeft);
  };

  const trigger = isValidElement(children)
    ? cloneElement(children, { "aria-describedby": tooltipId })
    : children;

  return (
    <span
      ref={wrapperRef}
      className="group/tooltip relative inline-flex"
      onMouseEnter={updatePosition}
      onFocus={updatePosition}
    >
      {trigger}

      <span
        ref={bubbleRef}
        id={tooltipId}
        role="tooltip"
        // Runtime-measured offset; the only value Tailwind classes can't express.
        style={{ "--tooltip-shift": `${shift}px` }}
        className={`absolute bottom-full left-1/2 z-50 mb-3 w-64 max-w-[calc(100vw-2rem)] translate-x-[calc(-50%_+_var(--tooltip-shift))] overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/95 shadow-xl shadow-black/40 backdrop-blur-sm ${REVEAL_CLASSES}`}
      >
        <span className="block h-0.5 bg-gradient-to-r from-primary-400 to-purple-400" />
        <span className="block px-4 py-3 text-left text-xs font-normal leading-relaxed text-gray-300">
          {content}
        </span>
      </span>

      {/* Arrow stays centred on the trigger even when the bubble is shifted */}
      <span
        aria-hidden="true"
        className={`absolute bottom-full left-1/2 z-50 mb-1.5 h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b border-gray-700/50 bg-gray-900 ${REVEAL_CLASSES}`}
      />
    </span>
  );
};
