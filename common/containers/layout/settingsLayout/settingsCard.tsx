import React from 'react';

import styled, { css } from 'styled-components';

import { AlignItemsProperty } from 'csstype';
import { cssVariables, Button, ButtonProps } from 'feather';

import { makeGrid } from '@ui/components';
import { transitionDefault } from '@ui/styles';

const disabledSectionStyle = css`
  opacity: 0.5;
  pointer-events: none;
`;

const { ResponsiveContainer, ResponsiveColumn, wideGridMediaQuery } = makeGrid({
  wideGutterSize: 24,
  narrowGutterSize: 24,
  columns: 8,
});

export interface SettingsCardAction extends ButtonProps {
  label: string;
  key: React.Key;
}

interface StretchLabelOptions {
  width?: number;
  wideWidth?: number;
}

export type SettingsCardProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  content?: React.ReactNode;

  // pass an object to manually set the width of LabelContainer
  stretchLabel?: boolean | StretchLabelOptions;

  // node put on the left side of the actions
  actionBeforeNode?: React.ReactNode;

  // actions on the right side of the footer
  actions?: ReadonlyArray<SettingsCardAction>;

  showActions?: boolean;
  singleColumn?: boolean;
  className?: string;
  alignItems?: AlignItemsProperty;

  // disable section 'all', 'content', 'footer'
  disable?: 'all' | 'content' | 'footer' | '';
};

const Body = styled.div<{ stretchLabel?: SettingsCardProps['stretchLabel'] }>`
  ${(props) =>
    props.stretchLabel === true
      ? css`
          flex: none;
          margin-left: auto;
          align-self: flex-start;
        `
      : css`
          flex: 1;
        `}

  font-size: 14px;
  line-height: 20px;
  color: ${cssVariables('neutral-6')};
`;

const transition = (...properties: Array<string>) =>
  properties.map((property) => `${property} 0.2s ${transitionDefault}`).join(', ');

const ActionBeforeNode = styled.div``;

export const SettingsCardFooter = styled.div<{ isVisible: boolean; disabled?: boolean; theme?: string }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  overflow: hidden;
  opacity: ${(props) => (props.isVisible ? 1 : 0)};

  transition: ${transition('height', 'margin-top', 'opacity')};

  ${({ theme }) => {
    switch (theme) {
      case 'transparent':
        return css`
          margin-top: 16px;
        `;
      default:
        return css`
          height: 72px;
          padding: 0 20px;
          margin-top: 20px;
          background-color: ${cssVariables('neutral-1')};
          border-top: 1px ${cssVariables('neutral-3')} solid;
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
          ${wideGridMediaQuery`
            padding: 0 24px;
            margin-top: 24px;
          `}
        `;
    }
  }}

  ${(props) =>
    !props.isVisible &&
    css`
      height: 0 !important;
    `}

  > ${ActionBeforeNode} {
    margin-right: auto;
  }

  > button {
    justify-content: center;
  }

  > button + button {
    margin-left: 12px;
  }

  ${(props) => props.disabled && disabledSectionStyle};
`;

const Description = styled.div``;

export const LabelContainer = styled(ResponsiveColumn)<{
  stretchLabel: SettingsCardProps['stretchLabel'];
}>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-right: 20px;

  ${wideGridMediaQuery`
  margin-right: 24px;
  `}

  ${(props) =>
    props.stretchLabel &&
    css`
      flex-shrink: 1;
      width: ${(props.stretchLabel as StretchLabelOptions).width || 492}px;

      ${wideGridMediaQuery`
      width: ${(props.stretchLabel as StretchLabelOptions).wideWidth || 680}px;
      `}
    `}

  h6 {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
    letter-spacing: -0.2px;
    color: ${cssVariables('neutral-10')};

    margin: 0;
  }

  ${Description} {
    font-size: 14px;
    line-height: 20px;
    color: ${cssVariables('neutral-6')};

    margin: 0;
  }

  h6 + ${Description} {
    margin-top: 4px;
  }
`;

const Container = styled.div<{
  hasFooter: boolean;
  singleColumn?: SettingsCardProps['singleColumn'];
  disabled: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  border-radius: 4px;
  border: 1px solid ${cssVariables('neutral-3')};
  background-color: #fff;
  padding: 24px 0;
  min-height: 96px;

  ${wideGridMediaQuery`
  padding: 24px 0;
  `}

  ${(props) =>
    props.hasFooter &&
    css`
      padding-bottom: 0 !important;
    `};

  ${(props) => props.disabled && disabledSectionStyle};
`;

const Grid = styled(ResponsiveContainer)<{
  alignItems: AlignItemsProperty;
  singleColumn?: boolean;
  disabled?: boolean;
}>`
  min-width: initial;
  align-items: ${(props) => props.alignItems};

  ${(props) =>
    props.singleColumn &&
    css`
      flex-wrap: wrap;
      > * {
        width: 100%;
      }

      ${LabelContainer} {
        margin-bottom: 20px;

        ${wideGridMediaQuery`margin-bottom: 24px;`}
      }
    `};
  ${(props) => props.disabled && disabledSectionStyle};
`;

const Content = styled.div`
  flex: 1;
  padding: 24px 24px 0;
`;

const SettingsCardComponent: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  content,
  stretchLabel,
  className,
  alignItems = 'center',
  actionBeforeNode,
  actions,
  showActions = true,
  singleColumn,
  disable = [],
}) => {
  return (
    <Container className={className} hasFooter={!!(actions && actions.length)} disabled={disable === 'all'}>
      <Grid singleColumn={singleColumn} alignItems={alignItems} disabled={disable === 'all' || disable === 'content'}>
        {singleColumn && !title && !description ? null : (
          <LabelContainer column={3} stretchLabel={stretchLabel}>
            <h6>{title}</h6>
            {description ? <Description>{description}</Description> : null}
          </LabelContainer>
        )}
        <Body stretchLabel={stretchLabel}>{children}</Body>
      </Grid>
      {content && <Content>{content}</Content>}
      {actions && actions.length > 0 ? (
        <SettingsCardFooter isVisible={showActions} disabled={disable === 'all' || disable === 'footer'}>
          {!!actionBeforeNode && <ActionBeforeNode>{actionBeforeNode}</ActionBeforeNode>}
          {actions.map((action) => {
            const { key, label, ...buttonProps } = action;
            return (
              <Button key={key} {...buttonProps}>
                {label}
              </Button>
            );
          })}
        </SettingsCardFooter>
      ) : (
        ''
      )}
    </Container>
  );
};

export const SettingsCard = styled(SettingsCardComponent)``;
