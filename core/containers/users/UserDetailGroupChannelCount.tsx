import { useEffect } from 'react';
import { useIntl } from 'react-intl';

import { Link } from 'feather';

import { SettingsGridCard } from '@common/containers/layout/settingsGrid';
import { fetchUserGroupChannelCount } from '@core/api';
import { useAppId } from '@hooks/useAppId';
import { useAsync } from '@hooks/useAsync';

const useFetchUserGroupChannelCount = (userId: SDKUser['user_id'], appId: Application['app_id']) => {
  const [{ status, data: response }, fetch] = useAsync(fetchUserGroupChannelCount, []);

  useEffect(() => {
    fetch({ appId, userId });
  }, [appId, fetch, userId]);
  return {
    isFetching: status === 'init' || status === 'loading',
    groupChannelCount: response?.data.group_channel_count ?? 0,
  };
};

export const UserDetailGroupChannelCount = ({ userId }) => {
  const intl = useIntl();
  const appId = useAppId();
  const { isFetching, groupChannelCount } = useFetchUserGroupChannelCount(userId, appId);
  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'core.user_detail.groupChannelCount.title' })}
      titleColumns={4}
      description={intl.formatMessage({ id: 'core.user_detail.groupChannelCount.description' })}
      isFetchingBody={isFetching}
      gridItemConfig={{ subject: { alignSelf: 'start' } }}
    >
      <Link
        href={`/${appId}/group_channels?userId=${userId}`}
        iconProps={{ icon: 'chevron-right', size: 16 }}
        useReactRouter={true}
        aria-label={intl.formatMessage(
          { id: 'core.user_detail.groupChannelCount.channels' },
          { channelCount: groupChannelCount },
        )}
      >
        {groupChannelCount}
      </Link>
    </SettingsGridCard>
  );
};
