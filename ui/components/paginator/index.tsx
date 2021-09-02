import React from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Button, cssVariables, Icon, transitionDefault } from 'feather';

import { getPageItemRange } from './getPageItemRange';
import { PageSizeDropdown } from './pageSizeDropdown';

interface Props {
  // current page number
  current: number;

  // number of data items per page
  pageSize: PerPage;

  // specify the size changer options
  pageSizeOptions?: ReadonlyArray<PerPage>;

  // total number of data items
  total: number;

  // a callback function when the page number is changed
  onChange: (page: number, pageSize: PerPage) => void;

  /**
   * a callback function when pageSize is changed
   * it will reset current page to 1
   **/

  onItemsPerPageChange?: (page: number, pageSize: PerPage) => void;

  className?: string;
  isHiddenPerPage?: boolean;
}

const ItemRange = styled.span`
  text-align: right;
  min-width: 73px;
`;

const ArrowButton = styled(Button)`
  position: relative;
  z-index: 10;
  width: 32px;
  min-width: 32px;
  height: 32px;
  padding: 3px !important;

  div {
    margin-left: 3px !important;
  }

  svg {
    fill: ${cssVariables('neutral-6')};
    transition: fill 0.2s ${transitionDefault};
  }

  &:hover {
    z-index: 20;

    svg {
      fill: ${cssVariables('purple-7')};
    }
  }
`;

const ButtonGroup = styled.div`
  > ${ArrowButton}:not(:last-child) {
    margin-right: -1px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  > ${ArrowButton}:not(:first-child) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  line-height: 20px;
  color: ${cssVariables('neutral-8')};

  label {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    font-size: inherit;
    line-height: inherit;
    color: inherit;

    ${PageSizeDropdown} {
      margin-left: 8px;
    }
  }

  ${ButtonGroup} {
    align-self: center;
    margin-left: 16px;
  }
`;

export const Paginator: React.FC<Props> = ({
  current,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  total,
  onChange,
  onItemsPerPageChange,
  className,
  isHiddenPerPage = false,
}) => {
  const intl = useIntl();
  const itemRange = getPageItemRange(current, pageSize, total);
  const onPageSizeChange = (value) => onItemsPerPageChange && onItemsPerPageChange(1, value);
  const onClickPrevButton = () => onChange(current - 1, pageSize);
  const onClickNextButton = () => onChange(current + 1, pageSize);

  return (
    <Container className={className} data-test-id="Paginator">
      {!isHiddenPerPage && (
        <label>
          {intl.formatMessage({ id: 'ui.table.paginator.lbl' })}
          <PageSizeDropdown value={pageSize} options={pageSizeOptions} onChange={onPageSizeChange} />
        </label>
      )}
      <ItemRange>
        {itemRange &&
          (itemRange[0] === itemRange[1]
            ? `${itemRange[0]}`
            : intl.formatMessage(
                { id: 'ui.table.paginator.perPage' },
                { startNumber: itemRange[0], endNumber: itemRange[1], totalNumber: total },
              ))}
      </ItemRange>
      <ButtonGroup data-test-id="PaginationButtonGroup">
        <ArrowButton
          buttonType="tertiary"
          title="Previous page"
          icon={<Icon icon="chevron-left" size={20} />}
          onClick={onClickPrevButton}
          disabled={current <= 1}
        />
        <ArrowButton
          buttonType="tertiary"
          title="Next page"
          icon={<Icon icon="chevron-right" size={20} />}
          onClick={onClickNextButton}
          disabled={current >= Math.ceil(total / pageSize)}
        />
      </ButtonGroup>
    </Container>
  );
};
