import React from 'react';

import styled from 'styled-components';

import { sanitize } from 'dompurify';
import { cssVariables, Icon } from 'feather';

import { transitionDefault } from '@ui/styles';

// component props & state types
type Props = {
  value: string;
  disabled?: boolean;
  selected?: boolean;
  editable?: boolean;
  hasError?: boolean;
  onBeginEditing?: () => void;
  onEndEditing?: (value: string) => void;
  onDelete?: (event: React.KeyboardEvent | React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onDragEnd?: (e: React.MouseEvent) => void;
  onDragOver?: (e: React.MouseEvent) => void;
  onDragLeave?: (e: React.MouseEvent) => void;
  className?: string;
  innerRef?: React.Ref<HTMLDivElement>;
};

type State = {
  isDragging: boolean;
  isEditing: boolean;
};

const ContentEditable = styled.span`
  height: 24px;
  line-height: 24px;
  outline: 0;
  vertical-align: top;
  max-width: none !important;
`;

const transition = `0.2s ${transitionDefault}`;

const ChipContainer = styled.div<{
  disabled?: boolean;
  hasError?: boolean;
  isDragging?: boolean;
}>`
  position: relative;
  display: block;
  background-color: #edf1f9;
  border-radius: 12px;
  height: 24px;
  padding: 0 24px 0 12px;
  font-size: 12px;
  color: ${(props) => (props.disabled ? '#a3a8c4' : '#212342')};
  line-height: 22px;
  cursor: pointer;
  outline: 0;
  border: 1px transparent solid;
  transition: color ${transition}, border ${transition}, background-color ${transition};

  &:hover {
    background-color: #e1e6f2;
  }

  &[aria-selected='true'] {
    background-color: #e1e6f2;
    border: 1px #ccd1e6 solid;
  }

  &:focus {
    background-color: #e1e6f2;
    border: 1px #a3a8c4 solid;
  }

  &:active {
    background-color: #ccd1e6;
    border: 1px transparent solid;
  }

  ${(props) =>
    props.isDragging &&
    `
  background-color: #e1e6f2;
  border: 1px transparent solid !important;
  cursor: move;
  cursor: grabbing;
  `}

  ${(props) =>
    props.hasError &&
    `
  background-color: #f24d6b !important;
  color: white !important;
  border: 1px transparent solid !important;
  `}

  ${(props) => props.disabled && 'pointer-events: none;'}
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 1px;
  right: 4px;
  width: 20px;
  height: 20px;
  border: 0;
  outline: 0;
  background: transparent;
  cursor: pointer;
`;

// components
class ChipComponent extends React.PureComponent<Props, State> {
  private contentEditableRef: React.RefObject<HTMLSpanElement> = React.createRef();

  public state: State = {
    isDragging: false,
    isEditing: false,
  };

  public componentDidUpdate() {
    if (this.state.isEditing && this.contentEditableRef.current) {
      this.contentEditableRef.current.focus();
    }
  }

  private onContentEditableKeyDown = (e: React.KeyboardEvent) => {
    if (!this.contentEditableRef.current) {
      return;
    }

    const isEscapePressed = e.keyCode === 27;
    if (this.state.isEditing && (e.key === 'Enter' || isEscapePressed)) {
      this.endEditing();
    }
  };

  private onContentEditableBlur = () => this.endEditing();

  private onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (this.props.editable && this.props.hasError) {
      return this.beginEditing();
    }
    if (!this.state.isEditing && this.props.onClick) {
      this.props.onClick(e);
    }
  };

  private onDoubleClick = () => {
    if (this.props.editable) {
      this.beginEditing();
    }
  };

  private onDragStart = (e) => {
    this.setState({ isDragging: true });
    this.props.onDragStart && this.props.onDragStart(e);
  };

  private onDragEnd = (e) => {
    this.setState({ isDragging: false });
    this.props.onDragEnd && this.props.onDragEnd(e);
  };

  private onDragOver = (e) => {
    this.props.onDragOver && this.props.onDragOver(e);
  };

  private onDragLeave = (e: React.MouseEvent) => this.props.onDragLeave && this.props.onDragLeave(e);

  private onKeyDown = (e: React.KeyboardEvent) => {
    if (this.props.onDelete && ['Backspace', 'Delete'].includes(e.key)) {
      e.persist();
      e.preventDefault();
      this.props.onDelete(e);
    }
    if (this.props.onKeyDown) {
      e.persist();
      this.props.onKeyDown(e);
    }
  };

  private onDeleteButtonClick = (e: React.MouseEvent) => {
    if (this.props.onDelete) {
      e.persist();
      this.props.onDelete(e);
    }
  };

  private beginEditing = () => {
    this.setState({ isEditing: true });
    this.props.onBeginEditing && this.props.onBeginEditing();
  };

  private endEditing = () => {
    this.setState({ isEditing: false });

    if (!this.contentEditableRef.current) {
      return;
    }
    const html = sanitize(this.contentEditableRef.current.innerHTML);
    this.props.onEndEditing && this.props.onEndEditing(html);
  };

  public render() {
    const { value, disabled = false, selected = false, hasError = false, innerRef, className } = this.props;
    const { isDragging, isEditing } = this.state;

    if (isEditing) {
      return (
        <ContentEditable
          ref={this.contentEditableRef}
          className={className}
          dangerouslySetInnerHTML={{ __html: sanitize(this.props.value) }}
          contentEditable={true}
          onBlur={this.onContentEditableBlur}
          onKeyDown={this.onContentEditableKeyDown}
          onClick={this.onClick}
        />
      );
    }

    return (
      <ChipContainer
        ref={innerRef}
        draggable={true}
        isDragging={isDragging}
        disabled={disabled}
        aria-selected={selected ? 'true' : 'false'}
        hasError={hasError}
        className={className}
        tabIndex={0}
        onDragStart={this.onDragStart}
        onDragEnd={this.onDragEnd}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onKeyDown={this.onKeyDown}
        onClick={this.onClick}
        onDoubleClick={this.onDoubleClick}
      >
        {value}
        <DeleteButton onClick={this.onDeleteButtonClick}>
          <Icon icon="close" size={12} color={hasError ? 'white' : cssVariables('neutral-10')} />
        </DeleteButton>
      </ChipContainer>
    );
  }
}

export const Chip = React.forwardRef((props: Props, ref: React.RefObject<HTMLDivElement>) => (
  <ChipComponent {...props} innerRef={ref} />
));
