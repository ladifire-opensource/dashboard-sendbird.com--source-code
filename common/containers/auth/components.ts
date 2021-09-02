import styled, { SimpleInterpolation } from 'styled-components';

import { Button, cssVariables, Body, Link } from 'feather';

import { StyledProps, media } from '@ui';

const AuthWrapper = styled.div`
  display: flex;
  align-items: stretch;
  height: 100vh;
  background: white;

  ${media.MOBILE_LARGE`
    flex-direction: column;
  `}
`;

const AuthLeft = styled.div<StyledProps>`
  position: relative;
  display: flex;
  flex: 1;
  height: 100vh;
  background: white;

  ${(props) => props.styles};
`;

const AuthRight = styled.div<StyledProps>`
  position: relative;
  width: 420px;
  background: ${cssVariables('neutral-10')};
  height: 100vh;

  .slick-slider {
    position: relative;
    display: flex;
    align-items: center;
    height: 100vh;
  }

  ${media.MOBILE_LARGE`
    overflow: hidden;
    width: 100%;
    height: 0;
    opacity: 0;
  `}

  ${(props) => props.styles};
`;

const AuthRightImage = styled.div<StyledProps>`
  position: absolute;
  max-width: 870px;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  background-image: url(https://dxstmhyqfqr1o.cloudfront.net/dashboard/sign-illust.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: 50%;
  z-index: 3;
`;

const AuthLeftUpper = styled.div`
  flex: 0.75;
`;

const AuthLeftLower = styled.div`
  flex: 1.25;
`;

const AuthBox = styled.div<StyledProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
  width: 100%;
  height: 100vh;

  ${media.MOBILE_LARGE`
    padding: 0 20px;
    height: auto;
  `}

  ${(props) => props.styles};
`;

const AuthBoxTop = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 76px;
  min-height: 76px;
  margin-bottom: 32px;
`;

const AuthBoxCenter = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretch;
  width: 100%;
  max-width: 460px;
`;

const AuthBoxHeader = styled.div`
  padding-bottom: 32px;
  text-align: center;
`;

const AuthBoxTitle = styled.h1`
  margin: 0 -20px;
  padding: 0;
  font-size: 44px;
  font-weight: 500;
  line-height: 1.27;
  letter-spacing: -1.5px;
  color: ${cssVariables('neutral-10')};

  ${media.MOBILE_LARGE`
    margin: 0;
    font-size: 36px;
    line-height: 1.2;
    letter-spacing: -0.5px;
  `}
`;

const AuthBoxDescription = styled.div`
  ${Body['body-long-02']};
  color: ${cssVariables('neutral-8')};
  margin-top: 16px;
  white-space: pre-wrap;

  b {
    font-weight: 600;
  }
`;

const Logo = styled.img.attrs(() => ({
  src: 'https://dxstmhyqfqr1o.cloudfront.net/brand/Sendbird_Logo_RGB.svg',
  alt: 'Sendbird Dashboard',
  onClick: () => {
    location.href = 'https://sendbird.com';
  },
}))`
  height: 24px;
  &:hover {
    cursor: pointer;
  }
`;

const AuthBoxBody = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;

  ${media.MOBILE_LARGE`
    margin-top: 0;
  `}
`;

const AuthFormWrapper = styled.div`
  padding: 24px;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;
`;

const AuthFormSet = styled.div`
  margin-bottom: 17px;
  position: relative;
`;

const AuthFormLabel = styled.div`
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0;
  color: #292855;
  margin-bottom: 8px;
`;

const AuthButton = styled(Button)`
  margin-top: 24px;
  display: block;
  width: 100%;
`;

const AuthBoxAlreadyText = styled.div`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
`;

const AuthBoxAlreadyLink = styled(Link)`
  margin-left: 4px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  &:hover {
    font-weight: 600;
  }
`;

const AuthBoxAlready = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  margin-bottom: 24px;

  ${AuthBoxAlreadyLink} + ${AuthBoxAlreadyLink} {
    margin-left: 16px;
  }

  i {
    margin-right: 8px;
  }
`;

const AuthBoxOptions = styled.ul`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
`;

const AuthBoxOption = styled.li`
  display: flex;
  flex: none;
  align-items: center;
  position: relative;
  padding: 0 24px;
  list-style: none;

  & + & {
    &:before {
      content: '';
      display: block;
      position: absolute;
      left: -2px;
      border-radius: 4px;
      width: 4px;
      height: 4px;
      background: ${cssVariables('purple-4')};
    }
  }
`;

const AuthBoxAttached = styled.div`
  text-align: right;
  margin-top: 8px;
`;

const AuthBoxOptionLink = styled(Link).attrs({ useReactRouter: true })<{ styles?: SimpleInterpolation }>`
  font-size: 14px;
  font-weight: 600;
  line-height: 1.43;
  color: ${cssVariables('purple-7')};
  &:hover {
    font-weight: 600;
  }

  ${(props) => props.styles};
`;

const AuthBoxFooter = styled.div`
  padding: 24px 0;
  text-align: center;

  ${media.MOBILE_LARGE`
    margin-top: 84px;
  `}
`;

const AuthBoxFooterTerms = styled.a`
  position: relative;
  display: inline-block;
  padding: 0 10px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  text-align: center;
  color: ${cssVariables('purple-7')};

  &:hover {
    text-decoration: underline;
  }

  &:last-child {
    text-decoration: none !important;
  }
`;

const SocialDivider = styled.div`
  position: relative;
  text-align: center;
  font-size: 14px;
  font-stretch: normal;
  line-height: 1.45;
  text-align: center;
  color: ${cssVariables('neutral-6')};
  margin-top: 15px;
  padding: 4px 0;

  &:before {
    position: absolute;
    content: '';
    width: 100%;
    height: 1px;
    background: ${cssVariables('neutral-3')};
    top: 14px;
    left: 0;
    z-index: 10;
  }
`;

const SocialDividerText = styled.div`
  display: inline-block;
  position: relative;
  z-index: 30;
  padding: 0 16px;
  background: white;
`;

const SocialLoginWrapper = styled.div`
  padding: 14px 0 0;
`;

const SocialLoginButton = styled(Button)`
  display: flex;
  justify-content: flex-start;
  width: 100%;

  i {
    flex: none;
    margin-left: -4px;
  }
`;

const SocialLoginButtonText = styled.span`
  display: flex;
  flex: 1;
  justify-content: center;
  margin-right: 24px;
`;

const SocialLoginDivider = styled.div`
  width: 20px;
`;

const AuthFormComponent = styled.form`
  padding-top: 24px;
`;

export {
  AuthWrapper,
  AuthLeft,
  AuthLeftUpper,
  AuthLeftLower,
  AuthRight,
  AuthRightImage,
  AuthBox,
  AuthBoxTop,
  AuthBoxCenter,
  AuthBoxHeader,
  AuthBoxTitle,
  AuthBoxDescription,
  AuthBoxBody,
  AuthBoxAlreadyLink,
  AuthBoxAlready,
  AuthBoxAlreadyText,
  AuthBoxOptions,
  AuthBoxOption,
  AuthBoxOptionLink,
  AuthBoxAttached,
  AuthBoxFooter,
  AuthBoxFooterTerms,
  AuthFormWrapper,
  AuthFormSet,
  AuthFormLabel,
  AuthFormComponent,
  AuthButton,
  Logo,
  SocialDivider,
  SocialLoginWrapper,
  SocialLoginButton,
  SocialLoginButtonText,
  SocialLoginDivider,
  SocialDividerText,
};
