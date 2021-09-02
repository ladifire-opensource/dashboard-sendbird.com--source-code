import { FC, useMemo, useRef, useState, useCallback, forwardRef, MutableRefObject, ReactNode } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { TreeSelect, TreeData, Icon, cssVariables, Subtitles, Tooltip, TooltipTrigger } from 'feather';

import { useLatestValue } from '@hooks';
import { PropOf, PropsOf } from '@utils';

import { useProjectTags } from './useProjectTags';

type TreeSelectProp<T extends keyof PropsOf<typeof TreeSelect>> = PropOf<typeof TreeSelect, T>;

type Props = {
  maxWidth?: number;
  selectedItems: TicketTag[];
  onChange: (items: TicketTag[]) => void;
  disabled?: boolean;
  className?: string;
  tooltipPortalId?: string;
};

const ToggleContent = styled.div`
  height: 30px;

  ${Subtitles['subtitle-01']};
  line-height: 30px; // align text vertically center
  text-align: left; // override default button text alignment (center)

  margin-left: 8px;
  margin-right: 4px;
`;

const PrefixItemWrapper = styled.div`
  padding: 6px 0;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
`;

const AllTagsMenuItem = styled.div<{ checked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 208px;
  height: 32px;
  padding: 0 16px;
  ${Subtitles['subtitle-01']};
  color: ${({ checked }) => (checked ? cssVariables('purple-7') : cssVariables('neutral-10'))};
  cursor: pointer;

  &:hover,
  &:focus {
    background: ${cssVariables('neutral-1')};
  }
`;

const convertTicketTagToTreeData = ({ id, name }: TicketTag) => ({ key: String(id), label: name, value: String(id) });

const isTicketTagTreeDataMatch = ({ tag, treeData }: { tag: TicketTag; treeData: TreeData }) =>
  String(tag.id) === treeData.value;

const ItemLabel = forwardRef<HTMLDivElement, { children: ReactNode } & Pick<Props, 'tooltipPortalId'>>(
  ({ children, tooltipPortalId }, ref) => {
    const [isTooltipEnabled, setIsTooltipEnabled] = useState(false);

    return (
      <Tooltip
        content={children}
        tooltipContentStyle="word-break: break-word;"
        trigger={isTooltipEnabled ? TooltipTrigger.Hover : TooltipTrigger.Manual}
        portalId={tooltipPortalId}
      >
        <div
          css={`
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          `}
          ref={(node) => {
            setIsTooltipEnabled(!!node && node.scrollWidth > node.clientWidth);

            if (ref) {
              if (typeof ref === 'function') {
                ref(node);
              } else {
                (ref as MutableRefObject<HTMLDivElement | null>).current = node;
              }
            }
          }}
        >
          {children}
        </div>
      </Tooltip>
    );
  },
);

export const TicketTagMultiSelectDropdown: FC<Props> = ({
  maxWidth,
  selectedItems,
  onChange,
  disabled: disabledProp,
  className,
  tooltipPortalId = 'TicketTagMultiSelectDropdownTooltip',
}) => {
  const intl = useIntl();
  const { tags: items, status, loadMoreTags, hasNext } = useProjectTags();
  const isLoading = status === 'loading';

  const intersectionObserverTargetRef = useRef<HTMLDivElement | null>(null);
  const intersectionObserverRef = useRef<{ menu: HTMLDivElement; observer: IntersectionObserver } | null>(null);

  const disabled = disabledProp || (isLoading && items.length === 0);

  const treeData: TreeSelectProp<'treeData'> = useMemo(() => items.map(convertTicketTagToTreeData), [items]);

  const handleMenuScrollToEnd = useLatestValue(() => {
    if (!hasNext) {
      // Prevent this callback from being called again.
      intersectionObserverRef.current?.observer?.disconnect();
      return;
    }
    if (!isLoading) {
      // Avoid duplicated requests.
      loadMoreTags();
    }
  });

  const selectedNodes: TreeSelectProp<'treeData'> = useMemo(
    () =>
      treeData.filter((treeDataItem) =>
        selectedItems.some((tag) => isTicketTagTreeDataMatch({ tag, treeData: treeDataItem })),
      ),
    [selectedItems, treeData],
  );

  const onSelect: TreeSelectProp<'onSelect'> = useCallback(
    (selectedTreeData) => {
      onChange(items.filter((tag) => selectedTreeData.some((treeData) => isTicketTagTreeDataMatch({ tag, treeData }))));
    },
    [items, onChange],
  );

  const isAllTicketsVisible = selectedItems.length === 0;

  const prefixItem = useMemo(
    () => (
      <PrefixItemWrapper>
        <AllTagsMenuItem
          checked={isAllTicketsVisible}
          onClick={() => {
            if (!isAllTicketsVisible) {
              // avoid unnecessary onChange trigger
              onChange([]);
            }
          }}
        >
          {intl.formatMessage({ id: 'desk.tickets.filter.tag.allTags' })}
          {isAllTicketsVisible && <Icon icon="done" size={20} color={cssVariables('purple-7')} />}
        </AllTagsMenuItem>
      </PrefixItemWrapper>
    ),
    [intl, isAllTicketsVisible, onChange],
  );

  const toggleRenderer = useMemo(
    () =>
      isAllTicketsVisible
        ? () => <ToggleContent>{intl.formatMessage({ id: 'desk.tickets.filter.tag.allTags' })}</ToggleContent>
        : undefined,
    [intl, isAllTicketsVisible],
  );

  const intersectionObserverTargetRefHandler = (node: HTMLDivElement | null) => {
    const observer = intersectionObserverRef.current?.observer;
    if (observer && intersectionObserverTargetRef.current !== node) {
      // IntersectionObserver's target element needs to be updated.
      if (intersectionObserverTargetRef.current) {
        observer.unobserve(intersectionObserverTargetRef.current);
      }
      if (node) {
        observer.observe(node);
      }
      intersectionObserverTargetRef.current = node;
    }
  };

  const menuRefHandler = (node: HTMLDivElement | null) => {
    if (intersectionObserverRef.current?.menu !== node) {
      // IntersectionObserver's root element needs to be updated.
      intersectionObserverRef.current?.observer?.disconnect();

      if (node == null) {
        intersectionObserverRef.current = null;
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            handleMenuScrollToEnd.current();
          }
        },
        { root: node },
      );
      if (intersectionObserverTargetRef.current) {
        // Let the new IntersectionObserver observe the last option.
        observer.observe(intersectionObserverTargetRef.current);
      }
      intersectionObserverRef.current = { menu: node, observer };
    }
  };

  return (
    <>
      <TreeSelect
        menuRef={menuRefHandler}
        className={className}
        disabled={disabled}
        treeData={treeData}
        width={maxWidth == null ? '100%' : undefined}
        css={
          maxWidth == null
            ? undefined
            : css`
                max-width: ${maxWidth}px;

                [role='option'] {
                  max-width: ${maxWidth}px;
                }
              `
        }
        selectedNodes={selectedNodes}
        selectedNodeMaxWidth={144}
        onSelect={onSelect}
        toggleRenderer={toggleRenderer}
        nodeToElement={({ label, key }) => {
          // load next page when the fifth item from the end intersects the menu element.
          const isIntersectionObserverTarget = key === treeData[treeData.length - 5]?.key;
          return (
            <ItemLabel
              ref={isIntersectionObserverTarget ? intersectionObserverTargetRefHandler : undefined}
              tooltipPortalId={tooltipPortalId}
            >
              {label}
            </ItemLabel>
          );
        }}
        prefixItem={prefixItem}
      />
      <div id={tooltipPortalId} />
    </>
  );
};
