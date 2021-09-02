import { createSelector } from 'reselect';

import { Actions } from '@actions';
import { AuthenticationActionTypes, OrganizationsActionTypes, ApplicationActionTypes } from '@actions/types';

const initialState: OrganizationsState = {
  isFetching: false,
  updateOrganizationName: {
    isFetching: false,
    error: null,
  },
  updateOrganizationSlugName: {
    isFetching: false,
    error: null,
  },
  samlConfigurationForm: {
    isFetching: false,
    isSaving: false,
    error: null,
  },
  current: {} as Organization,
};

export const currentOrganizationSelector = createSelector(
  (state: ReadonlyArray<Organization>) => state,
  (organizations) => {
    return organizations.length > 0 ? organizations[0] : ({} as Organization);
  },
);

export const organizationsReducer = (
  state: OrganizationsState = initialState,
  action: Actions, // OrganizationsActions | AuthenticationActions,
): OrganizationsState => {
  let newOrg: Organization = {} as Organization;
  switch (action.type) {
    case AuthenticationActionTypes.AUTHENTICATED:
      return {
        ...state,
        current: currentOrganizationSelector(action.payload.organizations),
      };
    case OrganizationsActionTypes.DELETE_ORGANIZATION_MEMBERS_SUCCESS:
      newOrg = {
        ...state.current,
        members: state.current.members.filter((member) => !action.payload.includes(member.email)),
      };
      return {
        ...state,
        current: newOrg,
      };
    case OrganizationsActionTypes.CREATE_ORGANIZATION_SUCCESS:
      return {
        ...state,
        current: currentOrganizationSelector(action.payload.organizations),
        isFetching: false,
      };
    case OrganizationsActionTypes.UPDATE_ORGANIZATION_SUCCESS:
      return {
        ...state,
        isFetching: false,
        current: {
          ...state.current,
          ...action.payload,
        },
      };
    case OrganizationsActionTypes.UPDATE_ORGANIZATION_NAME_REQUEST:
      return {
        ...state,
        updateOrganizationName: {
          isFetching: true,
          error: null,
        },
      };
    case OrganizationsActionTypes.UPDATE_ORGANIZATION_NAME_SUCCESS:
      return {
        ...state,
        updateOrganizationName: {
          isFetching: false,
          error: null,
        },
      };
    case OrganizationsActionTypes.UPDATE_ORGANIZATION_NAME_FAIL:
      return {
        ...state,
        updateOrganizationName: {
          isFetching: false,
          error: action.payload,
        },
      };
    case OrganizationsActionTypes.UPDATE_SAML_CONFIGURATION_AND_SLUG_NAME_REQUEST:
      return {
        ...state,
        updateOrganizationSlugName: {
          ...state.updateOrganizationSlugName,
          isFetching: true,
        },
      };
    case OrganizationsActionTypes.UPDATE_ORGANIZATION_SLUG_NAME_SUCCESS: {
      return {
        ...state,
        current: action.payload,
        updateOrganizationSlugName: {
          isFetching: false,
          error: null,
          timestamp: Date.now(),
        },
      };
    }
    case OrganizationsActionTypes.UPDATE_ORGANIZATION_SLUG_NAME_FAIL:
      return {
        ...state,
        updateOrganizationSlugName: {
          isFetching: false,
          error: action.payload,
        },
      };
    case OrganizationsActionTypes.UPDATE_ORGANIZATION_SLUG_NAME_RESET:
      return {
        ...state,
        updateOrganizationSlugName: {
          ...state.updateOrganizationSlugName,
          isFetching: false,
          error: null,
        },
      };
    case OrganizationsActionTypes.UPDATE_SAML_CONFIGURATION_REQUEST:
      return {
        ...state,
        samlConfigurationForm: {
          ...state.samlConfigurationForm,
          isFetching: false,
          isSaving: true,
        },
      };
    case OrganizationsActionTypes.UPDATE_SAML_CONFIGURATION_SUCCESS: {
      const {
        sso_entity_id,
        sso_idp_url,
        sso_idp_cert,
        sso_enforcing,
        sso_jit_provisioning,
        sso_default_role,
      } = action.payload;
      return {
        ...state,
        current: {
          ...state.current,
          sso_entity_id,
          sso_idp_url,
          sso_idp_cert,
          sso_enforcing,
          sso_jit_provisioning,
          sso_default_role,
        },
        samlConfigurationForm: {
          isFetching: false,
          isSaving: false,
          error: null,
          lastUpdatedTimestamp: Date.now(),
        },
      };
    }
    case OrganizationsActionTypes.UPDATE_SAML_CONFIGURATION_FAIL:
      return {
        ...state,
        samlConfigurationForm: {
          isFetching: false,
          isSaving: false,
          error: action.payload,
        },
      };
    case OrganizationsActionTypes.UPDATE_SAML_CONFIGURATION_RESET:
      return {
        ...state,
        samlConfigurationForm: initialState.samlConfigurationForm,
      };
    case ApplicationActionTypes.REGISTER_CALLS_APPLICATION:
      return {
        ...state,
        current: { ...state.current, is_calls_enabled: true },
      };
    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
