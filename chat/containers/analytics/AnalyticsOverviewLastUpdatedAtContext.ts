import { createContext } from 'react';

export const AnalyticsOverviewLastUpdatedAtContext = createContext<(value: number | null) => void>(() => {});
