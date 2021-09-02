import styled, { css } from 'styled-components';

import { cssVariables, transitionDefault, Body, Typography, Avatar, transitions } from 'feather';

import { BasicInput } from '../input';

export const DialogFormLabel = styled.label`
  display: flex;
  align-items: center;
  ${Typography['label-02']}
  margin-bottom: 6px;
  color: ${cssVariables('neutral-10')};
`;

export const DialogFormHidden = styled.div<{ display?: boolean }>`
  height: ${(props) => (props.display ? 'auto' : '0')};
  margin: ${(props) => (props.display ? '25px' : '0')} 0 25px;
  padding: ${(props) => (props.display ? '25px' : '0')} 0;
  overflow: ${(props) => (props.display ? 'visible' : 'hidden')};
  border-top: 1px solid ${cssVariables('neutral-3')};
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  opacity: ${(props) => (props.display ? 1 : 0)};
  transition: all 0.25s ${transitionDefault};

  ${DialogFormLabel} {
    font-weight: 300;
  }
`;

export const DialogFormSet = styled.div<{ alignItems?: string }>`
  position: relative;
  line-height: 1;
  align-items: ${(props) => (props.alignItems ? props.alignItems : 'center')};
`;

export const DialogFormContent = styled.div`
  display: flex;
`;

export const DialogFormContentInline = styled.div<{ paddingRight?: string; flex?: string }>`
  ${(props) => (props.paddingRight ? `padding-right: ${props.paddingRight};` : null)};
  flex: ${(props) => (props.flex ? props.flex : '1')};
`;

export const DialogFormBody = styled.div<{ inline?: boolean; titleWidth?: number }>`
  font-size: 14px;
  line-height: 20px;

  ${DialogFormSet} + ${DialogFormSet} {
    margin-top: 24px;
  }

  ${(props) =>
    props.inline
      ? css`
          ${DialogFormSet} {
            display: flex;
            justify-content: left;

            &:last-child {
              padding-bottom: 27px;
            }
          }

          ${DialogFormSet} + ${DialogFormSet} {
            margin-top: 25px;
          }

          ${DialogFormLabel} {
            margin-bottom: 0;
            font-size: 15px;
            width: ${props.titleWidth ? `${props.titleWidth}%` : 'auto'};
          }

          ${DialogFormContent},
          ${BasicInput},
      .Select {
            width: ${props.titleWidth ? `${100 - props.titleWidth}%` : '100%'};
          }
        `
      : null}
`;

export const DialogFormHelpText = styled.div`
  color: ${cssVariables('neutral-7')};
  display: block;
  font-size: 14px;
  margin-top: 8px;
  line-height: 1;
`;

export const DialogFormDivider = styled.div`
  width: 100%;
  height: 1px;
  background: ${cssVariables('neutral-3')};
  margin: 24px 0;
`;

export const ListCountText = styled.div`
  font-size: 13px;
  color: ${cssVariables('neutral-10')};
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1;
`;

export const ListHeader = styled.div`
  background: ${cssVariables('neutral-1')};
  display: flex;
  border: 1px solid ${cssVariables('neutral-3')};
  border-bottom: none;
  border-top-right-radius: 4px;
  border-top-left-radius: 4px;
  height: 36px;
  line-height: 34px;
  font-weight: 600;
  padding: 0 16px;
`;

export const ListHeaderColumn = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 25%;
  font-size: 12px;
  color: ${cssVariables('neutral-10')};
  padding: 0 16px 0 0;
`;

export const ListHeaderColumnFunc = styled.div`
  width: 18px;
`;

export const ListHeaderColumnImage = styled.div`
  width: 24px;
  margin-right: 16px;
`;

export const ListContent = styled.div`
  background: white;
  border: 1px solid ${cssVariables('neutral-3')};
  border-top: none;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  max-height: 204px;
  overflow-y: auto;
`;

export const ListContentItem = styled.div`
  display: flex;
  position: relative;
  padding: 8px 1rem;
  border-bottom: 1px solid ${cssVariables('neutral-3')};

  &:last-child {
    border-bottom: none;
  }
`;

export const ListContentItemImage = styled(Avatar).attrs({ size: 24 })`
  margin-right: 16px;
`;

export const ListContentItemText = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 25%;
  padding-right: 16px;
  word-wrap: break-word;
  overflow: hidden;
  font-size: 14px;
  color: ${cssVariables('neutral-7')};
  line-height: 1.43;
`;

export const ListContentItemDelete = styled.div`
  width: 18px;
  display: flex;
  line-height: 1;
  cursor: pointer;
`;

export const DialogFormAction = styled.div`
  margin: 0 -24px;
  padding: 32px 24px 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: baseline;

  > * + * {
    margin-left: 8px;
  }
`;

export const DialogAlertTitle = styled.div`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
`;

export const DialogAlertNote = styled.div`
  padding-left: 13px;
  position: relative;
  border-left: 3px solid ${cssVariables('purple-7')};
  font-size: 15px;
  line-height: 1.53;
  letter-spacing: -0.3px;
  color: ${cssVariables('neutral-10')};
  margin: 0 0 24px 0;
`;

export const DialogAlertDesc = styled.div`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-10')};
  b {
    font-weight: 600;
  }
  & + & {
    margin-top: 16px;
  }
`;

export const DialogAlertLink = styled.div<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.3px;
  color: ${(props) => (props.disabled ? cssVariables('content-disabled') : cssVariables('content-primary'))};
  text-decoration: ${(props) => (props.disabled ? 'line-through' : 'none')};
  transition: ${transitions({ properties: ['color'], duration: 0.3 })};

  &:hover {
    text-decoration: ${(props) => (props.disabled ? 'line-through' : 'underline')};
    ${(props) =>
      props.disabled
        ? ''
        : css`
            cursor: pointer;
            color: ${cssVariables('content-primary-hover')};

            svg {
              fill: ${cssVariables('content-primary-hover')};
            }
          `};

    svg {
      transform: translateX(4px);
    }
  }

  svg {
    margin-left: 4px;
    transition: ${transitions({ properties: ['transform', 'fill'], duration: 0.3 })};
  }
`;

export const DialogAlert = styled.div`
  ${DialogAlertLink} + ${DialogAlertDesc} {
    margin-top: 24px;
  }
  ${DialogAlertLink} + ${DialogAlertLink} {
    margin-top: 15px;
  }
  & + ${DialogFormSet} {
    margin-top: 30px;
  }
`;
