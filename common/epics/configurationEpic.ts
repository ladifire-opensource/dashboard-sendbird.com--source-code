import { ofType } from 'redux-observable';
import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { commonActions } from '@actions';

export const locationChangeEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType('@@router/LOCATION_CHANGE'),
    mergeMap(({ payload }) => {
      if (window.ga) {
        // Log page view
        window.ga('set', 'page', window.location.pathname);
        window.ga('send', 'pageview', window.location.pathname);

        window.ga('sendbirdShared.set', 'page', window.location.pathname);
        window.ga('sendbirdShared.send', 'pageview');
      }

      if (payload?.action === 'POP') {
        return from([commonActions.hideDialogsRequest()]);
      }
      return from([]);
    }),
  );
};
