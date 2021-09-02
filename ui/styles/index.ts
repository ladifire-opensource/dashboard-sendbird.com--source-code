import { createGlobalStyle, css, keyframes } from 'styled-components';

import { cssVariables, transitionDefault, elevation, typeface } from 'feather';

import { colors_old, ZIndexes } from '@ui';

import normalize from './normalize';
import { slickStyle } from './slick';

const GlobalStyles = createGlobalStyle`
  ${normalize}

  html {
    height: 100%;
    box-sizing: border-box;
    line-height: 1;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
    padding: 0;
  }

  body {
    font-family: ${typeface.system};
    position: relative;
    height: 100%;
    color: ${cssVariables('neutral-10')};

    text-rendering: optimizeLegibility;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
  }

  #root {
    position: fixed;
    z-index: 0;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  #portal_popup {
    position: absolute;
    top: 0%;
    left: 0;
    width: 0;
    top: 0;
    overflow: visible;
    z-index: 80;
  }

  span {
    display: inline-block;
    vertical-align: middle;
  }

  img {
    vertical-align: middle;
  }

  button, input, optgroup, select, textarea {
    font-family: ${typeface.system};
  }

  button, html [type="button"], [type="reset"], [type="submit"] {
    -webkit-appearance: initial;
  }

  a {
    color: ${cssVariables('purple-7')};
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: color .2s ${transitionDefault}, text-decoration .2s ${transitionDefault};
    &:hover {
      color: ${cssVariables('purple-8')};
      font-weight: 500;
      text-decoration: underline;
    }
  }

  sup {
    top: 0;
    font-size: 100%;
  }

  p {
    line-height: 1.5;
  }

  input,
  textarea {
    &:invalid {
      box-shadow: none;
    }
  }

  ::selection {
    background: rgba(124, 96, 217, 1);
    color: white;
  }

  .sprite {
    display: block;
  }
  

  .unsupported {
    text-align: center;
    padding: 120px 0 0 0;
    &__logo {
      img {
        width: 250px;
      }
    }
    &__header {
      font-size: 32px;
      font-weight: 300;
      padding: 40px 0;
      color: ${cssVariables('purple-7')};
    }
    &__description {
      color: ${cssVariables('neutral-6')};
      font-size: 20px;
      strong {
        color: #f45477;
      }
    }
    &__footer {
      padding: 0;
      margin-top: 60px;
      li {
        font-size: 16px;
        font-weight: 300;
        color: ${cssVariables('neutral-3')};
        display: inline-block;
      }
      &__divider {
        margin: 0 10px;
      }
      &__link {
        a {
          color: #343840;
          &:hover {
            color: #343840;
            text-decoration: underline;
          }
        }
      }
    }
  }

  .table {
    width: 100%;
    max-width: 100%;
    margin-bottom: 16px;
    border-collapse: collapse;
    border-spacing: 0;
    td, th {
      vertical-align: top;
      padding: 0 12px;
    }
    th {
      line-height: 28px;
      height: 44px;
      border-top: 1px solid ${cssVariables('neutral-3')};
    }
    td {
      line-height: 40px;
      height: 42px;
      border-top: 1px solid ${cssVariables('neutral-3')};
      font-size: 14px;;
      color: ${cssVariables('neutral-8')};
      border-left: 1px solid ${cssVariables('neutral-3')};
      &:last-child {
        border-right: 1px solid ${cssVariables('neutral-3')};
      }
    }
    tr {
      &:last-child {
        td {
          border-bottom: 1px solid ${cssVariables('neutral-3')};
        }
      }
    }
    thead {
      th {
        border-bottom: 1px solid ${cssVariables('neutral-3')};
        vertical-align: middle;
        font-size: 14px;
        font-weight: 600;
        color: ${cssVariables('neutral-8')};
        background: ${cssVariables('neutral-1')};
        border-left: 1px solid ${cssVariables('neutral-3')};
        &:last-child {
          border-right: 1px solid ${cssVariables('neutral-3')};
        }
      }
    }
    &--fixed {
      table-layout: fixed;
    }
  }

  .daterange {
    .dropdown__menu {
      min-width: 514px;
      padding: 0;
    }
    .dropdown__item {
      padding: 0;
      @include clearfix();
      &:hover {
        background: transparent;
      }
    }
  }
  
  // rc-time-picker
  .rc-time-picker-panel {
    z-index: ${ZIndexes.timePickerPanel};
    width: 100%;
    position: absolute;
    box-sizing: border-box;
  }

  .rc-time-picker-panel * {
    box-sizing: border-box;
  }

  .rc-time-picker-panel-inner {
    display: inline-block;
    position: relative;
    outline: none;
    list-style: none;
    font-size: 16px;
    text-align: left;
    background-color: #fff;
    background-clip: padding-box;
    line-height: 1.5;
    border: 0;
    border-radius: 4px;
    ${elevation.popover}
  }

  .rc-time-picker-panel-narrow {
    max-width: 170px;
  }

  .rc-time-picker-panel-input {
    margin: 0;
    padding: 0;
    padding-left: 8px;
    width: 100%;
    cursor: auto;
    line-height: 1.5;
    font-weight: 600;
    color: ${cssVariables('neutral-10')};
    outline: 0;
    border: 1px solid transparent;
  }

  .rc-time-picker-panel-input-wrap {
    box-sizing: border-box;
    position: relative;
    padding: 12px 6px;
    border-bottom: 1px solid ${cssVariables('neutral-3')};
  }

  .rc-time-picker-panel-input-invalid {
    border-color: red;
  }

  .rc-time-picker-panel-clear-btn {
    position: absolute;
    right: 9px;
    cursor: pointer;
    overflow: hidden;
    width: 20px;
    height: 20px;
    text-align: center;
    line-height: 20px;
    top: 14px;
    margin: 0;
  }

  .rc-time-picker-panel-clear-btn:after {
    content: 'X';
    font-size: 12px;
    color: #aaa;
    display: inline-block;
    line-height: 1;
    width: 20px;
    transition: color 0.3s ease;
  }

  .rc-time-picker-panel-clear-btn:hover:after {
    color: #666;
  }

  .rc-time-picker-panel-select {
    float: left;
    font-size: 14px;
    border: 1px solid ${cssVariables('neutral-3')};
    border-width: 0 1px;
    margin-left: -1px;
    box-sizing: border-box;
    width: 50%;
    max-height: 144px;
    overflow: hidden;
    position: relative;
  }

  .rc-time-picker-panel-select-active {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .rc-time-picker-panel-select:first-child {
    border-left: 0;
    margin-left: 0;
  }

  .rc-time-picker-panel-select:last-child {
    border-right: 0;
  }

  .rc-time-picker-panel-select ul {
    list-style: none;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    width: 100%;
  }

  .rc-time-picker-panel-select li {
    list-style: none;
    box-sizing: content-box;
    margin: 0;
    padding: 0 0 0 16px;
    width: 100%;
    height: 32px;
    line-height: 32px;
    text-align: left;
    font-weight: 500;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .rc-time-picker-panel-select li:hover {
    background: ${colors_old.background.gray};
    color: ${colors_old.primary.purple.dark};
  }

  li.rc-time-picker-panel-select-option-selected {
    line-height: 30px;
    color: ${cssVariables('purple-7')};
    background-color: ${cssVariables('purple-2')};
    box-sizing: border-box;
  }

  li.rc-time-picker-panel-select-option-selected:hover {
    background: ${colors_old.background.gray};
    color: ${cssVariables('neutral-10')};
  }

  li.rc-time-picker-panel-select-option-disabled {
    color: #ccc;
  }

  li.rc-time-picker-panel-select-option-selected.rc-time-picker-panel-select-option-disabled,
  li.rc-time-picker-panel-select-option-disabled:hover {
    color: #ccc;
    background: ${colors_old.background.gray};
    cursor: not-allowed;
  }

  // temp fix for date range
  .rdr-MonthAndYear-divider {
    color: white;
  }

  ${slickStyle};
`;

const clearfix = () => css`
  &::after {
    content: '';
    display: table;
    clear: both;
  }
`;

const animationBounceDelay = () => keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  } 40% {
    transform: scale(1.0);
  }
`;

const animationScaleY = () => keyframes`
  0% {
    transform: scaleY(0);
    opacity: 0;
  } 100% {
    transform: scaleY(1.0);
    opacity: 1;
  }
`;

const animationFadeIn = () => keyframes`
  0% {
    opacity: 0;
    display: none;
  }
  100% {
    opacity: 1;
    display: block;
  }
`;
const animationFadeOut = () => keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    display: none;
  }
`;

const animationLoading = () => keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

const rotateRightDynamic = () => keyframes`
  0% {
    transform: rotate(0);
  }

  10% {
    transform: rotate(20deg);
  }

  20% {
    transform: rotate(55deg);
  }

  50% {
    transform: rotate(170deg);
  }

  60% {
    transform: rotate(220deg);
  }

  80% {
    transform: rotate(280deg);
  }

  90% {
    transform: rotate(320deg);
  }

  100% {
    transform: rotate(360deg);
  }
`;

export {
  GlobalStyles,
  clearfix,
  // animations
  transitionDefault,
  animationBounceDelay,
  animationScaleY,
  animationFadeIn,
  animationFadeOut,
  animationLoading,
  rotateRightDynamic,
};
