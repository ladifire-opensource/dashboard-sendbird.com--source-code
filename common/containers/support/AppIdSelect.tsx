import { FC, ComponentProps, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { InputSelect, InputSelectItem, Subtitles, cssVariables } from 'feather';

import { useApplicationSearch } from '@hooks';
import { HighlightedText } from '@ui/components';

type Props = Pick<
  ComponentProps<typeof InputSelect>,
  'name' | 'label' | 'width' | 'size' | 'placeholder' | 'error' | 'disabled'
> & {
  applications: ApplicationSummary[];
  applicationSearch: Pick<
    ReturnType<typeof useApplicationSearch>,
    'fetchNextResults' | 'updateSearchQuery' | 'searchQuery' | 'hasMore'
  >;
  selectedItem: string | null;
  onChange: (value: string | null) => void;
};

const infiniteScrollObserverItem = { value: 'infinite scroll observer', label: '' };

const ObserverItem = styled.div`
  position: relative;
  top: -48px;
`;

const ItemContainer = styled.div`
  overflow: hidden;
`;

const AppID = styled(HighlightedText)`
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: inherit;
`;

const AppName = styled(HighlightedText)`
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const AppIdSelect: FC<Props> = ({
  name,
  label,
  width,
  size,
  placeholder,
  disabled,
  error,
  selectedItem: selectedAppId,
  onChange,
  applications,
  applicationSearch: { fetchNextResults, updateSearchQuery, searchQuery, hasMore },
}) => {
  const intl = useIntl();

  const observerItemRefCallback = (observerItem: HTMLElement | null) => {
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchNextResults();
        }
      },
      { root: observerItem?.closest('ul[role="listbox"]') },
    );

    if (observerItem) {
      intersectionObserver.observe(observerItem);
    }

    return () => {
      intersectionObserver.disconnect();
    };
  };

  const inputSelectItems: InputSelectItem[] = useMemo(
    () =>
      applications
        .map(({ app_id }) => ({ value: app_id, label: app_id }))
        .concat(hasMore ? [infiniteScrollObserverItem] : []),
    [hasMore, applications],
  );

  const selectedItem = useMemo(() => (selectedAppId ? { value: selectedAppId, label: selectedAppId } : null), [
    selectedAppId,
  ]);

  const itemToElement = ({ value: appId }: InputSelectItem) => {
    const item = applications.find((v) => v.app_id === appId);
    const isObserverItem = appId === infiniteScrollObserverItem.value;
    if (isObserverItem) {
      return <ObserverItem ref={observerItemRefCallback} />;
    }
    return (
      <ItemContainer>
        <AppID content={item?.app_id} highlightedText={searchQuery} />
        <AppName content={item?.app_name} highlightedText={searchQuery} />
      </ItemContainer>
    );
  };

  const emptyView = (
    <div
      css={`
        padding-top: 40px;
        padding-bottom: 44px;
        ${Subtitles['subtitle-01']};
        color: ${cssVariables('neutral-5')};
        text-align: center;
      `}
    >
      {intl.formatMessage({ id: 'common.support.form.label.appIdSearchNoResults' })}
    </div>
  );

  return (
    <InputSelect
      name={name}
      label={label}
      items={inputSelectItems}
      width={width}
      size={size}
      selectedItem={selectedItem}
      onChange={(item) => onChange(item?.value)}
      disabled={disabled}
      placeholder={placeholder}
      itemToElement={itemToElement}
      isItemDisabled={(item) => item.value === infiniteScrollObserverItem.value}
      itemToString={(item) => item.label}
      useSearch={true}
      searchPlaceholder={intl.formatMessage({ id: 'common.support.form.label.appIdSearchPlaceholder' })}
      onSearchChange={updateSearchQuery}
      emptyView={emptyView}
      error={error}
    />
  );
};
