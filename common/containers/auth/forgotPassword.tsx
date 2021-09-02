import { createRef, Component } from 'react';
import { connect } from 'react-redux';

import { css } from 'styled-components';

import { Alert, AlertMessageAlign, AlertStatus, ScrollBar } from 'feather';
import startCase from 'lodash/startCase';
import trim from 'lodash/trim';

import { commonActions } from '@actions';
import { EMAIL_REGEX } from '@constants';
import { FormInputSize, AuthFooter, FormInput, HistoryBackText } from '@ui/components';
import { ALERT_EMAIL_INVALID } from '@utils/text';

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

const mapStateToProps = (state: RootState) => {
  return {
    isFetching: state.auth.isFetching,
    alert: state.alert,
  };
};

const mapDispatchToProps = {
  addNotificationsRequest: commonActions.addNotificationsRequest,
  initAlert: commonActions.initAlert,
  showAlert: commonActions.showAlert,
  hideAlert: commonActions.hideAlert,
  forgotPasswordRequest: commonActions.forgotPasswordRequest,
};

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionProps;

type State = {
  errors: { email: FormError };
};

export class ForgotPasswordConnectable extends Component<Props, State> {
  private emailRef = createRef<HTMLInputElement>();

  public state = {
    errors: {
      email: {
        hasError: false,
        message: '',
      },
    },
  };

  componentDidMount() {
    this.props.initAlert({
      status: AlertStatus.DANGER,
      message: ALERT_EMAIL_INVALID,
    });
  }

  private checkError = ({ name, value }: { name: string; value: string }): FormError => {
    switch (name) {
      case 'email':
        return {
          hasError: value.trim() === '',
          message: `${startCase(name)} is required`,
        };

      default:
        return {
          hasError: false,
          message: '',
        };
    }
  };

  public setError = ({ name, error }: { name: string; error: FormError }): void => {
    if (!this.state.errors[name] || (this.state.errors[name] && this.state.errors[name].hasError !== error.hasError)) {
      this.setState((prevState) => ({
        ...prevState,
        errors: {
          ...prevState.errors,
          [name]: error,
        },
      }));
    }
  };

  private isValidOnSubmit = ({ email }) => {
    let errorCount = 0;
    if (this.state.errors.email.hasError) {
      errorCount++;
    }

    // check validation for email and password only at the moment of the form sumbit
    if (!EMAIL_REGEX.test(email)) {
      this.setError({
        name: 'email',
        error: {
          hasError: true,
          message: ALERT_EMAIL_INVALID,
        },
      });
      errorCount++;
    }

    return errorCount === 0;
  };

  private handleSubmit = (e) => {
    e.preventDefault();

    const email = trim(this.emailRef.current ? this.emailRef.current.value : '').toLowerCase();

    if (this.isValidOnSubmit({ email })) {
      this.props.hideAlert();
      this.props.forgotPasswordRequest(email);
    } else {
      this.props.showAlert({ message: ALERT_EMAIL_INVALID });
      return false;
    }
  };

  private handleInputChange = (name) => (e) => {
    const { value } = e.target;
    const error = this.checkError({ name, value });

    if (!error.hasError) {
      this.props.hideAlert();
    }

    this.setError({ name, error });
  };

  public render() {
    const { isFetching } = this.props;

    return (
      <AuthWrapper>
        <ScrollBar>
          <AuthBox>
            <AuthTopBar />
            <AuthBoxCenter>
              <AuthBoxBody>
                <AuthBoxHeader>
                  <AuthBoxTitle>Forgot your password?</AuthBoxTitle>
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
                  <form name="forgotPassword" onSubmit={this.handleSubmit}>
                    <FormInput
                      innerRef={this.emailRef}
                      size={FormInputSize.MEDIUM}
                      name="email"
                      label="Email"
                      type="text"
                      required={true}
                      error={this.state.errors.email}
                      onChange={this.handleInputChange('email')}
                    />
                    <AuthButton
                      id="id_button_submit"
                      buttonType="primary"
                      type="submit"
                      size="large"
                      disabled={isFetching}
                      isLoading={isFetching}
                    >
                      Send email
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

export const ForgotPassword = connect(mapStateToProps, mapDispatchToProps)(ForgotPasswordConnectable);
