import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Icon, Headings, Body, Subtitles, Link } from 'feather';

import { PageHeader } from '@ui/components';

import { SupportForm } from './SupportForm';
import { SupportCommunity, SCTitle, SCDescription, SCLink } from './components';

const StyledSupport = styled.div`
  max-width: 1088px;
`;

const StyledSupportForm = styled.div`
  margin-top: 24px;

  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 32px;
`;

const SupportSectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  min-height: 636px;

  padding: 24px;
  border-radius: 4px;
  border: 1px solid ${cssVariables('neutral-3')};
`;

const SupportSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  ul {
    margin: 8px 0 24px;
    list-style: none;
    li {
      display: flex;
      align-items: center;
      ${Body['body-short-02']};
      color: ${cssVariables('neutral-7')};
      svg {
        fill: ${cssVariables('purple-7')};
        margin-right: 8px;
      }
      & + li {
        margin-top: 8px;
      }
    }
  }
`;

const SupportContent = styled.div`
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  margin-bottom: 24px;
  padding: 0 0 24px 16px;
`;

const SupportSectionTitle = styled.div`
  ${Subtitles['subtitle-02']};
  color: ${cssVariables('neutral-10')};
  margin-bottom: 24px;
`;

const SupportSectionLabel = styled.div`
  ${Headings['heading-01']};
  color: ${cssVariables('neutral-10')};
`;

const SupportPolicy = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-end;
  font-size: 14px;
`;

const SupportPolicyText = styled.div`
  display: flex;
  align-items: center;
`;

const SupportPolicyLink = styled(Link)`
  margin-left: 4px;
`;

export const Support: FC = () => {
  const intl = useIntl();

  return (
    <StyledSupport>
      <PageHeader>
        <PageHeader.Title>{intl.formatMessage({ id: 'common.support.title' })}</PageHeader.Title>
      </PageHeader>

      <StyledSupportForm>
        <SupportSectionWrapper>
          <SupportSectionTitle>{intl.formatMessage({ id: 'common.support.categories_header' })}</SupportSectionTitle>
          <SupportSection>
            <SupportContent>
              <SupportSectionLabel>
                {intl.formatMessage({ id: 'common.support.categories.technical_title' })}
              </SupportSectionLabel>
              <ul>
                <li>
                  <Icon icon="done" size={20} />
                  {intl.formatMessage({ id: 'common.support.categories.technical_lbl.sdk' })}
                </li>
                <li>
                  <Icon icon="done" size={20} />
                  {intl.formatMessage({ id: 'common.support.categories.technical_lbl.serverAPI' })}
                </li>
                <li>
                  <Icon icon="done" size={20} />
                  {intl.formatMessage({ id: 'common.support.categories.technical_lbl.reportBug' })}
                </li>
              </ul>
              <SupportSectionLabel>
                {intl.formatMessage({ id: 'common.support.categories.sales_title' })}
              </SupportSectionLabel>
              <ul>
                <li>
                  <Icon icon="done" size={20} />
                  {intl.formatMessage({ id: 'common.support.categories.sales_lbl.inquiry' })}
                </li>
                <li>
                  <Icon icon="done" size={20} />
                  {intl.formatMessage({ id: 'common.support.categories.sales_lbl.serviceLimit' })}
                </li>
                <li>
                  <Icon icon="done" size={20} />
                  {intl.formatMessage({ id: 'common.support.categories.sales_lbl.subscription' })}
                </li>
              </ul>
              <SupportSectionLabel>
                {intl.formatMessage({ id: 'common.support.categories.others_title' })}
              </SupportSectionLabel>
            </SupportContent>
            <SupportCommunity>
              <SCTitle>{intl.formatMessage({ id: 'common.support.communityBanner_title' })}</SCTitle>
              <SCDescription>{intl.formatMessage({ id: 'common.support.communityBanner_lbl.body' })}</SCDescription>
              <SCLink>
                <Link
                  target="_blank"
                  href="https://community.sendbird.com"
                  iconProps={{
                    icon: 'chevron-right',
                    size: 16,
                  }}
                >
                  {intl.formatMessage({ id: 'common.support.communityBanner_btn.cta' })}
                </Link>
              </SCLink>
            </SupportCommunity>
            <SupportPolicy>
              <SupportPolicyText>
                {intl.formatMessage(
                  { id: 'common.support_btn.supportPolicy' },
                  {
                    a: (text) => (
                      <SupportPolicyLink
                        iconProps={{ icon: 'open-in-new', size: 16 }}
                        href="https://sendbird.com/support-policy"
                        target="_blank"
                      >
                        {text}
                      </SupportPolicyLink>
                    ),
                  },
                )}
              </SupportPolicyText>
            </SupportPolicy>
          </SupportSection>
        </SupportSectionWrapper>
        <SupportForm />
      </StyledSupportForm>
    </StyledSupport>
  );
};
