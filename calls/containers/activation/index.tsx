import { FC, useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { Button } from 'feather';

import { commonActions } from '@actions';
import { Introduction } from '@calls/components/Introduction';
import { requestFreeVoucher } from '@calls/services';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { CLOUD_FRONT_URL, FREE_VOUCHER_CREDITS } from '@constants';
import { registerCallsApplication } from '@core/api';
import { useAppId, useAsync, useErrorToast, useShowDialog } from '@hooks';
import { useIsCallsActivatedOrganization } from '@hooks/useIsCallsActivatedOrganization';
import { convertNodeArrayToReactFragment } from '@utils';

const Background = () => {
  const intl = useIntl();

  return (
    <img
      alt={intl.formatMessage({ id: 'calls.activation.background' })}
      width={558}
      height={458}
      srcSet={`${CLOUD_FRONT_URL}/dashboard/img-call-promotion-01.jpg,
       ${CLOUD_FRONT_URL}/dashboard/img-call-promotion-01%402x.jpg 2x,
       ${CLOUD_FRONT_URL}/dashboard/img-call-promotion-01%403x.jpg 3x
       `}
      src={`${CLOUD_FRONT_URL}/dashboard/img-call-promotion-01.jpg`}
    />
  );
};

/* services */
const activateCallsSelfService = async (appId: string) => {
  await registerCallsApplication({ app_id: appId });
  return requestFreeVoucher(appId);
};

const useActivationConfirm = () => {
  const showDialog = useShowDialog();
  const intl = useIntl();

  const confirm = useCallback(() => {
    showDialog({
      dialogTypes: DialogType.Custom,
      dialogProps: {
        size: 'small',
        isNegativeButtonHidden: true,
        title: intl.formatMessage({ id: 'calls.activation.confirm.title' }),
        description: intl.formatMessage({ id: 'calls.activation.confirm.content' }),
        positiveButtonProps: {
          text: intl.formatMessage({ id: 'calls.activation.confirm.ok' }),
        },
      },
    });
  }, [intl, showDialog]);

  return confirm;
};

const useActivateCalls = () => {
  const appId = useAppId();
  const confirm = useActivationConfirm();
  const openFreeVoucherDialog = useShowDialog({ dialogTypes: DialogType.CallsFreeVoucher });
  const dispatch = useDispatch();

  const [{ status, data, error }, activate] = useAsync(() => activateCallsSelfService(appId), [appId]);

  /* handle success */
  useEffect(() => {
    if (!data) return;

    /* after activation, reload organization data */
    dispatch(commonActions.verifyAuthenticationRequest());

    data.isFreeVoucherIssued ? openFreeVoucherDialog() : confirm();
  }, [data, dispatch, confirm, openFreeVoucherDialog]);

  useErrorToast(error);

  return { isLoading: status === 'loading', activate };
};

const Activation: FC = () => {
  const intl = useIntl();
  const isCallsActivatedOrganization = useIsCallsActivatedOrganization();

  /* shows different title and content following isCallsActivatedOrganization value */
  const title = isCallsActivatedOrganization
    ? 'calls.activation.title.activated'
    : 'calls.activation.title.inactivated';

  const introduction = isCallsActivatedOrganization
    ? 'calls.activation.introduction.activated'
    : 'calls.activation.introduction.inactivated';

  const leadParagraphs = convertNodeArrayToReactFragment(
    intl
      .formatMessage({ id: introduction }, { credits: FREE_VOUCHER_CREDITS })
      .split('\n\n')
      .map((paragraph, index) => <p key={`leadParagraph_${index}`}>{paragraph}</p>),
  );

  const { isLoading, activate } = useActivateCalls();

  return (
    <Introduction.Layout css="padding: 0 56px;">
      <h2>{intl.formatMessage({ id: title })}</h2>
      <section>{leadParagraphs}</section>
      <h3>{intl.formatMessage({ id: 'calls.activation.features.title' })}</h3>
      <ul>
        {[
          'calls.activation.features.1On1Call',
          'calls.activation.features.sdk',
          'calls.activation.features.callLogs',
          'calls.activation.features.compatibility',
          'calls.activation.features.groupCall',
        ].map((intlKey) => (
          <Introduction.FeatureItem key={intlKey}>{intl.formatMessage({ id: intlKey })}</Introduction.FeatureItem>
        ))}
      </ul>
      <Button buttonType="primary" size="medium" onClick={activate} isLoading={isLoading} disabled={isLoading}>
        {intl.formatMessage({ id: 'calls.activation.activate' })}
      </Button>
      <Background />
    </Introduction.Layout>
  );
};

export default Activation;
