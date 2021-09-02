import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { css } from 'styled-components';

import { sanitize } from 'dompurify';
import { Alert, AlertMessageAlign, AlertStatus, ScrollBar } from 'feather';
import startCase from 'lodash/startCase';

import { commonActions } from '@actions';
import { PASSWORD_VALIDATION_REGEX } from '@constants';
import {
  FormInput,
  PasswordValidation,
  AuthFooter,
  FormInputSize,
  MessageSuccess,
  HistoryBackText,
} from '@ui/components';
import {
  ALERT_PASSWORD_INVALID,
  ALERT_RESET_PASSWORD_FAILED,
  PASSWORD_SPACE_SPECIAL_CHARACTER_NOT_ALLOWED,
  PASSWORD_DO_NOT_MATCH,
} from '@utils/text';

import { AuthAlready } from './AuthAlready';
import { AuthTopBar } from './AuthTopBar';
import {
  AuthWrapper,
  AuthBox,
  AuthBoxHeader,
  AuthBoxTitle,
  AuthBoxBody,
  AuthButton,
  AuthBoxCenter,
  AuthFormWrapper,
} from './components';

const mapStateToProps = (state: RootState) => ({
  isFetching: state.auth.isFetching,
  alert: state.alert,
});

const mapDispatchToProps = {
  initAlert: commonActions.initAlert,
  showAlert: commonActions.showAlert,
  hideAlert: commonActions.hideAlert,
  resetPasswordRequest: commonActions.resetPasswordRequest,
};

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionProps & RCProps<StoreProps & ActionProps>;

type State = {
  password: string;
  passwordConfirm: string;
  passwordFocused: boolean;
  passwordValidation: boolean;
  errors: {
    password: FormError;
    passwordConfirm: FormError;
  };
};

class ResetPasswordConnectable extends Component<Props, State> {
  private passwordRef = createRef<HTMLInputElement>();
  private passwordConfirmRef = createRef<HTMLInputElement>();
  private get key() {
    return sanitize(this.props.history.location.query.key) || '';
  }
  public state = {
    password: '',
    passwordConfirm: '',
    passwordFocused: false,
    passwordValidation: false,
    errors: {
      password: {
        hasError: false,
        message: '',
      },
      passwordConfirm: {
        hasError: false,
        message: '',
      },
    },
  };

  componentDidMount() {
    this.props.initAlert({
      status: AlertStatus.DANGER,
      message: ALERT_RESET_PASSWORD_FAILED,
    });
  }

  componentWillUnmount() {
    this.passwordRef.current && (this.passwordRef.current.value = '');
    this.passwordConfirmRef.current && (this.passwordConfirmRef.current.value = '');
  }

  private checkErrorWhileTyping = ({ name, value }: { name: string; value: string }): FormError => {
    const password = (this.passwordRef.current && this.passwordRef.current.value) || '';

    switch (name) {
      case 'password':
        if (value === '') {
          return {
            hasError: true,
            message: `${startCase(name)} is required.`,
          };
        }
        if (!new RegExp(PASSWORD_VALIDATION_REGEX).test(value)) {
          return {
            hasError: true,
            message: PASSWORD_SPACE_SPECIAL_CHARACTER_NOT_ALLOWED,
          };
        }
        return {
          hasError: false,
          message: this.state.errors.password.message,
        };

      case 'passwordConfirm': {
        if (value === '') {
          return {
            hasError: true,
            message: 'Confirm password is required.',
          };
        }
        const hasError = password !== value;
        return {
          hasError,
          message: hasError ? PASSWORD_DO_NOT_MATCH : this.state.errors.passwordConfirm.message,
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

  private setPasswordValidation = ({ name, passwordValidation }) => {
    if (this.state.passwordValidation !== passwordValidation) {
      this.setState({
        passwordValidation,
      });
    }

    this.setError({
      name,
      error: {
        hasError: !passwordValidation,
        message: passwordValidation ? '' : ALERT_PASSWORD_INVALID,
      },
    });
  };

  private isValidOnSubmit = () => {
    let errorCount = 0;
    Object.keys(this.state.errors).forEach((name) => {
      if (this.state.errors[name].hasError) {
        errorCount++;
      }
    });

    if (!this.state.passwordValidation) {
      this.setError({
        name: 'password',
        error: {
          hasError: true,
          message: ALERT_PASSWORD_INVALID,
        },
      });
      errorCount++;
    }

    return errorCount === 0;
  };

  private handlePasswordFocus = () => {
    this.setState({ passwordFocused: true });
  };

  private handlePasswordBlur = () => {
    this.setState({ passwordFocused: false });
  };

  private handleInputChange = (name) => (e) => {
    const { value } = e.target;
    const error = this.checkErrorWhileTyping({ name, value });

    if (!error.hasError) {
      this.props.hideAlert();
    }

    if (name === 'password') {
      const passwordConfirm = this.passwordConfirmRef.current ? this.passwordConfirmRef.current.value : '';
      if (value !== passwordConfirm && passwordConfirm.length > 0) {
        this.setError({
          name: 'passwordConfirm',
          error: {
            hasError: true,
            message: PASSWORD_DO_NOT_MATCH,
          },
        });
      }

      if (value === passwordConfirm) {
        this.setError({
          name: 'passwordConfirm',
          error: {
            hasError: false,
            message: '',
          },
        });
      }
      this.setState({ password: value });
    }

    if (name === 'passwordConfirm') {
      this.setState({ passwordConfirm: value });
    }

    this.setError({ name, error });
  };

  private handleSubmit = (e) => {
    e.preventDefault();

    const password = this.passwordRef.current ? this.passwordRef.current.value : '';
    const passwordConfirm = this.passwordConfirmRef.current ? this.passwordConfirmRef.current.value : '';

    if (this.isValidOnSubmit()) {
      this.props.resetPasswordRequest({
        key: this.key,
        password,
        password_confirm: passwordConfirm,
      });
    } else {
      this.props.showAlert({ message: ALERT_RESET_PASSWORD_FAILED });
      return false;
    }
  };

  public render() {
    const { isFetching } = this.props;
    const { password, passwordFocused, passwordConfirm, errors } = this.state;
    const showConfirmSucces =
      passwordConfirm !== '' &&
      password === passwordConfirm &&
      !errors.password.hasError &&
      !errors.passwordConfirm.hasError;

    if (!this.key) {
      return <Redirect to="/" />;
    }

    return (
      <AuthWrapper>
        <ScrollBar>
          <AuthBox>
            <AuthTopBar />
            <AuthBoxCenter>
              <AuthBoxBody>
                <AuthBoxHeader>
                  <AuthBoxTitle>Reset your password?</AuthBoxTitle>
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
                  <form name="signIn" onSubmit={this.handleSubmit}>
                    <FormInput
                      id="new-password"
                      innerRef={this.passwordRef}
                      size={FormInputSize.MEDIUM}
                      type="password"
                      name="password"
                      label="New password"
                      value={password}
                      required={true}
                      showAsterisks={false}
                      error={errors.password}
                      onChange={this.handleInputChange('password')}
                      onFocus={this.handlePasswordFocus}
                      onBlur={this.handlePasswordBlur}
                    >
                      <PasswordValidation
                        password={password}
                        focused={passwordFocused}
                        hasError={errors.password.hasError}
                        handleChange={this.setPasswordValidation}
                      />
                    </FormInput>
                    <FormInput
                      id="confirm-password"
                      innerRef={this.passwordConfirmRef}
                      size={FormInputSize.MEDIUM}
                      type="password"
                      name="passwordConfirm"
                      label="Confirm password"
                      required={true}
                      showAsterisks={false}
                      error={errors.passwordConfirm}
                      onChange={this.handleInputChange('passwordConfirm')}
                    >
                      <MessageSuccess
                        show={showConfirmSucces}
                        message="Your new password is confirmed!"
                        styles={css`
                          margin-top: 6px;
                        `}
                      />
                    </FormInput>
                    <AuthButton
                      id="id_button_submit"
                      buttonType="primary"
                      type="submit"
                      size="large"
                      disabled={isFetching}
                      isLoading={isFetching}
                    >
                      Reset password
                    </AuthButton>
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

export const ResetPassword = connect(mapStateToProps, mapDispatchToProps)(ResetPasswordConnectable);
