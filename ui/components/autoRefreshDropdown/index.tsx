import { FC, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import Downshift from 'downshift';
import { SplitButton, Checkbox } from 'feather';
import { interval, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { animationLoading } from '@ui/styles';

interface IntervalItem {
  label: string;
  seconds: number;
}

type DropdownItem = { type: 'autoRefreshToggle' } | { type: 'interval'; label: string; seconds: number };

type Props = {
  defaultIsAutoRefreshEnabled?: boolean;
  disabled?: boolean;
  selectedInterval?: IntervalItem;
  onRefreshTriggered: () => void;
  onIsAutoRefreshActiveChange?: (isAutoRefreshEnabled: boolean) => void;
  onSelectedIntervalChange?: (intervalItem: IntervalItem) => void;
  className?: string;
};

const intervalItems = [
  { label: 'ui.autoRefreshDropdown.label.3s', seconds: 3 },
  { label: 'ui.autoRefreshDropdown.label.10s', seconds: 10 },
  { label: 'ui.autoRefreshDropdown.label.30s', seconds: 30 },
  { label: 'ui.autoRefreshDropdown.label.1m', seconds: 60 },
  { label: 'ui.autoRefreshDropdown.label.5m', seconds: 300 },
];

const dropdownIntervalItems = intervalItems.map((v) => ({ ...v, type: 'interval' }));

const dropdownItems = [{ items: [{ type: 'autoRefreshToggle' }] }, { items: dropdownIntervalItems }];

const stateReducer = (state, changes) => {
  switch (changes.type) {
    case Downshift.stateChangeTypes.keyDownEnter:
    case Downshift.stateChangeTypes.clickItem:
      return {
        ...changes,
        isOpen: state.isOpen,
        highlightedIndex: state.highlightedIndex,
      };
    default:
      return changes;
  }
};

const rotatingAnimationCSS = css`
  animation-name: ${animationLoading};
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  animation-fill-mode: both;
`;

const SplitButtonWrapper = styled.div<{ isRefreshIconRotating: boolean }>`
  .Refresh__SplitButton__LeftButton svg {
    ${(props) => (props.isRefreshIconRotating ? rotatingAnimationCSS : null)}
  }

  .Refresh__SplitButton__Dropdown + ul[role='listbox'] > div > div:first-child > li {
    position: relative;
    height: 32px;
  }
`;

const AutoRefreshToggleCheckbox = styled(Checkbox)`
  margin-right: 8px;
  pointer-events: none;
`;

const AutoRefreshToggleCheckboxLabel = styled.label`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0;
  padding: 6px 16px;
  cursor: pointer;

  font-size: inherit;
  color: inherit;
`;

export const AutoRefreshDropdown: FC<Props> = ({
  defaultIsAutoRefreshEnabled,
  disabled,
  selectedInterval,
  onRefreshTriggered,
  onIsAutoRefreshActiveChange,
  onSelectedIntervalChange,
  className,
}) => {
  const intl = useIntl();
  const refreshCheckerSubscriptionRef = useRef<Subscription>();
  const refreshCheckerRef = useRef<ReturnType<typeof interval>>();
  const onRefreshTriggeredRef = useRef(onRefreshTriggered);

  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(defaultIsAutoRefreshEnabled || false);
  const [selectedIntervalItem, setSelectedIntervalItem] = useState(selectedInterval || intervalItems[0]);

  const isAutoRefreshActive = isAutoRefreshEnabled && !disabled;
  const selectedDropdownItem = isAutoRefreshEnabled
    ? dropdownIntervalItems.find((i) => i.seconds === selectedIntervalItem.seconds)
    : null;

  useEffect(() => {
    onRefreshTriggeredRef.current = onRefreshTriggered;
  }, [onRefreshTriggered]);

  useEffect(() => {
    refreshCheckerSubscriptionRef.current?.unsubscribe();

    if (!isAutoRefreshActive) {
      return;
    }

    const refreshChecker = interval(selectedIntervalItem.seconds * 1000).pipe(
      tap(() => {
        onRefreshTriggeredRef.current();
      }),
    );

    refreshCheckerRef.current = refreshChecker;
    refreshCheckerSubscriptionRef.current = refreshChecker.subscribe();
  }, [isAutoRefreshActive, selectedIntervalItem.seconds]);

  useEffect(() => {
    onIsAutoRefreshActiveChange && onIsAutoRefreshActiveChange(isAutoRefreshActive);
  }, [isAutoRefreshActive, onIsAutoRefreshActiveChange]);

  useEffect(() => {
    onSelectedIntervalChange && onSelectedIntervalChange(selectedIntervalItem);
  }, [onSelectedIntervalChange, selectedIntervalItem]);

  useEffect(() => {
    return () => {
      refreshCheckerSubscriptionRef.current?.unsubscribe();
    };
  }, []);

  const handleAutoRefreshToggleClick = (newValue: boolean) => {
    if (!disabled) {
      setIsAutoRefreshEnabled(newValue);
    }
  };

  const handleItemClick = (item: IntervalItem) => {
    setSelectedIntervalItem(item);
    if (!isAutoRefreshEnabled) {
      setIsAutoRefreshEnabled(true);
    }
  };

  const handleRefreshButtonClick = () => {
    onRefreshTriggered && onRefreshTriggered();
  };

  return (
    <SplitButtonWrapper
      className={className}
      isRefreshIconRotating={isAutoRefreshActive}
      data-test-id="AutoRefreshContainer"
    >
      <SplitButton
        size="small"
        left={{
          icon: 'refresh',
          className: 'Refresh__SplitButton__LeftButton',
          disabled,
          onClick: handleRefreshButtonClick,
        }}
        right={{ icon: 'chevron-down', disabled }}
        dropdown={{
          className: 'Refresh__SplitButton__Dropdown',
          itemsType: 'section',
          items: dropdownItems,
          selectedItem: selectedDropdownItem,
          onItemSelected: (selectedItem: DropdownItem | null) => {
            if (selectedItem?.type !== 'interval') {
              return;
            }
            const { label, seconds } = selectedItem;
            handleItemClick({ label, seconds });
          },
          itemToElement: (item: DropdownItem) => {
            return item.type === 'autoRefreshToggle' ? (
              <AutoRefreshToggleCheckboxLabel
                role="button"
                aria-pressed={isAutoRefreshEnabled ? 'true' : 'false'}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAutoRefreshToggleClick(!isAutoRefreshEnabled);
                }}
              >
                <AutoRefreshToggleCheckbox checked={isAutoRefreshEnabled} disabled={disabled} />
                {intl.formatMessage({ id: 'ui.autoRefreshDropdown.label.autoRefresh' })}
              </AutoRefreshToggleCheckboxLabel>
            ) : (
              intl.formatMessage({ id: item.label })
            );
          },
          stateReducer,
        }}
      />
    </SplitButtonWrapper>
  );
};
