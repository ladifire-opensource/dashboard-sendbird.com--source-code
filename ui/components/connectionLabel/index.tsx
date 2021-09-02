import styled, { css } from 'styled-components';

import upperCase from 'lodash/upperCase';

import { CONNECTION_COLORS } from '@constants';
import { StyledProps } from '@ui';
import { transitionDefault } from '@ui/styles';

export const ConnectionLabel = styled.div<StyledProps>`
  display: inline-block;
  vertical-align: middle;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background 0.2s ${transitionDefault};
  ${(props) =>
    props.connection
      ? css`
          background: ${CONNECTION_COLORS[upperCase(props.connection)]};
        `
      : ''};
  ${(props) => props.styles};
`;
