import React, { useCallback, useRef, useContext, ComponentProps } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { cssVariables, Button, IconButton, InlineNotification, Headings } from 'feather';

import { commonActions, deskActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { ContentContainer, AutoRefreshDropdown } from '@ui/components';

import { TicketSearchInput, TicketSearchQuery } from '../TicketSearchInput';
import { TicketFilters } from './ticketFilters';
import { TicketsContext } from './ticketsContext';
import { TicketsList } from './ticketsList';

const TicketsExportButton: React.FC<{ onClick: React.MouseEventHandler<HTMLButtonElement> }> = ({ onClick }) => {
  const intl = useIntl();

  return (
    <Button size="small" buttonType="secondary" icon="export" onClick={onClick}>
      {intl.formatMessage({ id: 'desk.tickets.header.export.button' })}
    </Button>
  );
};

const LeftContainer = styled.div`
  display: flex;
  align-self: flex-start;
  align-items: center;
`;

const RightContainer = styled.div<{ $isSearchMode: boolean }>`
  position: relative;
  display: flex;
  ${({ $isSearchMode }) =>
    $isSearchMode
      ? css`
          width: 100%;
          flex-direction: column;
          align-items: flex-start;
        `
      : css`
          width: initial;
          align-items: center;
        `}
`;

const PageHeader = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 26px;
`;

const PageTitle = styled.h1`
  font-size: 20px;
  line-height: 1.4;
  letter-spacing: -0.25px;
  font-weight: 600;
  color: ${cssVariables('neutral-10')};
  margin: 0;
`;

const SearchResult = styled.div`
  margin-bottom: 24px;
  color: ${cssVariables('neutral-10')};
  ${Headings['heading-02']};
`;

const SearchResultCount = styled.span`
  margin-left: 8px;
  vertical-align: initial;
  color: ${cssVariables('neutral-6')};
`;

const StyledTicketsList = styled(ContentContainer)`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  height: 100%;
  overflow-y: auto;
`;

const TicketsListContainer = styled.div<{ $isSearchMode: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;

  margin-top: ${(props) => (props.$isSearchMode ? 32 : 16)}px;
`;

const StyledTicketSearchInput = styled(TicketSearchInput)<{ $isSearchMode: boolean }>`
  width: ${({ $isSearchMode }) => ($isSearchMode ? '100%' : '232px')};
  margin-right: 8px;
`;

const LeftArrow = styled(IconButton)`
  margin-right: 8px;
`;

const NotificationWrapper = styled.div`
  margin-top: 24px;
`;

type OwnProps = {
  isShownExportNotification: boolean;
  initialSearchQuery: ComponentProps<typeof TicketSearchInput>['initialSearchQuery'];
  setIsShownExportNotification: React.Dispatch<React.SetStateAction<boolean>>;
  onSearch: (queries: TicketSearchQuery[]) => void;
  onResetSearch: () => void;
  handleTicketItemActionChange: (action, item) => void;
  handleRefresh: () => void;
};

type Props = OwnProps;

export const TicketsWrapper: React.FC<Props> = ({
  isShownExportNotification,
  initialSearchQuery,
  setIsShownExportNotification,
  handleTicketItemActionChange,
  handleRefresh,
  onSearch,
  onResetSearch,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const searchBarRef = useRef<HTMLInputElement>(null);
  const { showDialogsRequest } = commonActions;
  const { isSearchMode, ticketCount, setIsSearchMode, resetSearch } = useContext(TicketsContext);
  const { timezone, refresh } = useSelector((state: RootState) => ({
    timezone: state.desk.project.timezone,
    refresh: state.tickets.refresh,
  }));

  const handleIsAutoRefreshActiveChange: ComponentProps<
    typeof AutoRefreshDropdown
  >['onIsAutoRefreshActiveChange'] = useCallback(
    (isAutoRefreshEnabled) => {
      dispatch(deskActions.setTicketsRefreshAutomatic(isAutoRefreshEnabled));
    },
    [dispatch],
  );
  const handleSelectedIntervalChange: ComponentProps<
    typeof AutoRefreshDropdown
  >['onSelectedIntervalChange'] = useCallback(
    (intervalItem) => {
      dispatch(deskActions.setTicketsRefreshAutomaticItem(intervalItem));
    },
    [dispatch],
  );

  const handleExportButtonClick = useCallback(() => {
    dispatch(
      showDialogsRequest({
        dialogTypes: DialogType.ExportTicketsInfo,
        dialogProps: {
          onSuccess: () => {
            setIsShownExportNotification(true);
          },
        },
      }),
    );
  }, [dispatch, setIsShownExportNotification, showDialogsRequest]);

  const handleSearchClick = useCallback(() => {
    setIsSearchMode(true);
  }, [setIsSearchMode]);

  const handleSearchReset = useCallback(() => {
    onResetSearch();
    resetSearch();
    if (searchBarRef.current) {
      searchBarRef.current.value = '';
    }
  }, [onResetSearch, resetSearch]);

  const handleBackButtonClick = () => {
    setIsSearchMode(false);
    onResetSearch();
    resetSearch();
  };

  const handleCloseNotification = useCallback(() => {
    setIsShownExportNotification(false);
  }, [setIsShownExportNotification]);

  return (
    <StyledTicketsList>
      <PageHeader>
        <LeftContainer>
          {isSearchMode ? (
            <LeftArrow icon="arrow-left" size="small" buttonType="secondary" onClick={handleBackButtonClick} />
          ) : (
            <>
              <PageTitle>{intl.formatMessage({ id: 'desk.tickets.header.title' })}</PageTitle>
              <AutoRefreshDropdown
                defaultIsAutoRefreshEnabled={refresh.isAutomatic}
                selectedInterval={refresh.automaticItem}
                onRefreshTriggered={handleRefresh}
                onIsAutoRefreshActiveChange={handleIsAutoRefreshActiveChange}
                onSelectedIntervalChange={handleSelectedIntervalChange}
                css={css`
                  margin-left: 8px;
                `}
              />
            </>
          )}
        </LeftContainer>
        <RightContainer $isSearchMode={isSearchMode}>
          <StyledTicketSearchInput
            placeholder={
              isSearchMode
                ? intl.formatMessage({ id: 'desk.tickets.search.placeholder.expanded' })
                : intl.formatMessage({ id: 'desk.tickets.search.placeholder.collapsed' })
            }
            $isSearchMode={isSearchMode}
            initialSearchQuery={initialSearchQuery}
            showBackButton={false}
            onSearch={onSearch}
            onResetButtonClick={handleSearchReset}
            onClick={handleSearchClick}
          />
          {!isSearchMode && <TicketsExportButton onClick={handleExportButtonClick} />}
        </RightContainer>
      </PageHeader>
      {isShownExportNotification && (
        <NotificationWrapper>
          <InlineNotification
            type="info"
            message={intl.formatMessage(
              { id: 'desk.dataExport.notification.dataExport.start' },
              {
                link: <Link to="data_exports">{intl.formatMessage({ id: 'desk.dataExport.title' })}</Link>,
              },
            )}
            onClose={handleCloseNotification}
          />
        </NotificationWrapper>
      )}
      <TicketsListContainer $isSearchMode={isSearchMode}>
        {isSearchMode ? (
          ticketCount > 0 && (
            <SearchResult>
              {intl.formatMessage({ id: 'desk.tickets.header.searchResults' })}
              <SearchResultCount>{intl.formatNumber(ticketCount)}</SearchResultCount>
            </SearchResult>
          )
        ) : (
          <TicketFilters />
        )}
        <TicketsList timezone={timezone} handleActionChange={handleTicketItemActionChange} />
      </TicketsListContainer>
    </StyledTicketsList>
  );
};
