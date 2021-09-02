import { Component } from 'react';

import moment from 'moment';

import { importAll } from '@utils';

import { LegacyJSXContents } from './entries/LegacyJSXContents';
import { WhatsNewCategory, WhatsNewEntry } from './types';

type MarkdownModule = { default: Component; frontMatter: { category: WhatsNewCategory; date: Date; title: string } };

export const loadMarkdownEntries = (): WhatsNewEntry[] => {
  return Object.entries(importAll<MarkdownModule>(require.context('./entries', false, /\.md$/))).map(
    ([key, module]) => {
      const { default: component, frontMatter } = module;
      const { title, date, category } = frontMatter;
      return { key, component, title, date: moment(date), category };
    },
  );
};

const legacyEntries = LegacyJSXContents.map((item) => ({ ...item, date: moment(item.date) }));

// sort newest to oldest
const entries = [...loadMarkdownEntries(), ...legacyEntries].sort((a, b) => moment(b.date).diff(a.date));

/**
 * This function should be a platform-agnostic getter of What's New entries sorted newest to oldest.
 */
export const loadEntries = (): WhatsNewEntry[] => {
  return entries;
};
