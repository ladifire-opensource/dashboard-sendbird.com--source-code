import { FC, MouseEventHandler } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Headings, shadow } from 'feather';

import FullScreenModalHeader from '@ui/components/FullScreenModal/components/FullScreenModalHeader';
import { SlideTransition } from '@ui/components/SlideTransition';

import { floatingPlanHeadTitleKeys } from '../constants';
import { ScrollTriggerProp } from './VerticalScrollTrigger';

const FixedContainer = styled(SlideTransition)`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 88px;
  background: white;
  ${shadow[2]};
`;

const CenterWrapper = styled.div`
  width: 1024px;
`;

const ModalCloseButtonWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 40px;
  z-index: 30;
`;

const ModalTitle = styled(SlideTransition).attrs({
  from: 'top',
  duration: 0.2,
})`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  ${Headings['heading-04']};
`;

const TableHead = styled.div`
  display: grid;
  grid-template-columns: 612px 1fr 1fr 1.3fr;
  width: 100%;
  transform: translateX(-8px);
`;

const TableColumn = styled(SlideTransition).attrs({ from: 'bottom', duration: 0.2 })`
  position: relative;
  ${Headings['heading-02']};
`;

type Prop = {
  isVisible: boolean;
  onCloseModalClick: MouseEventHandler<HTMLButtonElement>;
} & Pick<ScrollTriggerProp, 'currentKey'>;

const FloatingPlanHeader: FC<Prop> = ({ isVisible, currentKey, onCloseModalClick }) => {
  const intl = useIntl();
  const isShowFeaturesHeader = currentKey === 'features';

  return (
    <FixedContainer show={isVisible} distance={96} from="top">
      <ModalCloseButtonWrapper>
        <FullScreenModalHeader.ModalCloseButton onClick={onCloseModalClick} />
      </ModalCloseButtonWrapper>
      <CenterWrapper>
        {/* key prop will guarantee the title to disappeared when the user scroll all the way down to features at once. */}
        <ModalTitle key={currentKey} show={!isShowFeaturesHeader}>
          {intl.formatMessage({ id: floatingPlanHeadTitleKeys.subscriptionPlanModalTitle })}
        </ModalTitle>
        <TableHead>
          {[
            floatingPlanHeadTitleKeys.features,
            'common.subscriptionPlanDialog.table.features.planType.starter',
            'common.subscriptionPlanDialog.table.features.planType.pro',
            'common.subscriptionPlanDialog.table.features.planType.enterprise',
          ].map((id) => (
            <TableColumn key={id} show={isShowFeaturesHeader}>
              {intl.formatMessage({ id })}
            </TableColumn>
          ))}
        </TableHead>
      </CenterWrapper>
    </FixedContainer>
  );
};

export default FloatingPlanHeader;
