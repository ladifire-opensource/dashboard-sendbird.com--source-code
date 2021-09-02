import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Headings } from 'feather';

import Body from './Body';
import Contacts from './Contacts';
import { ContactsProvider } from './ContactsContext';
import NewOnboarding from './Onboarding/NewOnboarding';
import { OnboardingContext, useOnboardingProvider } from './Onboarding/OnboardingContext';
import Operator from './Operator';

const HeaderWrapper = styled.header`
  padding: 24px 32px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};

  > h1 {
    margin: 0;
    ${Headings['heading-04']}
  }
`;

const Aside = styled.aside`
  border-right: 1px solid ${cssVariables('neutral-3')};
  width: 336px;
  height: 100%;
  max-height: 100%;
  overflow-y: auto;

  > section {
    padding: 24px 32px;

    & + section {
      border-top: 1px solid ${cssVariables('neutral-3')};
    }
  }
`;

const Layout = styled.article`
  display: grid;
  grid-template-areas:
    'header header'
    'aside section';
  grid-template-rows: 80px auto;
  grid-template-columns: auto 1fr;
  min-width: 864px;
  height: 100%;

  > aside {
    grid-area: aside;
  }

  > header {
    grid-area: header;
  }
`;

const NewStudio = () => {
  const contextValue = useOnboardingProvider();
  const intl = useIntl();

  return (
    <OnboardingContext.Provider value={contextValue}>
      {contextValue.shouldShowOnboarding ? (
        <NewOnboarding />
      ) : (
        <ContactsProvider>
          <Layout>
            <HeaderWrapper>
              <h1>{intl.formatMessage({ id: 'calls.studio.header.title' })}</h1>
            </HeaderWrapper>
            <Aside>
              <Operator />
              <Contacts />
            </Aside>
            <Body />
          </Layout>
        </ContactsProvider>
      )}
    </OnboardingContext.Provider>
  );
};

export default NewStudio;
