import React from 'react';

import styled from 'styled-components';

import { cssVariables, transitionDefault } from 'feather';

import { StyledProps } from '@ui';

import { Chip } from '../chip';

type UndoHistory = {
  chips: ChipItem[];
  textInputValue: string;
};

type ChipItem = {
  value: string;
  createdAt: Date;
};

const makeChip = (value: string): ChipItem => {
  return { value, createdAt: new Date() };
};

// component props & state types
type Props = {
  multiline?: boolean;
  placeholder?: string;
  values?: ReadonlyArray<string>;
  readonly?: boolean;
  disabled?: boolean;
  className?: string;
  validator?: (value: string) => boolean;
  onClick?: (e: React.MouseEvent) => void;
  onChange?: (values: string[]) => void;
  onPaste?: (e: Event) => void;
  onFocus?: (e: Event) => void;
  onBlur?: (e: Event) => void;
};

type State = {
  chips: ChipItem[];
  textInputValue: string;
  textInputWidth: string;
  isTextInputFocused: boolean;
  draggedIndex?: number;
  fakeCursorPosition?: number;
  isEditingChip: boolean;
};

// styled
const chipSpacing = 4;
const inputHorizontalPadding = 12;

const Container = styled.div<
  StyledProps & {
    readOnly: boolean;
    disabled?: boolean;
    isTextInputFocused?: boolean;
    multiline?: boolean;
  }
>`
  width: 100%;
  padding: 0 ${inputHorizontalPadding}px;

  border-radius: 4px;
  border: 1px #ccd2e0 solid;
  outline: 0;

  font-size: 14px;
  line-height: ${(props) => (props.readOnly ? '1.5' : 'inherit')};
  background-color: ${(props) => (props.readOnly ? cssVariables('neutral-1') : null)};
  padding-top: ${(props) => (props.readOnly ? 8 : 4)}px;
  padding-bottom: ${(props) => (props.readOnly ? '8px' : 0)};

  ${(props) =>
    props.multiline
      ? `
    min-height: 40px;
    resize: none;
    `
      : `
    height: 40px;
    white-space: nowrap;
    overflow-x: scroll;
    overflow-y: hidden;
    -ms-overflow-style: none;
  ::-webkit-scrollbar { 
    display: none; 
  }`}

  transition: border 0.25s ${transitionDefault};

  &:focus {
    outline: none;
    border: 1px solid ${cssVariables('purple-7')};
  }

  ${(props) =>
    props.isTextInputFocused &&
    `
    border: 1px solid ${cssVariables('purple-7')};
  `}

  &:disabled {
    background: ${cssVariables('neutral-1')};
    border: 1px solid ${cssVariables('neutral-3')};
  }

  ${(props) => props.disabled && 'pointer-events: none;'}
  ${(props) => props.styles}

  & > * {
    vertical-align: middle;
  }
`;

const TextInput = styled.input<{ width?: string }>`
  display: inline-block;
  min-width: 60px;
  width: ${(props) => props.width};
  height: 36px;
  vertical-align: top;

  color: #212342;
  font-size: 12px;
  line-height: 24px;

  border: 0;
  outline: 0;
  resize: none;
  overflow-x: hidden;
  white-space: nowrap;
  margin: 0;
  padding: 4px 0 8px 0;
  -webkit-appearance: none;
`;

const HiddenTextInput = styled(TextInput)`
  position: fixed;
  top: 0;
  left: 0;
  width: auto;
  overflow: auto;
  min-width: initial;
  visibility: hidden;
`;

const FakeCursor = styled.div`
  display: inline-block;
  width: 2px;
  height: 18px;
  background-color: ${cssVariables('purple-7')};
`;

const MaxWidthChip = styled(Chip)`
  display: inline-block;
  margin-top: 4px;
  margin-bottom: 4px;
  margin-right: ${chipSpacing}px;
  max-width: 360px;
  overflow-x: hidden;
  text-overflow: ellipsis;
`;

const isUndoKeyEvent = (e: React.KeyboardEvent) =>
  (window.navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z';

const isRedoKeyEvent = (e: React.KeyboardEvent) =>
  window.navigator.platform.match('Mac')
    ? e.metaKey && e.shiftKey && e.key.toLowerCase() === 'z'
    : e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'y';

// components
export class ChipInput extends React.PureComponent<Props, State> {
  private containerRef: React.RefObject<HTMLDivElement> = React.createRef();
  private textInputRef: HTMLInputElement;
  private hiddenTextDivRef: React.RefObject<HTMLDivElement> = React.createRef();
  private chipRefs: HTMLDivElement[] = Array(this.props.values ? this.props.values.length : 0);

  private undoHistory: UndoHistory[] = [
    {
      chips: this.props.values ? this.props.values.map(makeChip) : [],
      textInputValue: '',
    },
  ];
  private undoHistoryCurrentIndex: number = 0;
  private pushTextInputHistoryTimeout: number;

  private get validator(): (value: string) => boolean {
    return this.props.validator || (() => true);
  }

  private get nextValues() {
    const newValues = this.state.textInputValue
      .trim()
      .split(',')
      .filter((v) => v); // not empty
    return [...this.state.chips.map((chip) => chip.value), ...newValues];
  }

  public state: State = {
    chips: this.props.values ? this.props.values.map(makeChip) : [],
    textInputValue: '',
    textInputWidth: '0',
    isTextInputFocused: false,
    isEditingChip: false,
  };

  public componentDidMount() {
    document.addEventListener('mousedown', this.handleOutsideClick);
    this.calculateTextInputWidth();
  }

  public componentDidUpdate(prevProps, prevState) {
    const { readonly } = this.props;
    const { chips, textInputValue } = this.state;
    if (prevState.chips !== chips || prevState.textInputValue !== textInputValue || (prevProps.readonly && !readonly)) {
      this.calculateTextInputWidth();
    }

    // focus on editing
    if (prevProps.readonly && !readonly && this.textInputRef) {
      this.textInputRef.focus();
    }

    if (prevProps.readonly !== readonly) {
      this.resetValues(this.props.values as string[]);
    }
  }

  public componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleOutsideClick);
    if (this.textInputRef) {
      this.textInputRef.removeEventListener('paste', this.onTextInputPaste);
    }
  }

  public handleOutsideClick = (e: MouseEvent) => {
    if (!this.state.isTextInputFocused) {
      return;
    }

    const target = e.target as Element;
    const clickable = ['BUTTON', 'INPUT'].includes(target?.nodeName);
    const isOutside = !this.containerRef.current?.contains(target);

    if (target && !clickable && isOutside) {
      this.onTextInputBlur(e);
    }
  };

  public resetValues = (values: string[] = []) => {
    this.setState({
      chips: values.filter(this.validator).map(makeChip),
      textInputValue: '',
    });
  };

  private onTextInputChange = (e) =>
    this.setState({ textInputValue: e.target.value }, () => {
      this.props.onChange && this.props.onChange(this.nextValues);
    });

  private onTextInputKeyPress = (e) => {
    if (['Enter', ','].includes(e.key)) {
      e.preventDefault();
      this.tokenizeTextInputContent();
    }
  };

  private onTextInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (this.pushTextInputHistoryTimeout) {
      clearTimeout(this.pushTextInputHistoryTimeout);
    }
    if (!e.metaKey && !e.ctrlKey) {
      this.pushTextInputHistoryTimeout = window.setTimeout(this.inputKeyDownPauseCallback, 500);
    }

    if (e.key === 'Tab' && e.currentTarget.value.trim()) {
      e.preventDefault();
      this.tokenizeTextInputContent();
      return;
    }

    const shouldManipulateChips =
      !this.state.textInputValue && this.chipRefs.length && ['Backspace', 'ArrowLeft'].includes(e.key);

    if (shouldManipulateChips) {
      e.preventDefault();
      if (e.key === 'Backspace') {
        this.setState(
          {
            chips: this.state.chips.slice(0, this.state.chips.length - 1),
          },
          this.onValuesChanged,
        );
      } else if (e.key === 'ArrowLeft') {
        const lastChip = this.chipRefs[this.chipRefs.length - 1];
        lastChip && lastChip.focus();
      }
    } else if (isUndoKeyEvent(e)) {
      e.preventDefault(); // prevent default undo action
      this.undo();
    } else if (isRedoKeyEvent(e)) {
      e.preventDefault(); // prevent default redo action
      this.redo();
    }
  };

  private onTextInputPaste = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const clipboardData = e.clipboardData.getData('text');
    const tokens: string[] = clipboardData
      .split(/[,\s]/)
      .map((item) => item.trim())
      .filter((item) => item);

    if (tokens.length === 0) {
      return;
    }

    const lastToken = tokens[tokens.length - 1];
    let updater;
    if (this.validator(lastToken)) {
      updater = { chips: [...this.state.chips, ...tokens.map(makeChip)] };
    } else {
      updater = {
        chips: [...this.state.chips, ...tokens.slice(0, tokens.length - 1).map(makeChip)],
        textInputValue: lastToken,
      };
    }
    this.setState(updater, this.onValuesChanged);
  };

  private onTextInputDragOver = () => this.setState({ fakeCursorPosition: this.state.chips.length });

  private onClick = (e) => {
    if (this.props.disabled) {
      return;
    }
    this.textInputRef && this.textInputRef.focus();

    if (window.getSelection() && !window.getSelection()!.toString()) {
      // if there's no selection handle onClick event
      this.props.onClick && this.props.onClick(e);
    }
  };

  private onFocus = (e) => {
    this.setState({ isTextInputFocused: true });
    this.props.onFocus && this.props.onFocus(e);
  };

  private onTextInputBlur = (e) => {
    this.setState({ isTextInputFocused: false });
    this.tokenizeTextInputContent();
    this.props.onBlur && this.props.onBlur(e);
  };

  private onValuesChanged = () => {
    if (this.undoHistory.length === 0 || this.undoHistory[this.undoHistory.length - 1].chips !== this.state.chips) {
      this.pushUndoHistory();
    }
    this.chipRefs.length = this.state.chips.length;
    this.props.onChange && this.props.onChange(this.nextValues);
  };

  private onDeleteChip = (targetIndex) => (e?: React.KeyboardEvent | React.MouseEvent) =>
    this.setState(
      {
        chips: this.state.chips.filter((_, index) => index !== targetIndex),
      },
      () => {
        this.onValuesChanged();
        if (!e) {
          return;
        }

        if (e.type === 'click') {
          this.textInputRef && this.textInputRef.focus();
        } else if ((e as React.KeyboardEvent).key === 'Backspace' && targetIndex > 0) {
          this.chipRefs[targetIndex - 1].focus();
        } else if ((e as React.KeyboardEvent).key === 'Delete' && targetIndex < this.state.chips.length) {
          this.chipRefs[targetIndex].focus();
        }
      },
    );

  private onChipBeginEditing = () => this.setState({ isEditingChip: true });

  private onChipEndEditing = (targetIndex) => (newValue: string) => {
    if (!newValue) {
      this.setState({ isEditingChip: false });
      return this.onDeleteChip(targetIndex)();
    }

    this.setState(
      {
        isEditingChip: false,
        chips: this.state.chips.map((chip, index) => (index === targetIndex ? makeChip(newValue) : chip)),
      },
      this.onValuesChanged,
    );
  };

  private onChipKeyDown = (index) => (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && index > 0) {
      this.chipRefs[index - 1].focus();
    } else if (e.key === 'ArrowRight') {
      if (index < this.chipRefs.length - 1) {
        this.chipRefs[index + 1].focus();
      } else if (this.textInputRef) {
        this.textInputRef.focus();
      }
    } else if (isUndoKeyEvent(e)) {
      e.preventDefault();
      e.stopPropagation(); // prevent side effect
      this.undo();
    } else if (isRedoKeyEvent(e)) {
      e.preventDefault();
      e.stopPropagation(); // prevent side effect
      this.redo();
    }
  };

  private onChipDragOver = (index) => (e: React.MouseEvent) => {
    const chipBox = this.chipRefs[index].getBoundingClientRect();
    if (e.clientX < chipBox.left + chipBox.width / 2) {
      this.setState({ fakeCursorPosition: index });
    } else {
      this.setState({ fakeCursorPosition: index + 1 });
    }
  };

  private onChipDragStart = (index) => () => this.setState({ draggedIndex: index });

  private onChipDragEnd = (e: React.MouseEvent) => {
    const initialDragState = {
      draggedIndex: undefined,
      fakeCursorPosition: undefined,
    };
    const { draggedIndex, fakeCursorPosition } = this.state;

    if (!this.containerRef.current || draggedIndex === undefined || fakeCursorPosition === undefined) {
      // Reset drag state and do nothing
      return this.setState(initialDragState);
    }

    const containerBox = this.containerRef.current.getBoundingClientRect();
    if (
      e.clientX >= containerBox.left &&
      e.clientX <= containerBox.right &&
      e.clientY >= containerBox.top &&
      e.clientY <= containerBox.bottom
    ) {
      const newChips = [...this.state.chips];
      const [targetChip] = newChips.splice(draggedIndex, 1);

      const newIndex = draggedIndex < fakeCursorPosition ? fakeCursorPosition - 1 : fakeCursorPosition;

      newChips.splice(newIndex, 0, targetChip);
      return this.setState(
        {
          chips: newChips,
          ...initialDragState,
        },
        () => {
          this.chipRefs[newIndex].focus();
          this.onValuesChanged();
        },
      );
    }

    this.setState(initialDragState);
  };

  private setTextInputRef = (ref) => {
    this.textInputRef = ref;
    if (this.textInputRef) {
      this.textInputRef.addEventListener('paste', this.onTextInputPaste);
    }
  };

  private inputKeyDownPauseCallback = () => {
    if (
      this.undoHistory.length === 0 ||
      this.state.textInputValue !== this.undoHistory[this.undoHistory.length - 1].textInputValue
    ) {
      this.pushUndoHistory();
    }
  };

  private pushUndoHistory = () => {
    const { chips, textInputValue } = this.state;

    if (this.undoHistory.length >= 100) {
      this.undoHistory.shift();
    }
    if (this.undoHistoryCurrentIndex < this.undoHistory.length - 1) {
      this.undoHistory.splice(this.undoHistoryCurrentIndex + 1);
    }
    this.undoHistory.push({ chips, textInputValue });
    this.undoHistoryCurrentIndex = this.undoHistory.length - 1;
  };

  private undo = () => {
    if (this.undoHistory.length === 0 || !this.undoHistoryCurrentIndex) {
      return;
    }
    this.undoHistoryCurrentIndex -= 1;
    this.setState(this.undoHistory[this.undoHistoryCurrentIndex]);
  };

  private redo = () => {
    if (this.undoHistoryCurrentIndex + 1 < this.undoHistory.length) {
      this.undoHistoryCurrentIndex += 1;
      this.setState(this.undoHistory[this.undoHistoryCurrentIndex]);
    }
  };

  private tokenizeTextInputContent() {
    if (!this.state.textInputValue.trim()) {
      return;
    }
    this.setState(
      {
        chips: [...this.state.chips, makeChip(this.state.textInputValue)],
        textInputValue: '',
      },
      () => {
        this.onValuesChanged();
        this.textInputRef && this.textInputRef.scrollIntoView();
      },
    );
  }

  private updateRef = (index) => (ref) => {
    if (ref && this.chipRefs[index] !== ref) {
      this.chipRefs[index] = ref;
      this.calculateTextInputWidth();
    }
  };

  private renderChips = (values) =>
    values.map(({ value, createdAt }, index) => (
      <React.Fragment key={`${value}-${createdAt}`}>
        {this.state.fakeCursorPosition === index && <FakeCursor />}
        <MaxWidthChip
          value={value}
          hasError={!this.validator(value)}
          ref={this.updateRef(index)}
          onDelete={this.onDeleteChip(index)}
          onBeginEditing={this.onChipBeginEditing}
          onEndEditing={this.onChipEndEditing(index)}
          onKeyDown={this.onChipKeyDown(index)}
          onDragStart={this.onChipDragStart(index)}
          onDragEnd={this.onChipDragEnd}
          onDragOver={this.onChipDragOver(index)}
          editable={true}
        />
        {index === values.length - 1 && this.state.fakeCursorPosition === values.length && <FakeCursor />}
      </React.Fragment>
    ));

  private measureTextInTextInput = (): number => {
    if (this.hiddenTextDivRef.current) {
      return this.hiddenTextDivRef.current.clientWidth;
    }
    return 0;
  };

  private calculateTextInputWidth = () => {
    if (!this.textInputRef) {
      return;
    }

    const chips = this.chipRefs.filter((ref) => ref);

    if (chips.length === 0 || this.props.readonly) {
      return this.setState({ textInputWidth: '100%' });
    }

    const containerInnerWidth = this.containerRef.current ? this.containerRef.current.clientWidth - 26 : 0;

    const rects = chips
      .map((chip) => chip.getBoundingClientRect())
      .filter(({ width, height }) => width > 0 && height > 0);

    const lastLineRects = rects.filter((rect) => rect.top === rects[rects.length - 1].top);
    const chipsWidth = lastLineRects.reduce(
      (acc: number, rect: ClientRect, index: number) => acc + rect.width + (index > 0 ? chipSpacing : 0),
      0,
    );

    const textInputContentWidth = this.measureTextInTextInput();

    const wholeContentWidth = chipsWidth + chipSpacing + textInputContentWidth;

    const textInputWidth =
      wholeContentWidth < containerInnerWidth
        ? textInputContentWidth + (containerInnerWidth - wholeContentWidth)
        : textInputContentWidth;

    this.setState({ textInputWidth: `${textInputWidth}px` });
  };

  public render() {
    const { readonly = false, disabled = false, className, multiline = false, placeholder } = this.props;
    const { chips, textInputValue, textInputWidth, isTextInputFocused, isEditingChip } = this.state;

    if (readonly) {
      return (
        <Container
          role="textbox"
          multiline={multiline}
          disabled={disabled}
          readOnly={readonly}
          onClick={this.onClick}
          onFocus={this.onFocus}
          className={className}
        >
          {chips.map((chip) => chip.value).join(', ')}
        </Container>
      );
    }

    return (
      <Container
        role="textbox"
        multiline={multiline}
        disabled={disabled}
        ref={this.containerRef}
        onClick={this.onClick}
        isTextInputFocused={isTextInputFocused}
        className={className}
      >
        {this.renderChips(chips)}
        {!isEditingChip && (
          <TextInput
            type="text"
            placeholder={chips.length > 0 ? '' : placeholder}
            ref={this.setTextInputRef}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            value={textInputValue}
            width={textInputWidth}
            onChange={this.onTextInputChange}
            onKeyPress={this.onTextInputKeyPress}
            onKeyDown={this.onTextInputKeyDown}
            onFocus={this.onFocus}
            onDragOver={this.onTextInputDragOver}
          />
        )}
        <HiddenTextInput as="div" ref={this.hiddenTextDivRef as React.RefObject<HTMLInputElement>}>
          {textInputValue}
        </HiddenTextInput>
      </Container>
    );
  }
}
