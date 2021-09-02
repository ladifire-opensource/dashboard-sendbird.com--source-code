import React, { forwardRef, HTMLAttributes } from 'react';

import styled, { css } from 'styled-components';

import {
  ButtonProps,
  Grid,
  cssVariables,
  GridItem,
  transitionDefault,
  Button,
  GridProps,
  GridItemProps,
  Spinner,
} from 'feather';

export interface SettingsGridCardAction extends ButtonProps {
  label: string;
  key: React.Key;
}

export type SettingsGridCardProps = GridProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
    title?: React.ReactNode;
    titleId?: string;
    description?: React.ReactNode;
    titleColumns?: number;
    actionBeforeNode?: React.ReactNode;
    actions?: SettingsGridCardAction[];
    showActions?: boolean;
    gridItemConfig?: {
      subject?: GridItemProps;
      body?: GridItemProps;
    };
    extra?: React.ReactNode;
    isFetchingBody?: boolean;
    isDisabled?: boolean;
  };

type Props = SettingsGridCardProps;

const transition = (...properties: Array<string>) =>
  properties.map((property) => `${property} 0.2s ${transitionDefault}`).join(', ');

const SettingGrid = styled(Grid)`
  height: 100%;
`;

const SubjectItem = styled(GridItem)`
  padding: 24px 0 24px 24px;
`;

export const SettingsTitle = styled.h6`
  display: flex;
  align-items: center;
  line-height: 1.25;
  letter-spacing: -0.15px;
  white-space: pre-wrap;
  color: ${cssVariables('neutral-10')};
  font-size: 16px;
  font-weight: 500;
`;

export const SettingsDescription = styled.p`
  font-size: 14px;
  line-height: 1.43;
  letter-spacing: normal;
  color: ${cssVariables('neutral-7')};
  white-space: pre-wrap;

  b,
  strong {
    font-weight: 600;
  }

  ${SettingsTitle} + & {
    margin-top: 8px;
  }
`;

export const SettingsGridGroupChild = styled.div`
  border: solid 1px ${cssVariables('neutral-3')};
  border-radius: 4px;

  & + & {
    margin-top: 32px;
  }

  &[aria-disabled='true'] {
    pointer-events: none;
    user-select: none;

    ${SettingsTitle}, ${SettingsDescription} {
      color: ${cssVariables('neutral-5')};
    }
  }
`;

const BodyItem = styled(GridItem)`
  padding: 24px 24px 24px 0;
`;

const ExtraItem = styled(GridItem)`
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 100%;
  padding: 0 24px 24px 24px;
`;

const ActionBeforeNode = styled.div``;

const Footer = styled.div<{ isVisible: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24px;
  width: 100%;
  height: ${(props) => (props.isVisible ? 64 : 0)}px;
  background-color: ${cssVariables('neutral-1')};
  overflow: hidden;
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  transition: ${transition('height', 'margin-top', 'opacity')};

  > ${ActionBeforeNode} {
    margin-right: auto;
  }

  > button {
    justify-content: center;
  }

  > button + button {
    margin-left: 12px;
  }
`;

export const SettingsGridGroup = styled.section`
  ${SettingsGridGroupChild} + ${SettingsGridGroupChild} {
    margin-top: 0;
    border-top: 0;
    border-radius: 0;
  }

  ${SettingsGridGroupChild}:first-child {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  ${SettingsGridGroupChild}:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  & + ${SettingsGridGroupChild}, ${SettingsGridGroupChild} + &,
  & + & {
    margin-top: 32px;
  }
`;

export const SettingsDescriptionText = styled.span<{ display?: 'inline-block' | 'block'; fontSize?: number }>`
  display: ${(props) => props.display || 'inline-block'};
  font-size: ${(props) => props.fontSize || 14}px;
  line-height: 1.43;
  color: ${cssVariables('neutral-7')};

  a {
    color: ${cssVariables('purple-7')};
  }

  b,
  strong {
    font-weight: 600;
  }

  ${(props) =>
    props.display === 'block' &&
    css`
      & + & {
        margin-top: 8px;
      }
    `}
`;

export const SettingsGridCard = forwardRef<HTMLDivElement, Props>(
  (
    {
      className,
      title,
      titleId,
      description,
      titleColumns = 6,
      gap,
      children,
      actions,
      actionBeforeNode,
      showActions = true,
      isDisabled = false,
      gridItemConfig,
      extra,
      isFetchingBody = false,
      ...props
    },
    ref,
  ) => {
    const subjectGridItemConfig = gridItemConfig ? gridItemConfig.subject : undefined;
    const bodyGridItemConfig = gridItemConfig ? gridItemConfig.body : undefined;

    return (
      <SettingsGridGroupChild className={className} {...props} ref={ref} aria-disabled={isDisabled}>
        <SettingGrid gap={gap || ['24px', '32px']} css={extra ? `grid-template-rows: auto 1fr;` : undefined}>
          {!title && !description ? null : (
            <SubjectItem
              colSpan={titleColumns}
              alignSelf={(subjectGridItemConfig && subjectGridItemConfig.alignSelf) || 'center'}
              {...subjectGridItemConfig}
            >
              <SettingsTitle id={titleId}>{title}</SettingsTitle>
              {description ? <SettingsDescription>{description}</SettingsDescription> : null}
            </SubjectItem>
          )}
          <BodyItem
            colSpan={titleColumns === 12 ? 12 : 12 - titleColumns}
            alignSelf={(bodyGridItemConfig && bodyGridItemConfig.alignSelf) || 'center'}
            {...bodyGridItemConfig}
          >
            {isFetchingBody ? <Spinner stroke={cssVariables('neutral-10')} /> : children}
          </BodyItem>
          {extra ? <ExtraItem colSpan={12}>{extra}</ExtraItem> : null}
        </SettingGrid>
        {actions && actions.length && (
          <Footer data-test-id="Actions" isVisible={showActions}>
            {!!actionBeforeNode && <ActionBeforeNode>{actionBeforeNode}</ActionBeforeNode>}
            {actions.map((action) => {
              const { key, label, ...buttonProps } = action;
              return (
                <Button key={key} size="small" {...buttonProps}>
                  {label}
                </Button>
              );
            })}
          </Footer>
        )}
      </SettingsGridGroupChild>
    );
  },
);
