import { FC, ReactNode, useState } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import {
  Body,
  Button,
  cssVariables,
  Dropdown,
  Headings,
  Icon,
  Subtitles,
  Tooltip,
  TooltipVariant,
  Typography,
  IconName,
} from 'feather';

import InputInteger from '@ui/components/InputInteger';

import { MAX_CREDITS } from './constants';

const ResetButton = styled(Button).attrs({
  type: 'button',
  icon: 'refresh',
  size: 'medium',
  buttonType: 'tertiary',
  variant: 'ghost',
})``;

const Reference = styled.span`
  ${Typography['caption-01']}
  color: ${cssVariables('neutral-7')};

  sup {
    ${Typography['label-02']}
    color: ${cssVariables('purple-7')};
  }
`;

const CreditConverterTable = styled.table`
  border-spacing: 0;

  tr {
    display: grid;
    grid-template-columns: 136px 120px 12px 80px 12px auto;
    grid-gap: 12px;
    align-items: center;
    margin-top: 24px;
  }

  thead tr {
    ${Typography['label-03']}
    border-bottom: 1px solid ${cssVariables('neutral-3')};
    height: 40px;

    th {
      color: ${cssVariables('neutral-10')};
      font-weight: 600;
      text-align: start;
      &:last-child {
        text-align: end;
      }
    }
  }

  tbody tr {
    td {
      ${Body['body-03']}
      color: ${cssVariables('neutral-10')};
    }

    td:not(:first-child) {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    td:last-child {
      justify-content: flex-end;
      ${Subtitles['subtitle-01']}

      > span {
        ${Body['body-short-01']}
        margin-left: 8px;
      }
    }
  }

  hr {
    border: none;
    height: 1px;
    background: ${cssVariables('neutral-1')};
    margin-top: 24px;
  }
`;

const TotalCreditsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: ${cssVariables('neutral-10')};
  ${Body['body-short-01']}

  small {
    color: ${cssVariables('neutral-7')};
    ${Typography['label-01']}
  }

  strong {
    margin: 0 8px;
    min-width: 90px;
    text-align: right;
    ${Headings['heading-02']}
  }
`;

const ButtonsContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto auto;
  grid-column-gap: 8px;

  button {
    width: fit-content;
  }

  ${ResetButton} {
    transform: translateX(-12px);
  }
`;

const FooterContainer = styled.footer`
  width: 100%;
  padding-top: 24px;
  border-top: 1px solid ${cssVariables('neutral-3')};
  display: grid;
  align-items: center;
  grid-template-areas:
    'reference credits'
    'buttons buttons';

  ${Reference} {
    grid-area: reference;
  }

  ${TotalCreditsContainer} {
    grid-area: credits;
  }

  ${ButtonsContainer} {
    grid-area: buttons;
    margin-top: 32px;
  }
`;

const CreditConverterContainer = styled.form`
  display: flex;
  align-items: center;
  flex-direction: column;

  ${CreditConverterTable} {
    padding-bottom: 24px;
    width: 100%;
  }
`;

type DirectCallType = 'audio' | 'video' | 'p2p_audio' | 'p2p_video';

const initialForm: Record<DirectCallType, { minutes: number | undefined; participants: number }> = {
  audio: { minutes: undefined, participants: 2 },
  video: { minutes: undefined, participants: 2 },
  p2p_audio: { minutes: undefined, participants: 2 },
  p2p_video: { minutes: undefined, participants: 2 },
};

const useCalculator = (rates: CreditRates) => {
  const [form, setForm] = useState(initialForm);

  const credits = Object.keys(form).reduce((acc, cur: DirectCallType) => {
    const { minutes, participants } = form[cur];
    const price = rates[cur].user;
    acc[cur] = (minutes || 0) * participants * price;

    return acc;
  }, {} as Record<DirectCallType, number>);

  const total = Object.values(credits).reduce<number>((acc, cur) => acc + (cur ?? 0), 0);

  const updateMinutes = (key: DirectCallType, value?: number) => {
    setForm((form) => ({ ...form, [key]: { ...form[key], minutes: value } }));
  };

  const updateParticipants = (key: DirectCallType, value: number) => {
    setForm((form) => ({ ...form, [key]: { ...form[key], participants: value } }));
  };

  const reset = () => setForm(initialForm);

  return {
    state: { form, credits, total },
    actions: { updateMinutes, updateParticipants, reset },
  };
};

const LabelContainer = styled.label`
  ${Subtitles['subtitle-01']}
  color: ${cssVariables('neutral-10')};

  display: flex;
  flex-direction: column;

  > span {
    display: flex;
    align-items: center;

    > svg {
      margin-right: 12px;
    }
  }

  > ${Reference} {
    margin-top: 4px;
    margin-left: 28px;
  }
`;

const Label: FC<{
  icon: IconName;
  text: ReactNode;
  price: number;
  hasReference: boolean;
}> = ({ icon, text, price, hasReference }) => {
  const intl = useIntl();
  return (
    <LabelContainer>
      <span>
        <Icon size={16} color={cssVariables('neutral-9')} icon={icon} />
        {text}
      </span>
      <Reference>
        {intl.formatMessage(
          { id: 'common.settings.general.callsVoucherModalDialogs.calculator.form.body.label' },
          { price },
        )}
        {hasReference && <sup>*</sup>}
      </Reference>
    </LabelContainer>
  );
};
export const Calculator: FC<{
  rates: CreditRates;
  onCancel: () => void;
  onSubmit: (credits: number) => void;
}> = ({ rates, onCancel, onSubmit }) => {
  const intl = useIntl();
  const {
    state: { form, credits, total },
    actions: { updateMinutes, updateParticipants, reset },
  } = useCalculator(rates);

  const handleSubmit = () => onSubmit(Math.round(total));

  const renderRows = (rows: { id: DirectCallType; icon: IconName; label: string; max: number }[]) => {
    return rows.map(({ id, icon, label, max }) => {
      const price = rates[id].user;
      const { minutes, participants } = form[id];
      const isGroupCallsSupported = max > 2;

      return (
        <tr key={id}>
          <td>
            <Label
              icon={icon}
              text={intl.formatMessage({ id: label })}
              price={price}
              hasReference={isGroupCallsSupported}
            />
          </td>
          <td>
            <InputInteger
              name={id}
              aria-label={intl.formatMessage({ id: label })}
              placeholder="0"
              min={0}
              max={MAX_CREDITS}
              value={minutes}
              onChange={(value) => updateMinutes(id, value)}
            />
          </td>
          <td>×</td>
          <td>
            {isGroupCallsSupported ? (
              <Dropdown<number>
                items={Array(max - 1)
                  .fill(null)
                  .map((_, i) => i + 2)} // [2, 3, ..., max]
                selectedItem={participants}
                onChange={(value) => value && updateParticipants(id, value)}
              />
            ) : (
              <Tooltip
                variant={TooltipVariant.Light}
                content={intl.formatMessage({
                  id: 'common.settings.general.callsVoucherModalDialogs.calculator.form.body.p2p.tooltip',
                })}
                tooltipContentStyle={`
                  ${Body['body-short-01']}
                  max-width: 256px;
                `}
              >
                <InputInteger readOnly tabIndex={-1} value={max} />
              </Tooltip>
            )}
          </td>
          <td>=</td>
          <td data-test-id="Credits">
            {intl.formatNumber(credits[id], { maximumFractionDigits: 4 })}
            <span>credits</span>
          </td>
        </tr>
      );
    });
  };

  return (
    <CreditConverterContainer onSubmit={handleSubmit}>
      <CreditConverterTable>
        <thead>
          <tr>
            <th />
            <th>
              {intl.formatMessage({
                id: 'common.settings.general.callsVoucherModalDialogs.calculator.form.header.minute',
              })}
            </th>
            <th />
            <th>
              {intl.formatMessage({
                id: 'common.settings.general.callsVoucherModalDialogs.calculator.form.header.participants',
              })}
            </th>
            <th />
            <th>
              {intl.formatMessage({
                id: 'common.settings.general.callsVoucherModalDialogs.calculator.form.header.credits',
              })}
            </th>
          </tr>
        </thead>
        <tbody>
          {renderRows([
            {
              id: 'audio',
              icon: 'call-filled',
              label: 'common.settings.general.callsVoucherModalDialogs.calculator.form.body.audio',
              max: 25,
            },
            {
              id: 'video',
              icon: 'call-video-filled',
              label: 'common.settings.general.callsVoucherModalDialogs.calculator.form.body.video',
              max: 6,
            },
          ])}
          <hr />
          {renderRows([
            {
              id: 'p2p_audio',
              icon: 'call-p2p-filled',
              label: 'common.settings.general.callsVoucherModalDialogs.calculator.form.body.p2pAudio',
              max: 2,
            },
            {
              id: 'p2p_video',
              icon: 'call-video-p2p-filled',
              label: 'common.settings.general.callsVoucherModalDialogs.calculator.form.body.p2pVideo',
              max: 2,
            },
          ])}
        </tbody>
      </CreditConverterTable>
      <FooterContainer>
        <Reference>
          {intl.formatMessage(
            { id: 'common.settings.general.callsVoucherModalDialogs.calculator.footer.reference' },
            { sup: (text: string) => <sup>{text}</sup> },
          )}
        </Reference>
        <TotalCreditsContainer>
          <small>
            {intl.formatMessage({ id: 'common.settings.general.callsVoucherModalDialogs.calculator.footer.total' })}
          </small>
          <strong data-test-id="Total">{intl.formatNumber(total, { maximumFractionDigits: 4 })}</strong>
          {intl.formatMessage({ id: 'common.settings.general.callsVoucherModalDialogs.calculator.footer.credits' })}
        </TotalCreditsContainer>
        <ButtonsContainer>
          <ResetButton onClick={reset}>
            {intl.formatMessage({ id: 'common.settings.general.callsVoucherModalDialogs.calculator.footer.reset' })}
          </ResetButton>
          <Button type="button" size="medium" buttonType="tertiary" onClick={onCancel}>
            {intl.formatMessage({ id: 'common.settings.general.callsVoucherModalDialogs.calculator.footer.cancel' })}
          </Button>
          <Button type="submit" size="medium" buttonType="primary">
            {intl.formatMessage({ id: 'common.settings.general.callsVoucherModalDialogs.calculator.footer.apply' })}
          </Button>
        </ButtonsContainer>
      </FooterContainer>
    </CreditConverterContainer>
  );
};
