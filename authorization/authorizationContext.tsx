import { createContext, useCallback, useMemo, useEffect, useState } from 'react';

import { toast } from 'feather';

import { Page, LegacyPremiumFeatureMap, AllPremiumFeatures, ChatFeatureName } from '@constants';
import { fetchEnabledFeatures } from '@core/api';
import { getErrorMessage } from '@epics';
import { useLatestValue } from '@hooks/useLatestValue';
import { useTypedSelector, useShallowEqualSelector } from '@hooks/useTypedSelector';

type IsPermittedCombinedWithOption = 'and' | 'or';

/**
 * Returns a function checking if the user has given permissions
 * @param userPermissions user role's permission list
 */
export const isPermittedFactory = (userPermissions: PermissionKey[]) => (
  allowedPermissions: readonly PermissionKey[],
  options: { combinedWith: IsPermittedCombinedWithOption } = { combinedWith: 'or' },
) => {
  switch (options.combinedWith) {
    case 'or':
      return userPermissions.some((permission) => allowedPermissions.includes(permission));
    case 'and':
      return allowedPermissions.every((permission) => userPermissions.includes(permission));
    default:
      throw new Error('combinedWith option must be either "and" or "or".');
  }
};

export const isAccessiblePageFactory = (userPermissions: PermissionKey[]) => (page: Page) => {
  switch (page) {
    case Page.openChannels:
      return userPermissions.some((v) => v.startsWith('application.channels.openChannel.'));
    case Page.groupChannels:
      return userPermissions.some((v) => v.startsWith('application.channels.groupChannel.'));
    case Page.dataExports:
      return userPermissions.some((v) => v.startsWith('application.data'));
    case Page.callsStudio:
      return userPermissions.some((v) => v.startsWith('calls.studio.'));
    default:
      return userPermissions.some((permission) => permission.split('.').includes(page));
  }
};

type AuthorizationContext = {
  isFeatureEnabled: (feature: AllPremiumFeatures) => boolean;
  preparingFeatures: boolean;
  setEnabledFeatures: (features: string[]) => void;
  /**
   * Returns true if the authenticated user has any of the permissions passed as argument. You can optionally pass an
   * options argument which contains `combinedWith` property, which can be either `and` or `or` (default is `or`). If
   * it's `and`, it returns true only if the user has all the permissions passed. If it's `or`, it returns true if the
   * user has any of the permissions passed.
   */
  isPermitted: ReturnType<typeof isPermittedFactory>;
  isAccessiblePage: ReturnType<typeof isAccessiblePageFactory>;
  isSelfService: boolean;
} & Pick<AuthState, 'user' | 'role' | 'authenticated'>;

export const AuthorizationContext = createContext<AuthorizationContext>({
  isPermitted: () => false,
  isAccessiblePage: () => false,
  isFeatureEnabled: () => false,
  preparingFeatures: true,
  setEnabledFeatures: () => {},
  isSelfService: true,
  user: {
    country_code: '',
    email: '',
    new_email: '',
    email_verified: false,
    first_name: '',
    last_name: '',
    country_name: '',
    nickname: '',
    profile_id: 0,
    profile_url: '',
    user_id: 0,
    two_factor_authentication: false,
    verification_email_sent: false,
    coachmark_completed: false,
  },
  role: {
    name: 'GUEST',
    permissions: [],
    is_predefined: false,
  },
  authenticated: false,
});

const isSetEqual = (a: Set<string>, b: Set<string>) => {
  if (a.size !== b.size) {
    return false;
  }
  for (const aElement of a) {
    if (!b.has(aElement)) {
      return false;
    }
  }
  return true;
};

const getLegacyFeatureSet = (premiumFeatures: Application['current_premium_features']) =>
  new Set(
    Object.entries(premiumFeatures)
      .filter(([, value]) => value === true) // filter boolean current_premium_feature values that are true
      .map(([key]) => LegacyPremiumFeatureMap[key])
      .filter((value): value is string => Boolean(value)), // filter possible undefined values
  );

const useLegacyFeatures = () => {
  const application = useTypedSelector((state) => state.applicationState.data);
  const [result, setResult] = useState<Set<string> | null>(null);
  const latestResult = useLatestValue(result);

  useEffect(() => {
    const legacyFeatures = application && getLegacyFeatureSet(application.current_premium_features);
    const currentResult = latestResult.current;
    if (currentResult === legacyFeatures) {
      return;
    }
    if (currentResult == null || legacyFeatures == null || !isSetEqual(currentResult, legacyFeatures)) {
      setResult(legacyFeatures);
      return;
    }
  }, [application, latestResult]);

  const isLoading = application == null || result == null;

  return useMemo(() => ({ isLoading, result: result ? Array.from(result) : [] }), [isLoading, result]);
};

const useIsSelfService = () => useTypedSelector((state) => !!state.organizations.current.is_self_serve);

export const convertEnabledFeaturesObjectToFeatureKeys = (enabledFeatures: EnabledFeatures) =>
  Object.entries(enabledFeatures)
    .filter(([key, value]) => {
      if (key === ChatFeatureName.MessageSearch) {
        return false;
      }
      return !!value;
    })
    .map(([key]) => key);

const useSelfServiceFeatures = () => {
  const isSelfService = useIsSelfService();
  const { authenticated, application } = useShallowEqualSelector((state) => {
    return {
      authenticated: state.auth.authenticated,
      application: state.applicationState.data,
    };
  });
  const [selfServiceFeatures, setSelfServiceFeatures] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const appId = application?.app_id;

  useEffect(() => {
    if (!authenticated || !isSelfService || !appId) {
      return;
    }

    const loadEnabledFeatures = async () => {
      try {
        setIsFetching(true);
        const { data } = await fetchEnabledFeatures(appId);
        setSelfServiceFeatures(convertEnabledFeaturesObjectToFeatureKeys(data));
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
        setSelfServiceFeatures([]);
      } finally {
        setIsFetching(false);
      }
    };

    loadEnabledFeatures();
  }, [appId, authenticated, isSelfService]);

  const isLoading = !authenticated || !application || isFetching;

  return useMemo(() => ({ isLoading, result: selfServiceFeatures, update: setSelfServiceFeatures }), [
    isLoading,
    selfServiceFeatures,
  ]);
};

const useFeatureEnabled = () => {
  const isSelfService = useIsSelfService();
  const legacyFeatures = useLegacyFeatures();
  const selfServiceFeatures = useSelfServiceFeatures();
  const preparingFeatures = legacyFeatures.isLoading || (isSelfService ? selfServiceFeatures.isLoading : false);

  const features = useMemo(() => {
    if (isSelfService) {
      return [...selfServiceFeatures.result, ...legacyFeatures.result];
    }
    return legacyFeatures.result;
  }, [isSelfService, legacyFeatures.result, selfServiceFeatures.result]);

  const isFeatureEnabled = useCallback((feature) => features.includes(feature), [features]);

  return {
    preparingFeatures,
    features,
    isFeatureEnabled,
    setEnabledFeatures: selfServiceFeatures.update,
  };
};

export const AuthorizationContextProvider = ({ children }) => {
  const isSelfService = useIsSelfService();
  const { authenticated, user, role } = useShallowEqualSelector((state) => {
    const { authenticated, user, role } = state.auth;
    return { authenticated, user, role };
  });

  const { isFeatureEnabled, preparingFeatures, setEnabledFeatures } = useFeatureEnabled();

  /**
   * @deprecated Message search funtionality is deprecated.
   */
  const availablePermissions: PermissionKey[] = role.permissions.filter((permission) => {
    if (permission.includes('application.messageSearch') && !isFeatureEnabled('message_search')) {
      return false;
    }
    return true;
  });

  // used to compare arrays in useMemo dependencies
  const availablePermissionsStringified = availablePermissions.join(',');

  const isPermitted = useMemo(() => isPermittedFactory(availablePermissionsStringified.split(',') as PermissionKey[]), [
    availablePermissionsStringified,
  ]);

  const isAccessiblePage = useMemo(
    () => isAccessiblePageFactory(availablePermissionsStringified.split(',') as PermissionKey[]),
    [availablePermissionsStringified],
  );

  return (
    <AuthorizationContext.Provider
      value={{
        authenticated,
        role,
        user,
        isPermitted,
        isAccessiblePage,
        isFeatureEnabled,
        preparingFeatures,
        setEnabledFeatures,
        isSelfService,
      }}
    >
      {children}
    </AuthorizationContext.Provider>
  );
};
