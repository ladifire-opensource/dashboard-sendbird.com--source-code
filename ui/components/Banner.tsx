import React, { FC } from 'react';

import styled, { keyframes, css } from 'styled-components';

import {
  transitionDefault,
  Icon,
  cssVariables,
  OverlayButton,
  OverlayButtonBackgroundTypeContext,
  OverlayButtonBackgroundType,
  Link,
  LinkVariant,
  IconName,
} from 'feather';

import { BANNER_HEIGHT } from '@constants/ui';

export enum BannerStatus {
  Error = 'error',
  Warning = 'warning',
  Success = 'success',
  Information = 'info',
}
const BANNER_ANIMATION_DURATION = 1;
const BannerFadeInAnimation = keyframes`
  0% {
    opacity: 0.8;
  }

  100% {
    opacity: 1;
  }
`;

const BannerContent = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  max-width: 80%;
`;

const Container = styled.div<{ status: BannerStatus }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-width: 1024px;
  height: ${BANNER_HEIGHT}px;
  animation: ${BannerFadeInAnimation} ${BANNER_ANIMATION_DURATION}s ${transitionDefault};

  svg {
    margin-right: 16px;
  }
  button {
    margin-left: 16px;
  }
  a {
    margin-left: 13px;
    font-size: 14px;
  }
  ${({ status }) => {
    if (status === BannerStatus.Warning) {
      return css`
        background: ${cssVariables('yellow-2')};
        color: ${cssVariables('neutral-10')};
        svg {cssVariables('yellow-5')
          --icon-primary-color: ${cssVariables('yellow-5')};
        }
      `;
    }
    if (status === BannerStatus.Error) {
      return css`
        background: ${cssVariables('red-2')};
        color: ${cssVariables('neutral-10')};
        svg {
          --icon-primary-color: ${cssVariables('red-5')};
        }
      `;
    }
    if (status === BannerStatus.Information || status === BannerStatus.Success) {
      return css`
        background: ${cssVariables('neutral-9')};
        color: white;
        transition: top 1s ${transitionDefault};
        svg {
          --icon-primary-color: ${cssVariables('green-5')};
        }
      `;
    }
  }}
`;

type BannerAction = {
  type: 'button' | 'link';
  label: string;
  onClick: React.MouseEventHandler;
};

type BannerProps = {
  status: BannerStatus;
  content: string;
  action?: BannerAction;
};

const icons: {
  [key: string]: IconName | '';
} = {
  [BannerStatus.Error]: 'error-filled',
  [BannerStatus.Warning]: 'warning-filled',
  [BannerStatus.Success]: 'success',
  [BannerStatus.Information]: '',
};

const backgroundTypes = {
  [BannerStatus.Error]: OverlayButtonBackgroundType.Danger,
  [BannerStatus.Warning]: OverlayButtonBackgroundType.Warning,
  [BannerStatus.Success]: OverlayButtonBackgroundType.Inverse,
  [BannerStatus.Information]: OverlayButtonBackgroundType.Inverse,
};

const Action: FC<{
  action?: BannerAction;
  status: BannerStatus;
}> = ({ action, status }) => {
  if (!action) {
    return null;
  }
  const { type, label, onClick } = action;
  if (type === 'button') {
    return (
      <OverlayButtonBackgroundTypeContext.Provider value={backgroundTypes[status]}>
        <OverlayButton onClick={onClick}>{label}</OverlayButton>
      </OverlayButtonBackgroundTypeContext.Provider>
    );
  }
  if (type === 'link') {
    return (
      <Link onClick={onClick} variant={LinkVariant.Mono}>
        {label}
      </Link>
    );
  }
  return null;
};

export const Banner: FC<BannerProps> = ({ status, content, action }) => {
  return (
    <Container status={status}>
      {icons[status] !== '' && <Icon icon={icons[status] as IconName} size={20} />}
      <BannerContent>{content}</BannerContent>
      <Action action={action} status={status} />
    </Container>
  );
};
