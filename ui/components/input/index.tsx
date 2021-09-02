import React from 'react';

import styled, { css } from 'styled-components';

import { cssVariables, transitionDefault } from 'feather';

import { colors_old, StyledProps } from '@ui';

/** @deprecated it overrides `type` attribute causing buggy behaviors on password inputs */
const BasicInput = styled.input.attrs<StyledProps>({
  type: 'text',
})<StyledProps>`
  display: block;
  width: 100%;
  font-size: 14px;
  padding: 0 8px;
  height: 40px;
  color: ${cssVariables('neutral-10')};
  border: 1px solid ${cssVariables('neutral-4')};
  line-height: 1.5;
  border-radius: 4px;
  transition: all 0.25s ${transitionDefault};
  background: ${(props) => (props.readOnly ? cssVariables('neutral-1') : 'white')};
  cursor: ${(props) => (props.readOnly ? 'text' : 'auto')};
  -webkit-appearance: none;

  &:focus {
    outline: none;
    border: 1px solid ${cssVariables('purple-7')};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  &:read-only {
    color: ${cssVariables('content-2')};
    background: ${cssVariables('neutral-3')};
    border-color: ${cssVariables('neutral-3')};
  }

  &:disabled {
    color: ${cssVariables('content-disabled')};
    border-color: ${cssVariables('border-disabled')};
  }

  ${(props) => props.styles}
`;

const SmallInput = styled(BasicInput)`
  font-size: 13px;
  padding: 2px 8px 3px;
`;

const MediumInput = styled(BasicInput)`
  font-size: 15px;
  padding: 6px 12px;
`;

const LargeInput = styled(BasicInput)`
  font-size: 16px;
  height: 45px;
  padding: 0 16px;
`;

const SystemInput = styled.input<StyledProps>`
  display: block;
  padding: 0 12px;
  ${(props) =>
    props.iconPrefix && props.iconPrefix.name
      ? css`
          padding-left: 44px;
        `
      : null};
  width: 100%;
  height: 40px;
  line-height: 1.5;
  letter-spacing: -0.2px;
  font-size: 14px;
  color: ${cssVariables('neutral-10')};
  border-radius: 4px;
  border: 1px solid ${cssVariables('neutral-4')};
  background: ${(props) => (props.readOnly ? cssVariables('neutral-1') : 'white')};
  cursor: ${(props) => (props.readOnly ? 'text' : 'auto')};
  transition: all 0.25s ${transitionDefault};
  -webkit-appearance: none;

  &:focus {
    outline: none;
    border: 1px solid ${cssVariables('purple-7')};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  &:read-only {
    color: ${cssVariables('content-2')};
    background: ${cssVariables('neutral-3')};
    border-color: ${cssVariables('neutral-3')};
  }

  &:disabled {
    color: ${cssVariables('content-disabled')};
    border-color: ${cssVariables('border-disabled')};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${cssVariables('neutral-5')};
  }
`;

const LargeSystemInput = styled(SystemInput)`
  padding: 0 16px;
  height: 52px;
  font-size: 16px;
`;

const BasicTextarea = styled.textarea<StyledProps>`
  display: block;
  width: 100%;
  font-size: 14px;
  background: white;
  padding: 4px 12px 5px;
  border: 1px solid ${cssVariables('neutral-4')};
  color: ${cssVariables('neutral-10')};
  line-height: 1.5;
  border-radius: 4px;
  resize: vertical;
  transition: all 0.2s ${transitionDefault};

  &:focus {
    outline: none;
    border: 1px solid ${cssVariables('purple-7')};
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.28);
  }

  ${(props) => props.styles};
  ${(props) =>
    props.disabled
      ? css`
          background: ${cssVariables('neutral-1')};
          color: ${cssVariables('neutral-5')};
        `
      : ''};
`;

// InputAddons

const InputIndicator = styled.span<StyledProps>`
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 16px;
  height: 16px;
  line-height: 16px;
  color: ${cssVariables('neutral-5')};
  text-align: center;
  user-select: none;
  border: 1px solid ${(props) => (props.hasError ? cssVariables('red-5') : cssVariables('neutral-3'))};
  background-repeat: no-repeat;
  background-position: center center;
  transition: all 0.2s ${transitionDefault};
  ${(props) => props.styles};
`;

const InputToggleInlineLabel = styled.span`
  font-size: 14px;
  color: ${cssVariables('neutral-10')};
`;

const InputToggleInlineDescription = styled.span`
  font-size: 14px;
  color: ${cssVariables('neutral-7')};
`;

const CheckboxBaseComponent: React.SFC<StyledProps> = ({ useDiv, showText, ...rest }) => {
  if (useDiv) {
    return <div {...rest} />;
  }
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  return <label {...rest} />;
};

const StyledCheckboxBase = styled(CheckboxBaseComponent)<StyledProps>`
  position: relative;
  display: ${(props) => props.display || 'inline-block'};
  padding-left: 14px;
  color: ${cssVariables('neutral-6')};
  cursor: pointer;
  vertical-align: middle;
  line-height: 1;
  font-weight: 500;
  margin-bottom: 6px;

  > input {
    position: absolute;
    z-index: -1;
    opacity: 0;
    &:checked {
      ~ ${InputIndicator} {
        color: ${cssVariables('purple-7')};
        border: 1px solid ${cssVariables('purple-7')};
      }
    }

    &:focus {
      ~ ${InputIndicator} {
        border: 1px solid ${cssVariables('purple-7')};
      }
    }
  }
  ${InputToggleInlineLabel} {
    padding-left: 10px;
    line-height: 1;
  }

  ${(props) => {
    if (props.types === 'radio') {
      return css`
        ${InputIndicator} {
          border-radius: 50%;
        }
        input {
          &:checked {
            ~ ${InputIndicator} {
              background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIHZpZXdCb3g9IjAgMCA4IDgiPiAgICA8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iNCIgZmlsbD0iIzc3NTZEOSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+);
            }
          }
          &[disabled] {
            ~ ${InputIndicator} {
              border: 1px solid ${cssVariables('neutral-3')};
              background-image: none;
              background-color: ${cssVariables('neutral-1')};
              color: ${cssVariables('neutral-5')};
            }
          }
          &[readonly] {
            ~ ${InputIndicator} {
              border: 1px solid ${cssVariables('neutral-3')};
              background-image: none;
              background-color: ${cssVariables('neutral-1')};
              color: ${cssVariables('neutral-5')};
            }
          }
        }
      `;
    }
    if (props.types === 'checkbox') {
      return css`
        ${props.label === ''
          ? css`
              width: 16px;
              height: 16px;
            `
          : css`
              padding-left: 16px;
            `};
        ${InputIndicator} {
          background-color: white;
          border-radius: 2px;
        }
        input {
          &:checked {
            ~ ${InputIndicator} {
              background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgMTAgOCI+ICAgIDxwYXRoIGZpbGw9IiM3NzU2RDkiIGZpbGwtcnVsZT0ibm9uemVybyIgZD0iTTkuMDQxIDBMMTAgLjk4OCAzLjE5MiA4IDAgNC43MTNsLjk1OS0uOTg4IDIuMjMzIDIuM3oiLz48L3N2Zz4=);
            }
          }
          &[disabled] {
            ~ ${InputIndicator} {
              border: 1px solid ${cssVariables('neutral-3')};
              background-image: none;
              background-color: ${cssVariables('neutral-1')};
              color: ${cssVariables('neutral-5')};
            }
          }
          &[readonly] {
            ~ ${InputIndicator} {
              border: 1px solid ${cssVariables('neutral-3')};
              background-image: none;
              background-color: ${cssVariables('neutral-1')};
              color: ${cssVariables('neutral-5')};
            }
          }
        }
      `;
    }
    if (props.types === 'checkboxSmall') {
      return css`
        ${InputIndicator} {
          background-color: white;
          border-radius: 1px;
        }
        input {
          &:checked {
            ~ ${InputIndicator} {
              background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3IiBoZWlnaHQ9IjUiIHZpZXdCb3g9IjAgMCA3IDUiPiAgICA8cGF0aCBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yLjc1NiAzLjY3TDYuMTAyLjE2YS41MDkuNTA5IDAgMCAxIC43NDQgMCAuNTcuNTcgMCAwIDEgMCAuNzhMMy4xMjggNC44MzlhLjUwOS41MDkgMCAwIDEtLjc0MyAwTC4xNTQgMi41YS41Ny41NyAwIDAgMSAwLS43OC41MDkuNTA5IDAgMCAxIC43NDQgMGwxLjg1OCAxLjk1eiIvPjwvc3ZnPg==);
              background-color: ${cssVariables('purple-7')};
            }
          }
          &[disabled] {
            ~ ${InputIndicator} {
              border: 2px solid ${cssVariables('neutral-5')};
              background-image: none;
              background-color: ${cssVariables('neutral-1')};
              color: ${cssVariables('neutral-5')};
            }
          }
          &[readonly] {
            ~ ${InputIndicator} {
              border: 3px solid ${cssVariables('neutral-5')};
              background-image: none;
              background-color: ${cssVariables('neutral-1')};
              color: ${cssVariables('neutral-5')};
            }
          }
        }
      `;
    }
    if (props.types === 'toggle') {
      return css`
        padding: 3px 0;
        margin-bottom: 0;

        &:after {
          position: absolute;
          top: 6px;
          left: 44px;
          font-size: 12px;
          transition: all 0.2s ${transitionDefault};
        }
        ${props.showText &&
        (props.checked
          ? css`
              &:after {
                content: 'ON';
                color: ${cssVariables('purple-7')};
              }
            `
          : css`
              &:after {
                content: 'OFF';
                color: ${cssVariables('neutral-6')};
              }
            `)}
        ${InputIndicator} {
          outline: 0;
          font-size: 16px;
          line-height: 16px;
          cursor: pointer;
          color: ${cssVariables('neutral-6')};
          width: 32px;
          position: relative;
          top: auto;
          left: auto;
          border: none;
          &:hover {
            &:before {
              background-color: ${cssVariables('neutral-5')};
            }
          }
          &:before {
            display: block;
            position: absolute;
            content: '';
            border: none !important;
            top: 0;
            left: 0;
            background-color: ${cssVariables('neutral-5')};
            width: 32px;
            height: 16px;
            transform: none;
            border-radius: 500rem;
            transition: background-color 0.2s ${transitionDefault};
          }
          &:after {
            background: white;
            position: absolute;
            content: '' !important;
            opacity: 1;
            border: none;
            width: 14px;
            height: 14px;
            top: 1px;
            left: 1px;
            transform: none;
            border-radius: 50%;
            transition: left 0.2s ${transitionDefault};
          }
        }
        input {
          &:checked {
            ~ ${InputIndicator} {
              border: none;
              &:hover {
                &:before {
                  background-color: ${colors_old.primary.purple.dark};
                }
              }
              &:before {
                background-color: ${cssVariables('purple-7')};
              }
              &:after {
                left: 17px;
              }
            }
          }
        }
      `;
    }
    return '';
  }};
  ${(props) => props.styles};
`;

const InputToggle: React.SFC<any> = ({
  checked,
  showText = false,
  disabled,
  useDiv,
  children,
  styles,
  onChange,
  onClick,
  ref,
  ...rest
}) => {
  return (
    <StyledCheckboxBase checked={checked} styles={styles && styles.InputToggle} showText={showText} types="toggle">
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={onChange}
        onClick={onClick}
        disabled={disabled}
        {...rest}
      />
      <InputIndicator styles={styles && styles.Indicator} />
      {children}
    </StyledCheckboxBase>
  );
};

const InputCheckbox: React.SFC<{
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  refHandler?:
    | ((instance: HTMLInputElement | null) => void)
    | React.RefObject<HTMLInputElement>
    | React.MutableRefObject<HTMLInputElement | undefined>;
  [key: string]: any;
}> = ({
  styles,
  types,
  checked,
  onChange = () => {},
  onClick,
  disabled,
  display,
  useDiv,
  label = '',
  description,
  refHandler,
  hasError = false,
  ...rest
}) => {
  const handleOnClick = (e) => {
    if (onClick) {
      onClick();
      e.preventDefault();
    }
  };
  return (
    <StyledCheckboxBase
      types={types || 'checkbox'}
      styles={styles}
      useDiv={useDiv}
      display={display}
      onClick={handleOnClick}
      label={label}
    >
      <input
        ref={refHandler as any}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...rest}
      />
      <InputIndicator hasError={hasError} />
      <InputToggleInlineLabel>{label}</InputToggleInlineLabel>
      {description ? <InputToggleInlineDescription>{description}</InputToggleInlineDescription> : ''}
    </StyledCheckboxBase>
  );
};

const InputRadio: React.SFC<any> = ({
  styles,
  checked,
  onChange,
  onClick,
  disabled,
  display,
  useDiv,
  name,
  children,
  label = '',
  description = '',
  ref = () => {},
  ...rest
}) => {
  const handleOnClick = (e) => {
    if (onClick) {
      onClick();
      e.preventDefault();
    }
  };
  return (
    <StyledCheckboxBase types="radio" styles={styles} useDiv={useDiv} display={display} onClick={handleOnClick}>
      <input ref={ref} type="radio" name={name} checked={checked} onChange={onChange} disabled={disabled} {...rest} />
      <InputIndicator />
      <InputToggleInlineLabel>{label}</InputToggleInlineLabel>
      {description ? <InputToggleInlineDescription>{description}</InputToggleInlineDescription> : ''}
    </StyledCheckboxBase>
  );
};

export {
  BasicInput,
  SmallInput,
  MediumInput,
  LargeInput,
  SystemInput,
  LargeSystemInput,
  BasicTextarea,
  InputToggle,
  InputToggleInlineLabel,
  InputIndicator,
  InputCheckbox,
  InputRadio,
  StyledCheckboxBase,
};

export * from './inputError';
