import { createAction, ActionCreatorWithPayload, ActionCreator } from '@actions/createAction';
import { BillingActionTypes } from '@actions/types';

type BillingActionCreators = {
  fetchCardInfoRequest: ActionCreatorWithPayload<
    BillingActionTypes.FETCH_CARD_INFO_REQUEST,
    { organization_uid: string }
  >;
  fetchCardInfoSuccess: ActionCreatorWithPayload<
    BillingActionTypes.FETCH_CARD_INFO_SUCCESS,
    NonNullable<BillingState['cardInfo']>
  >;
  fetchCardInfoCancel: ActionCreator<BillingActionTypes.FETCH_CARD_INFO_CANCEL>;
  fetchCardInfoFail: ActionCreatorWithPayload<BillingActionTypes.FETCH_CARD_INFO_FAIL, any>;

  saveBillingContactsRequest: ActionCreatorWithPayload<
    BillingActionTypes.SAVE_BILLING_CONTACTS_REQUEST,
    { organization_uid: string; emails: string[] }
  >;
  saveBillingContactsSuccess: ActionCreator<BillingActionTypes.SAVE_BILLING_CONTACTS_SUCCESS>;
  saveBillingContactsCancel: ActionCreator<BillingActionTypes.SAVE_BILLING_CONTACTS_CANCEL>;
  saveBillingContactsFail: ActionCreatorWithPayload<BillingActionTypes.SAVE_BILLING_CONTACTS_FAIL, any>;
};

export const BillingActions: BillingActionCreators = {
  fetchCardInfoRequest: (payload) => createAction(BillingActionTypes.FETCH_CARD_INFO_REQUEST, payload),
  fetchCardInfoSuccess: (payload) => createAction(BillingActionTypes.FETCH_CARD_INFO_SUCCESS, payload),
  fetchCardInfoCancel: () => createAction(BillingActionTypes.FETCH_CARD_INFO_CANCEL),
  fetchCardInfoFail: (payload) => createAction(BillingActionTypes.FETCH_CARD_INFO_FAIL, payload),

  saveBillingContactsRequest: (payload: { organization_uid: string; emails: string[] }) =>
    createAction(BillingActionTypes.SAVE_BILLING_CONTACTS_REQUEST, payload),
  saveBillingContactsSuccess: () => createAction(BillingActionTypes.SAVE_BILLING_CONTACTS_SUCCESS),
  saveBillingContactsCancel: () => createAction(BillingActionTypes.SAVE_BILLING_CONTACTS_CANCEL),
  saveBillingContactsFail: (payload) => createAction(BillingActionTypes.SAVE_BILLING_CONTACTS_FAIL, payload),
};
