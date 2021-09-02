import { TicketFieldsActionTypes } from '@actions/types';

const initialState: TicketFieldsState = {
  isFetching: false,
  isFetchingFieldData: false,
  items: [],
  selectedCustomField: null,
  customFieldDataList: [],
  total: 0,
  keyValidation: {
    isChecking: false,
    isValid: false,
  },
  options: {
    fields: {},
    order: [],
  },
};

export const ticketFieldsReducer: Reducer<TicketFieldsState> = (state = initialState, action) => {
  switch (action.type) {
    case TicketFieldsActionTypes.FETCH_TICKET_FIELDS_REQUEST: {
      return {
        ...state,
        isFetching: true,
      };
    }
    case TicketFieldsActionTypes.FETCH_TICKET_FIELDS_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        items: action.payload.items,
        total: action.payload.total,
      };
    }
    case TicketFieldsActionTypes.FETCH_TICKET_FIELDS_FAIL: {
      return {
        ...state,
        isFetching: false,
      };
    }

    case TicketFieldsActionTypes.DELETE_TICKET_FIELD_SUCCESS: {
      const item = action.payload;
      const idx = state.items.findIndex((field) => field.id === item.id);
      if (idx === -1) {
        return state;
      }
      return {
        ...state,
        items: [...state.items.slice(0, idx), ...state.items.slice(idx + 1)],
        total: state.total - 1,
      };
    }

    case TicketFieldsActionTypes.GET_TICKET_FIELD_REQUEST:
      return { ...state, selectedCustomField: null, options: initialState.options };

    case TicketFieldsActionTypes.GET_TICKET_FIELD_SUCCESS: {
      const selectedCustomField: CustomField = action.payload;
      if (selectedCustomField.fieldType === 'DROPDOWN') {
        const { options } = selectedCustomField;
        const dropdownField: CustomFieldDropdownValue = {
          fields: {},
          order: [],
        };
        options &&
          options.forEach((value, index) => {
            const id = `${String(new Date().getTime())}_${index}`;
            dropdownField.order.push(id);
            dropdownField.fields[id] = {
              value,
              error: {
                hasError: false,
                message: '',
              },
            };
          });
        return {
          ...state,
          selectedCustomField,
          options: dropdownField,
        };
      }

      return {
        ...state,
        selectedCustomField,
      };
    }
    case TicketFieldsActionTypes.GET_TICKET_FIELD_DATA_LIST_REQUEST: {
      return {
        ...state,
        isFetchingFieldData: true,
      };
    }
    case TicketFieldsActionTypes.GET_TICKET_FIELD_DATA_LIST_SUCCESS: {
      return {
        ...state,
        isFetchingFieldData: false,
        customFieldDataList: [...action.payload.results],
      };
    }
    case TicketFieldsActionTypes.GET_TICKET_FIELD_DATA_LIST_FAIL: {
      return {
        ...state,
        isFetchingFieldData: false,
      };
    }
    case TicketFieldsActionTypes.ADD_TICKET_FIELD_DATA_SUCCESS: {
      return {
        ...state,
        customFieldDataList: [...state.customFieldDataList, action.payload],
      };
    }
    case TicketFieldsActionTypes.UPDATE_TICKET_FIELD_DATA_SUCCESS:
      return {
        ...state,
        customFieldDataList: state.customFieldDataList.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        ),
      };
    case TicketFieldsActionTypes.CHECK_TICKET_FIELD_KEY_VALIDATION_REQUEST: {
      return {
        ...state,
        keyValidation: {
          ...state.keyValidation,
          isChecking: true,
        },
      };
    }
    case TicketFieldsActionTypes.CHECK_TICKET_FIELD_KEY_VALIDATION_SUCCESS: {
      return {
        ...state,
        keyValidation: {
          isChecking: false,
          isValid: action.payload.result,
          detail: action.payload.detail,
        },
      };
    }
    case TicketFieldsActionTypes.CHECK_TICKET_FIELD_KEY_VALIDATION_FAIL: {
      return {
        ...state,
        keyValidation: {
          ...state.keyValidation,
          isChecking: false,
          isValid: false,
        },
      };
    }
    case TicketFieldsActionTypes.SET_CHECKING_STATUS_TICKET_FIELD_KEY_VALIDATION: {
      return {
        ...state,
        keyValidation: {
          ...state.keyValidation,
          isChecking: action.payload,
        },
      };
    }
    default:
      return state;
  }
};
