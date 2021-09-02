import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Icon, Subtitles, Typography } from 'feather';

type ProgressStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

const ProgressStepContainer = styled.li<{ $status: ProgressStatus }>`
  display: flex;
  align-items: center;
  ${Subtitles['subtitle-01']}
  color: ${({ $status }) =>
    ({
      TODO: cssVariables('neutral-6'),
      IN_PROGRESS: cssVariables('purple-7'),
      DONE: cssVariables('neutral-7'),
    }[$status])};

  > div {
    margin: 1px 9px 1px 1px;
    width: 22px;
    height: 22px;
    border-radius: 11px;
    background: ${({ $status }) =>
      ({
        TODO: cssVariables('neutral-5'),
        IN_PROGRESS: cssVariables('purple-7'),
        DONE: null,
      }[$status])};

    ${Typography['label-01']}
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  > svg {
    margin-right: 8px;
    fill: ${(props) => props.$status === 'DONE' && cssVariables('neutral-9')};
  }
`;

const ProgressContainer = styled.ul`
  list-style: none;
  display: flex;

  li + li {
    &:before {
      content: '';
      height: 1px;
      width: 56px;
      background: ${cssVariables('neutral-3')};
      margin: 0 8px;
    }
  }
`;

const ProgressStep: FC<{
  title: string;
  status: ProgressStatus;
  value: number;
}> = ({ status, value, title }) => {
  return (
    <ProgressStepContainer $status={status}>
      {status === 'DONE' ? <Icon icon="success-filled" size={24} /> : <div>{value}</div>}
      {title}
    </ProgressStepContainer>
  );
};

type Props = { titles: string[]; activeIndex: number; className?: string };

const Progress = styled(({ titles, activeIndex, className }: Props) => {
  const intl = useIntl();
  const getStatus = (index: number): ProgressStatus => {
    if (index < activeIndex) return 'DONE';
    if (index === activeIndex) return 'IN_PROGRESS';
    return 'TODO';
  };

  return (
    <ProgressContainer className={className}>
      {titles.map((title, index) => (
        <ProgressStep
          key={title}
          status={getStatus(index)}
          value={index + 1}
          title={intl.formatMessage({ id: title })}
        />
      ))}
    </ProgressContainer>
  );
})``;

export default Progress;
