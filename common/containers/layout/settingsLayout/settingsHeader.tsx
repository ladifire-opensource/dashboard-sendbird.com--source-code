import React, { useCallback } from 'react';

import styled, { css } from 'styled-components';

import { cssVariables, Button, ButtonProps, transitionDefault } from 'feather';

const Container = styled.div<{ hasAction?: boolean; showBorder?: boolean; hasTab?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;

  ${(props) =>
    props.hasAction &&
    css`
      padding-bottom: ${props.hasTab ? 0 : 15}px;
    `}

  ${(props) =>
    props.showBorder &&
    css`
      border-bottom: 1px ${cssVariables('neutral-3')} solid;
    `}
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 20px;
  line-height: 32px;
  font-weight: 600;
  color: ${cssVariables('neutral-10')};
`;

const Description = styled.p`
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-7')};
  margin-top: 24px;
  strong {
    font-weight: 500;
  }
`;

const ActionButton = styled(Button)``;

const ActionsContainer = styled.div`
  display: flex;
  align-items: baseline;
  margin-left: auto;

  ${ActionButton} + ${ActionButton} {
    margin-left: 8px;
  }
`;

const transition = (...properties: Array<string>) =>
  properties.map((property) => `${property} 0.2s ${transitionDefault}`).join(', ');

const Tab = styled.button`
  position: relative;
  height: 40px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  color: ${cssVariables('neutral-7')};
  border: 0;
  outline: 0;
  padding: 0;
  margin: 0;
  background-color: transparent;
  cursor: pointer;
  transition: ${transition('color')};

  &::after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 2px;
    background-color: ${cssVariables('purple-7')};
    transform: scaleX(0);
    transform-origin: 0 0;
    transition: ${transition('transform')};
  }

  &:hover {
    color: ${cssVariables('purple-7')};
    &::after {
      transform: scaleX(1);
    }
  }

  &[aria-selected='true'] {
    color: ${cssVariables('purple-7')};
    cursor: default;

    &::after {
      transform: scaleX(1);
    }
  }
`;

const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 8px 0 0 0;

  ${Tab} + ${Tab} {
    margin-left: 24px;
  }
`;

export type SettingsHeaderAction = {
  key: React.Key;
  label: string;
  icon?: ButtonProps['icon'];
  buttonType: ButtonProps['buttonType'];
  disabled?: ButtonProps['disabled'];
};

type TabProps = {
  key: React.Key;
  label: string;
};

type Props = {
  title: string;
  description?: React.ReactNode;
  actions?: readonly SettingsHeaderAction[];
  tabs?: readonly TabProps[];
  activeTab?: TabProps;
  onActionPress?: (action: SettingsHeaderAction) => void;
  onTabPress?: (tab: TabProps) => void;
  showBorder?: boolean;
};

/** @deprecated
 * This component is becoming complicated. Use `<OrgSettingPageHeader/>` or `<PageHeader />` component whenever possible.
 *
 * Don't try to modify this component. Before adding extra props to this component, read the articles below to check if
 * you can use component composition instead.
 *
 * - [Avoid soul-crushing components](https://epicreact.dev/soul-crushing-components/)
 * - [Composition vs Inheritance](https://reactjs.org/docs/composition-vs-inheritance.html)
 */
export const SettingsHeader = styled(
  ({
    title,
    description,
    actions = [],
    tabs = [],
    activeTab,
    onActionPress,
    onTabPress,
    showBorder = false,
  }: Props) => {
    const handleActionClick = useCallback((action) => () => onActionPress && onActionPress(action), [onActionPress]);

    const handleTabClick = useCallback((tab) => () => onTabPress && onTabPress(tab), [onTabPress]);

    if (actions.length === 0 && tabs.length === 0) {
      return (
        <Container>
          <Title>{title}</Title>
        </Container>
      );
    }

    return (
      <Container showBorder={showBorder || !!actions.length} hasAction={!!actions.length} hasTab={!!tabs.length}>
        <TitleRow>
          <Title>{title}</Title>
          <ActionsContainer>
            {actions.map((action) => (
              <ActionButton
                key={action.key}
                icon={action.icon}
                buttonType={action.buttonType}
                disabled={action.disabled}
                size="small"
                onClick={handleActionClick(action)}
              >
                {action.label}
              </ActionButton>
            ))}
          </ActionsContainer>
        </TitleRow>
        {description && <Description>{description}</Description>}
        {tabs.length > 0 ? (
          <TabsContainer>
            {tabs.map((tab) => {
              const selected = tab.key === activeTab?.key;
              return (
                <Tab key={tab.key} type="button" role="tab" aria-selected={selected} onClick={handleTabClick(tab)}>
                  {tab.label}
                </Tab>
              );
            })}
          </TabsContainer>
        ) : null}
      </Container>
    );
  },
)``;
