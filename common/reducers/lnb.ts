import { LeftNavigationBarItemInterface } from 'feather';

import { LNBActionTypes } from '@actions/types';
import { LNBActionCreator } from '@interfaces/common/actions/lnb';

const initialState: LNBState = {
  menuItems: [],
  activeItemKey: undefined,
};
export type Actions = ReturnType<LNBActionCreator[keyof LNBActionCreator]>;

export const lnbReducer: Reducer<LNBState, Actions> = (state = initialState, action) => {
  switch (action.type) {
    case LNBActionTypes.SET_LNB_MENU_ITEMS:
      return { ...state, menuItems: action.payload.items };
    case LNBActionTypes.SET_ACTIVE_LNB_MENU_ITEM:
      return { ...state, activeItemKey: action.payload.activeItemKey };
    case LNBActionTypes.UPDATE_LNB_MENU_ITEM: {
      const menuItems = state.menuItems.map((item: LeftNavigationBarItemInterface) =>
        item.key === action.payload.key
          ? { ...item, ...action.payload.option }
          : {
              ...item,
              subMenus: item.subMenus?.map((subMenu) =>
                subMenu.key === action.payload.key ? { ...subMenu, ...action.payload.option } : subMenu,
              ),
            },
      );
      return { ...state, menuItems };
    }
    default:
      return state;
  }
};
