import { FC, memo } from 'react';

import styled from 'styled-components';

import { cssVariables, Headings, Icon, Lozenge, Subtitles } from 'feather';

import { ContentContainer } from '@ui/components';

const Layout = styled(ContentContainer)`
  padding: 0 56px;

  > h2 {
    ${Headings['heading-06']}
    margin-top: 88px;
  }

  > section {
    width: 800px;
    margin-top: 16px;
    margin-bottom: 32px;

    > p {
      font-size: 14px;
      line-height: 22px;
      font-weight: 500;
      letter-spacing: -0.1px;
      white-space: pre-wrap;

      & + & {
        margin-top: 22px;
      }
    }
  }

  > h3 {
    ${Headings['heading-02']}
    margin-bottom: 8px;
  }

  > ul {
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
    letter-spacing: -0.1px;
    color: ${cssVariables('purple-7')};
    margin-bottom: 32px;
    list-style: none;

    li {
      margin-bottom: 4px;
    }
  }

  > img {
    position: absolute;
    top: 373px;
    left: 512px;
    background: ${cssVariables('neutral-1')};
    pointer-events: none;
    user-select: none;
    margin-bottom: 32px;
  }
`;

const FeatureCheckIcon = styled(Icon)`
  vertical-align: middle;
  margin-right: 8px;
`;

const FeatureListItemContainer = styled.li`
  display: flex;
  align-items: center;

  > span {
    ${Subtitles['subtitle-01']};
    color: ${cssVariables('purple-7')};
  }

  > ${Lozenge} {
    margin-left: 8px;
  }
`;

const FeatureItem: FC = memo(({ children }) => {
  return (
    <FeatureListItemContainer>
      <FeatureCheckIcon icon="done" size={20} color={cssVariables('purple-7')} />
      <span>{children}</span>
    </FeatureListItemContainer>
  );
});

export const Introduction = {
  Layout,
  FeatureItem,
};
