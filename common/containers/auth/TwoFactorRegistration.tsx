import { useIntl } from 'react-intl';

import { css } from 'styled-components';

import { ScrollBar, Button, Icon, cssVariables } from 'feather';

import { useShowDialog } from '@hooks';
import { AuthFooter } from '@ui/components';

import { DialogType } from '../dialogs/DialogType';
import { AuthTopBar } from './AuthTopBar';
import {
  AuthWrapper,
  AuthBox,
  AuthBoxCenter,
  AuthBoxBody,
  AuthBoxHeader,
  AuthBoxDescription,
  AuthBoxTitle,
} from './components';

export const TwoFactorRegistration = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();

  const handleGetStarted = () => {
    showDialog({
      dialogTypes: DialogType.RegisterTwoFactor,
    });
  };
  return (
    <AuthWrapper>
      <ScrollBar>
        <AuthBox>
          <AuthTopBar />
          <AuthBoxCenter>
            <AuthBoxBody>
              <AuthBoxHeader>
                <Icon
                  icon="security"
                  size={80}
                  color={cssVariables('neutral-5')}
                  css={css`
                    margin-bottom: 32px;
                  `}
                />
                <AuthBoxTitle>
                  {intl.formatMessage({ id: 'common.authentication.twoFactorRegistration.title' })}
                </AuthBoxTitle>
                <AuthBoxDescription>
                  {intl.formatMessage({ id: 'common.authentication.twoFactorRegistration.description' })}
                </AuthBoxDescription>
              </AuthBoxHeader>
              <Button
                buttonType="primary"
                size="large"
                css={css`
                  width: 100%;
                  margin-top: 8px;
                `}
                onClick={handleGetStarted}
              >
                {intl.formatMessage({ id: 'common.authentication.twoFactorRegistration.button' })}
              </Button>
            </AuthBoxBody>
            <AuthFooter />
          </AuthBoxCenter>
        </AuthBox>
      </ScrollBar>
    </AuthWrapper>
  );
};
