import { ComponentProps, FC, useEffect } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Body, Tooltip, TooltipTargetIcon, TooltipVariant } from 'feather';

import { fetchCreditRates } from '@common/api';
import { useAsync, useErrorToast } from '@hooks';

const RatesTableContainer = styled.ul`
  padding-inline-start: 18px;

  li {
    ${Body['body-short-01']}

    &::before {
      content: '';
      margin-left: 8px;
    }

    > b {
      font-weight: 600;
    }
  }

  li + li {
    margin-top: 4px;
  }
`;

const useCreditRates = () => {
  const [{ status, data: response, error }, requestRates] = useAsync(fetchCreditRates, []);
  return [{ loading: status === 'loading', response: response?.data, error }, requestRates] as const;
};

export const RatesTable: FC<{ rates: CreditRates }> = ({ rates }) => {
  const intl = useIntl();
  type Rate = { key: keyof CreditRates; label: string };
  const list: Rate[] = [
    { key: 'audio', label: 'calls.components.ratesTooltip.audio' },
    { key: 'video', label: 'calls.components.ratesTooltip.video' },
    { key: 'p2p_audio', label: 'calls.components.ratesTooltip.p2pAudio' },
    { key: 'p2p_video', label: 'calls.components.ratesTooltip.p2pVideo' },
  ];

  /* Video call: 0.007 credits per minute per user */
  const format = (rate: Rate) => {
    const label = intl.formatMessage({ id: rate.label });
    return intl.formatMessage(
      { id: 'calls.components.ratesTooltip.value' },
      {
        label,
        value: rates[rate.key].user,
        b: ([text]) => <b>{text}</b>,
      },
    );
  };

  return (
    <RatesTableContainer data-test-id="RatesTable">
      {list.map((rate) => (
        <li key={rate.key}>{format(rate)}</li>
      ))}
    </RatesTableContainer>
  );
};

type Props = Omit<ComponentProps<typeof Tooltip>, 'variant' | 'disabled' | 'content' | 'children'>;

export const RatesTooltip: FC<Props> = (props) => {
  const [{ response: rates, loading, error }, fetch] = useCreditRates();

  useEffect(() => {
    fetch();
  }, [fetch]);

  useErrorToast(error);

  return (
    <Tooltip
      variant={TooltipVariant.Light}
      disabled={loading}
      content={rates ? <RatesTable rates={rates} /> : null}
      {...props}
    >
      <TooltipTargetIcon icon="info" />
    </Tooltip>
  );
};
