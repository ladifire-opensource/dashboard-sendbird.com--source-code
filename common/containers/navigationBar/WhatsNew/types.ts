import { Component, ReactNode } from 'react';

import { Moment } from 'moment-timezone';

export enum WhatsNewCategory {
  NewFeatures = 'NEW FEATURES',
  Updates = 'UPDATES',
}

export interface WhatsNewEntry {
  key?: string;
  category: string;
  title: string;
  text?: ReactNode;
  component?: Component;
  date: Moment;
}
