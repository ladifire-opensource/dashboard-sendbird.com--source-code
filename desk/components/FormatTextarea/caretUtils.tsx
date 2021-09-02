import React from 'react';

import { ContentEditableRef } from '@ui/components';

export const pasteHtmlAtCaret = (range: Range, html: string) => {
  let selection: Selection | null = null;
  if (window.getSelection) {
    selection = window.getSelection();
    if (selection) {
      range.deleteContents();

      const element = document.createElement('div');
      element.innerHTML = html;

      const fragment = document.createDocumentFragment();
      let node: ChildNode | null = null;
      let lastNode: ChildNode | null = null;

      while ((node = element.firstChild)) {
        lastNode = fragment.appendChild(node);
      }
      range.insertNode(fragment);

      if (lastNode) {
        const rangeCurrent = range.cloneRange();
        rangeCurrent.setStartAfter(lastNode);
        rangeCurrent.collapse(true);
        selection.removeAllRanges();
        selection.addRange(rangeCurrent);
      }
    }
  }
};

type ReplaceTextWithComponentProps = {
  text: string;
  values?: Record<string, React.ReactNode>;
};

type ReplaceTextFlatten = (strArray: string[], fn: (str: string) => React.ReactNode) => React.ReactNode[];

export const ReplaceTextWithComponent = React.memo<ReplaceTextWithComponentProps>(({ text, values }) => {
  const flatten: ReplaceTextFlatten = (strArray, fn) => {
    if (strArray.constructor !== Array) {
      throw new Error('The first parameter should be type of string Array');
    }

    return strArray.reduce((acc, str) => {
      const replaced = fn(str);
      acc.push(replaced);
      return acc;
    }, [] as React.ReactNode[]);
  };

  const replaceByValues = (splittedStr) => {
    if (!values) {
      return splittedStr;
    }
    const keys = Object.keys(values);
    let node: React.ReactNode = null;
    keys.forEach((key) => {
      if (splittedStr === `{${key}}`) {
        node = values[key];
      }
    });
    return node || splittedStr;
  };

  const replacedNode = flatten(text.split(/({[a-zA-Z_]+})/g), replaceByValues);

  return <>{replacedNode}</>;
});

export const getSelectionTextPosition = (element) => {
  let isAtStart = false;
  let isAtEnd = false;
  let selRange: Range | null = null;
  let testRange: Range | null = null;
  if (window.getSelection) {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      selRange = sel.getRangeAt(0);
      testRange = selRange.cloneRange();

      testRange.selectNodeContents(element);
      testRange.setEnd(selRange.startContainer, selRange.startOffset);
      isAtStart = testRange.toString() === '';

      testRange.selectNodeContents(element);
      testRange.setStart(selRange.endContainer, selRange.endOffset);
      isAtEnd = testRange.toString() === '';
    }
  }

  return { atStart: isAtStart, atEnd: isAtEnd };
};

export const getCaretCharacterOffsetWithin = (element: HTMLInputElement | HTMLDivElement) => {
  let caretOffset = 0;
  if (window.getSelection) {
    const selection = window.getSelection();
    if (selection) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
  }
  return caretOffset;
};

export const getWordAt = (str: string, position: number) => {
  const left = str.slice(0, position + 1).search(/\S+$/);
  const right = str.slice(position).search(/\s/);

  if (right < 0) {
    return str.slice(left);
  }

  return str.slice(left, right + position);
};

export const getBoundingClientRectAt = () => {
  let rect = {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
  };

  if (typeof window !== undefined && window.getSelection) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount) {
      const range = selection.getRangeAt(0).cloneRange();
      if (range.getBoundingClientRect) {
        range.collapse(true);
        const { top, left, bottom, right, width, height } = range.getBoundingClientRect();
        rect = { top, left, bottom, right, width, height };
      }
    }
  }

  return rect;
};

export const getKeywordNearCaretOnContentEditable = (
  contentEditableRef: React.RefObject<ContentEditableRef>,
  prefix,
) => {
  if (contentEditableRef.current?.getCurrent()) {
    const characterPosition = getCaretCharacterOffsetWithin(contentEditableRef.current.getCurrent() as HTMLDivElement);
    let word = getWordAt(contentEditableRef.current.getText(), characterPosition - 1);

    const prefixLastIndex = word.lastIndexOf(prefix);
    if (word && prefixLastIndex > 0) {
      word = word.slice(prefixLastIndex, word.length);
    }
    return word;
  }
  return '';
};

export const replaceWordNearCaret = ({
  range,
  replaceValue,
  searchQuery,
}: {
  range: Range | null;
  replaceValue: string;
  searchQuery: string;
}) => {
  let selection: Selection | null = null;

  if (window.getSelection) {
    selection = window.getSelection();
    if (selection?.rangeCount && range) {
      selection.removeAllRanges();
      selection.addRange(range);

      if (!selection.focusNode) {
        return;
      }

      const { nodeValue } = selection.focusNode;
      const nodeHead = nodeValue ? nodeValue.slice(0, selection.focusOffset) : '';
      const startIndex = nodeHead.lastIndexOf(searchQuery);

      if (startIndex === -1) {
        return;
      }

      range.setStart(selection.focusNode, startIndex);
      range.setEnd(selection.focusNode, selection.focusOffset);
      range.deleteContents();

      const element = document.createElement('div');
      element.innerHTML = `{${replaceValue}}`;
      const fragment = document.createDocumentFragment();
      const lastNode = fragment.appendChild(element.firstChild as ChildNode);

      range.insertNode(fragment);
      if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }
};
