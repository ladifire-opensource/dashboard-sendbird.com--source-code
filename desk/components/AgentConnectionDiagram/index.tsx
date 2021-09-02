import React, { useCallback, useMemo, useState, useRef, useLayoutEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, elevation, transitionDefault } from 'feather';
import moment, { Moment } from 'moment-timezone';

import { CONNECTION_COLORS, DEFAULT_DATE_FORMAT } from '@constants';
import { Popover } from '@ui/components/popover';
import { renderTimestring, getWorkingHourVerticalLineColor } from '@utils';

import { DurationRect } from './durationRect';
import { EmptyBar } from './emptyBar';
import { getRelativeTimeOfDay } from './getRelativeTimeOfDay';
import { TimeVerticalLine } from './timeVerticalLine';

type AgentConnectionLogDiagram = {
  id: AgentConnectionLog['id'];
  startedAt: Moment;
  endedAt: Moment;
  connection: AgentConnectionLog['toConnection'];
};

const BarWrapper = styled.div`
  position: relative;
  .BarWrapper__popover-target {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    pointer-events: none;
  }
`;

const PopoverContentContainer = styled.div<{
  connection: Agent['connection'];
}>`
  width: 200px;
  padding: 16px;
  border-radius: 4px;
  background-color: #fff;

  font-size: 14px;
  line-height: 20px;
  color: ${cssVariables('neutral-10')};
  font-weight: 600;
  ${elevation.popover}

  transition: transform 0.2s ${transitionDefault};

  .PopoverContent__status {
    font-size: 12px;
    line-height: 16px;
    color: ${cssVariables('neutral-6')};
    margin-top: 18px;
  }

  .PopoverContent__duration {
    font-size: 20px;
    line-height: 24px;
    font-weight: 600;
    color: ${(props) => CONNECTION_COLORS[props.connection]};
    margin-top: 8px;
  }
`;

type Props = {
  date: string;
  connectionLogs: ReadonlyArray<AgentConnectionLog>;
  width?: number;
  className?: string;
  detailed?: boolean;
  serviceHours?: WorkHour;
};

const AgentConnectionDiagram = React.memo<Props>(
  ({ date, connectionLogs, width = 288, className, detailed = false, serviceHours }) => {
    const [hoveredDiagram, setHoveredDiagram] = useState<AgentConnectionLogDiagram | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);
    const containerBoundingRect = useRef<DOMRect | ClientRect | null>(null);
    const connectionLabels = {
      ONLINE: <FormattedMessage id="desk.statistics.agents.detail.lbl.online" />,
      AWAY: <FormattedMessage id="desk.statistics.agents.detail.lbl.away" />,
      OFFLINE: <FormattedMessage id="desk.statistics.agents.detail.lbl.offline" />,
    };
    const currentTime = moment(new Date());

    useLayoutEffect(() => {
      if (containerRef.current) {
        containerBoundingRect.current = containerRef.current.getBoundingClientRect();
      }
    });

    const viewBoxHeight = detailed ? 60 : 40;
    const startOfDate = moment(date).startOf('day');
    const endOfDate = moment(date).endOf('day');
    const barRect = useMemo(() => ({ x: 0, y: detailed ? 12 : 16, width, height: detailed ? 24 : 8 }), [
      width,
      detailed,
    ]);
    const refinedConnectionLogs = useMemo(() => {
      return connectionLogs
        .map((log) => {
          const createdAt = moment(log.createdAt);
          const startedAt = createdAt.isBefore(startOfDate) ? startOfDate : createdAt;

          const originalEndedAt =
            log.durationTime == null ? currentTime : createdAt.clone().add(log.durationTime, 'seconds');
          const endedAt = originalEndedAt.isAfter(endOfDate) ? endOfDate : originalEndedAt;

          return {
            id: log.id,
            startedAt,
            endedAt,
            connection: log.toConnection,
          };
        })
        .filter((log) => {
          return log.startedAt.isBefore(log.endedAt);
        });
    }, [connectionLogs, startOfDate, currentTime, endOfDate]);

    const boundXPositionWithinBar = useCallback((xValue: number) => Math.max(0.5, Math.min(xValue, width - 0.5)), [
      width,
    ]);

    const getXPositionOfTime = useCallback(
      (time: Moment) => boundXPositionWithinBar(getRelativeTimeOfDay(time) * width + 0.5),
      [width, boundXPositionWithinBar],
    );

    let serviceHourLines;
    if (serviceHours && serviceHours.enabled) {
      const { operationTimes } = serviceHours;
      serviceHourLines = operationTimes.map(({ from, to }, index) => {
        const color = getWorkingHourVerticalLineColor(index);
        return (
          <>
            <TimeVerticalLine
              key={`vertical-line-from-${index}`}
              x={getXPositionOfTime(moment(from, 'HH:mm'))}
              y1={0}
              y2={barRect.height + 24}
              strokeStyle="dashed"
              strokeWidth={1.5}
              color={color}
              testId="ServiceHourStart"
            />
            <TimeVerticalLine
              key={`vertical-line-to-${index}`}
              x={getXPositionOfTime(moment(to, 'HH:mm'))}
              y1={0}
              y2={barRect.height + 24}
              strokeStyle="dashed"
              strokeWidth={1.5}
              color={color}
              testId="ServiceHourEnd"
            />
          </>
        );
      });
    }

    const onMouseMove: React.MouseEventHandler<HTMLDivElement> = useCallback(
      (e) => {
        if (e.target['dataset']) {
          const hoveredConnectionDiagram = refinedConnectionLogs.find(
            (log) => log.id === parseInt(e.target['dataset'].id, 10),
          );
          setHoveredDiagram(hoveredConnectionDiagram);
        }
      },
      [refinedConnectionLogs],
    );

    const onMouseLeave: React.MouseEventHandler = useCallback(() => setHoveredDiagram(undefined), []);

    const getLogDurationDescription = useCallback(({ startedAt, endedAt }: AgentConnectionLogDiagram) => {
      return (
        <>
          {startedAt.format(DEFAULT_DATE_FORMAT)}
          <br />
          {startedAt.format('h:mmA')} - {endedAt.format('h:mmA')}
        </>
      );
    }, []);

    const getLogPopoverTranslateX = useCallback(
      ({ startedAt, endedAt }: AgentConnectionLogDiagram) =>
        getXPositionOfTime(moment((startedAt.valueOf() + endedAt.valueOf()) / 2)) - 100,
      [getXPositionOfTime],
    );

    return (
      <BarWrapper ref={containerRef} onMouseLeave={onMouseLeave}>
        <EmptyBar
          className={className}
          barRect={barRect}
          detailed={detailed}
          viewBoxHeight={viewBoxHeight}
          onMouseMove={onMouseMove}
        >
          {refinedConnectionLogs.map(({ id, startedAt, endedAt, connection }, index) => {
            return (
              <DurationRect
                key={id}
                id={id}
                barRect={barRect}
                startedAt={startedAt}
                endedAt={endedAt}
                connection={connection}
                isHovered={hoveredDiagram && hoveredDiagram.id === id}
                testId={`${connection}-${index}`}
              />
            );
          })}
          {detailed ? (
            <>
              {Array.from({ length: 25 }, (_, index) => (
                <TimeVerticalLine
                  key={`vertical-line-${index}`}
                  x={boundXPositionWithinBar((index / 24) * width + 0.5)}
                  y1={barRect.y}
                  y2={barRect.y + barRect.height}
                  opacity={index % 4 ? 0.08 : 0.16}
                  testId={`TimeVerticalLineDetailed-${index}`}
                />
              ))}
              {serviceHourLines}
            </>
          ) : (
            <TimeVerticalLine
              x={getXPositionOfTime(currentTime)}
              y1={0}
              y2={viewBoxHeight}
              opacity={0.16}
              testId="TimeVerticalLine"
            />
          )}
        </EmptyBar>
        <Popover
          placement="top"
          offset="0, 60"
          isOpen={!!hoveredDiagram}
          enableFlip={false}
          canOutsideClickClose={false}
          target={<div className="BarWrapper__popover-target" />}
          content={
            hoveredDiagram && (
              <PopoverContentContainer
                connection={hoveredDiagram.connection}
                style={{
                  transform: `translateX(${getLogPopoverTranslateX(hoveredDiagram)}px)`,
                }}
              >
                {getLogDurationDescription(hoveredDiagram)}
                <div className="PopoverContent__status">{connectionLabels[hoveredDiagram.connection]}</div>
                <div className="PopoverContent__duration">
                  {renderTimestring(hoveredDiagram.endedAt.diff(hoveredDiagram.startedAt, 'seconds'))}
                </div>
              </PopoverContentContainer>
            )
          }
        />
      </BarWrapper>
    );
  },
);

export default AgentConnectionDiagram;
