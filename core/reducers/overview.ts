import moment from 'moment-timezone';

import { AuthenticationActionTypes, OverviewActionTypes, ApplicationActionTypes } from '@actions/types';

const initialState = {
  statistics: {
    dau: [],
    mau: [],
    messages: {},
    connections: [],
    hourlyCCU: {},
    monthlyConnection: [],
  },
  selectedHourlyDate: moment().format('YYYY-MM-DD'),
};

export const overviewReducer = (state: OverviewState = initialState, action) => {
  switch (action.type) {
    case OverviewActionTypes.FETCH_MAU_SUCCESS:
      return {
        ...state,
        statistics: { ...state.statistics, mau: action.payload },
      };
    case OverviewActionTypes.FETCH_DAU_SUCCESS:
      return {
        ...state,
        statistics: { ...state.statistics, dau: action.payload },
      };
    case OverviewActionTypes.FETCH_MESSAGES_COUNT_SUCCESS:
      return {
        ...state,
        statistics: { ...state.statistics, messages: action.payload },
      };
    case OverviewActionTypes.FETCH_DAILY_CCU_SUCCESS:
      return {
        ...state,
        statistics: { ...state.statistics, connections: action.payload },
      };
    case OverviewActionTypes.FETCH_MONTHLY_CCU_SUCCESS:
      return {
        ...state,
        statistics: { ...state.statistics, monthlyConnection: action.payload },
      };
    case OverviewActionTypes.FETCH_HOURLY_CCU_SUCCESS:
      return {
        ...state,
        statistics: { ...state.statistics, hourlyCCU: action.payload.statistics },
        selectedHourlyDate: action.payload.date,
      };
    case ApplicationActionTypes.RESET_APPLICATION_SUCCESS:
    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
