/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useLayoutEffect, useState, FC } from 'react';

function getDOMProperty(node, property) {
  if (window.getComputedStyle && window.getComputedStyle(node, null)) {
    return window.getComputedStyle(node, null).getPropertyValue(property);
  }
}

type Props = {
  component: any;
  text?: string;
  maxLines?: number;
  ellipsisToken?: string;
};

export const EllipsisText: FC<Props> = ({
  component: TextComponent,
  text = '',
  maxLines = 3,
  ellipsisToken = '...',
  children,
}) => {
  const targetRef = useRef(null);

  const [originalText, setOriginalText] = useState(text);

  const [ellipsedText, setEllipsedText] = useState(text);

  const checkNeedEllipsis = () => {
    const targetNode = targetRef.current;
    if (typeof window !== 'undefined' && targetNode) {
      const lineHeight = parseInt(getDOMProperty(targetNode, 'line-height')!.replace('px', ''));
      const height = parseInt(getDOMProperty(targetNode, 'height')!.replace('px', ''));
      /**
       * Weird but firefox, edge need Math.round chrome not
       */
      const currentLines = Math.round(height / lineHeight);

      return currentLines > maxLines;
    }
    return false;
  };

  const checkEllipsis = (initial = false) => {
    if (checkNeedEllipsis()) {
      const targetText = initial ? originalText : ellipsedText;
      const end = targetText.length;
      const ellipsed = targetText.substring(0, end - 5);

      setEllipsedText(`${ellipsed}${ellipsisToken}`);
    }
  };

  useLayoutEffect(() => {
    setOriginalText(text);
    setEllipsedText(text);
    checkEllipsis(true);
  }, [text]);

  useLayoutEffect(() => {
    ellipsedText !== text && setEllipsedText(text);
    checkEllipsis();
  }, []);

  useLayoutEffect(() => {
    checkEllipsis();
  }, [ellipsedText, targetRef.current]);

  return (
    <TextComponent ref={targetRef}>
      {ellipsedText}
      {children}
    </TextComponent>
  );
};
