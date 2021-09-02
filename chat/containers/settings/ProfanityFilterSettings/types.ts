export type FormValues = {
  keywords: string;
  // FIXME: The implementation of array-type field seems invalid. https://github.com/react-hook-form/react-hook-form/blob/master/examples/V6/FieldArray.tsx
  regexFilters: string[];
  type: ChannelSettings['profanity_filter']['type'];
  customChannelType: string;
};

export enum FileReaderStatus {
  Empty = 'empty',
  Loading = 'loading',
  Done = 'done',
}
