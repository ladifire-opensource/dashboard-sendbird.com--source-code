import { forwardRef, ReactNode, useMemo, HTMLAttributes } from 'react';

import styled from 'styled-components';

import { cssVariables } from 'feather';

type Props = {
  content?: string | null;
  highlightedText: string;
  isWrapper?: boolean;
} & HTMLAttributes<HTMLDivElement>;

const HighlightedSpan = styled.mark`
  color: ${cssVariables('purple-7')};
  background-color: ${cssVariables('purple-2')};
`;

const findTokenCharIndexes = (text: string, tokens: string[]) => {
  return tokens.reduce<number[]>((acc, cur, index) => {
    const fromIndex = index === 0 ? 0 : acc[index - 1] + 1;
    acc.push(text.indexOf(cur, fromIndex));
    return acc;
  }, []);
};

const findIndexOfIgnoreCase = (text: string, searchString: string, fromIndex: number = 0) => {
  return text.toLowerCase().indexOf(searchString.toLowerCase(), fromIndex);
};

export const HighlightedText = forwardRef<HTMLDivElement, Props>(
  ({ highlightedText, content, isWrapper = true, ...props }, ref) => {
    const formatted: ReactNode = useMemo(() => {
      if (!content) {
        return content;
      }

      let result: ReactNode = content;
      if (highlightedText.trim()) {
        const tokens = content.split(/\s/);
        const nameWithoutSpaces = content.replace(/\s/g, '');
        const highlightedTextWithoutSpaces = highlightedText.replace(/\s/g, '');

        const tokenCharIndexes = findTokenCharIndexes(content, tokens);
        const tokenCharIndexesWithoutSpaces = findTokenCharIndexes(nameWithoutSpaces, tokens);

        let fromIndex = 0;
        let foundIndex = -1;
        const highlightIndexes: { start: number; end: number }[] = [];

        const findContainingTokenIndex = (targetCharIndex: number) => {
          return tokenCharIndexesWithoutSpaces.findIndex((charIndex, index) => {
            const token = tokens[index];
            return charIndex <= targetCharIndex && targetCharIndex < charIndex + token.length;
          });
        };

        while ((foundIndex = findIndexOfIgnoreCase(nameWithoutSpaces, highlightedTextWithoutSpaces, fromIndex)) > -1) {
          const startTokenIndex = findContainingTokenIndex(foundIndex);
          const endTokenIndex = findContainingTokenIndex(foundIndex + highlightedTextWithoutSpaces.length - 1);
          const highlightStartIndex =
            tokenCharIndexes[startTokenIndex] + foundIndex - tokenCharIndexesWithoutSpaces[startTokenIndex];
          const highlightEndIndex =
            tokenCharIndexes[endTokenIndex] +
            foundIndex +
            highlightedTextWithoutSpaces.length -
            tokenCharIndexesWithoutSpaces[endTokenIndex];

          if (
            highlightIndexes.length === 0 ||
            highlightStartIndex >= highlightIndexes[highlightIndexes.length - 1].end
          ) {
            highlightIndexes.push({ start: highlightStartIndex, end: highlightEndIndex });
          } else {
            // New highlight range overlaps with the last range.
            const { start: lastItemStart, end: lastItemEnd } = highlightIndexes[highlightIndexes.length - 1];
            highlightIndexes[highlightIndexes.length - 1] = {
              start: Math.min(highlightStartIndex, lastItemStart),
              end: Math.max(highlightEndIndex, lastItemEnd),
            };
          }

          fromIndex = highlightStartIndex > -1 ? highlightStartIndex + 1 : nameWithoutSpaces.length;
        }

        if (highlightIndexes.length > 0) {
          result = highlightIndexes.reduce((acc, cur, index, array) => {
            const previousTokenEnd = index === 0 ? 0 : array[index - 1].end;
            const previousNonHighlightedToken = content.substring(previousTokenEnd, cur.start);
            const highlightedToken = <HighlightedSpan>{content.substring(cur.start, cur.end)}</HighlightedSpan>;
            return (
              <>
                {acc}
                {previousNonHighlightedToken}
                {highlightedToken}
                {index === array.length - 1 && content.substring(cur.end)}
              </>
            );
          }, null);
        }
      }

      return result;
    }, [highlightedText, content]);

    if (!isWrapper) {
      return <>{formatted}</>;
    }

    return (
      <div {...props} ref={ref}>
        {formatted}
      </div>
    );
  },
);
