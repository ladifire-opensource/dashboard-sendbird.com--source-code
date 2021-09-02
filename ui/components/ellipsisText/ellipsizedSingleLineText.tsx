import { forwardRef, HTMLAttributes } from 'react';

import styled from 'styled-components';

type Props = { width?: number } & Pick<HTMLAttributes<HTMLSpanElement>, 'children' | 'onMouseEnter' | 'onMouseLeave'>;

const TextWrapper = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const EllipsizedSingleLineText = forwardRef<HTMLSpanElement, Props>(
  ({ width, onMouseEnter, onMouseLeave, children }, ref) => {
    return (
      <TextWrapper
        ref={ref}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        css={`
          max-width: ${width ? `${width}px` : '100%'};
        `}
        data-test-id="EllipsizedSingleLineText"
      >
        {children}
      </TextWrapper>
    );
  },
);
