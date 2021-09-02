import { FC, ReactNode, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Body, Button, cssColors, Headings, Tooltip, TooltipRef, TooltipTrigger, TooltipVariant } from 'feather';
import { rgba } from 'polished';

const Highlight = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  border-radius: 16px;
  background: ${rgba(cssColors('green-5'), 0.3)};
  width: 32px;
  height: 32px;
`;

const CoachMarkContentContainer = styled.div`
  display: flex;
  flex-direction: column;

  > strong {
    ${Headings['heading-01']}
  }

  > p {
    ${Body['body-short-01']}
  }

  > button {
    align-self: flex-end;
  }

  > strong + p {
    margin-top: 4px;
  }

  > p + button {
    margin-top: 16px;
  }
`;

const CoachmarkTarget = styled.div`
  position: relative;
  pointer-events: none;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Coachmark: FC<{ tooltip: ReactNode; className?: string }> = ({ tooltip, className, children }) => {
  const ref = useRef<TooltipRef>(null);

  useEffect(() => {
    ref.current?.show();
  }, []);

  return (
    <Tooltip
      variant={TooltipVariant.Light}
      trigger={TooltipTrigger.Manual}
      ref={ref}
      popperProps={{
        modifiers: { offset: { offset: '0, 16' } },
      }}
      content={tooltip}
      tooltipContentStyle="max-width: 316px;"
      className={className}
    >
      <CoachmarkTarget>
        {children}
        <Highlight />
      </CoachmarkTarget>
    </Tooltip>
  );
};

const CoachmarkTooltip: FC<{
  title: ReactNode;
  description: ReactNode;
  onDone?: () => void;
}> = ({ title, description, onDone }) => {
  const intl = useIntl();
  return (
    <CoachMarkContentContainer>
      <strong>{title}</strong>
      <p>{description}</p>
      <Button buttonType="primary" size="small" onClick={onDone}>
        {intl.formatMessage({ id: 'calls.studio.contacts.coachmark.done' })}
      </Button>
    </CoachMarkContentContainer>
  );
};

export default Object.assign(Coachmark, { Tooltip: CoachmarkTooltip });
