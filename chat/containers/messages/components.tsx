import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { cssVariables, cssColors } from 'feather';
import { rgba } from 'polished';

import { ButtonDefaultStyle } from '@ui/components';

const ButtonLink = styled(Link)`
  ${ButtonDefaultStyle};
  color: white;
  background: ${cssVariables('purple-7')};
  &:hover {
    background: ${rgba(cssColors('purple-7'), 0.9)};
  }
`;

const CustomPricingLink = styled(ButtonLink)`
  line-height: 30px;
`;

const InputSupportButton = styled.div`
  position: absolute;
  top: -2px;
  right: 0;
`;

const AlertPlanLimited = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px -1px rgba(0, 0, 0, 0.4);
  padding: 20px 24px;
  overflow: hidden;
`;

const AlertPlanLimitedTitle = styled.div`
  color: ${cssVariables('neutral-10')};
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.2px;
  margin-bottom: 5px;
`;

const AlertPlanLimitedDescription = styled.div`
  color: ${cssVariables('neutral-8')};
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
`;

export { CustomPricingLink, InputSupportButton, AlertPlanLimited, AlertPlanLimitedTitle, AlertPlanLimitedDescription };
