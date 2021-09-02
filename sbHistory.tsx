import { createBrowserHistory } from 'history';
import qs from 'qs';

import { checkUnsavedConfirm } from '@ui/components/dialog';

const history = createBrowserHistory({
  getUserConfirmation: checkUnsavedConfirm,
});

// helper to add parsed query-property to history.location
function addLocationQuery(historyObject) {
  historyObject.location.query = qs.parse(historyObject.location.search, { ignoreQueryPrefix: true });
}

addLocationQuery(history);

history.listen(() => addLocationQuery(history));

export { history };
