import React from 'react';

import styled, { css, SimpleInterpolation } from 'styled-components';

import { Icon, cssVariables, transitionDefault } from 'feather';

import { StyledProps, media } from '@ui';

import { SystemInput, LargeSystemInput, BasicTextarea } from '../input';

const BasicInputText = styled(SystemInput)`
  position: relative;
  z-index: 30;
  border-radius: 4px;

  ${(props) => (props.styles ? props.styles : null)};
`;

const LargeInputText = styled(LargeSystemInput)`
  position: relative;
  z-index: 30;
  border-radius: 4px;

  ${(props) => (props.styles ? props.styles : null)};
`;

const InputTextarea = styled(BasicTextarea)`
  position: relative;
  z-index: 30;
  border-radius: 4px;

  &::placeholder {
    opacity: 0.5;
  }

  ${(props) => (props.styles ? props.styles : null)};
`;

const FormField = styled.div`
  position: relative;
`;

const FormLabel = styled.label<{ styles: SimpleInterpolation; disabled?: boolean }>`
  display: flex;
  align-items: center;
  text-align: left;
  color: ${cssVariables('neutral-10')};
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 6px;

  ${(props) =>
    props.disabled
      ? css`
          color: ${cssVariables('neutral-5')};
        `
      : ''}

  ${(props) => (props.styles ? props.styles : null)};
`;

const FormGroup = styled.div<StyledProps>`
  ${(props) =>
    props.layout === 'ROW'
      ? css`
          display: flex;
          flex-direction: row;
          align-items: center;

          ${FormLabel} {
            margin-bottom: 0;
          }

          ${FormField} {
            flex: 1;
          }
        `
      : null};
  ${(props) => (props.styles ? props.styles : null)};
`;

const FormSet = styled.div<StyledProps>`
  position: relative;
  text-align: left;

  & + & {
    margin-top: 20px;
  }

  ${(props) =>
    props.isHalf
      ? css`
          display: inline-block;
          width: 48.5%;
          max-width: 222px;
          vertical-align: top;

          ${media.MOBILE_LARGE`
            padding-top: 0;
            max-width: none;
          `}

          &:nth-child(2) {
            margin-top: 0 !important;
            margin-left: 3%;

            ${FormLabel} {
              visibility: hidden;
            }
          }
        `
      : null};

  ${(props) =>
    props.hasError
      ? css`
          ${BasicInputText},
          ${LargeInputText} {
            border-color: ${cssVariables('red-5')};
          }
          ${InputTextarea} {
            border-color: ${cssVariables('red-5')};
          }
          .Select-control {
            border-color: ${cssVariables('red-5')};
          }
        `
      : null};

  ${(props) => (props.styles ? props.styles : null)};
`;

const RequiredAsterisks = styled.span<StyledProps>`
  color: ${cssVariables('red-5')};
  ${(props) => (props.styles ? props.styles : null)};
`;

const AssitiveText = styled.div`
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.7;
  color: ${cssVariables('neutral-5')};
`;

const ErrorMessageText = styled.p<StyledProps>`
  font-size: 12px;
  line-height: 1.33;
  color: ${cssVariables('red-5')};

  ${(props) => (props.styles ? props.styles : null)};
`;

const ErrorMessageContainer = styled.div<StyledProps & ErrorMessageProps>`
  height: ${(props) => (props.error && props.error.hasError ? props.errorHeight : 0)}px;
  text-align: left;
  opacity: ${(props) => (props.error && props.error.hasError ? 1 : 0)};
  transform: translateY(${(props) => (props.error && props.error.hasError ? 0 : -12)}px);
  transition: height 0.3s ${transitionDefault}, opacity 0.3s ${transitionDefault}, transform 0.3s ${transitionDefault};
  will-change: height, opacity, transform;

  ${(props) => (props.styles ? props.styles : null)};

  ${(props) =>
    props.hasError &&
    css`
      padding-top: 4px;
      ${ErrorMessageText} {
        padding: 4px 0;
      }
    `}
`;

export enum FormInputSize {
  LARGE,
  MEDIUM,
  SMALL,
  BASIC,
}

type InputLabelProps = {
  label?: string;
  labelFor?: string;
  labelComponent?: React.ReactElement<any>;
  required?: boolean;
  showAsterisks?: boolean;
};

type InputSelectProps = {
  options?: Array<any>;
  unselectedLabel?: string;
  selectedOption?: any;
  defaultMenuIsOpen?: boolean;
};

type AssitiveProps = {
  assistiveText?: string;
};

type CommonProps = {
  innerRef?: React.RefObject<HTMLElement> | React.MutableRefObject<HTMLElement | undefined>;
  label?: string;
  size?: FormInputSize;
  showValidIcon?: boolean;
  layout?: 'ROW' | 'COLUMN';
  styles?: {
    FORM_SET?: SimpleInterpolation;
    FORM_GROUP?: SimpleInterpolation;
    INPUT_TEXT?: SimpleInterpolation;
    INPUT_TEXTAREA?: SimpleInterpolation;
    INPUT_SELECT?: SimpleInterpolation;
    LABEL?: SimpleInterpolation;
    LABEL_ASTERISKS?: SimpleInterpolation;
    ERROR_MESSAGE_CONTAINER?: SimpleInterpolation;
    ERROR_MESSAGE_TEXT?: SimpleInterpolation;
  };
  customComponent?: any;
  indicatorIcon?: string;
};

type ErrorMessageProps = {
  error?: FormError;
  errorRef?: React.RefObject<HTMLParagraphElement>;
  errorHeight?: number;
  hasError?: boolean;
};

type Props = React.InputHTMLAttributes<HTMLInputElement> &
  CommonProps &
  InputLabelProps &
  InputSelectProps &
  AssitiveProps &
  ErrorMessageProps;

type State = {
  errorHeight: number;
};

const Label: React.FC<CommonProps & InputLabelProps & { disabled?: boolean }> = ({
  labelFor,
  label,
  labelComponent,
  required = false,
  showAsterisks = false,
  disabled = false,
  styles = {},
}) => {
  return (
    <FormLabel htmlFor={labelFor} disabled={disabled} styles={styles.LABEL}>
      {label}
      {required && showAsterisks ? <RequiredAsterisks styles={styles.LABEL_ASTERISKS}>&nbsp;*</RequiredAsterisks> : ''}
      {labelComponent}
    </FormLabel>
  );
};

const ErrorMessage: React.FC<CommonProps & ErrorMessageProps> = ({
  error,
  errorRef,
  errorHeight,
  hasError,
  label,
  styles = {},
}) => {
  return (
    <ErrorMessageContainer
      errorHeight={errorHeight}
      error={error}
      styles={styles.ERROR_MESSAGE_CONTAINER}
      hasError={hasError}
    >
      <ErrorMessageText ref={errorRef} styles={styles.ERROR_MESSAGE_TEXT}>
        {error && error.message ? error.message : `${label || 'This field'} is required.`}
      </ErrorMessageText>
    </ErrorMessageContainer>
  );
};

export const Inputs: React.FC<Props> = ({
  innerRef,
  type,
  id,
  size = FormInputSize.BASIC,
  unselectedLabel,
  selectedOption,
  styles = {},
  ...restProps
}) => {
  if (type === 'text' || type === 'password') {
    if (size === FormInputSize.LARGE) {
      return <LargeInputText ref={innerRef} type={type} id={id} styles={styles.INPUT_TEXT} {...restProps} />;
    }
    return <BasicInputText ref={innerRef} type={type} id={id} styles={styles.INPUT_TEXT} {...restProps} />;
  }
  if (type === 'textarea') {
    return <InputTextarea ref={innerRef} type={type} id={id} styles={styles.INPUT_TEXTAREA} {...restProps} />;
  }
  return null;
};

const defaultLabels = { firstname: 'Name', lastname: ' ' };

export class FormInput extends React.Component<Props, State> {
  private errorRef = React.createRef<HTMLParagraphElement>();
  private formFieldRef = React.createRef<HTMLDivElement>();

  public state = {
    errorHeight: this.props.errorHeight || 0,
  };

  public shouldComponentUpdate(nextProps, nextState) {
    if (
      this.props.type !== nextProps.type ||
      this.props.value !== nextProps.value ||
      this.props.defaultValue !== nextProps.defaultValue ||
      (this.props.error &&
        (this.props.error.hasError !== nextProps.error.hasError ||
          nextProps.error.message !== this.props.error.message)) ||
      nextProps.disabled !== this.props.disabled ||
      nextProps.children !== this.props.children ||
      nextState.errorHeight !== this.state.errorHeight ||
      nextProps.styles !== this.props.styles ||
      nextProps.selectedOption !== this.props.selectedOption
    ) {
      return true;
    }
    return false;
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.error !== prevProps.error) {
      this.setState({
        errorHeight: (this.errorRef.current && this.errorRef.current.offsetHeight) || 0,
      });
    }
  }

  public render() {
    const {
      innerRef,
      type,
      size,
      id = '',
      label,
      labelComponent,
      options,
      hidden = false,
      required = false,
      disabled = false,
      showValidIcon = false,
      showAsterisks,
      assistiveText,
      error = {
        hasError: false,
        message: '',
      },
      layout = '',
      customComponent,
      styles = {
        FORM_SET: css``,
        FORM_GROUP: css``,
        INPUT_TEXT: css``,
        INPUT_TEXTAREA: css``,
        INPUT_SELECT: css``,
        LABEL: css``,
        LABEL_ASTERISKS: css``,
        ERROR_MESSAGE_CONTAINER: css``,
        ERROR_MESSAGE_TEXT: css``,
      },
      children,
      ...restProps
    } = this.props;

    const { name } = restProps;
    const formId = id || name || '';
    const isHalf = name === 'firstname' || name === 'lastname';

    const labelText = label || (name && defaultLabels[name]) || '';
    if (hidden) return null;
    return (
      <FormSet styles={styles.FORM_SET} hasError={error.hasError} isHalf={isHalf}>
        <FormGroup layout={layout} styles={styles.FORM_GROUP}>
          {label && (
            <Label
              label={labelText}
              labelFor={id}
              labelComponent={labelComponent}
              disabled={disabled}
              showAsterisks={showAsterisks}
              required={required}
              styles={styles}
            />
          )}
          <FormField ref={this.formFieldRef}>
            <Inputs
              innerRef={innerRef}
              id={formId}
              type={type}
              size={size}
              options={options}
              error={error}
              styles={styles}
              disabled={disabled}
              {...restProps}
            />
            {type === 'text' || type === 'password' ? (
              <Icon
                icon="done"
                size={20}
                color={cssVariables('purple-6')}
                css={css`
                  display: block;
                  position: absolute;
                  top: ${this.formFieldRef && this.formFieldRef.current
                    ? (this.formFieldRef.current.offsetHeight - 20) / 2 - 1
                    : 0}px;
                  right: 12px;
                  z-index: 40;
                  margin: auto;
                  opacity: ${showValidIcon && !error.hasError ? 1 : 0};
                  transform: translate(${showValidIcon && !error.hasError ? 0 : 12}px);
                  transition: transform 0.3s ${transitionDefault}, opacity 0.3s ${transitionDefault};
                  will-change: transform, opacity;
                `}
              />
            ) : null}
            {customComponent}
          </FormField>
        </FormGroup>
        <ErrorMessage
          error={error}
          errorRef={this.errorRef}
          errorHeight={this.state.errorHeight}
          styles={styles}
          hasError={error.hasError}
        />
        {assistiveText ? <AssitiveText>{assistiveText}</AssitiveText> : null}
        {children}
      </FormSet>
    );
  }
}
