import { FC } from 'react';
import { Link } from 'react-router-dom';

import styled, { css, SimpleInterpolation } from 'styled-components';

import { cssVariables, transitionDefault } from 'feather';

import { colors_old, StyledProps } from '@ui';

import { InputIndicator } from '../input';

const Table = styled.div<StyledProps>`
  position: relative;
  flex: 1;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.5), 0 2px 4px 0 rgba(0, 0, 0, 0.1);

  ${(props) => props.theme.table};
  ${(props) => props.styles};
`;

const RowDefault = styled.div`
  display: flex;
  align-items: center;
  background: white;
  color: ${cssVariables('neutral-7')};
  position: relative;
  padding: 0 24px;
  font-size: 14px;
  transition: all 0.2s ${transitionDefault};
`;

const ColLink = styled(Link)`
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
  white-space: nowrap;
  line-height: 1.4;
  color: ${colors_old.primary.skyBlue.core};

  &:hover {
    text-decoration: underline;
  }
`;

const Row = styled(RowDefault)<StyledProps>`
  ${(props) =>
    props.selectable
      ? css`
          &:hover {
            background: ${cssVariables('neutral-1')};
            cursor: pointer;

            ${ColLink} {
              text-decoration: underline;
            }
          }
        `
      : ''};
  ${(props) =>
    props.selected
      ? css`
          background: #efedfc;
        `
      : ''};
`;

const ColumnComponent = ({ children, width, ...props }) => {
  const exactProps = Object.assign({}, props);
  delete exactProps.style;
  const styles = Object.assign({}, props.style, {
    width,
  });
  return (
    <div style={styles} {...exactProps}>
      {children}
    </div>
  );
};

const Column = styled(ColumnComponent)<StyledProps>`
  padding: 0 10px 0 0;
  font-size: 14px;
  color: #494e57;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  height: 100%;

  ${(props) => props.styles};
`;

const ColumnFlex = styled.div<StyledProps>`
  ${(props) =>
    props.flex
      ? css`
          min-width: ${props.flex};
          flex-grow: 0;
          flex-shrink: 0;
          flex-basis: ${props.flex};
        `
      : css`
          flex: 1;
        `};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.25;
  display: flex;
  align-items: center;
  height: 100%;
  ${(props) => props.styles};
`;

const ColInnerWrapper = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  width: 100%;
  ${(props) => props.styles};
`;

const ColInnerFix = styled.div`
  display: inherit;
  align-items: inherit;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
  vertical-align: middle;
  white-space: nowrap;
`;

const ColInnerFlex = styled.div`
  min-width: 0;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
  vertical-align: middle;
  width: 100%;
`;

const ColText = styled.div`
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;

  u {
    font-weight: 600;
    color: ${cssVariables('neutral-10')};
  }
`;

const Header = styled.div<StyledProps>`
  background: transparent;
  ${Row} {
    background: #f7f8fa;
    height: 46px;
    border-top: 1px solid ${cssVariables('neutral-3')};
    border-bottom: 1px solid ${cssVariables('neutral-3')};
  }
  ${Column} {
    font-size: 12px;
    font-weight: 500;
    color: ${cssVariables('neutral-10')};
    text-transform: uppercase;
  }
  ${ColumnFlex} {
    font-size: 12px;
    font-weight: 500;
    color: ${cssVariables('neutral-10')};
    text-transform: uppercase;
  }
  ${(props) => props.theme.header};
`;

const Body = styled.div<StyledProps>`
  position: relative;
  ${Row} {
    color: ${cssVariables('neutral-8')};
    height: 68px;
    border-bottom: 1px solid ${cssVariables('neutral-3')};
  }
  ${Row}:last-child {
    /* border-bottom: none; */
  }
  ${Row}:first-child {
    border-bottom: 1px solid ${cssVariables('neutral-3')};
  }

  ${(props) => props.theme.body};
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 17px 34px 33px;
`;

const HeaderMenuItemIcon = styled.span`
  margin-top: -2px;
  display: flex;
`;

const HeaderMenuItemLabel = styled.span``;

const StyledHeaderMenuItem = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: white;
  height: 35px;
  line-height: 33px;
  padding: 0 16px;
  font-size: 14px;
  letter-spacing: -0.2px;
  font-weight: 600;
  color: ${cssVariables('neutral-7')};
  transition: all 0.2s ${transitionDefault};
  margin-left: 8px;
  z-index: 1;
  border-radius: 4px;
  box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.15);
  border: 1px solid ${cssVariables('neutral-3')};
  &:hover {
    cursor: pointer;
    color: ${cssVariables('purple-7')};
    z-index: 2;
  }
  ${InputIndicator} {
    width: 14px;
    height: 14px;
    line-height: 14px;
    margin-top: 3px;
  }
  ${(props) =>
    props.disabled
      ? css`
          color: ${cssVariables('neutral-6')};
          .sprite,
          ${InputIndicator} {
            opacity: 0.4;
          }
          &:hover {
            color: #878d99;
            border: 1px solid #d1d7e0;
          }
        `
      : ''};
  ${(props) =>
    props.isAttached
      ? css`
          margin-left: -1px;
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        `
      : ''};
  ${(props) =>
    props.hasAttached
      ? css`
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        `
      : ''};
  ${HeaderMenuItemIcon} + ${HeaderMenuItemLabel} {
    margin-left: 8px;
  }
`;

interface Props {
  label?: string | React.ReactElement<any>;
  disabled?: boolean;
  onClick?: (...any) => any;
}

const HeaderMenuItem: FC<Props> = ({ label, disabled, onClick }) => {
  return (
    <StyledHeaderMenuItem disabled={disabled} onClick={onClick}>
      {label ? <HeaderMenuItemLabel>{label}</HeaderMenuItemLabel> : ''}
    </StyledHeaderMenuItem>
  );
};

const HeaderMenu = styled.div<{ styles?: SimpleInterpolation }>`
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 4px;
  height: 78px;
  border-top: 1px solid ${cssVariables('neutral-3')};

  ${(props) => props.styles};
`;

const HeaderMenuSelector = styled.div<StyledProps>`
  background-color: white;
  width: 56px;
  height: 35px;
  line-height: 33px;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;
  box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.15);
  padding: 0 19px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

export {
  Table,
  Header,
  Row,
  RowDefault,
  Column,
  ColumnFlex,
  ColInnerWrapper,
  ColInnerFix,
  ColInnerFlex,
  ColText,
  ColLink,
  Body,
  Footer,
  HeaderMenu,
  HeaderMenuSelector,
  HeaderMenuItem,
};
