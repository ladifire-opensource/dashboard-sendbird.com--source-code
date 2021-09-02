import { CustomerFieldsActionTypes } from '@actions/types';

const initialState: CustomerFieldsState = {
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

export const customerFieldsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CustomerFieldsActionTypes.CREATE_CUSTOMER_FIELD_REQUEST: {
      return {
        ...state,
        isFetching: true,
      };
    }
    case CustomerFieldsActionTypes.CREATE_CUSTOMER_FIELD_SUCCESS: {
      return {
        ...state,
        total: state.total + 1,
        isFetching: false,
      };
    }
    case CustomerFieldsActionTypes.CREATE_CUSTOMER_FIELD_FAIL: {
      return {
        ...state,
        isFetching: false,
      };
    }

    case CustomerFieldsActionTypes.FETCH_CUSTOMER_FIELDS_REQUEST: {
      return {
        ...state,
        isFetching: true,
      };
    }
    case CustomerFieldsActionTypes.FETCH_CUSTOMER_FIELDS_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        items: action.payload.items,
        total: action.payload.total,
      };
    }
    case CustomerFieldsActionTypes.FETCH_CUSTOMER_FIELDS_FAIL: {
      return {
        ...state,
        isFetching: false,
      };
    }

    case CustomerFieldsActionTypes.DELETE_CUSTOMER_FIELD_REQUEST: {
      return {
        ...state,
        isFetching: true,
      };
    }
    case CustomerFieldsActionTypes.DELETE_CUSTOMER_FIELD_SUCCESS: {
      const item = action.payload;
      const idx = state.items.findIndex((field) => field.id === item.id);
      if (idx === -1) {
        return state;
      }
      return {
        ...state,
        items: [...state.items.slice(0, idx), ...state.items.slice(idx + 1)],
        total: state.total - 1,
        isFetching: false,
      };
    }
    case CustomerFieldsActionTypes.DELETE_CUSTOMER_FIELD_FAIL: {
      return {
        ...state,
        isFetching: false,
      };
    }

    case CustomerFieldsActionTypes.GET_CUSTOMER_FIELD_REQUEST: {
      return {
        ...state,
        isFetching: true,
      };
    }
    case CustomerFieldsActionTypes.GET_CUSTOMER_FIELD_SUCCESS: {
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
          isFetching: false,
          selectedCustomField: action.payload,
          options: dropdownField,
        };
      }

      return {
        ...state,
        isFetching: false,
        selectedCustomField: action.payload,
      };
    }
    case CustomerFieldsActionTypes.GET_CUSTOMER_FIELD_FAIL: {
      return {
        ...state,
        isFetching: false,
      };
    }

    case CustomerFieldsActionTypes.GET_CUSTOMER_FIELD_DATA_LIST_REQUEST: {
      return {
        ...state,
        isFetchingFieldData: true,
      };
    }
    case CustomerFieldsActionTypes.GET_CUSTOMER_FIELD_DATA_LIST_SUCCESS: {
      return {
        ...state,
        isFetchingFieldData: false,
        customFieldDataList: [...action.payload.results],
      };
    }
    case CustomerFieldsActionTypes.GET_CUSTOMER_FIELD_DATA_LIST_FAIL: {
      return {
        ...state,
        isFetchingFieldData: false,
      };
    }
    case CustomerFieldsActionTypes.ADD_CUSTOMER_FIELD_DATA_SUCCESS: {
      return {
        ...state,
        customFieldDataList: [...state.customFieldDataList, action.payload],
      };
    }
    case CustomerFieldsActionTypes.UPDATE_CUSTOMER_FIELD_DATA_SUCCESS: {
      const idx = state.customFieldDataList.findIndex((customFieldData) => customFieldData.id === action.payload.id);
      if (idx === -1) {
        return {
          ...state,
        };
      }
      return {
        ...state,
        customFieldDataList: [
          ...state.customFieldDataList.slice(0, idx),
          action.payload,
          ...state.customFieldDataList.slice(idx + 1),
        ],
      };
    }
    case CustomerFieldsActionTypes.CHECK_CUSTOMER_FIELD_KEY_VALIDATION_REQUEST: {
      return {
        ...state,
        keyValidation: {
          ...state.keyValidation,
          isChecking: true,
        },
      };
    }
    case CustomerFieldsActionTypes.CHECK_CUSTOMER_FIELD_KEY_VALIDATION_SUCCESS: {
      return {
        ...state,
        keyValidation: {
          isChecking: false,
          isValid: action.payload.result,
          detail: action.payload.detail,
        },
      };
    }
    case CustomerFieldsActionTypes.CHECK_CUSTOMER_FIELD_KEY_VALIDATION_FAIL: {
      return {
        ...state,
        keyValidation: {
          ...state.keyValidation,
          isChecking: false,
          isValid: false,
        },
      };
    }

    case CustomerFieldsActionTypes.SET_CHECKING_STATUS_CUSTOMER_FIELD_KEY_VALIDATION: {
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
