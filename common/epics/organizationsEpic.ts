import { ofType } from 'redux-observable';
import { of, from, forkJoin } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom } from 'rxjs/operators';

import { commonActions } from '@actions';
import { OrganizationsActionTypes } from '@actions/types';
import { commonApi } from '@api';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { generateBadRequest, getErrorMessage } from '@epics/generateBadRequest';
import { logException } from '@utils/logException';

export const updateOrganizationEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(OrganizationsActionTypes.UPDATE_ORGANIZATION_REQUEST),
    mergeMap((action) => {
      const request = commonApi.updateOrganization(action.payload.organization_uid, action.payload.payload);
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          return from([commonActions.updateOrganizationSuccess(response)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), commonActions.updateOrganizationFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.updateOrganizationFail(error));
    }),
  );
};

export const updateOrganizationNameEpic: SBEpicWithState<UpdateOrganizationNameAction> = (action$, state$) => {
  return action$.pipe(
    ofType(OrganizationsActionTypes.UPDATE_ORGANIZATION_NAME_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { name, onSuccess } = action.payload;
      const request = commonApi.updateOrganization(state.organizations.current.uid, { name });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((organization) => {
          onSuccess();
          return from([
            commonActions.updateOrganizationSuccess(organization),
            commonActions.updateOrganizationNameSuccess(),
          ]);
        }),
        catchError((error) => of(commonActions.updateOrganizationNameFail(getErrorMessage(error)))),
      );
    }),
    catchError((error) => {
      logException(error);
      return of(commonActions.updateOrganizationNameFail(getErrorMessage(error)));
    }),
  );
};

export const updateOrganizationSlugNameEpic: SBEpicWithState<UpdateSamlConfigurationAndSlugNameAction> = (
  action$,
  state$,
) => {
  return action$.pipe(
    ofType(OrganizationsActionTypes.UPDATE_SAML_CONFIGURATION_AND_SLUG_NAME_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { slug_name, ...samlConfigurationPayload } = action.payload;
      const request = commonApi.updateOrganization(state.organizations.current.uid, {
        slug_name,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((organization) => {
          return from([
            commonActions.updateOrganizationSlugNameSuccess(organization),
            commonActions.updateSamlConfigurationRequest(samlConfigurationPayload),
          ]);
        }),
        catchError((error) => {
          if (error.data && error.data.detail) {
            return of(commonActions.updateOrganizationSlugNameFail(error.data.detail));
          }
          return of(commonActions.updateOrganizationSlugNameFail(getErrorMessage(error)));
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.updateOrganizationSlugNameFail(getErrorMessage(error)));
    }),
  );
};

// members
export const updateOrganizationMemberRoleEpic: SBEpicWithState<UpdateOrganizationMemberRoleAction> = (
  action$,
  state$,
) => {
  return action$.pipe(
    ofType(OrganizationsActionTypes.UPDATE_ORGANIZATION_MEMBER_ROLE_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action]) => {
      const request = commonApi.updateOrganizationMemberRole({
        uid: action.payload.uid,
        email: action.payload.email,
        role: action.payload.role,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response: Member) => {
          action.payload.onSuccess?.();
          return from([commonActions.updateOrganizationMemberRoleSuccess(response)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), commonActions.updateOrganizationMemberRoleFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.updateOrganizationMemberRoleFail(error));
    }),
  );
};

export const deleteOrganizationMembersEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(OrganizationsActionTypes.DELETE_ORGANIZATION_MEMBERS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action]) => {
      const { members } = action.payload;
      const promiseArray = members.map((member) => {
        return from(commonApi.deleteOrganizationMember(action.payload.organization_uid, member));
      });
      return forkJoin(promiseArray).pipe(
        mergeMap(() => {
          const deletedMemberEmails = members.map((member) => {
            return member.user.email;
          });

          if (action.payload.onDelete) {
            action.payload.onDelete();
          }
          return from([
            commonActions.deleteOrganizationMembersSuccess(deletedMemberEmails),
            commonActions.addNotificationsRequest({
              status: 'success',
              message: 'Members has been deleted.',
            }),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), commonActions.deleteOrganizationMembersFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.deleteOrganizationMembersFail(error));
    }),
  );
};

export const exportMembersList: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(OrganizationsActionTypes.EXPORT_MEMBERS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      return from(commonApi.exportOrganizationMembersList(state.organizations.current.uid)).pipe(
        map((response) => response.data),
        mergeMap((fileData) =>
          from([
            commonActions.exportOrganizationMembersSuccess(),
            commonActions.fileSaveRequest({
              data: fileData,
              filename: 'organization_member_list.csv',
            }),
          ]),
        ),
      );
    }),
  );
};

export const inviteMemberEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(OrganizationsActionTypes.INVITE_MEMBER_REQUEST),
    mergeMap((action) => {
      const request = commonApi.inviteMember({
        email: action.payload.email,
        role: action.payload.role,
        organization_uid: action.payload.uid,
        options: action.payload.options,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap(() => {
          action.payload.onSuccess?.();
          return from([
            commonActions.addNotificationsRequest({
              status: 'success',
              message: 'Invitation has been successfully sent.',
            }),
            commonActions.hideDialogsRequest(),
          ]);
        }),
        catchError((error) => {
          if (error.data && error.data.code === 'gate400101') {
            return from([
              commonActions.hideDialogsRequest(),
              commonActions.inviteMemberFail(error),
              commonActions.showDialogsRequest({
                dialogTypes: DialogType.Confirm,
                dialogProps: {
                  confirmText: 'OK',
                  title: action.payload.options.title,
                  description: action.payload.options.description,
                  hideCancel: true,
                },
              }),
            ]);
          }
          return from([generateBadRequest(error), commonActions.inviteMemberFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.inviteMemberFail(error));
    }),
  );
};

export const updateSamlConfigurationEpic: SBEpicWithState<UpdateSamlConfigurationAction> = (action$, state$) => {
  return action$.pipe(
    ofType(OrganizationsActionTypes.UPDATE_SAML_CONFIGURATION_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { uid: organization_uid } = state.organizations.current;
      const request = commonApi.updateSamlConfiguration(organization_uid, action.payload);
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          return from([
            commonActions.updateSamlConfigurationSuccess(response),
            commonActions.showDialogsRequest({
              dialogTypes: DialogType.SamlOneMoreStepToGo,
              dialogProps: {
                organizationKey: state.organizations.current.slug_name,
              },
            }),
          ]);
        }),
        catchError(() => {
          return of(
            commonActions.updateSamlConfigurationFail(
              window.intl.formatMessage({ id: 'common.authentication.sso.error.samlConfigurationFail' }),
            ),
          );
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.updateSamlConfigurationFail(getErrorMessage(error)));
    }),
  );
};

export const deleteSamlConfigurationEpic: SBEpicWithState<DeleteSamlConfigurationAction> = (action$, state$) => {
  return action$.pipe(
    ofType(OrganizationsActionTypes.DELETE_SAML_CONFIGURATION_REQUEST),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const { uid: organization_uid } = state.organizations.current;
      const request = commonApi.deleteSamlConfiguration(organization_uid);
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          return from([
            commonActions.updateSamlConfigurationSuccess(response),
            commonActions.hideDialogsRequest(),
            commonActions.addNotificationsRequest({
              status: 'success',
              message: window.intl.formatMessage({ id: 'alerts.samlConfigurationDeleted' }),
            }),
          ]);
        }),
        catchError((error) => {
          return of(generateBadRequest(error));
        }),
      );
    }),
    catchError((error) => {
      return of(generateBadRequest(error));
    }),
  );
};

export const transferOwnerEpic: SBEpic<TransferOwnerAction> = (action$) => {
  return action$.pipe(
    ofType(OrganizationsActionTypes.TRANSFER_OWNER_REQUEST),
    mergeMap((action) => {
      const request = commonApi.transferOwner({
        organization_uid: action.payload.organization_uid,
        email: action.payload.email,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap(() => {
          action.payload.onSuccess?.();
          return from([
            commonActions.hideDialogsRequest(),
            commonActions.addNotificationsRequest({
              status: 'success',
              message: 'Transfering Owner is completed. You should sign in again.',
            }),
            commonActions.pushHistory('/auth/signout'),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), commonActions.transferOwnerFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.transferOwnerFail(error));
    }),
  );
};
