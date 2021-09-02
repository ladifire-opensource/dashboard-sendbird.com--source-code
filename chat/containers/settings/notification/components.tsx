import styled from 'styled-components';

import { cssVariables, Icon, TableProps, Table, Link } from 'feather';

const PushPlatform = styled.section`
  overflow: hidden;

  & + & {
    margin-top: 48px;
  }
`;

const PushPlatformHeader = styled.div`
  display: flex;
  align-items: center;
`;

const PushPlatformIcon = styled(Icon)`
  display: inline-block;
  vertical-align: middle;
`;

const PushPlatformTitle = styled.h2`
  display: inline-block;
  flex: 1;
  margin-left: 8px;
  vertical-align: middle;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: -0.15px;
  color: ${cssVariables('neutral-10')};
`;

const PushPlatformTable = <T,>(props: TableProps<T>) => (
  <Table<T>
    css={`
      margin-top: 16px;
      border-radius: 4px;

      thead {
        border-top-right-radius: 4px;
        border-top-left-radius: 4px;
      }
    `}
    {...props}
  />
);

const PushPlatforms = styled.section`
  &[aria-disabled='true'] {
    ${PushPlatformTitle} {
      color: ${cssVariables('neutral-5')};
    }

    ${PushPlatformIcon} {
      fill: ${cssVariables('neutral-5')};
    }

    th,
    td {
      color: ${cssVariables('neutral-5')};
    }
  }
`;

const ColumnLink = styled(Link)`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  color: ${cssVariables('neutral-10')};
`;

export {
  PushPlatforms,
  PushPlatform,
  PushPlatformHeader,
  PushPlatformIcon,
  PushPlatformTitle,
  PushPlatformTable,
  ColumnLink,
};
