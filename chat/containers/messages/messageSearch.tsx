import { Component } from 'react';
import { connect } from 'react-redux';

import styled, { css } from 'styled-components';

import {
  cssVariables,
  Button,
  ScrollBar,
  DateRangePicker,
  DateRangePickerValue,
  ContextualHelp,
  TooltipTargetIcon,
  Dropdown,
} from 'feather';
import escapeRegExp from 'lodash/escapeRegExp';
import moment, { Moment } from 'moment-timezone';

import { commonActions, chatActions } from '@actions';
import { AuthorizationContext } from '@authorization';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { ISO_DATE_FORMAT } from '@constants';
import { selectApplication_DEPRECATED } from '@selectors';
import {
  Table,
  HeaderMenu,
  HeaderMenuSelector,
  HeaderMenuItem,
  InputCheckbox,
  BasicInput,
  BasicTextarea,
  FormSet,
  FormAction,
  Pagination,
  ContentContainerHorizontalPaddingContext,
} from '@ui/components';
import { PropOf } from '@utils';

import { CustomPricingLink, InputSupportButton, AlertPlanLimited, AlertPlanLimitedDescription } from './components';
import { MessageList } from './messageList';

const MessageSearchContent = styled.div`
  padding-bottom: 24px;
`;

const MessageSearchPanel = styled.div`
  label {
    display: inline-block;
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 500;
    color: ${cssVariables('neutral-7')};
  }
`;

const MessageSearchContainer = styled.div`
  margin-top: 24px;
  display: grid;
  grid-template-columns: 75% 1fr;
  grid-gap: 0 24px;
`;

const MessagesTable = styled(Table)`
  flex: 1;
  min-height: 0;
  border-right: none;
  border-left: none;
  box-shadow: none;
`;

const timezoneOptions = moment.tz.names();

const mapStateToProps = (state: RootState) => ({
  application: selectApplication_DEPRECATED(state),
  messages: state.messages,
});

const mapDispatchToProps = {
  showDialogsRequest: commonActions.showDialogsRequest,

  resetMessagesRequest: chatActions.resetMessagesRequest,
  setMessagesSearchOptions: chatActions.setMessagesSearchOptions,
  searchMessagesRequest: chatActions.searchMessagesRequest,
  recoverMessageRequest: chatActions.recoverMessageRequest,
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

type State = {
  dateRangePickerState: {
    dateRange?: { startDate: Moment | null; endDate: Moment | null };
    value: DateRangePickerValue;
  };
  checked: boolean[];
  isAllChecked: boolean;
  selectedMessages: any[]; // FIXME: replace any
  timezoneQuery: string;
};

class MessageSearchConnectable extends Component<Props, State> {
  public state = {
    dateRangePickerState: {
      dateRange: { startDate: moment(), endDate: moment() },
      value: DateRangePickerValue.Today,
    },
    height: 0,
    checked: this.props.messages.items.map(() => false),
    isAllChecked: false,
    selectedMessages: [] as any[],
    timezoneQuery: '',
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.state.checked.length !== nextProps.messages.items.length) {
      this.setState({ checked: nextProps.messages.items.map(() => false) });
    }
  }

  private checkedLength = () => {
    return this.state.checked.filter((checkedItem) => checkedItem === true).length;
  };

  private handleSelectAll = () => {
    if (this.props.messages.items.length > 0) {
      this.selectAll(!(this.checkedLength() !== 0 && this.state.isAllChecked));
    }
  };

  private selectAll = (checked) => {
    // Set all checked states to true
    const checkedAll = this.state.checked.map(() => checked);
    const selectedMessages = checked ? this.props.messages.items : [];
    this.setState({
      checked: checkedAll,
      isAllChecked: true,
      selectedMessages,
    });
  };

  private handleCheck = (nextCheck, index, message) => {
    const { checked } = this.state;
    checked[index] = nextCheck;

    const selectedMessages = nextCheck
      ? [...this.state.selectedMessages, message]
      : this.state.selectedMessages.filter((selectedMessage) => {
          return selectedMessage !== message;
        });

    this.setState((prevState) => {
      return {
        checked,
        selectedMessages,
        isAllChecked:
          prevState.checked.filter((c) => {
            return c;
          }).length === prevState.checked.length ||
          prevState.checked.filter((c) => {
            return !c;
          }).length === prevState.checked.length,
      };
    });
  };

  private handleDeleteMessage = () => {
    if (this.state.selectedMessages.length > 0) {
      this.props.showDialogsRequest({
        dialogTypes: DialogType.DeleteMessage,
        dialogProps: {
          multiple: true,
          messages: this.state.selectedMessages.filter((message) => {
            return !message['removed'];
          }),
        },
      });
    }
  };

  private setSearchOption = (newPayload) => {
    const payload = {
      ...this.props.messages.options,
      ...newPayload,
    };
    this.props.setMessagesSearchOptions(payload);
  };

  private handleChangeDateRange: PropOf<typeof DateRangePicker, 'onChange'> = (value, dateRange) => {
    this.setState({ dateRangePickerState: { value, dateRange } });
  };

  private handleChangeChannelURL = (e) => {
    this.setSearchOption({ channel_url: e.target.value });
  };

  private handleChangeKeyword = (e) => {
    this.setSearchOption({ keyword: e.target.value });
  };

  private handleChangeUserID = (e) => {
    this.setSearchOption({ user_id: e.target.value });
  };

  private handleChangeExcludeRemoved = () => {
    this.setSearchOption({
      excludeRemoved: !this.props.messages.options.excludeRemoved,
    });
  };

  private handleChangeTimezone = (timezone) => {
    this.setSearchOption({ timezone });
  };

  private handlePageClick = (page) => {
    this.searchMessages(page);
  };

  private searchMessages = (page = 1) => {
    const {
      dateRangePickerState: { dateRange },
    } = this.state;
    const { timezone } = this.props.messages.options;

    const { startDate: startDateMoment, endDate: endDateMoment } = dateRange;

    const startDate = moment.tz(startDateMoment.format(ISO_DATE_FORMAT), timezone).startOf('day').unix();
    const endDate = moment.tz(endDateMoment.format(ISO_DATE_FORMAT), timezone).endOf('day').unix();

    const datePayload = {
      startDate,
      endDate,
    };

    const payload = {
      ...this.props.messages.options,
      ...datePayload,
      page,
    };

    this.props.searchMessagesRequest(payload);
  };

  private handleSubmit = (e) => {
    e.preventDefault();

    this.searchMessages(1);
  };

  private onTimezoneQueryChange = (value: string) => {
    this.setState({
      timezoneQuery: value,
    });
  };

  public render() {
    const { checked, isAllChecked, selectedMessages, dateRangePickerState } = this.state;
    const { messages, recoverMessageRequest } = this.props;

    const { isFetching, isSearched, items } = messages;

    return (
      <ContentContainerHorizontalPaddingContext.Consumer>
        {() => (
          <>
            <AuthorizationContext.Consumer>
              {({ isPermitted, isFeatureEnabled }) => (
                <MessageSearchContainer>
                  <MessageSearchContent>
                    {items.length > 0 && isPermitted(['application.messageSearch.all']) && (
                      <HeaderMenu
                        styles={css`
                          flex: none;
                          height: auto;
                          padding: 0 4px 16px;
                          border-top: none;
                          border-bottom: 1px solid ${cssVariables('neutral-3')};
                        `}
                      >
                        <HeaderMenuSelector disabled={items.length === 0} onClick={this.handleSelectAll}>
                          <InputCheckbox checked={this.checkedLength() !== 0 && isAllChecked} useDiv={true} />
                        </HeaderMenuSelector>
                        {selectedMessages.length > 0 && (
                          <HeaderMenuItem
                            label="Delete"
                            disabled={selectedMessages.length === 0}
                            onClick={this.handleDeleteMessage}
                          />
                        )}
                      </HeaderMenu>
                    )}
                    <MessagesTable>
                      <ScrollBar>
                        <MessageList
                          isFetching={isFetching}
                          isSearched={isSearched}
                          messageRemovable={isPermitted(['application.messageSearch.all'])}
                          checked={checked}
                          messages={items}
                          recoverMessageRequest={recoverMessageRequest}
                          handleCheck={this.handleCheck}
                        />
                      </ScrollBar>
                    </MessagesTable>
                    {items.length > 0 ? (
                      <Pagination
                        style={{
                          marginTop: '20px',
                        }}
                        pagination={this.props.messages.pagination}
                        onPageClick={this.handlePageClick}
                      />
                    ) : (
                      ''
                    )}
                  </MessageSearchContent>
                  <MessageSearchPanel>
                    {isFeatureEnabled('message_search') ? (
                      <form onSubmit={this.handleSubmit}>
                        <FormSet>
                          <label htmlFor="message-search-timezone-dropdown">Timezone</label>
                          <div>
                            <Dropdown
                              width="100%"
                              placeholder="Time zone"
                              itemHeight={32}
                              useSearch={true}
                              items={timezoneOptions.filter(
                                (value) =>
                                  !this.state.timezoneQuery ||
                                  value.match(new RegExp(escapeRegExp(this.state.timezoneQuery), 'ig')),
                              )}
                              selectedItem={messages.options.timezone}
                              onSearchChange={this.onTimezoneQueryChange}
                              onChange={this.handleChangeTimezone}
                              toggleButtonProps={{ id: 'message-search-timezone-dropdown' }}
                            />
                          </div>
                        </FormSet>
                        <FormSet>
                          <label htmlFor="message-search-datepicker">Date</label>
                          <InputSupportButton>
                            <ContextualHelp
                              content="We only support up to 7 days for now but should support longer range soon!"
                              placement="top-end"
                              tooltipContentStyle="max-width: 256px;"
                            >
                              <TooltipTargetIcon icon="question" />
                            </ContextualHelp>
                          </InputSupportButton>
                          <DateRangePicker
                            value={dateRangePickerState.value}
                            dateRange={dateRangePickerState.dateRange}
                            onChange={this.handleChangeDateRange}
                            maximumNights={6}
                            placement="bottom-end"
                            fullWidth={true}
                            dropdownProps={{ toggleButtonProps: { id: 'message-search-datepicker' } }}
                          />
                        </FormSet>
                        <FormSet>
                          <label htmlFor="message-search-keyword">Keyword</label>
                          <BasicInput
                            id="message-search-keyword"
                            placeholder="Keyword"
                            value={messages.options.keyword}
                            onChange={this.handleChangeKeyword}
                          />
                        </FormSet>
                        <FormSet>
                          <label htmlFor="message-search-user-id">User ID</label>
                          <BasicInput
                            id="message-search-user-id"
                            placeholder="User ID"
                            value={messages.options.user_id}
                            onChange={this.handleChangeUserID}
                          />
                        </FormSet>
                        <FormSet>
                          <label htmlFor="message-search-channel-url">Channel URL</label>
                          <BasicTextarea
                            id="message-search-channel-url"
                            resize={false}
                            style={{
                              height: 85,
                              resize: 'none',
                            }}
                            placeholder="Channel URL"
                            value={messages.options.channel_url}
                            onChange={this.handleChangeChannelURL}
                          />
                        </FormSet>
                        <FormSet>
                          <InputCheckbox
                            checked={messages.options.excludeRemoved === true}
                            disabled={isFetching}
                            onChange={this.handleChangeExcludeRemoved}
                            label="Exclude deleted messages"
                          />
                        </FormSet>
                        <FormAction>
                          <Button
                            buttonType="primary"
                            styles={css`
                              width: 100%;
                            `}
                            type="submit"
                            isLoading={isFetching}
                            disabled={isFetching}
                          >
                            Search
                          </Button>
                        </FormAction>
                      </form>
                    ) : (
                      <AlertPlanLimited>
                        <AlertPlanLimitedDescription>
                          Upgrading to the Sendbird’s custom pricing plan enables you to search and export chat messages
                          in your application.
                        </AlertPlanLimitedDescription>
                        <CustomPricingLink to="/settings/contact_us?category=sales_inquiry">
                          Contact Sales
                        </CustomPricingLink>
                      </AlertPlanLimited>
                    )}
                  </MessageSearchPanel>
                </MessageSearchContainer>
              )}
            </AuthorizationContext.Consumer>
          </>
        )}
      </ContentContainerHorizontalPaddingContext.Consumer>
    );
  }
}

export const MessageSearch = connect(mapStateToProps, mapDispatchToProps)(MessageSearchConnectable);
