import { createSelector } from 'reselect';

export const selectApplication_DEPRECATED = createSelector(
  (state: RootState) => state.applicationState.data,
  (applicationOrNull) => {
    return applicationOrNull || ({} as Application);
  },
);
