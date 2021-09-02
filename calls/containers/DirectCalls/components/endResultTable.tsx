import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Headings, Body } from 'feather';

const Container = styled.div`
  max-width: 312px;
`;

const DottedList = styled.ul`
  margin: 0px 4px 0px 20px;
`;

const BulletItem = styled.li`
  padding-left: 7px;
  ${Body['body-short-01']}

  strong {
    ${Headings['heading-01']}
  }

  & + & {
    margin-top: 4px;
  }
`;

export const EndResultTable = () => {
  const intl = useIntl();
  const table = [
    {
      title: 'calls.callLogs.contextualHelp.title_label.canceled',
      desc: 'calls.callLogs.contextualHelp.description_label.canceled',
    },
    {
      title: 'calls.callLogs.contextualHelp.title_label.completed',
      desc: 'calls.callLogs.contextualHelp.description_label.completed',
    },
    {
      title: 'calls.callLogs.contextualHelp.title_label.connection_lost',
      desc: 'calls.callLogs.contextualHelp.description_label.connection_lost',
    },
    {
      title: 'calls.callLogs.contextualHelp.title_label.declined',
      desc: 'calls.callLogs.contextualHelp.description_label.declined',
    },
    {
      title: 'calls.callLogs.contextualHelp.title_label.no_answer',
      desc: 'calls.callLogs.contextualHelp.description_label.no_answer',
    },
    {
      title: 'calls.callLogs.contextualHelp.title_label.timed_out',
      desc: 'calls.callLogs.contextualHelp.description_label.timed_out',
    },
    {
      title: 'calls.callLogs.contextualHelp.title_label.unknown',
      desc: 'calls.callLogs.contextualHelp.description_label.unknown',
    },
  ];

  return (
    <Container onClick={(e) => e.stopPropagation()}>
      <DottedList>
        {table.map(({ title, desc }) => (
          <BulletItem key={title}>
            <strong>{intl.formatMessage({ id: title })}:</strong>
            {` ${intl.formatMessage({ id: desc })}`}
          </BulletItem>
        ))}
      </DottedList>
    </Container>
  );
};
