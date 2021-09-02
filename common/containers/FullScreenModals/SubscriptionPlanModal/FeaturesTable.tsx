import { FC, memo, useCallback, useState, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { cssVariables, Icon, Link, LinkVariant, transitions } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShowDialog } from '@hooks';
import { SlideTransition } from '@ui/components/SlideTransition';

import {
  TitleContainer,
  TitleText,
  TitleSuffix,
  TableWrapper,
  Header,
  Column,
  Row,
  TableSection,
} from './components/table';
import { pricingTitleIntlKeys } from './constants';
import { getPricingFeatures, PricingFeatureRow, FeatureTooltip } from './features';

const SubRow = styled(Row)<{ $isLastRow: boolean }>`
  cursor: default;
  position: relative;

  ${({ $isLastRow }) =>
    !$isLastRow &&
    css`
      border-bottom: 0;

      &:before {
        content: '';
        display: block;
        position: absolute;
        bottom: 0;
        right: 0;
        width: calc(100% - 36px);
        height: 1px;
        background: ${cssVariables('neutral-3')};
      }
    `};
`;

const FoldingIcon = styled(Icon)<{ $isOpen: boolean }>`
  transform: rotate(${({ $isOpen }) => ($isOpen ? 0 : -90)}deg);
  transition: ${transitions({ duration: 0.3, properties: ['transform'] })};
`;

const FoldableTableBody = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
`;

const FoldableTableHead = styled(Header)`
  cursor: pointer;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 24px 0;

  a {
    font-size: 14px;
    font-weight: 600;
  }
`;

const AddOnIndicator = styled.div.attrs({ children: '$' })`
  color: ${cssVariables('purple-7')};
  font-weight: 500;
  font-size: 16px;
  margin-left: 4px;
`;

const OverageIndicator = styled.div.attrs({ children: '*' })`
  color: ${cssVariables('purple-7')};
  margin-left: 4px;
  font-weight: 600;
`;

type FoldableTableProps = {
  defaultIsOpen?: boolean;
  features: PricingFeatureRow[];
  headColumnNodes: ReactNode[];
};

const FoldableTable = memo<FoldableTableProps>(({ defaultIsOpen = true, features, headColumnNodes }) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  const renderFeatures = useCallback(() => {
    return features.map(({ key, name, description: titleDescription, plans }, index) => (
      <SlideTransition show={isOpen} delay={index / 30} key={index} from="bottom">
        <SubRow $isLastRow={index === features.length - 1}>
          <Column />
          <Column>
            <FeatureTooltip
              key={key}
              text={intl.formatMessage({ id: name })}
              content={titleDescription ? intl.formatMessage({ id: titleDescription }) : undefined}
            />
          </Column>
          {Object.entries(plans).map(([, { supported, isAddon, description, hasOverage }], columnIndex) => {
            if (!supported) {
              return (
                <Column key={columnIndex}>
                  <Icon icon="close" size={20} color={cssVariables('neutral-3')} />
                  {hasOverage && <OverageIndicator />}
                </Column>
              );
            }

            if (isAddon) {
              return (
                <Column key={columnIndex}>
                  <AddOnIndicator />
                  {hasOverage && <OverageIndicator />}
                </Column>
              );
            }

            if (description) {
              return (
                <Column key={columnIndex}>
                  {description}
                  {hasOverage && <OverageIndicator />}
                </Column>
              );
            }

            return (
              <Column key={columnIndex}>
                <Icon icon="done" size={20} color={cssVariables('purple-7')} />
                {hasOverage && <OverageIndicator />}
              </Column>
            );
          })}
        </SubRow>
      </SlideTransition>
    ));
  }, [features, intl, isOpen]);

  return (
    <>
      <FoldableTableHead onClick={() => setIsOpen(!isOpen)}>
        <Column>
          <FoldingIcon icon="chevron-down" size={20} $isOpen={isOpen} />
        </Column>
        {headColumnNodes.map((node, index) => (
          <Column key={index}>{node}</Column>
        ))}
      </FoldableTableHead>
      <FoldableTableBody $isOpen={isOpen}>{renderFeatures()}</FoldableTableBody>
    </>
  );
});

export const FeaturesTable: FC<{ showStarter1kOption: boolean }> = ({ showStarter1kOption = false }) => {
  const intl = useIntl();
  const history = useHistory();
  const showDialog = useShowDialog();

  const handleFooterLinkClick = () => {
    history.push('/settings/general/plans/support', { background: history.location });
  };

  const showOverageDialog = () => {
    showDialog({
      dialogTypes: DialogType.Overage,
      dialogProps: { showStarter1kOption },
    });
  };

  const pricingFeatures = getPricingFeatures();

  return (
    <TableSection>
      <TitleContainer>
        <TitleText data-trigger="features">{intl.formatMessage({ id: 'common.features.table.title' })}</TitleText>
        <TitleSuffix>
          {intl.formatMessage(
            { id: 'common.features.table.legends.available' },
            {
              b: (dollarSign) => <b>{dollarSign}</b>,
            },
          )}
        </TitleSuffix>
        <TitleSuffix>
          {intl.formatMessage(
            { id: 'common.features.table.legends.overages' },
            {
              b: (asterisk) => <b>{asterisk}</b>,
              a: (overages) => (
                <Link variant={LinkVariant.Inline} onClick={showOverageDialog}>
                  {overages}
                </Link>
              ),
            },
          )}
        </TitleSuffix>
      </TitleContainer>
      <TableWrapper>
        {pricingFeatures.map(({ title, rows }) => {
          return (
            <FoldableTable
              key={title}
              features={rows}
              headColumnNodes={
                title === pricingTitleIntlKeys.usage
                  ? [
                      intl.formatMessage({ id: title }),
                      intl.formatMessage({ id: 'common.subscriptionPlanDialog.table.features.planType.starter' }),
                      intl.formatMessage({ id: 'common.subscriptionPlanDialog.table.features.planType.pro' }),
                      intl.formatMessage({ id: 'common.subscriptionPlanDialog.table.features.planType.enterprise' }),
                    ]
                  : [intl.formatMessage({ id: title })]
              }
            />
          );
        })}
        <Header>
          <Column />
          <Column>{intl.formatMessage({ id: 'common.features.table.th.support.title' })}</Column>
          <Column>{intl.formatMessage({ id: 'common.features.table.th.support.baseL1' })}</Column>
          <Column>{intl.formatMessage({ id: 'common.features.table.th.support.baseL1' })}</Column>
          <Column>{intl.formatMessage({ id: 'common.features.table.th.support.all' })}</Column>
        </Header>
        <Footer>
          <Link iconProps={{ icon: 'open-in-new', size: 16 }} onClick={handleFooterLinkClick}>
            {intl.formatMessage({ id: 'common.features.table.th.support.link.viewMore' })}
          </Link>
        </Footer>
      </TableWrapper>
    </TableSection>
  );
};
