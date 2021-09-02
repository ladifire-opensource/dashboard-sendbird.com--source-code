import { createRef, Component } from 'react';
import { connect } from 'react-redux';

import { css } from 'styled-components';

import { Alert, AlertMessageAlign, AlertStatus, ScrollBar, ContextualHelpContent } from 'feather';

import { commonActions } from '@actions';
import { FormInput, FormInputSize, HistoryBackText, AuthFooter, InputInform } from '@ui/components';
import { ALERT_TWO_FACTOR_RECOVERY_FAILED } from '@utils/text';

import { AuthAlready } from './AuthAlready';
import { AuthTopBar } from './AuthTopBar';
import {
  AuthWrapper,
  AuthBox,
  AuthBoxHeader,
  AuthBoxTitle,
  AuthBoxDescription,
  AuthBoxBody,
  AuthBoxOptionLink,
  AuthButton,
  AuthBoxCenter,
  AuthBoxAttached,
  AuthFormWrapper,
} from './components';

const mapStateToProps = (state: RootState) => ({
  auth: state.auth,
  alert: state.alert,
});

const mapDispatchToProps = {
  initAlert: commonActions.initAlert,
  showAlert: commonActions.showAlert,
  hideAlert: commonActions.hideAlert,
  recoverTwoFactorAuthenticationRequest: commonActions.recoverTwoFactorAuthenticationRequest,
};

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionProps;

type State = {
  errors: { code: FormError };
};

class TwoFactorRecoveryConnectable extends Component<Props, State> {
  private codeRef = createRef<HTMLInputElement>();
  public state = {
    errors: {
      code: {
        hasError: false,
        message: '',
      },
    },
  };

  componentDidMount() {
    this.props.initAlert({
      status: AlertStatus.DANGER,
      message: ALERT_TWO_FACTOR_RECOVERY_FAILED,
    });
  }

  private checkErrorWhileTyping = ({ name, value }: { name: string; value: string }): FormError => {
    switch (name) {
      case 'code': {
        const code = value.trim().replace('-', '').replace(' ', '');
        if (code.length > 0 && code.length !== 20) {
          return {
            hasError: true,
            message: 'Your recovery code should be 20 digits',
          };
        }
        const emptyValue = code.length === 0;
        return {
          hasError: emptyValue,
          message: emptyValue ? 'The recovery code is required' : '',
        };
      }
      default:
        return {
          hasError: false,
          message: '',
        };
    }
  };

  public setError = ({ name, error }: { name: string; error: FormError }): void => {
    if (
      !this.state.errors[name] ||
      (this.state.errors[name] &&
        (this.state.errors[name].hasError !== error.hasError || this.state.errors[name].message !== error.message))
    ) {
      this.setState((prevState) => ({
        ...prevState,
        errors: {
          ...prevState.errors,
          [name]: error,
        },
      }));
    }
  };

  private isValidOnSubmit = () => {
    return !this.state.errors.code.hasError;
  };

  private handleInputChange = (name) => (e) => {
    const { value } = e.target;
    const error = this.checkErrorWhileTyping({ name, value });

    if (!error.hasError) {
      this.props.hideAlert();
    }

    this.setError({ name, error });
  };

  private handleSubmit = (e) => {
    e.preventDefault();
    const code = (this.codeRef.current && this.codeRef.current.value) || '';

    if (this.isValidOnSubmit()) {
      this.props.recoverTwoFactorAuthenticationRequest({
        code: code.replace('-', '').replace(' ', ''),
      });
    } else {
      this.props.showAlert({ message: ALERT_TWO_FACTOR_RECOVERY_FAILED });
      return false;
    }
  };

  public render() {
    const { errors } = this.state;

    return (
      <AuthWrapper>
        <ScrollBar>
          <AuthBox>
            <AuthTopBar />
            <AuthBoxCenter>
              <AuthBoxBody>
                <AuthBoxHeader>
                  <AuthBoxTitle>Two-Factor Authentication</AuthBoxTitle>
                  <AuthBoxDescription>
                    Your account is protected with two-factor authentication. To continue with the sign-in, please
                    provide the 6-digit verification code from your authentication app or the recovery code.
                  </AuthBoxDescription>
                </AuthBoxHeader>
                <AuthFormWrapper>
                  <Alert
                    {...this.props.alert}
                    align={AlertMessageAlign.LEFT}
                    styles={{
                      CONTAINER: css`
                        margin-bottom: ${this.props.alert.show ? 24 : 0}px;
                      `,
                    }}
                  />
                  <AuthAlready />
                  <form name="twoFactorRecovery" onSubmit={this.handleSubmit}>
                    <FormInput
                      innerRef={this.codeRef}
                      size={FormInputSize.MEDIUM}
                      type="text"
                      name="code"
                      label="Recovery code"
                      placeholder="20-digit recovery code"
                      required={true}
                      error={this.state.errors.code}
                      labelComponent={
                        <InputInform
                          content={
                            <>
                              <ContextualHelpContent.Header>Recovery Code</ContextualHelpContent.Header>
                              <ContextualHelpContent.Body>
                                This is the 20-digit code we sent you after you set up your two-factor authentication.
                              </ContextualHelpContent.Body>
                            </>
                          }
                          styles={css`
                            right: 10px;
                            top: 32px;
                          `}
                        />
                      }
                      onChange={this.handleInputChange('code')}
                    />
                    <AuthButton
                      id="id_button_submit"
                      buttonType="primary"
                      type="submit"
                      size="large"
                      disabled={errors.code.hasError}
                    >
                      Verify code
                    </AuthButton>
                    <AuthBoxAttached>
                      <AuthBoxOptionLink
                        href="/auth/two_factor"
                        styles={css`
                          display: block;
                          margin: 0 auto 8px;
                        `}
                      >
                        Have an authentication code?
                      </AuthBoxOptionLink>
                    </AuthBoxAttached>
                  </form>
                </AuthFormWrapper>
                <HistoryBackText text="Back to Sign in" href="/auth/signin" />
              </AuthBoxBody>
              <AuthFooter />
            </AuthBoxCenter>
          </AuthBox>
        </ScrollBar>
      </AuthWrapper>
    );
  }
}

export const TwoFactorRecovery = connect(mapStateToProps, mapDispatchToProps)(TwoFactorRecoveryConnectable);
