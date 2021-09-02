import moment from 'moment-timezone';

import { Actions } from '@actions';
import { AuthenticationActionTypes, DeskActionTypes } from '@actions/types';

const initialState: StatsState = {
  activeTab: 0,
  statistics: {
    isFetching: false,
    data: undefined,
  },
  agentStatistics: {
    isFetching: false,
    data: [],
    detailAgentId: undefined,
    detail: {
      dailyStatusDate: moment(),
      connectionLogsTime: {
        isFetching: false,
        error: null,
        data: undefined,
      },
      ticketsClosed: {
        isFetching: false,
        error: null,
        data: undefined,
      },
      assignments: {
        isFetching: false,
        error: null,
        data: undefined,
      },
      firstResponseTime: {
        isFetching: false,
        error: null,
        data: undefined,
      },
      dailyStatus: {
        isFetching: false,
        error: null,
        data: undefined,
      },
      CSAT: {
        isFetching: false,
        error: null,
        data: undefined,
      },
      hourlyClosedTickets: {
        isFetching: false,
        error: null,
        data: undefined,
      },
    },
  },
};

export const statsReducer = (state: StatsState = initialState, action: Actions): StatsState => {
  switch (action.type) {
    case DeskActionTypes.INITIALIZE_DATE_FILTERS:
      return {
        ...state,
        statistics: {
          ...state.statistics,
        },
        agentStatistics: {
          ...state.agentStatistics,
          detail: {
            ...state.agentStatistics.detail,
            dailyStatusDate: moment(),
          },
        },
      };

    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
