import { FC, ReactNode } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Body, Button, cssVariables, Headings } from 'feather';

import { CLOUD_FRONT_URL } from '@constants';

import { OnboardingType } from './types';

const Layout = styled.article`
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;

  > section {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    > ul {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: 32px;
      list-style: none;
    }
  }
`;

const HeaderWrapper = styled.header`
  padding: 24px 32px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};

  > h1 {
    margin: 0;
    ${Headings['heading-04']}
  }

  > p {
    margin-top: 12px;
    color: ${cssVariables('neutral-7')};
    ${Body['body-short-01']}
  }
`;

const CardWrapper = styled.div`
  width: 520px;

  > h2 {
    margin-top: 32px;
    ${Headings['heading-05']}
  }

  > p {
    margin-top: 16px;
    margin-bottom: 48px;
    max-width: 400px;
    ${Body['body-short-01']}
  }
`;

const ImageWrapper = styled.div`
  border-radius: 4px;
  background: ${cssVariables('neutral-1')};
  width: 520px;
  height: 320px;
`;

const Header = () => {
  const intl = useIntl();

  return (
    <HeaderWrapper>
      <h1>{intl.formatMessage({ id: 'calls.studio.new.onboarding.pages.start.header.title' })}</h1>
      <p>{intl.formatMessage({ id: 'calls.studio.new.onboarding.pages.start.header.description' })}</p>
    </HeaderWrapper>
  );
};

const Card: FC<{
  image: ReactNode;
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
}> = ({ image, title, description, action }) => {
  return (
    <CardWrapper>
      {image}
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </CardWrapper>
  );
};

const images = {
  direct: {
    filename: 'img-calls-studio-main-direct-calls',
    alt: 'calls.studio.new.onboarding.pages.start.content.direct.image',
  },
  group: {
    filename: 'img-calls-studio-main-group-calls',
    alt: 'calls.studio.new.onboarding.pages.start.content.group.image',
    transform: 'translate(10px, 8px)',
  },
};

const Image: FC<{ filename: string; alt: string; transform?: string }> = ({ filename, alt, transform }) => {
  const intl = useIntl();

  return (
    <ImageWrapper>
      <img
        srcSet={[
          `${CLOUD_FRONT_URL}/calls/${filename}.png`,
          `${CLOUD_FRONT_URL}/calls/${filename}@2x.png 2x`,
          `${CLOUD_FRONT_URL}/calls/${filename}@3x.png 3x`,
        ].join(', ')}
        src={`${CLOUD_FRONT_URL}/calls/${filename}.png`}
        alt={intl.formatMessage({ id: alt })}
        css={transform && `transform: ${transform};`}
      />
    </ImageWrapper>
  );
};

const DirectCallsCard: FC<{ onNextClick: () => void }> = ({ onNextClick }) => {
  const intl = useIntl();

  return (
    <Card
      image={<Image {...images.direct} />}
      title={intl.formatMessage({ id: 'calls.studio.new.onboarding.pages.start.content.direct.title' })}
      description={intl.formatMessage({ id: 'calls.studio.new.onboarding.pages.start.content.direct.description' })}
      action={
        <Button buttonType="primary" onClick={onNextClick}>
          {intl.formatMessage({ id: 'calls.studio.new.onboarding.pages.start.content.direct.button' })}
        </Button>
      }
    />
  );
};

const GroupCallsCard: FC<{ onNextClick: () => void }> = ({ onNextClick }) => {
  const intl = useIntl();

  return (
    <Card
      image={<Image {...images.group} />}
      title={intl.formatMessage({ id: 'calls.studio.new.onboarding.pages.start.content.group.title' })}
      description={intl.formatMessage({ id: 'calls.studio.new.onboarding.pages.start.content.group.description' })}
      action={
        <Button buttonType="primary" onClick={onNextClick}>
          {intl.formatMessage({ id: 'calls.studio.new.onboarding.pages.start.content.group.button' })}
        </Button>
      }
    />
  );
};

const StartPage: FC<{ setOnboardingType: (type: OnboardingType) => void }> = ({ setOnboardingType }) => {
  const handleClick = (type: OnboardingType) => () => setOnboardingType(type);

  return (
    <Layout>
      <Header />
      <section>
        <ul>
          <li>
            <DirectCallsCard onNextClick={handleClick('direct')} />
          </li>
          <li>
            <GroupCallsCard onNextClick={handleClick('group')} />
          </li>
        </ul>
      </section>
    </Layout>
  );
};

export default StartPage;
