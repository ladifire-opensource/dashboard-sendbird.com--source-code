import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { IconButton, FeatherProvider, toast } from 'feather';
import 'intersection-observer';
import Cookies from 'universal-cookie';

import { AuthorizationContextProvider } from '@authorization';
import { FeatureFlagContextProvider } from '@utils/featureFlags';

import { ConnectedIntlProvider } from './intl';
import RootConnected from './root';
import { initializeStore } from './store';

window.dashboardSB = null as any;
window.cookies = new Cookies();

IconButton.setTooltipPortalId('portal_popup');
toast.rootElementID = 'portal_toast';

ReactDOM.render(
  <FeatherProvider>
    <Provider store={initializeStore}>
      <FeatureFlagContextProvider>
        <AuthorizationContextProvider>
          <ConnectedIntlProvider>
            <RootConnected />
          </ConnectedIntlProvider>
        </AuthorizationContextProvider>
      </FeatureFlagContextProvider>
    </Provider>
  </FeatherProvider>,
  document.getElementById('root'),
);
