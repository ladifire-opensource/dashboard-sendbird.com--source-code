import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';

import { Subject } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

import { commonActions } from '@actions';
import { Banner, BannerStatus } from '@ui/components/Banner';

export const EmailVerificationBanner: React.FC = () => {
  const intl = useIntl();
  const { email, newEmail, emailVerified, verificationEmailSent } = useSelector((state: RootState) => ({
    email: state.auth.user.email,
    newEmail: state.auth.user.new_email,
    emailVerified: state.auth.user.email_verified,
    verificationEmailSent: state.auth.user.verification_email_sent,
  }));

  const dispatch = useDispatch();
  const sendEmailVerificationMail = useCallback(() => dispatch(commonActions.sendEmailVerificationMailRequest()), [
    dispatch,
  ]);

  const [isEmailSent, setIsEmailSent] = useState(false);
  const sendEmail$ = useRef(new Subject<boolean>());

  const handleSendBtnClick = useCallback(() => {
    sendEmail$.current.next(true);
  }, []);

  useEffect(() => {
    const sendEmailSubscription = sendEmail$.current
      .pipe(
        tap((shouldRequest) => {
          if (shouldRequest) sendEmailVerificationMail();
        }),
        tap(() => setIsEmailSent(true)),
        delay(5000),
        tap(() => setIsEmailSent(false)),
      )
      .subscribe();

    if (!emailVerified && verificationEmailSent) {
      sendEmail$.current.next(false);
    }

    return () => {
      sendEmailSubscription.unsubscribe();
    };
  }, [emailVerified, sendEmailVerificationMail, verificationEmailSent]);

  if (newEmail || isEmailSent) {
    return (
      <Banner
        content={intl.formatMessage({ id: 'common.emailVerification_banner.verificationEmailSent_success' })}
        status={BannerStatus.Success}
      />
    );
  }

  const bannerContent = verificationEmailSent
    ? intl.formatMessage({ id: `common.emailVerification_banner.unverified_warning.resend` }, { email })
    : intl.formatMessage({ id: `common.emailVerification_banner.unverified_warning.send` }, { email });

  const label = verificationEmailSent
    ? intl.formatMessage({ id: `common.emailVerification_btn.resend` })
    : intl.formatMessage({ id: `common.emailVerification_btn.send` });
  return (
    <Banner
      status={BannerStatus.Warning}
      content={bannerContent}
      action={{
        type: 'button',
        label,
        onClick: handleSendBtnClick,
      }}
    />
  );
};
