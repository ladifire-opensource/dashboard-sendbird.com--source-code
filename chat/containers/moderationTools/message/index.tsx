import { FC } from 'react';

import styled, { css, SimpleInterpolation } from 'styled-components';

import { Icon, Button, cssVariables, transitionDefault, elevation, cssColors } from 'feather';
import { rgba } from 'polished';

import { StyledProps } from '@ui';
import { TargetWrapper } from '@ui/components';

import { cssVariables as sizeCSSVariables } from '../defineSizeCSSVariables';

const FOCUSED_SPACE_SIZE: number = 12;

export const MessageWrapper = styled.span<StyledProps>`
  display: inline;
  color: ${cssVariables('neutral-10')};
  white-space: pre-line;
  word-wrap: break-word;
  hyphens: auto;

  a {
    text-decoration: underline;
  }
`;

export const MessageLink = styled.a`
  display: inline;
  word-break: break-all;

  > .file-attach-icon {
    display: inline-block;
    margin-right: 8px;
    vertical-align: sub;
  }
`;

export const MessageImage = styled.div`
  width: 100%;
  max-width: 360px;
  margin-top: 10px;
  margin-bottom: 16px;
  cursor: pointer;

  img {
    width: 100%;
    max-height: 360px;
    border: 1px solid ${rgba(cssColors('neutral-10'), 0.08)};
    border-radius: 8px;
  }
`;

export const MessageVideoThumbnail = styled(MessageImage)`
  position: relative;
  display: inline-block;

  img {
    position: relative;
    display: block;
    z-index: 0;
  }
`;

export const MessageVideoThumbnailCover = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  background: ${rgba(cssColors('neutral-9'), 0.6)};
  border-radius: 8px;

  > .video-thumbnail-icon {
    position: absolute;
    top: 16px;
    right: 16px;
    opacity: 0.8;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
  }
`;

export const MessageActionIconButton = styled(Button).attrs({
  buttonType: 'secondary',
  size: 'small',
  variant: 'ghost',
})`
  display: flex;
  align-items: center;
  padding: 4px;
  min-width: 0;
  height: auto;
`;

export const MessageMenuToggle: FC<{ isMenuOpen: boolean }> = ({ isMenuOpen }) => {
  return (
    <MessageActionIconButton aria-pressed={isMenuOpen}>
      <Icon icon="more" size={20} />
    </MessageActionIconButton>
  );
};

export const MessageMenu = styled.div`
  min-width: 57px;
  border-radius: 4px;
  background-color: white;
  ${elevation.popover}
  padding: 4px 0;
`;

export const MessageMenuItem = styled.div`
  display: block;
  width: 128px;
  font-size: 14px;
  line-height: 20px;
  color: ${cssVariables('neutral-10')};
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  padding: 6px 12px 6px 16px;
  transition: background-color 0.2s ${transitionDefault};

  &:hover {
    background-color: ${cssVariables('neutral-1')};
  }
`;

export const MessageMenuDivider = styled.div`
  height: 1px;
  background-color: ${cssVariables('neutral-3')};
  margin: 4px 0;
`;

export const MessageTime = styled.time`
  position: relative;
  // FIXME: top calculation is inaccurate.
  top: 0;

  width: calc(${sizeCSSVariables.timeLineHeight} * 3);
  text-align: left;
  font-size: ${sizeCSSVariables.timeFontSize};
  line-height: ${sizeCSSVariables.timeLineHeight};
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: ${cssVariables('neutral-6')};
`;

export const SenderNickname = styled.div`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  margin-right: 8px;
  line-height: ${sizeCSSVariables.lineHeight};
  letter-spacing: -0.1px;
  font-size: ${sizeCSSVariables.fontSize};
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }

  svg {
    width: ${sizeCSSVariables.operatorIconSize};
    height: ${sizeCSSVariables.operatorIconSize};
  }
`;

export const MessageActions = styled.div`
  display: flex;
  position: absolute;
  top: 1px;
  right: 8px;
  opacity: 0;
  border-radius: 4px;
  background-color: ${cssVariables('neutral-2')};
  transition: 0.2s ${transitionDefault};
  transition-property: background-color, opacity;

  > * + * {
    margin-left: 4px;
  }
`;

export const MessageItem = styled.div<{
  focused: boolean;
  backgroundColor: string;
  messageTextStyle: SimpleInterpolation;
  senderNameColor: string;
  isSenderOperator: boolean;
  isMenuOpen: boolean;
  styles: SimpleInterpolation;
}>`
  --padding-y: calc(${sizeCSSVariables.spacing} * 6 / 8);

  display: flex;
  position: relative;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: baseline;
  padding: var(--padding-y) 48px var(--padding-y) ${sizeCSSVariables.timeLineHeight};
  z-index: ${(props) => (props.focused ? 250 : 0)};
  cursor: text;
  ${(props) => props.messageTextStyle};

  ${SenderNickname} {
    color: ${(props) => props.senderNameColor};
  }

  background: ${(props) => props.backgroundColor};
  transition: background 0.2s ${transitionDefault}, box-shadow 0.2s ${transitionDefault};
  box-shadow: ${(props) =>
    props.focused ? '0 3px 5px 0 rgba(74, 80, 90, 0.35), 0 0 3px 0 rgba(74, 80, 90, 0.4)' : null};
  will-change: background, box-shadow;
  word-wrap: break-word;

  &:first-child {
    margin-top: 24px;
  }

  &:last-child {
    margin-bottom: 12px;
  }

  &:hover {
    background: ${cssVariables('neutral-2')};
    ${MessageActions} {
      opacity: 1;
    }
  }

  &:not(:hover) {
    ${(props) =>
      props.isMenuOpen &&
      css`
        ${MessageActions} {
          opacity: 1;
          background-color: white;
        }
      `}
  }

  ${(props) => props.styles}
`;

export const MessageGutter = styled.div<StyledProps>`
  width: 84px;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  text-align: center;
  margin-left: ${(props) => (props.focused ? `-${FOCUSED_SPACE_SIZE}px` : null)};
  padding: 4px 0 4px;
`;

export const MessageContent = styled.div<StyledProps>`
  flex: 1;
  line-height: ${sizeCSSVariables.lineHeight};
  word-break: break-word;
  font-size: ${sizeCSSVariables.fontSize};

  & > ${TargetWrapper} {
    display: initial;
  }
`;

export const ProfileLabel = styled.div<StyledProps>`
  width: 30px;
  height: 30px;
  float: left;
  text-align: center;
  border-radius: 50%;
  margin-top: 3px;

  ${(props) => {
    if (props.isNickname) {
      return css`
        line-height: 28px;
        font-weight: 600;
        color: white;
      `;
    }
  }};
`;
