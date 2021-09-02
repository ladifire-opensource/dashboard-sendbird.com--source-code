import React, { useState, useRef, useEffect, useCallback } from 'react';

import styled, { SimpleInterpolation } from 'styled-components';

import { cssVariables, transitionDefault, Headings, Body, TooltipTargetIcon, ContextualHelp } from 'feather';

import { media } from '@ui';

import { MessageSuccess } from './messageSuccess';

export enum ValidationListLayoutEnum {
  COLUMN = 'COLUMN',
  ROW = 'ROW',
}

const Container = styled.div<ContainerProps>`
  position: relative;
  ${(props) => props.styles};
`;

const Label = styled.div<{ show: boolean }>`
  font-size: 11px;
  font-weight: 600;
  line-height: 12px;
  letter-spacing: 0.25px;
  color: ${cssVariables('neutral-6')};
  opacity: ${(props) => (props.show ? 1 : 0)};
  height: ${(props) => (props.show ? 'auto' : 0)};
  margin-top: ${(props) => (props.show ? 16 : 0)}px;
`;

const Validation = styled.ul<ValidationProps>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: wrap;
  position: relative;
  margin-left: 4px;
  margin-top: ${(props) => (props.show || props.validPassword ? 8 : 0)}px;
  height: ${(props) => (props.show || props.validPassword ? props.height : 0)}px;
  transition: padding 0.3s ${transitionDefault}, height 0.3s ${transitionDefault};
  will-change: padding, height;
  overflow: hidden;
  ${(props) => !props.show && 'pointer-events: none;'}
  ${(props) => props.styles};
`;

const Checklist = styled.li<ChecklistProps>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 22px;
  padding: 2px 0;
  list-style: none;
  font-size: 14px;
  line-height: 1.3;
  color: ${(props) => (props.valid ? cssVariables('neutral-5') : cssVariables('neutral-8'))};
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: color 0.1s ${transitionDefault} opacity 0.2s ${transitionDefault};

  &::before {
    content: '';
    display: inline-block;
    margin-right: 12px;
    width: 8px;
    height: 8px;
    border-radius: 8px;
    background: ${(props) => (props.valid ? cssVariables('neutral-3') : cssVariables('purple-7'))};
    transition: background 0.1s ${transitionDefault};
    will-change: background;
  }

  ${media.MOBILE_LARGE`
    width: 100%;
  `}

  ${(props) => props.styles};
`;

const TooltipTitle = styled.div`
  ${Headings['heading-01']};
  color: ${cssVariables('neutral-10')};
  margin-bottom: 4px;
`;

const TooltipContent = styled.div`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-10')};
`;

interface ChecklistProps {
  valid: boolean;
  show: ValidProps['show'];
  styles: ValidProps['styles'];
}

interface isValid {
  (regex: string): boolean;
}

type Check = {
  regex: string;
  text: string;
  tooltip?: {
    title?: string;
    content?: string;
  };
};

type ValidType = boolean;

type ValidProps = {
  innerRef: React.RefObject<HTMLLIElement>;
  valid: ValidType;
  show: boolean;
  text: Check['text'];
  tooltip?: Check['tooltip'];
  styles: SimpleInterpolation;
};

type ValidationProps = {
  show: State['show'];
  validPassword: boolean;
  height: number;
  styles: SimpleInterpolation;
};

type ContainerProps = {
  styles: SimpleInterpolation;
};

interface ParentValidationPayload {
  name: string;
  passwordValidation: boolean;
}

type Props = {
  password: string;
  focused: boolean;
  fieldName?: string;
  hasError?: FormError['hasError'];
  styles?: {
    CONTAINER?: SimpleInterpolation;
    VALIDATION?: SimpleInterpolation;
    VALIDATION_LIST?: SimpleInterpolation;
  };
  handleChange?: (paylod: ParentValidationPayload) => void;
};

type State = {
  show: boolean;
  valids: Array<ValidType>;
};

export const PASSWORD_VALIDATION_REGEXS: Array<Check> = [
  {
    regex: '^.{8,}$',
    text: '8 or more characters',
  },
  {
    regex: '.*[0-9].*',
    text: 'At least 1 number',
  },
  {
    regex: '(?=.*[a-z])',
    text: 'At least 1 lowercase letter',
  },
  {
    regex: '(?=.*[-+(){|}\\]\\[\\\\<=>/_~\'":;`!@#$%^&*.,?])',
    text: 'At least 1 special character',
    tooltip: {
      title: 'Allowed characters:',
      content: "!\"# $%&'()*+,-./:;<=>?@[\\]^_`{|}~'",
    },
  },
  {
    regex: '(?=.*[A-Z])',
    text: 'At least 1 uppercase letter',
  },
];

export const Valid: React.FC<ValidProps> = React.memo(({ innerRef, valid, show, text, styles, tooltip }) => {
  return (
    <>
      <Checklist ref={innerRef} show={show} valid={valid} styles={styles} data-test-id="PasswordValidationChecklist">
        {text}
        {tooltip && (
          <ContextualHelp
            content={
              <>
                {tooltip.title && <TooltipTitle>{tooltip.title}</TooltipTitle>}
                <TooltipContent>{tooltip.content}</TooltipContent>
              </>
            }
          >
            <TooltipTargetIcon icon="info" size={16} />
          </ContextualHelp>
        )}
      </Checklist>
    </>
  );
});

export const PasswordValidation: React.FC<Props> = React.memo(
  ({ password, focused, fieldName, hasError, styles = {}, handleChange }) => {
    const validationRefs = useRef<React.RefObject<HTMLLIElement>[]>([]);
    const initialValids: Array<boolean> = [];
    for (let i = 0; i < PASSWORD_VALIDATION_REGEXS.length; i++) {
      validationRefs.current.push(React.createRef());
      initialValids.push(false);
    }

    const [show, setShow] = useState(false);
    const [valids, setValids] = useState(initialValids);
    const isFirstRun = useRef(true);

    const checkValidation = useCallback(() => {
      const nextValids = [...valids];
      PASSWORD_VALIDATION_REGEXS.forEach(({ regex }, index) => {
        const nextValid = new RegExp(regex).test(password);
        nextValids[index] = nextValid;
        const nextShow = (password.trim() !== '' || focused) && !nextValids.every((valid) => valid);

        if (valids[index] !== nextValid || show !== nextShow) {
          setShow(nextShow);
          setValids(nextValids);
        }
      });
    }, [focused, password, show, valids]);

    const updateValidation = useCallback(() => {
      handleChange &&
        handleChange({
          name: fieldName || 'password',
          passwordValidation: valids.every((valid) => valid),
        });
    }, [fieldName, handleChange, valids]);

    useEffect(() => {
      if (isFirstRun.current) {
        // bypass validation on first run
        isFirstRun.current = false;
        return;
      }
      updateValidation();
    }, [updateValidation]);

    useEffect(() => {
      checkValidation();
    }, [password, focused, checkValidation]);

    const isValid: isValid = (regex) => {
      return new RegExp(regex).test(password);
    };

    const validPassword = valids.every((valid) => valid);
    const height = (() => {
      if (!hasError && validPassword) {
        return 0;
      }
      if (validationRefs.current[validationRefs.current.length - 1] == null) {
        return 0;
      }
      return validationRefs.current
        .filter((ref) => !!ref.current)
        .map((ref) => ref.current as HTMLLIElement)
        .reduce((acc, curr) => {
          return acc + curr.offsetHeight;
        }, 0);
    })();

    return (
      <Container styles={styles.CONTAINER}>
        <Label show={show}>PASSWORD MUST CONTAIN:</Label>
        <Validation show={show} validPassword={validPassword && !hasError} height={height} styles={styles.VALIDATION}>
          {PASSWORD_VALIDATION_REGEXS.map((check, index) => (
            <Valid
              key={`password-validation-${index}`}
              innerRef={validationRefs.current[index]}
              show={show && !validPassword}
              valid={isValid(check.regex)}
              text={check.text}
              tooltip={check.tooltip}
              styles={styles.VALIDATION_LIST}
            />
          ))}
        </Validation>
        <MessageSuccess show={!hasError && validPassword} message="Your new password is secure and you're all set!" />
      </Container>
    );
  },
);
