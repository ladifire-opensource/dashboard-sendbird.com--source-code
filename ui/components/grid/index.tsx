import React, { HTMLAttributes, useRef, useEffect, useState, useMemo, createContext, useContext } from 'react';

import styled, { css, SimpleInterpolation, FlattenSimpleInterpolation } from 'styled-components';

import { ResizeObserver } from 'resize-observer';

import { LNBContext } from '@core/containers/app/lnbContext';

import { MakeGrid } from './types';

export const ContentContainerHorizontalPaddingContext = createContext(32);

export const useContentContainerHorizontalPadding = () => {
  return useContext(ContentContainerHorizontalPaddingContext);
};

export const ContentContainer: React.FC<Omit<HTMLAttributes<HTMLDivElement>, 'ref'>> = (props) => {
  const { isForceCollapsed } = useContext(LNBContext);
  const [horizontalPadding, setHorizontalPadding] = useState<32 | 40>(32);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const { current: currentDivElement } = ref;
      const resizeObserver = new ResizeObserver(([{ contentRect }]) => {
        setHorizontalPadding(contentRect.width >= 1584 ? 40 : 32);
      });
      resizeObserver.observe(currentDivElement);

      return () => {
        resizeObserver.unobserve(currentDivElement);
        resizeObserver.disconnect();
      };
    }
  }, []);

  return useMemo(
    () => (
      <ContentContainerHorizontalPaddingContext.Provider value={horizontalPadding}>
        <div
          ref={ref}
          css={`
            min-width: ${1024 + horizontalPadding * 2}px;
            padding: 0 ${horizontalPadding}px;

            ${isForceCollapsed && `width: 1088px;`}
          `}
          {...props}
        />
      </ContentContainerHorizontalPaddingContext.Provider>
    ),
    [horizontalPadding, props, isForceCollapsed],
  );
};

export const PageContainer = styled(ContentContainer)`
  padding-top: 24px;
`;

export const TablePageContainer = styled(PageContainer)`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  > *:not(:first-child) {
    margin-top: 16px;
  }

  > *:last-child {
    flex: 1;
    min-height: 0;
  }
`;

export const makeGrid: MakeGrid = (options) => {
  const { wideWidth = 1224, wideGutterSize = 24, narrowMaxWidth = 984, narrowGutterSize = 20, columns = 12 } =
    options || {};

  const maxWidth = narrowMaxWidth + narrowGutterSize * 2;
  const width = wideWidth + wideGutterSize * 2;

  const wideGridMediaQuery = (first, ...interpolations) =>
    css`
      @media (min-width: ${width}px) {
        ${css(first, ...interpolations)}
      }
    ` as FlattenSimpleInterpolation;

  const ResponsiveContainer = styled.div`
    display: flex;
    flex-direction: row;
    margin: 0 auto;
    position: relative;
    width: 100%;
    min-width: 1024px;
    max-width: ${maxWidth}px;
    padding: 0 ${narrowGutterSize}px;

    ${wideGridMediaQuery`
    max-width: ${width}px;
    width: 100%;
    padding: 0 ${wideGutterSize}px;
    `}
  `;

  const ResponsiveColumn = styled.div<{
    column: number;
    includeOuterGutters?: boolean;
    styles?: SimpleInterpolation;
  }>`
    ${({ column, includeOuterGutters = false, styles }) => css`
      flex: none;
      width: calc(
        (100% + ${narrowGutterSize}px) / ${columns} * ${column} ${includeOuterGutters ? '' : ` - ${narrowGutterSize}px`}
      );

      ${wideGridMediaQuery`
      width: calc((100% + ${wideGutterSize}px) / ${columns} * ${column}${
        includeOuterGutters ? '' : ` - ${wideGutterSize}px`
      });
      `}

      && {
        ${styles}
      }
    `}
  `;

  return {
    ResponsiveContainer,
    wideGridMediaQuery,
    ResponsiveColumn,
  };
};
