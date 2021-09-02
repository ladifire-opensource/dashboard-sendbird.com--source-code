import styled, { css, SimpleInterpolation } from 'styled-components';

import { cssVariables } from 'feather';

import { UITab } from '@interfaces/ui';
import { StyledProps } from '@ui';
import { transitionDefault } from '@ui/styles';

const Tab = styled.div<StyledProps>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${cssVariables('neutral-7')};
  font-size: 14px;
  font-weight: 600;
  line-height: 1.43;
  height: 40px;
  transition: all 0.2s ${transitionDefault};
  &:after {
    position: absolute;
    content: '';
    width: 100%;
    height: 2px;
    bottom: -1px;
    left: 0;
    background-color: ${cssVariables('purple-7')};
    transition: transform 0.2s ${transitionDefault};
    transform: scaleX(0);
    transform-origin: 0 0;
  }
  &:hover {
    color: ${cssVariables('purple-7')};
    &:after {
      transform: scaleX(1);
    }
  }
  &[aria-selected='true'] {
    color: ${cssVariables('purple-7')};
    font-weight: 600;
    &:after {
      transform: scaleX(1);
    }
  }
  &[aria-disabled='true'] {
    color: ${cssVariables('neutral-5')};
    &:hover {
      &:after {
        transform: scaleX(0);
      }
    }
  }
`;

const TabList = styled.div<{
  hasPanels: boolean;
  hasBorder?: boolean;
  spacing?: number;
  styles?: SimpleInterpolation;
}>`
  display: flex;
  ${Tab} + ${Tab} {
    margin-left: ${(props) => props.spacing || 24}px;
  }
  ${(props) => props.hasBorder && `border-bottom: 1px solid ${cssVariables('neutral-3')}`};
  ${(props) => props.hasPanels && 'margin-bottom: 32px'};
  ${(props) => props.styles}
`;

const StyledTabMenus = styled.div<StyledProps>`
  padding: 8px 0 0 0;
  ${(props) => props.styles};
`;

const PanelList = styled.div``;

const Panel = styled.div<StyledProps>`
  ${(props) =>
    props.isActive
      ? css`
          display: block;
        `
      : css`
          display: none;
        `};
`;

interface Props {
  tabs: UITab[];
  panels?: any;
  activeTab?: number;
  spacing?: 36 | 24;
  styles?: {
    tabMenus?: SimpleInterpolation;
    tabList?: SimpleInterpolation;
  };
  hasBorder?: boolean;
  handleTabClick?: (index, value?) => void;
  className?: string;
}

export const TabMenu = styled(
  ({
    panels,
    spacing,
    tabs,
    styles,
    hasBorder = true,
    activeTab,
    handleTabClick: handleTabClickProp,
    className,
  }: Props) => {
    const handleTabClick = (index, value?) => () => {
      handleTabClickProp && handleTabClickProp(index, value);
    };

    const renderedTabs = (
      <TabList
        role="tablist"
        hasPanels={panels && panels.length > 0}
        spacing={spacing}
        hasBorder={hasBorder}
        styles={styles && styles.tabList}
      >
        {tabs.map((tab, index) => {
          return (
            <Tab
              key={index}
              role="tab"
              aria-selected={index === activeTab}
              aria-disabled={tab.disabled || false}
              {...(tab.disabled
                ? {}
                : {
                    onClick: handleTabClick(index, tab.value),
                  })}
            >
              {tab.label}
            </Tab>
          );
        })}
      </TabList>
    );

    const renderedPanels =
      panels && panels.length > 0 ? (
        <PanelList>
          {panels.map((panel, index) => {
            return (
              <Panel key={index} isActive={index === activeTab}>
                {panel}
              </Panel>
            );
          })}
        </PanelList>
      ) : null;

    return (
      <StyledTabMenus className={className} styles={styles && styles.tabMenus}>
        {renderedTabs}
        {renderedPanels}
      </StyledTabMenus>
    );
  },
)``;
