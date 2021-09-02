import { accountReducer } from './account';
import { alertReducer } from './alert';
import { applicationUpdateReducer } from './applicationUpdate';
import { authReducer } from './auth';
import { billingReducer } from './billing';
import { configurationReducer } from './configuration';
import { dialogsReducer } from './dialogs';
import { imagePreviewReducer } from './imagePreview';
import { intlReducer } from './intl';
import { lnbReducer } from './lnb';
import { organizationsReducer } from './organizations';
import { sendbirdReducer } from './sendbird';

export const commonReducers = {
  auth: authReducer,
  alert: alertReducer,
  applicationUpdate: applicationUpdateReducer,
  dialogs: dialogsReducer,
  imagePreview: imagePreviewReducer,
  account: accountReducer,
  organizations: organizationsReducer,
  billing: billingReducer,
  configuration: configurationReducer,
  sendbird: sendbirdReducer,
  intl: intlReducer,
  lnb: lnbReducer,
};
