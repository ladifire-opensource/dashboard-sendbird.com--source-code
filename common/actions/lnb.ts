import { createAction } from '@actions/createAction';
import { LNBActionCreator } from '@interfaces/common/actions/lnb';

import { LNBActionTypes } from './types';

export const LNBActions: LNBActionCreator = {
  setLNBMenuItems: (payload) => createAction(LNBActionTypes.SET_LNB_MENU_ITEMS, payload),
  setActiveLNBMenuItem: (payload) => createAction(LNBActionTypes.SET_ACTIVE_LNB_MENU_ITEM, payload),
  updateLNBMenuItem: (payload) => createAction(LNBActionTypes.UPDATE_LNB_MENU_ITEM, payload),
};
