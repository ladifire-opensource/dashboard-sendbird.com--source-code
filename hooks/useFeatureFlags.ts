import { useContext } from 'react';

import { FeatureFlagContext } from '@utils/featureFlags';

export const useFeatureFlags = () => useContext(FeatureFlagContext);
