import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { Body, cssVariables, Headings, IconButton, IconButtonProps } from 'feather';

const FullScreenModalHeader = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
  width: 100%;
`;

const ModalTitle = styled.h1`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  margin: 0;
  ${Headings['heading-06']};
`;

const ModalSubTitle = styled.p`
  max-width: 912px;
  margin-top: 16px;
  text-align: center;
  white-space: pre-wrap;
  ${Body['body-short-01']};
  strong {
    font-weight: 600;
  }
`;

const ModalCloseButton = styled(IconButton).attrs({
  variant: 'ghost',
  buttonType: 'tertiary',
  icon: 'close',
  size: 48,
  iconSize: 32,
})`
  flex: none;
  padding: 0;
  width: 48px;
  height: 48px;

  svg {
    fill: ${cssVariables('neutral-9')};
  }
`;

type CloseButtonProps = Omit<IconButtonProps, 'icon' | 'iconSize' | 'buttonType' | 'variant' | 'size'>;

const CloseButton: FC<CloseButtonProps> = (props) => {
  const intl = useIntl();
  return (
    <ModalCloseButton
      aria-label={intl.formatMessage({ id: 'ui.fullScreenModal.btn.close' })}
      css={css`
        position: absolute;
        top: 32px;
        right: 32px;
      `}
      {...props}
    />
  );
};

export default Object.assign(FullScreenModalHeader, {
  Title: ModalTitle,
  Subtitle: ModalSubTitle,
  CloseButton,
  ModalCloseButton,
});
