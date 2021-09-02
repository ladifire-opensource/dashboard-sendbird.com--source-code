import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Tag, TagVariant, Typography } from 'feather';

import { DeskBotType } from '@constants';

const BotTypeTag = styled(Tag)`
  span {
    ${Typography['label-01']};
    line-height: 8px;
  }
`;

const botTypeLabelKey: Record<DeskBotType, string> = {
  [DeskBotType.CUSTOMIZED]: 'desk.settings.bots.list.item.label.custom',
  [DeskBotType.FAQBOT]: 'desk.settings.bots.list.item.label.faq',
};

type Props = {
  className?: string;
  type: DeskBotType;
};

export const DeskBotTypeTag: FC<Props> = ({ className, type }) => {
  const intl = useIntl();
  const botTypeLabel = botTypeLabelKey[type] ? intl.formatMessage({ id: botTypeLabelKey[type] }) : type;
  return (
    <BotTypeTag className={className} variant={TagVariant.Dark} rounded={true} data-test-id="BotTypeTag">
      {botTypeLabel}
    </BotTypeTag>
  );
};
