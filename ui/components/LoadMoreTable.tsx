import { FC, useEffect, useRef, ReactNode, useMemo } from 'react';
import { render } from 'react-dom';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import {
  TableProps,
  Table,
  ButtonProps,
  Button,
  ScrollBarRef,
  cssVariables,
  TableColumnProps,
  TooltipTargetIcon,
  Tooltip,
  TooltipVariant,
  Body,
  TooltipProps,
} from 'feather';

export type LoadMoreTableColumn<T> = TableColumnProps<T> & {
  titleTooltip?: { content: ReactNode; tooltipWidth?: number; placement?: TooltipProps['placement'] };
};

type Props<T> = Omit<TableProps<T>, 'columns'> & {
  hasNext: boolean;
  loadMoreButtonProps?: Partial<ButtonProps>;
  columns: readonly LoadMoreTableColumn<T>[];
};

const StyledTable = styled(Table)`
  padding-bottom: 16px;

  thead {
    // prevent thead from being shrunk on Safari
    flex: none;
  }

  th {
    overflow-y: hidden;
  }
`;

const LoadMoreButton = styled(Button)`
  display: block;
  width: 100%;
  margin-top: 16px;
  color: ${cssVariables('purple-7')};
`;

const ColumnTitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  > span {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

export const LoadMoreTable = <T,>({
  hasNext,
  loadMoreButtonProps,
  columns: columnsProp,
  ...props
}: Props<T>): ReturnType<FC<Props<T>>> => {
  const scrollBarRef = useRef<ScrollBarRef>(null);
  const intl = useIntl();
  const columns = useMemo(() => {
    return columnsProp.map((column) => {
      const { title, titleTooltip, ...rest } = column;
      return {
        ...rest,
        title: (
          <ColumnTitleWrapper>
            <span>{title}</span>
            {titleTooltip && (
              <Tooltip
                variant={TooltipVariant.Light}
                content={titleTooltip.content}
                placement={titleTooltip.placement || 'bottom'}
                popperProps={{
                  modifiers: {
                    flip: { behavior: [] },
                    preventOverflow: { priority: ['left', 'right'], boundariesElement: 'viewport' },
                  },
                }}
                tooltipContentStyle={css`
                  ${Body['body-short-01']};
                  width: ${titleTooltip.tooltipWidth || 256}px;
                `}
              >
                <TooltipTargetIcon icon="info" css="margin-left: 2px;" />
              </Tooltip>
            )}
          </ColumnTitleWrapper>
        ),
      };
    });
  }, [columnsProp]);

  useEffect(() => {
    if (scrollBarRef.current == null) {
      return;
    }

    let tfoot = scrollBarRef.current.node.querySelector('tfoot');
    if (tfoot) {
      tfoot.parentElement?.removeChild(tfoot);
    }

    if (!hasNext) {
      return;
    }

    tfoot = document.createElement('tfoot');
    tfoot.style.display = 'block';
    scrollBarRef.current.node.appendChild(tfoot);

    // FIXME: make the button rendered inside the existing react render tree
    render(
      <LoadMoreButton
        buttonType="tertiary"
        size="medium"
        children={intl.formatMessage({ id: 'ui.loadMoreTable.btn.loadMore' })}
        {...loadMoreButtonProps}
      />,
      tfoot,
    );
  }, [hasNext, intl, loadMoreButtonProps]);
  return <StyledTable scrollBarRef={scrollBarRef} showScrollbars={true} columns={columns} {...props} />;
};
