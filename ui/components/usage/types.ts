import { ReactNode } from 'react';

export type UsageVariant = 'default' | 'medium' | 'compact' | 'mini' | 'percent';

export enum Availability {
  available = 'available',
  warning = 'warning',
  over = 'over',
  willStop = 'willStop',
  stopped = 'stopped',
}

export type AvailabilityColor = 'green' | 'purple' | 'yellow' | 'orange' | 'red';

export type UsageNumbers = {
  usage: number;
  quota: number;
  others?: number;
  limit?: number;
};

export type AvailabilityTooltips = Partial<{
  warning: ReactNode;
  over: ReactNode;
  willStop: ReactNode;
  stopped: ReactNode;
}>;
