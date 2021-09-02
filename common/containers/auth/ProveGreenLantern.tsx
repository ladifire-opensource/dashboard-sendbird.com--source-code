import { Component } from 'react';
import { connect } from 'react-redux';

import styled from 'styled-components';

import { Icon, InputText } from 'feather';

import { commonActions } from '@actions';
import { SpinnerInner, ButtonNatureGreen } from '@ui/components';

const RegistrationWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  overflow: auto;
  display: flex;
  background: white;
  button {
    height: 45px;
    letter-spacing: 0.7px;
  }
`;

const SetupCard = styled.div`
  width: 300px;
  position: relative;
  margin: 0 auto;
  margin-top: 90px;
  z-index: 5;
`;

const Logo = styled.img.attrs({
  src: 'https://dxstmhyqfqr1o.cloudfront.net/brand/Sendbird_Logo_RGB.svg',
  alt: 'Sendbird Dashboard',
})`
  width: 150px;
  position: absolute;
  top: 37px;
  left: 40px;
`;

const Step = styled.div``;

const StepHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const StepTitle = styled.div`
  font-size: 30px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.6px;
  color: #292855;
  margin-top: 50px;
  margin-bottom: 14px;
`;

const StepDescription = styled.div`
  font-size: 15px;
  line-height: 1;
  letter-spacing: -0.3px;
  color: #292855;
  margin-bottom: 40px;
`;

const StepBody = styled.div``;

const FormWrapper = styled.div``;

const ContinueButton = styled(ButtonNatureGreen)`
  display: block;
  width: 100%;
  margin-top: 24px;
`;

const mapStateToProps = (state: RootState) => ({
  auth: state.auth,
});

const mapDispatchToProps = {
  pushHistory: commonActions.pushHistory,
  proveGreenLanternRequest: commonActions.proveGreenLanternRequest,
};

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionProps & RCProps<StoreProps & ActionProps>;

type State = {
  eid: string;
  password: string;
  targetUserEmail: string;
};

class ProveGreenLanternConnectable extends Component<Props, State> {
  public state = {
    eid: this.props.history.location.query?.eid ?? '',
    password: '',
    targetUserEmail: this.props.history.location.query?.target_user_email ?? '',
  };

  private handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value } as any);
  };

  private handleSubmit = (e) => {
    e.preventDefault();

    this.props.proveGreenLanternRequest(this.state);
  };

  public render() {
    const { eid, password, targetUserEmail } = this.state;
    const { isFetching } = this.props.auth;

    return (
      <RegistrationWrapper>
        <Logo />
        <SetupCard id="id_page_gl">
          <Step>
            <StepHeader>
              <Icon icon="sendbird-colored" size={104} />
              <StepTitle>Green Lantern</StepTitle>
              <StepDescription>Prove yourself the green lantern</StepDescription>
            </StepHeader>
            <StepBody>
              <form onSubmit={this.handleSubmit}>
                <FormWrapper>
                  <InputText
                    type="text"
                    name="eid"
                    value={eid}
                    label="EID"
                    placeholder="eid"
                    onChange={this.handleInputChange}
                    required={true}
                  />
                  <InputText
                    type="email"
                    name="targetUserEmail"
                    value={targetUserEmail}
                    label="Target User Email"
                    placeholder="Target user's email"
                    onChange={this.handleInputChange}
                    required={true}
                  />

                  <InputText
                    type="password"
                    name="password"
                    value={password}
                    label="Password"
                    placeholder="Password"
                    onChange={this.handleInputChange}
                    required={true}
                  />
                  <ContinueButton id="id_button_submit_gl" type="submit" disabled={isFetching}>
                    <SpinnerInner isFetching={isFetching} dotColor="white" spinnerBackground="#24ce96" />
                    Green Lantern's light!!!
                  </ContinueButton>
                </FormWrapper>
              </form>
            </StepBody>
          </Step>
        </SetupCard>
      </RegistrationWrapper>
    );
  }
}

export const ProveGreenLantern = connect(mapStateToProps, mapDispatchToProps)(ProveGreenLanternConnectable);
