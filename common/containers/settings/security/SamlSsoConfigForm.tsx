import { Fragment, FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, Lozenge, Icon, InputTextarea, Link, LinkVariant, Body, Subtitles, InputText } from 'feather';

import { getRoleDisplayName } from '@authorization';
import { useCopy } from '@hooks';
import { InfoTooltip } from '@ui/components';
import { getUriHost } from '@utils';

import { useRolesReducer } from '../roles/rolesReducer';
import SamlSsoConfigButtons from './SamlSsoConfigButtons';
import { serviceProviderEntityId, getServiceProviderAcsUrl } from './serviceProviderInformation';

const SSOHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 32px;
  grid-gap: 0 16px;
`;

const DList = styled.dl<{ $width: number; $bold?: boolean }>`
  display: grid;
  align-items: center;
  grid-template-columns: ${({ $width }) => $width}px 1fr;
  grid-gap: 6px 0;
  ${Body['body-short-01']}
  dt {
    align-self: self-start;
    display: flex;
    align-items: center;

    span {
      color: ${cssVariables('neutral-7')};
    }
  }
  dd {
    display: flex;
    font-weight: ${({ $bold }) => ($bold ? 500 : 400)};
    color: ${cssVariables('neutral-10')};
  }
`;

const StyledOrganizationKey = styled.span`
  margin-right: 2px;
`;

const WrapperWithBorder = styled.div`
  margin-top: 24px;
  border: solid 1px ${cssVariables('neutral-3')};
  border-radius: 4px;
`;

const IDPInfoDescription = styled.div`
  margin-top: 24px;
  p {
    ${Body['body-short-01']}
    color: ${cssVariables('neutral-7')};
    display: inline;
    strong {
      color: ${cssVariables('red-5')};
      font-weight: normal;
    }
  }
`;

const UpperSection = styled.div<{ $extended: boolean }>`
  padding: 24px;
  ${({ $extended }) =>
    $extended &&
    css`
      &:first-child {
        border-bottom: 1px solid ${cssVariables('neutral-3')};
      }
    `}
`;
const LowerSection = styled.div<{ $extended: boolean }>`
  overflow: hidden;
  height: ${({ $extended }) => ($extended ? '542px' : 0)};
`;

const ToggleComponent = styled.div`
  padding: 24px;
  padding-bottom: 30px;
`;

const StyledCopyableInputWithTitle = styled.div`
  & + & {
    margin-top: 20px;
  }
  h6 {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    letter-spacing: normal;
    color: ${cssVariables('neutral-10')};
  }
  svg {
    width: 18px;
    height: 18px;
    fill: ${cssVariables('neutral-6')};
  }
`;
const StyledGridBoxWithTitle = styled.div`
  margin-top: 18px;
`;
const TitleWithContextualHelp = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  height: 20px;
  h6 {
    ${Subtitles['subtitle-01']}
    margin-right:2px;
  }
`;

const ReadMoreButtonStyle = css`
  padding-bottom: 22px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.43;
  color: ${cssVariables('purple-7')};
  text-align: center;
  &:hover {
    cursor: pointer;
    color: ${cssVariables('purple-8')};

    svg {
      fill: ${cssVariables('purple-8')};
    }
  }

  svg {
    display: inline;
    vertical-align: text-bottom;
    margin-left: 4px;
    fill: ${cssVariables('purple-7')};
  }

  &[aria-hidden='true'] {
    margin-top: 0;
    height: 0;
    overflow: hidden;

    &:before {
      display: none;
    }
  }
`;

const SectionTitle = styled.div`
  margin-bottom: 16px;
  ${Subtitles['subtitle-01']}
`;

const ShowMoreButton = styled.div`
  ${ReadMoreButtonStyle}
  padding-top:6px;
`;

const HideInformationButton = styled.div`
  ${ReadMoreButtonStyle}
`;

const EmptyLine = styled.div`
  width: 9px;
  height: 1px;
  background: ${cssVariables('neutral-10')};
`;

const RoleItem = styled.div`
  display: flex;
  ${Lozenge} {
    margin-left: 4px;
    height: 20px;
  }
`;

export const CopyableInputWithTitle: FC<{ title: string; copyableString: string }> = ({ title, copyableString }) => {
  const copy = useCopy();
  return (
    <StyledCopyableInputWithTitle>
      <h6>{title}</h6>
      <InputText
        type="text"
        value={copyableString}
        readOnly={true}
        icons={[
          {
            icon: 'copy',
            onClick: () => {
              copy(copyableString);
            },
          },
        ]}
      />
    </StyledCopyableInputWithTitle>
  );
};

const PublicCertificateTextArea = ({ title, copyableString }) => (
  <StyledCopyableInputWithTitle>
    <h6>{title}</h6>
    <InputTextarea
      readOnly={true}
      styles={css`
        height: 120px;
      `}
      value={copyableString}
    />
  </StyledCopyableInputWithTitle>
);

const GridBoxWithTitle = ({ title, contextTitle, dataArr }) => (
  <StyledGridBoxWithTitle>
    <TitleWithContextualHelp>
      <h6>{title}</h6>
      <InfoTooltip content={contextTitle} placement="top" />
    </TitleWithContextualHelp>
    <DList $width={152}>
      {dataArr.map(({ title, content }) => (
        <Fragment key={title}>
          <dt>
            <span>{title}</span>
          </dt>
          <dd>{content}</dd>
        </Fragment>
      ))}
    </DList>
  </StyledGridBoxWithTitle>
);

const SamlSsoConfigForm: FC<{ uid: string; currentConfiguration: SSOConfigurationFormValues }> = ({
  uid,
  currentConfiguration,
}) => {
  const {
    slug_name,
    sso_entity_id,
    sso_idp_cert,
    sso_idp_url,
    sso_enforcing,
    sso_jit_provisioning,
    sso_default_role,
  } = currentConfiguration;

  const intl = useIntl();
  const [extended, setExtended] = useState(false);

  const {
    state: { memberRoles },
    actions: { fetchMemberRolesRequest },
  } = useRolesReducer();

  useEffect(() => {
    fetchMemberRolesRequest({
      uid,
      limit: 100,
      offset: 0,
    });
  }, [fetchMemberRolesRequest, uid]);

  const currentIDP = useMemo(() => {
    const fetchedSSOEntityId = getUriHost(sso_entity_id);
    return fetchedSSOEntityId ?? <EmptyLine />;
  }, [sso_entity_id]);

  const renderHideInformationButton = useCallback(
    () => (
      <HideInformationButton role="button" onClick={() => setExtended(false)} aria-hidden={!extended}>
        {intl.formatMessage({ id: 'common.settings.security.samlsso.form.buttons.showLess' })}
        <Icon icon="chevron-up" size={16} />
      </HideInformationButton>
    ),
    [extended, intl],
  );

  const renderShowMoreButton = useCallback(
    () => (
      <ShowMoreButton role="button" onClick={() => setExtended(true)} aria-hidden={extended}>
        {intl.formatMessage({ id: 'common.settings.security.samlsso.form.buttons.showMore' })}
        <Icon icon="chevron-down" size={16} />
      </ShowMoreButton>
    ),
    [extended, intl],
  );

  const getRoleWithLozenge = useCallback(
    (roleName) => {
      const role = memberRoles.find(({ name }) => name === roleName);
      return (
        role && (
          <RoleItem>
            <div>{getRoleDisplayName(role)}</div>
            {role.is_predefined && <Lozenge color="neutral">System role</Lozenge>}
          </RoleItem>
        )
      );
    },
    [memberRoles],
  );

  return (
    <>
      <SSOHeader data-test-id="ssoConfigFormHeader">
        <DList $width={176} $bold={true}>
          <dt>
            <span>{intl.formatMessage({ id: 'common.settings.security.samlsso.form.currentIdp' })}</span>
          </dt>
          <dd>{currentIDP}</dd>
          <dt>
            <StyledOrganizationKey>
              {intl.formatMessage({ id: 'common.settings.security.samlsso.configurePopover.organizationKey.title' })}
            </StyledOrganizationKey>
            <InfoTooltip
              content={intl.formatMessage({
                id: 'common.settings.security.samlsso.configurePopover.organizationKey.tooltip',
              })}
              placement="bottom"
            />
          </dt>
          <dd>{slug_name}</dd>
        </DList>
        <SamlSsoConfigButtons uid={uid} currentConfiguration={currentConfiguration} />
      </SSOHeader>
      <>
        <WrapperWithBorder>
          <UpperSection $extended={extended}>
            <SectionTitle>
              {intl.formatMessage({ id: 'common.settings.security.samlsso.form.serviceProvider.title' })}
            </SectionTitle>

            <CopyableInputWithTitle
              title={intl.formatMessage({ id: 'common.settings.security.samlsso.sp.entityId' })}
              copyableString={serviceProviderEntityId}
            />
            <CopyableInputWithTitle
              title={intl.formatMessage({ id: 'common.settings.security.samlsso.sp.assertionURL' })}
              copyableString={getServiceProviderAcsUrl(slug_name)}
            />
            <IDPInfoDescription>
              <p>
                {intl.formatMessage(
                  {
                    id: 'common.settings.security.samlsso.form.samlIdentityProviderInformation.description',
                  },
                  {
                    strong: (text: string) => <strong>{text}</strong>,
                  },
                )}
              </p>
            </IDPInfoDescription>
          </UpperSection>
          <LowerSection $extended={extended} data-test-id="lowerSection">
            <ToggleComponent>
              <SectionTitle>
                {intl.formatMessage({ id: 'common.settings.security.samlsso.form.identityProvider.title' })}
              </SectionTitle>
              <CopyableInputWithTitle
                title={intl.formatMessage({ id: 'common.settings.security.samlsso.entityId' })}
                copyableString={sso_entity_id}
              />
              <CopyableInputWithTitle
                title={intl.formatMessage({ id: 'common.settings.security.samlsso.endpointUrl' })}
                copyableString={sso_idp_url}
              />
              <PublicCertificateTextArea
                title={intl.formatMessage({ id: 'common.settings.security.samlsso.publicCertificate' })}
                copyableString={sso_idp_cert}
              />
              <GridBoxWithTitle
                title={intl.formatMessage({
                  id: 'common.settings.security.samlsso.alloJIT.title',
                })}
                contextTitle={
                  <>
                    {intl.formatMessage(
                      {
                        id:
                          'common.settings.security.samlsso.configurePopover.loginRestriction.allowAccess.description',
                      },
                      {
                        a: (text: string) => (
                          <Link variant={LinkVariant.Inline} href="/settings/roles" target="_blank">
                            {text}
                          </Link>
                        ),
                      },
                    )}
                  </>
                }
                dataArr={[
                  {
                    title: intl.formatMessage({ id: 'common.settings.security.samlsso.check.status' }),
                    content: sso_jit_provisioning
                      ? intl.formatMessage({ id: 'common.settings.security.samlsso.alloJIT.on' })
                      : intl.formatMessage({ id: 'common.settings.security.samlsso.alloJIT.off' }),
                  },
                  {
                    title: intl.formatMessage({ id: 'common.settings.security.samlsso.check.grantedRole' }),
                    content: getRoleWithLozenge(sso_default_role),
                  },
                ]}
              />
              <GridBoxWithTitle
                title={intl.formatMessage({ id: 'common.settings.security.samlsso.onlySigninSSO.title' })}
                contextTitle={intl.formatMessage({
                  id: 'common.settings.security.samlsso.configurePopover.enforceSso.description',
                })}
                dataArr={[
                  {
                    title: intl.formatMessage({ id: 'common.settings.security.samlsso.check.status' }),
                    content: sso_enforcing
                      ? intl.formatMessage({ id: 'common.settings.security.samlsso.alloJIT.on' })
                      : intl.formatMessage({ id: 'common.settings.security.samlsso.alloJIT.off' }),
                  },
                ]}
              />
            </ToggleComponent>
          </LowerSection>
          {extended ? renderHideInformationButton() : renderShowMoreButton()}
        </WrapperWithBorder>
      </>
    </>
  );
};

export default SamlSsoConfigForm;
