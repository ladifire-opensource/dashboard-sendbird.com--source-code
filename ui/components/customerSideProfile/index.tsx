import React, { useCallback, useMemo, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import styled, { css, SimpleInterpolation } from 'styled-components';

import { IconName, cssVariables, transitionDefault, Icon, Tag } from 'feather';
import numbro from 'numbro';

import { commonActions, deskActions } from '@actions';
import { CLOUD_FRONT_URL, EMPTY_TEXT } from '@constants';
import { useAppId } from '@hooks';
import { colors_old, StyledProps } from '@ui';
import { getRandomNumber } from '@utils';

type OwnProps = {
  customer: Customer;
  hasLinkToDetail: boolean;
  agentTwitter?: TwitterUser | null;
  customerTwitter?: TwitterUserDetail | null;
  styles?: SimpleInterpolation;
  children?: ReactNode;
};

const mapDispatchToProps = {
  pushHistory: commonActions.pushHistory,
  followTwitterUser: deskActions.followTwitterUserRequest,
  unfollowTwitterUser: deskActions.unfollowTwitterUserRequest,
};

type ActionProps = typeof mapDispatchToProps;
type Props = OwnProps & ActionProps;

const Member = styled.div<{ styles?: SimpleInterpolation }>`
  padding: 16px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  ${(props) => props.styles}
`;

const MemberInfoContainer = styled.div`
  display: flex;
  width: 100%;
`;

const MemberDefaultInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  width: calc(100% - 64px - 16px);
  margin-left: 16px;
`;

const MemberText = styled.div<StyledProps>`
  display: block;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.2px;
  line-height: 1.33;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${cssVariables('neutral-10')};
  margin-bottom: 8px;
  ${(props) =>
    props.hasLink
      ? css`
          transition: all 0.2s ${transitionDefault};
          &:hover {
            cursor: pointer;
            color: ${colors_old.primary.skyBlue.core};
            text-decoration: underline;
          }
        `
      : ''};
`;

const MemberProfile = styled.div<StyledProps>`
  flex: none;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  ${(props) => (props.url ? `background-image: url(${props.url})` : '')};
  background-position: center;
  background-size: cover;
`;

const CustomerInformationSection = styled.section`
  margin-top: 12px;
  display: flex;
  align-items: flex-start;
  align-self: stretch;

  & + & {
    margin-top: 8px;
  }
`;

const SocialIcon = styled(Icon)`
  display: inline-block;
  vertical-align: -3px;
  margin-right: 8px;
`;

const CustomerIDText = styled.div`
  display: inline;
  position: relative;
  font-size: 14px;
  line-height: 1.43;
  color: ${cssVariables('neutral-10')};
  word-break: break-all;
`;

const CustomerInformationLabel = styled.label`
  flex: 88 0;
  font-size: 14px;
  line-height: 1.43;
  color: ${cssVariables('neutral-6')};
  margin-bottom: 0;
  margin-right: 16px;
  word-break: break-word;
`;

const CustomerInformationValue = styled.div`
  display: inline-block;
  flex: 197 0;
  min-width: 0;
  font-size: 14px;
  line-height: 1.43;
  color: ${cssVariables('neutral-10')};
  word-break: break-all;
`;

const CustomerSocialValue = styled(CustomerInformationValue)`
  display: inline-flex;
  align-items: center;
`;

const TextButton = styled.button`
  color: ${cssVariables('purple-7')};
  font-size: 14px;
  font-weight: 500;
  border: none;
  background: none;
  outline: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ${transitionDefault};

  &:hover {
    color: ${cssVariables('purple-8')};
    text-decoration: underline;
  }

  &:active {
    color: ${cssVariables('neutral-9')};
  }
`;

const SocialNameText = styled(CustomerIDText)`
  display: inline-block;
  height: 20px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  word-wrap: normal;
  vertical-align: -2px;
`;

const FollowButton = styled(TextButton)`
  flex: none;
  margin-left: 8px;
`;

const formatNumber = (value: any) => numbro(value).format({ thousandSeparated: true, mantissa: 0 });

const CustomerSideProfileConnectable: React.FC<Props> = ({
  customer,
  hasLinkToDetail,
  pushHistory,
  followTwitterUser,
  unfollowTwitterUser,
  children,
  agentTwitter,
  customerTwitter,
  styles,
}) => {
  const intl = useIntl();
  const appId = useAppId();

  const handleMemberDisplayNameClick = (customer) => () => {
    if (hasLinkToDetail) {
      pushHistory(`/${appId}/desk/customers/${customer.id}`);
    }
  };

  const handleOnMemberProfileError = useCallback(
    (e) => {
      e.target.onerror = null;
      e.target.src = `${CLOUD_FRONT_URL}/desk/thumbnail-member-0${getRandomNumber(customer.id, 3)}.svg`;
    },
    [customer.id],
  );

  const handleClickFollowButton = useCallback(() => {
    if (!agentTwitter || !customerTwitter) {
      return;
    }
    if (customerTwitter.following) {
      unfollowTwitterUser({
        agentTwitterUserId: agentTwitter.id,
        customerTwitterUserId: customerTwitter.id_str,
      });
    } else {
      followTwitterUser({
        agentTwitterUserId: agentTwitter.id,
        customerTwitterUserId: customerTwitter.id_str,
      });
    }
  }, [agentTwitter, customerTwitter, followTwitterUser, unfollowTwitterUser]);

  const renderSendBirdDetailSection = useMemo(() => {
    return (
      <CustomerInformationSection>
        <CustomerInformationLabel>
          {intl.formatMessage({ id: 'desk.customers.profile.userId' })}
        </CustomerInformationLabel>
        <CustomerInformationValue>
          <CustomerIDText>{customer.sendbirdId}</CustomerIDText>
        </CustomerInformationValue>
      </CustomerInformationSection>
    );
  }, [customer.sendbirdId, intl]);

  const renderTwitterDetailSection = useMemo(() => {
    if (!customerTwitter) {
      return renderSendBirdDetailSection;
    }

    return (
      <>
        {renderSendBirdDetailSection}
        <CustomerInformationSection>
          <CustomerInformationLabel>
            {intl.formatMessage({ id: 'desk.customers.profile.name' })}
          </CustomerInformationLabel>
          <CustomerSocialValue>
            <SocialIcon icon="twitter" size={16} color={cssVariables('neutral-9')} />
            <SocialNameText>@{customerTwitter.screen_name}</SocialNameText>
            <FollowButton onClick={handleClickFollowButton}>
              {intl.formatMessage({
                id: customerTwitter.following ? 'desk.customers.profile.unfollow' : 'desk.customers.profile.follow',
              })}
            </FollowButton>
          </CustomerSocialValue>
        </CustomerInformationSection>
        <CustomerInformationSection>
          <CustomerInformationLabel>
            {intl.formatMessage({ id: 'desk.customers.profile.followers' })}
          </CustomerInformationLabel>
          <CustomerInformationValue>{formatNumber(customerTwitter.followers_count)}</CustomerInformationValue>
        </CustomerInformationSection>
        <CustomerInformationSection>
          <CustomerInformationLabel>
            {intl.formatMessage({ id: 'desk.customers.profile.following' })}
          </CustomerInformationLabel>
          <CustomerInformationValue>{formatNumber(customerTwitter.friends_count)}</CustomerInformationValue>
        </CustomerInformationSection>
        {(customerTwitter.location || '').trim() && (
          <CustomerInformationSection>
            <CustomerInformationLabel>
              {intl.formatMessage({ id: 'desk.customers.profile.location' })}
            </CustomerInformationLabel>
            <CustomerInformationValue>{customerTwitter.location}</CustomerInformationValue>
          </CustomerInformationSection>
        )}
      </>
    );
  }, [customerTwitter, handleClickFollowButton, intl, renderSendBirdDetailSection]);

  const renderSocialDetailSection = useCallback(
    ({ prefixForCustomerName = '@', icon }: { prefixForCustomerName?: string; icon: IconName }) => {
      return (
        <>
          {renderSendBirdDetailSection}
          <CustomerInformationSection>
            <CustomerInformationLabel>
              {intl.formatMessage({ id: 'desk.customers.profile.name' })}
            </CustomerInformationLabel>
            <CustomerSocialValue>
              <SocialIcon icon={icon} size={16} color={cssVariables('neutral-9')} />
              <SocialNameText>
                {prefixForCustomerName}
                {customer.displayName}
              </SocialNameText>
            </CustomerSocialValue>
          </CustomerInformationSection>
        </>
      );
    },
    [renderSendBirdDetailSection, intl, customer.displayName],
  );

  const renderUserDetailInfoSection = useMemo(() => {
    switch (customer.channelType) {
      case 'TWITTER_USER':
        return renderTwitterDetailSection;
      case 'FACEBOOK_PAGE':
        return renderSocialDetailSection({ icon: 'facebook' });
      case 'INSTAGRAM_USER':
        return renderSocialDetailSection({ icon: 'instagram' });
      case 'SENDBIRD':
      default:
        return renderSendBirdDetailSection;
    }
  }, [customer.channelType, renderTwitterDetailSection, renderSocialDetailSection, renderSendBirdDetailSection]);

  return (
    <>
      <Member styles={styles}>
        <MemberInfoContainer>
          <MemberProfile
            url={
              customer.photoThumbnailUrl ||
              `${CLOUD_FRONT_URL}/desk/thumbnail-member-0${getRandomNumber(customer.id, 3)}.svg`
            }
            onError={handleOnMemberProfileError}
            alt=""
          />
          <MemberDefaultInfo>
            <MemberText hasLink={hasLinkToDetail} onClick={handleMemberDisplayNameClick(customer)}>
              {customer.displayName || EMPTY_TEXT}
            </MemberText>
            <Tag>{intl.formatMessage({ id: 'desk.customers.profile.customerTag' })}</Tag>
          </MemberDefaultInfo>
        </MemberInfoContainer>
        {renderUserDetailInfoSection}
      </Member>
      {children}
    </>
  );
};

export const CustomerSideProfile = connect(null, mapDispatchToProps)(CustomerSideProfileConnectable);
