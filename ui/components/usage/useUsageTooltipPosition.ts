import { useRef, MouseEventHandler } from 'react';

export const useUsageTooltipPosition = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLElement | null>(null);
  const mouseOverEventRun = useRef(false);
  const scheduleUpdateRef = useRef<(() => void) | null>(null);

  const setScheduleUpdate = (value: () => void) => {
    scheduleUpdateRef.current = value;
  };

  const onMouseOut: MouseEventHandler = () => {
    mouseOverEventRun.current = false;
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = '0';
    }
  };

  const onMouseMove: MouseEventHandler = (event) => {
    const { current: tooltipElement } = tooltipRef;

    if (tooltipElement == null || containerRef.current == null) {
      return;
    }

    if (!mouseOverEventRun.current) {
      mouseOverEventRun.current = true;
      scheduleUpdateRef.current?.();
    }

    tooltipElement.style.opacity = '1';

    const { left, width } = containerRef.current.getBoundingClientRect();
    tooltipElement.style.marginLeft = `${event.pageX - left - width + 8}px`;
  };

  return {
    tooltipRef,
    containerRef,
    chartElementProps: { onMouseOut, onMouseMove },
    setScheduleUpdate,
  };
};
