import { AuthenticationActionTypes, BillingActionTypes } from '@actions/types';

const initialState: BillingState = {
  fetchingCardInfo: false,
  cardInfo: null,
  isSavingBillingContacts: false,
};

export const billingReducer: Reducer<BillingState> = (state = initialState, action) => {
  switch (action.type) {
    case BillingActionTypes.FETCH_CARD_INFO_REQUEST:
      return {
        ...state,
        fetchingCardInfo: true,
      };
    case BillingActionTypes.FETCH_CARD_INFO_SUCCESS:
      return {
        ...state,
        cardInfo: action.payload,
        fetchingCardInfo: false,
      };
    case BillingActionTypes.SAVE_BILLING_CONTACTS_REQUEST:
      return {
        ...state,
        isSavingBillingContacts: true,
      };
    case BillingActionTypes.SAVE_BILLING_CONTACTS_SUCCESS:
      return {
        ...state,
        isSavingBillingContacts: false,
        lastSavedAt: new Date(),
      };
    case BillingActionTypes.SAVE_BILLING_CONTACTS_FAIL:
    case BillingActionTypes.SAVE_BILLING_CONTACTS_CANCEL:
      return {
        ...state,
        isSavingBillingContacts: false,
      };
    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
