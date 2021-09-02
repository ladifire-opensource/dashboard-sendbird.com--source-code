import { ReactNode } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Body, cssVariables, Headings, Icon, Link } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShowDialog } from '@hooks';
import { ChevronLink } from '@ui/components';

import { AppStore, GooglePlay } from './components/AppDownload';
import { Image } from './components/Image';

const AppDownloadContainer = styled.div`
  a + a {
    margin-left: 8px;
  }
`;

const GuideContent = styled.ul`
  list-style: none;

  li {
    > p {
      ${Body['body-short-01']}

      strong {
        font-weight: 600;
      }
    }
    > img {
      border-radius: 4px;
      background: ${cssVariables('neutral-1')};
    }

    > p + * {
      margin-top: 16px;
    }
  }
  li + li {
    margin-top: 16px;
  }
`;

const useGuideDialog = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();

  return ({ title, body }: { title: string; body: ReactNode }) => {
    showDialog({
      dialogTypes: DialogType.Custom,
      dialogProps: {
        size: 'small',
        title,
        body,
        isNegativeButtonHidden: true,
        positiveButtonProps: { text: intl.formatMessage({ id: 'calls.studio.guides.dialogs.submit' }) },
      },
    });
  };
};

const useDesktopGuide = () => {
  const intl = useIntl();
  const showGuide = useGuideDialog();

  return () =>
    showGuide({
      title: intl.formatMessage({ id: 'calls.studio.guides.dialogs.desktop.title' }),
      body: (
        <GuideContent>
          <li>
            <p>
              {intl.formatMessage(
                { id: 'calls.studio.guides.dialogs.desktop.step1' },
                { strong: (text) => <strong>{text}</strong> },
              )}
            </p>
            <Image
              name="img-call-studio-guide-web-01"
              alt={intl.formatMessage({ id: 'calls.studio.guides.dialogs.desktop.step1.image' })}
            />
          </li>
          <li>
            <p>{intl.formatMessage({ id: 'calls.studio.guides.dialogs.desktop.step2' })}</p>
            <Image
              name="img-call-studio-guide-web-02"
              alt={intl.formatMessage({ id: 'calls.studio.guides.dialogs.desktop.step2.image' })}
            />
          </li>
        </GuideContent>
      ),
    });
};

const useMobileGuide = () => {
  const intl = useIntl();
  const showGuide = useGuideDialog();

  return () => {
    showGuide({
      title: intl.formatMessage({ id: 'calls.studio.guides.dialogs.mobile.title' }),
      body: (
        <GuideContent>
          <li>
            <p>{intl.formatMessage({ id: 'calls.studio.guides.dialogs.mobile.step1' })}</p>
            <AppDownloadContainer>
              <AppStore />
              <GooglePlay />
            </AppDownloadContainer>
          </li>
          <li>
            <p>{intl.formatMessage({ id: 'calls.studio.guides.dialogs.mobile.step2' })}</p>
            <Image
              name="img-call-studio-guide-mobile-01"
              alt={intl.formatMessage({ id: 'calls.studio.guides.dialogs.mobile.step2.image' })}
            />
          </li>
          <li>
            <p>{intl.formatMessage({ id: 'calls.studio.guides.dialogs.mobile.step3' })}</p>
          </li>
        </GuideContent>
      ),
    });
  };
};

const samples = [
  {
    icon: 'apple',
    links: {
      direct: 'https://github.com/sendbird/quickstart-calls-directcall-ios',
      group: 'https://github.com/sendbird/quickstart-calls-groupcall-ios',
    },
    label: 'calls.studio.guides.links.ios',
  },
  {
    icon: 'android',
    links: {
      direct: 'https://github.com/sendbird/quickstart-calls-directcall-android',
      group: 'https://github.com/sendbird/quickstart-calls-groupcall-android',
    },
    label: 'calls.studio.guides.links.android',
  },
  {
    icon: 'javascript',
    links: {
      direct: 'https://github.com/sendbird/quickstart-calls-javascript',
      group: 'https://github.com/sendbird/quickstart-calls-reactjs',
    },
    label: 'calls.studio.guides.links.javascript',
  },
] as const;

const Layout = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 32px;

  > div {
    padding: 24px;
    border-radius: 4px;
    background: ${cssVariables('neutral-1')};
    display: flex;
    flex-direction: column;

    > h3 {
      ${Headings['heading-01']}
    }

    > ul {
      margin-top: 16px;
      list-style: none;

      li {
        display: flex;
        align-items: center;

        > span {
          ${Body['body-short-01']}
          color: ${cssVariables('neutral-10')};

          > a {
            margin-left: 8px;
          }
        }

        > svg {
          fill: ${cssVariables('neutral-7')};
        }

        > * + * {
          margin-left: 8px;
        }
      }

      li + li {
        margin-top: 8px;
      }
    }

    > p {
      ${Body['body-short-01']}
    }

    a {
      font-size: 14px;
      line-height: 20px;
    }

    > ul + h3 {
      margin-top: 32px;
    }

    > h3 + p {
      margin-top: 16px;
    }

    > p + a {
      margin-top: 16px;
    }
  }
`;

export const DirectCallsGuides = () => {
  const intl = useIntl();
  const openDesktopGuide = useDesktopGuide();
  const openMobileGuide = useMobileGuide();

  const dialogs = [
    {
      icon: 'web-application-filled',
      label: 'calls.studio.guides.singin.desktop',
      onClick: openDesktopGuide,
    },
    {
      icon: 'mobile-application-filled',
      label: 'calls.studio.guides.singin.mobile',
      onClick: openMobileGuide,
    },
  ] as const;

  return (
    <Layout>
      <div>
        <h3>{intl.formatMessage({ id: 'calls.studio.guides.singin.title' })}</h3>
        <ul>
          {dialogs.map(({ icon, label, onClick }) => (
            <li key={label}>
              <Icon icon={icon} size={16} />
              <span>
                {intl.formatMessage(
                  { id: label },
                  { a: (text) => <ChevronLink onClick={onClick}>{text}</ChevronLink> },
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>{intl.formatMessage({ id: 'calls.studio.guides.links.title' })}</h3>
        <ul>
          {samples.map(({ icon, links, label }) => (
            <li key={label}>
              <Icon icon={icon} size={16} />
              <Link iconProps={{ icon: 'open-in-new', size: 16 }} target="_blank" href={links.direct}>
                {intl.formatMessage({ id: label })}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export const GroupCallsGuides = () => {
  const intl = useIntl();

  return (
    <Layout>
      <div>
        <h3>{intl.formatMessage({ id: 'calls.studio.guides.docs.title' })}</h3>
        <p>{intl.formatMessage({ id: 'calls.studio.guides.docs.description' })}</p>
        <ChevronLink href="https://sendbird.com/docs/calls" target="_blank" useReactRouter={false}>
          {intl.formatMessage({ id: 'calls.studio.guides.docs.link' })}
        </ChevronLink>
      </div>
      <div>
        <h3>{intl.formatMessage({ id: 'calls.studio.guides.links.title' })}</h3>
        <ul>
          {samples.map(({ icon, links, label }) => (
            <li key={label}>
              <Icon icon={icon} size={16} />
              <Link iconProps={{ icon: 'open-in-new', size: 16 }} target="_blank" href={links.group}>
                {intl.formatMessage({ id: label })}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};
