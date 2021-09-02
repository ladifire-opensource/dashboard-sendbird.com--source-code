import React from 'react';

import { AuthBoxFooter, AuthBoxFooterTerms } from '@common/containers/auth/components';
import { getYear } from '@utils';

type Props = {};

export const AuthFooter: React.SFC<Props> = () => {
  return (
    <AuthBoxFooter>
      <AuthBoxFooterTerms target="_blank" href="https://sendbird.com">
        Home
      </AuthBoxFooterTerms>
      <AuthBoxFooterTerms target="_blank" href="https://sendbird.com/privacy">
        Privacy
      </AuthBoxFooterTerms>
      <AuthBoxFooterTerms target="_blank" href="https://sendbird.com/terms-of-service">
        Terms
      </AuthBoxFooterTerms>
      <AuthBoxFooterTerms target="_blank" href="https://sendbird.com/contact-sales">
        Contact
      </AuthBoxFooterTerms>
      <AuthBoxFooterTerms as="span">&copy;{getYear()} Sendbird</AuthBoxFooterTerms>
    </AuthBoxFooter>
  );
};
