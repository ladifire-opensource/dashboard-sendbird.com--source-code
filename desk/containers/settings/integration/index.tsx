import React, { useEffect, useCallback, useContext } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route, RouteComponentProps, Redirect, useHistory } from 'react-router-dom';

import { commonActions, deskActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { IntegrationContext } from '@desk/contexts/integrationContext';
import { isAllowedToUseIframe } from '@desk/utils/iframeUtils';
import { isAllowedToUseSocial, isAllowedToUseInstagram, isAllowedToUseWhatsApp } from '@desk/utils/socialUtils';
import { generateBadRequest } from '@epics';

import { IntegrationWhatsApp } from './IntegrationWhatsApp';
import { IntegrationFacebook } from './facebook';
import { IntegrationFacebookEdit } from './facebookEdit';
import { IntegrationIframe } from './iframeApp';
import { IntegrationInstagram } from './instagram';
import { IntegrationInstagramEdit } from './instagramEdit';
import { IntegrationOverview } from './overview';
import { IntegrationTwitter } from './twitter';
import { IntegrationTwitterEdit } from './twitterEdit';

const SENDBIRD_PRODUCTION_FACEBOOK_APP_ID = '2164147677164087';
const SENDBIRD_STAGING_FACEBOOK_APP_ID = '259626784684057';

type Props = RouteComponentProps;

export const Integration = ({ match }: Props) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useDispatch();
  const uid = useSelector((state: RootState) => state.organizations.current.uid);

  const {
    twitterReducer: {
      actions: { authenticateTwitter },
    },
    instagramReducer: {
      actions: { addInstagramAccountsRequest },
    },
  } = useContext(IntegrationContext);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).fbAsyncInit = function () {
        FB.init({
          appId: SENDBIRD_STAGING_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v4.0',
        });
      };
    } else {
      (window as any).fbAsyncInit = function () {
        FB.init({
          appId: SENDBIRD_PRODUCTION_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v4.0',
        });
      };
    }
    (function (d, s, id) {
      if (d.getElementById(id)) return;

      const fjs = d.getElementsByTagName(s)[0] as HTMLScriptElement;
      let js = fjs;

      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.async = true;
      js.defer = true;
      js.crossOrigin = 'anonymous';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode!.insertBefore(js, fjs);
      {
        /* eslint-disable */
      }
    })(document, 'script', 'facebook-jssdk');
  }, []);

  const handleAddFacebookPageClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e && e.preventDefault();
    FB.login(
      (response) => {
        if (response.status === 'connected') {
          dispatch(
            deskActions.facebookAddPagesRequest({
              accessToken: response.authResponse.accessToken,
              onSuccessNavigateTo: `${match.url}/facebook`,
            }),
          );
        }
      },
      { scope: 'email,pages_manage_metadata,pages_messaging,read_page_mailboxes,publish_pages' },
    );
  };

  const handleAddTwitterAccountClick = (
    twitterCallbackPathname: string,
  ): React.MouseEventHandler<HTMLButtonElement> => async (e) => {
    e && e.preventDefault();
    try {
      await authenticateTwitter(twitterCallbackPathname);
    } catch (error) {
      generateBadRequest(error);
    }
  };

  const handleAddInstagramClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e && e.preventDefault();
    FB.login(
      (response) => {
        if (response.status === 'connected') {
          addInstagramAccountsRequest({
            accessToken: response.authResponse.accessToken,
            onSuccessNavigateTo: `${match.url}/instagram`,
            onError: (errorCode) => {
              const { title, description, isNegativeButtonHidden, positiveButtonProps } = (() => {
                switch (errorCode) {
                  case 'desk400107':
                    return {
                      title: intl.formatMessage({ id: 'desk.settings.integration.instagram.error.link.fb.title' }),
                      description: intl.formatMessage({
                        id: 'desk.settings.integration.instagram.error.link.fb.description',
                      }),
                      isNegativeButtonHidden: false,
                      positiveButtonProps: {
                        text: intl.formatMessage({ id: 'desk.settings.integration.instagram.error.link.fb.button' }),
                        onClick: () => {
                          window.open('https://help.instagram.com/399237934150902', '_blank');
                        },
                      },
                    };
                  case 'desk400108':
                    return {
                      title: intl.formatMessage({ id: 'desk.settings.integration.instagram.error.add.fb.title' }),
                      description: intl.formatMessage({
                        id: 'desk.settings.integration.instagram.error.add.fb.description',
                      }),
                      isNegativeButtonHidden: false,
                      positiveButtonProps: {
                        text: intl.formatMessage({ id: 'desk.settings.integration.instagram.error.add.fb.button' }),
                        onClick: () => {
                          history.push(`${match.url}/facebook`);
                        },
                      },
                    };
                  case 'desk400111':
                    return {
                      title: intl.formatMessage({ id: 'desk.settings.integration.instagram.error.rate.limit.title' }),
                      description: intl.formatMessage({
                        id: 'desk.settings.integration.instagram.error.rate.limit.description',
                      }),
                      isNegativeButtonHidden: true,
                      positiveButtonProps: {
                        text: intl.formatMessage({ id: 'desk.settings.integration.instagram.error.rate.limit.button' }),
                      },
                    };
                  default:
                    return { title: '', description: '' };
                }
              })();

              if (title && description) {
                dispatch(
                  commonActions.showDialogsRequest({
                    dialogTypes: DialogType.Custom,
                    dialogProps: {
                      size: 'small',
                      title,
                      description,
                      isNegativeButtonHidden,
                      positiveButtonProps,
                    },
                  }),
                );
              }
            },
          });
        }
      },
      {
        scope: 'email,instagram_basic,pages_show_list,instagram_manage_comments',
      },
    );
  };

  const handleAddIframeClick = useCallback(() => {
    history.push(`${match.url}/iframe`);
  }, [history, match.url]);

  return (
    <Switch>
      {isAllowedToUseSocial(uid) && [
        <Route key="facebookDetail" path={`${match.url}/facebook/:id`} component={IntegrationFacebookEdit} />,
        <Route
          key="facebook"
          path={`${match.url}/facebook`}
          render={(props) => <IntegrationFacebook {...props} onAddPageButtonClick={handleAddFacebookPageClick} />}
        />,
        <Route key="twitterDetail" path={`${match.url}/twitter/:id`} component={IntegrationTwitterEdit} />,
        <Route
          key="twitter"
          path={`${match.url}/twitter`}
          render={(props) => <IntegrationTwitter {...props} onAddAccountButtonClick={handleAddTwitterAccountClick} />}
        />,
      ]}
      {isAllowedToUseInstagram(uid) && [
        <Route key="instagramDetail" path={`${match.url}/instagram/:id`} component={IntegrationInstagramEdit} />,
        <Route
          key="instagram"
          path={`${match.url}/instagram`}
          render={(props) => <IntegrationInstagram {...props} onAddAccountButtonClick={handleAddInstagramClick} />}
        />,
      ]}
      {isAllowedToUseWhatsApp(uid) && (
        <Route key="whatsappDetail" path={`${match.url}/whatsapp/:id?`} component={IntegrationWhatsApp} />
      )}
      {isAllowedToUseIframe(uid) && <Route path={`${match.url}/iframe`} component={IntegrationIframe} />}
      <Route
        exact={true}
        path={`${match.url}/`}
        render={(props) => (
          <IntegrationOverview
            {...props}
            handleAddFacebookPageClick={handleAddFacebookPageClick}
            handleAddTwitterAccountClick={handleAddTwitterAccountClick}
            handleAddInstagramClick={handleAddInstagramClick}
            onIframeButtonClick={handleAddIframeClick}
          />
        )}
      />
      <Redirect to={`${match.url}`} />
    </Switch>
  );
};
