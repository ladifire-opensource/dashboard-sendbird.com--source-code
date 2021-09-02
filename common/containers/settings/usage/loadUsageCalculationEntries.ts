import { Component } from 'react';

import { importAll } from '@utils';

type UsageCalculationEntry = Record<FeatureUsageField, { key?: string; component: Component; communityUrl: string }>;

type MarkdownModule = { default: Component; frontMatter: { communityUrl: string } };

export const loadUsageCalculationEntries = (): UsageCalculationEntry => {
  return Object.entries(importAll<MarkdownModule>(require.context('./entries', false, /\.md$/))).reduce(
    (acc, [key, module]) => {
      const {
        default: component,
        frontMatter: { communityUrl },
      } = module;
      acc[key.replace('.md', '')] = { key, component, communityUrl };
      return acc;
    },
    {} as UsageCalculationEntry,
  );
};
