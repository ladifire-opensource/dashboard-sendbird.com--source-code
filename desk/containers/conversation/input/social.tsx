import React, { useRef, useEffect, useState, useCallback, useContext, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import styled, { css } from 'styled-components';

import { cssVariables, Body, Subtitles, IconButton, toast } from 'feather';
import debounce from 'lodash/debounce';
import { ContentRect } from 'resize-observer/lib/ContentRect';

import { deskActions } from '@actions';
import { uploadTwitterMedia } from '@desk/api';
import DeskCustomerAvatar from '@desk/components/DeskCustomerAvatar';
import QuickRepliesPopper from '@desk/components/QuickRepliesPopper';
import { ImageFileRenderer, VideoFileRenderer } from '@desk/components/chatBubble/mediaRenderers';
import { QuickRepliesContext } from '@desk/containers/settings/quickReplies/QuickRepliesContext';
import { getKeywordNearCaretOnContentEditable } from '@desk/containers/settings/quickReplies/caretUtils';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { QuickReplyTemplate } from '@desk/hooks/useQuickReply';
import { usePrevious, useOutsideEventByRef } from '@hooks';
import { useCharDirection } from '@hooks/useCharDirection';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { StyledProps, ZIndexes } from '@ui';
import { ContentEditable, ContentEditableRef } from '@ui/components';
import { convertURLsAndEmailsToLinks } from '@utils';

const BYTES_IN_MEGABYTE = 1000000;

const StyledSocialInput = styled.div<{ workingMessage: boolean }>`
  background: white;
  position: relative;
  margin-right: 20px;
  margin-bottom: 18px;
  margin-left: 20px;
  border-radius: 4px;
  border: 1px solid ${cssVariables('neutral-3')};
  box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.05);

  ${(props) => (props.workingMessage ? `z-index: ${ZIndexes.previewBackground + 1};` : '')};

  /* onMouseLeave is not called on a disabled button without this workaround. https://github.com/facebook/react/issues/4251 */
  button[disabled] {
    pointer-events: none;
  }
`;

const CEWrapper = styled.div<StyledProps>`
  max-height: ${(props) => props.maxHeight}px;
  padding-right: 120px;
  overflow: auto;
`;

const SocialInputMenu = styled.div`
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 40px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
`;

const SocialInputTypes = styled.div`
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: ${cssVariables('neutral-10')};
`;

const Account = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

const AccountText = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${cssVariables('neutral-7')};
`;

const AccountProfile = styled.div`
  margin: 0 10px;
`;

const FileInputWrapper = styled.div`
  position: absolute;
  right: 16px;
  bottom: 16px;
  cursor: pointer;
`;

const FileInput = styled.label`
  margin-bottom: 0;

  input[type='file'] {
    display: none;
  }
`;

const SendButton = styled(IconButton)`
  margin-left: 4px;
`;

const SocialWorkingMessage = styled.div`
  position: relative;
  background: rgba(236, 239, 241, 0.9);
  padding: 20px 16px 18px;
`;

const SocialWorkingMessageCustomer = styled.div`
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-10')};
`;

const SocialWorkingMessageMessage = styled.div`
  font-size: 14px;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-10')};
  margin-top: 6px;
`;

const SocialWorkingMessageImage = styled.img`
  display: inline-block;
  max-width: 80%;
  max-height: 260px;
  border-radius: 8px;
  margin-top: 8px;
`;

const SocialWorkingMessageVideo = styled.div`
  display: inline-block;
  overflow: hidden;
  border-radius: 8px;
  max-height: 260px;
  margin-top: 8px;
  video {
    max-height: 260px;
  }
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 12px;
  right: 8px;
`;

const Recipients = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  padding: 10px 16px;

  .Recipients__label {
    flex: none;
    margin-right: 8px;
    font-size: 12px;
    line-height: 16px;
    color: ${cssVariables('neutral-7')};
  }

  .Recipients__items {
    ${Body['body-short-01']}
    flex: 1;
    max-height: 60px;
    overflow: hidden;

    // Why use flex container here? Displaying Recipients as inline-block items makes the measurement inaccurate (it
    // adds a slight extra margin.) Displaying them as flex items makes the measurement accurate.
    > .Recipients__itemsMeasurer {
      display: flex;
      flex-wrap: wrap;
    }
  }

  .Recipients__editButton {
    ${Subtitles['subtitle-01']}
    color: ${cssVariables('purple-7')};
    cursor: pointer;
    border: 0;
    outline: 0;
    background: none;

    :active {
      color: ${cssVariables('neutral-9')};
    }

    :hover {
      color: ${cssVariables('purple-8')};
      text-decoration: underline;
    }
  }
`;

const Recipient = styled.span`
  ${Body['body-short-01']}
  display: inline-block;
  max-width: 400px;
  text-overflow: ellipsis;
  overflow-x: hidden;

  :not(:last-child) {
    margin-right: 8px;
  }
`;

const FilePreviewGrid = styled.div`
  display: grid;
  grid-gap: 4px;
  grid-template-columns: repeat(4, auto);
  grid-auto-flow: row;
  justify-content: start;
  padding: 0 16px;
  margin-top: 16px;
`;

const FilePreviewItem = styled.div`
  position: relative;
`;

const RemoveButton = styled(IconButton)`
  position: absolute;
  top: 2px;
  right: 2px;
`;

const DisabledCover = styled.div<{ isDisabled: boolean }>`
  display: ${({ isDisabled }) => (isDisabled ? 'block' : 'none')};
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: ${cssVariables('neutral-1')};
  opacity: 0.4;
  border-radius: 4px;
  z-index: 1;
`;

const ToggleQuickReplies = styled.div``;

const IconButtonContainer = styled.div`
  display: inline-block;
`;

const mapStateToProps = (state: RootState) => {
  return {
    agentTyping: state.conversation.typingStatus.agentTyping,
    isConnected: state.sendbird.isConnected,
    isFetchingConversation: state.conversation.isFetching,
  };
};

const mapDispatchToProps = { setAgentTypingStatus: deskActions.setAgentTypingStatus };

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionProps = typeof mapDispatchToProps;

interface SocialInputSubmitEventHandler {
  (text: string, files: File[]): void;
  (text: string, twitterMediaIds: string[]): void;
}

type OwnProps = {
  ticket: SocialTicket;
  maxHeight: number;
  workingMessage?: FacebookFeedType | MergedTwitterStatus;
  recipients?: string[];
  allowedFileExtensions?: string;
  onEditRecipientsButtonClick?: (recipients: string[]) => void;
  onResize?: (contentRect: ContentRect) => void;
  onSubmit: SocialInputSubmitEventHandler;
  onFileChange?: React.ChangeEventHandler<HTMLInputElement>;
  clearWorkingMessage: () => void;
};

type Props = StoreProps & ActionProps & OwnProps;

const isSupportedFileType = (mimeType: string) => mimeType.match(/^(video|image)/i);

export const SocialInputConnectable: React.FC<Props> = ({
  ticket,
  isFetchingConversation,
  isConnected,
  maxHeight,
  workingMessage,
  recipients = [],
  allowedFileExtensions,
  clearWorkingMessage,
  onEditRecipientsButtonClick: onEditRecipientsButtonClickProp,
  onFileChange,
  onResize,
  onSubmit,
  setAgentTypingStatus,
  agentTyping,
}) => {
  const intl = useIntl();
  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();
  const recipientsHeightMeasurerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const toggleQuickRepliesRef = useRef<HTMLDivElement>(null);

  const previousWorkingMessage = usePrevious(workingMessage);
  const [visibleRecipientsLength, setVisibleRecipientsLength] = useState(recipients.length);
  const [files, setFiles] = useState<
    { object: File; url: string | null; isReading: boolean; twitterMediaId: string | null; isUploading: boolean }[]
  >([]);
  const { facebookPage, twitterUser, instagramUser, channelType } = ticket;
  const dir = useCharDirection();
  const {
    searchCounts,

    isOpenCaretPopper,
    isOpenDropdownPopper,

    caretQuickReplyQuery,
    setCaretQuickReplyQuery,

    dropdownQuickReplyQuery,

    contentEditableRef,
    popperContentRef,

    saveSelectionOnContentEditable,

    handleQuickReplyEditableKeyDown,
    handleAppendQuickReply,
    handleQuickReplyIconButtonClick,
    handleCaretItemClick,

    reset,
  } = useContext(QuickRepliesContext);

  const outsideEvent = useOutsideEventByRef({
    ref: inputContainerRef,
    exceptionRefs: [popperContentRef],
    isExceptionsPreventOutsideClickEvent: true,
    onOutsideClick: reset,
  });

  /**
   * Some channel types don't support attaching files to messages. They only support sending either a file or a text
   * message.
   */
  const canAttachFiles =
    ticket.channelType === 'TWITTER_STATUS' || ticket.channelType === 'TWITTER_DIRECT_MESSAGE_EVENT';

  const remainingAttachmentFileCount = (() => {
    switch (ticket.channelType) {
      case 'TWITTER_DIRECT_MESSAGE_EVENT':
      case 'FACEBOOK_CONVERSATION':
      case 'FACEBOOK_FEED':
      case 'WHATSAPP_MESSAGE':
        // These channel types allow only one attachment.
        return 1 - files.length;
      case 'TWITTER_STATUS':
        if (
          files.some(
            ({ object }) => object.type.toLowerCase().startsWith('video') || object.type.toLowerCase() === 'image/gif',
          )
        ) {
          // Twitter status channel type allows to attach only one video or GIF.
          return 0;
        }
        // Twitter status channel type allows to attach up to 4 photos.
        return 4 - files.length;
      default:
        return 0;
    }
  })();

  useEffect(() => {
    // If the attached files are updated, read newly added files and show their previews.
    files
      .filter(({ url, isReading }) => url == null && !isReading)
      .forEach(({ object }) => {
        setFiles((files) => files.map((file) => (file.object === object ? { ...file, isReading: true } : file)));
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
          setFiles((files) =>
            files.map((item) => {
              return item.object === object
                ? { ...item, url: (event.target as FileReader).result as string, isReading: false }
                : item;
            }),
          );
        };
        fileReader.readAsDataURL(object);
      });

    if (
      twitterUser &&
      (ticket.channelType === 'TWITTER_STATUS' || ticket.channelType === 'TWITTER_DIRECT_MESSAGE_EVENT')
    ) {
      // Upload media for Twitter tickets
      files
        .filter(({ twitterMediaId, isUploading }) => !isUploading && twitterMediaId == null)
        .forEach(({ object }) => {
          setFiles((files) => files.map((file) => (file.object === object ? { ...file, isUploading: true } : file)));
          uploadTwitterMedia(pid, region, {
            id: twitterUser.id,
            channelType: ticket.channelType,
            filedata: object,
          })
            .then(({ data }) => {
              const { media_id_string } = data;
              setFiles((files) =>
                files.map((file) =>
                  file.object === object ? { ...file, isUploading: false, twitterMediaId: media_id_string } : file,
                ),
              );
            })
            .catch((error) => {
              toast.error({ message: getErrorMessage(error) });
              setFiles((files) => files.filter((file) => file.object !== object));
            });
        });
    }
  }, [files, getErrorMessage, pid, region, ticket, ticket.channelType, twitterUser]);

  const resetVisibleRecipientsLength = () => {
    setVisibleRecipientsLength(recipients.length);
  };

  const measureAndAdjustRecipientsHeight = () => {
    if (!recipientsHeightMeasurerRef.current) {
      return;
    }

    if (recipientsHeightMeasurerRef.current.offsetHeight > 20) {
      setVisibleRecipientsLength((length) => length - 1);
    }
  };

  /**
   * Make sure the following two useEffect hooks keep this order, or `resetVisibleRecipientsLength` hook will overwrite
   * the effect of `measureAndAdjustRecipientsHeight`.
   */
  useEffect(resetVisibleRecipientsLength, [recipients]);
  useEffect(measureAndAdjustRecipientsHeight, [visibleRecipientsLength]);

  useEffect(() => {
    if (workingMessage !== previousWorkingMessage && contentEditableRef.current) {
      contentEditableRef.current.focus();
    }
  }, [workingMessage, previousWorkingMessage, contentEditableRef]);

  useEffect(() => {
    if (isConnected) {
      contentEditableRef.current && contentEditableRef.current.focus();
    } else {
      contentEditableRef.current && contentEditableRef.current.blur();
    }
  }, [contentEditableRef, isConnected]);

  useEffect(() => {
    setAgentTypingStatus(false);
  }, [setAgentTypingStatus]);

  useEffect(() => {
    if (isOpenCaretPopper || isOpenDropdownPopper) {
      outsideEvent.subscribe();
    }

    if (!isOpenCaretPopper && !isOpenDropdownPopper) {
      outsideEvent.unsubscribe();
    }
  }, [isOpenCaretPopper, isOpenDropdownPopper, outsideEvent]);

  const debouncedSetCaretQuickReplyQuery = useMemo(
    () =>
      debounce((keyword: string) => {
        setCaretQuickReplyQuery(keyword);
      }, 400),
    [setCaretQuickReplyQuery],
  );

  const handleKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>, text: string) => {
      saveSelectionOnContentEditable();

      const isAgentTyping = !!text;
      if (isAgentTyping !== agentTyping) {
        setAgentTypingStatus(isAgentTyping);
      }

      if (['Enter', 'Escape'].includes(event.key) && (isOpenCaretPopper || isOpenDropdownPopper)) {
        reset();
        return;
      }

      const query = getKeywordNearCaretOnContentEditable(contentEditableRef, '#');
      if (query !== caretQuickReplyQuery) {
        if (query === '#') {
          setCaretQuickReplyQuery('#');
          debouncedSetCaretQuickReplyQuery.cancel();
          return;
        }

        if (query.indexOf('#') === 0) {
          debouncedSetCaretQuickReplyQuery(query);
          return;
        }

        setCaretQuickReplyQuery('');
        debouncedSetCaretQuickReplyQuery.cancel();
      }
    },
    [
      agentTyping,
      caretQuickReplyQuery,
      contentEditableRef,
      debouncedSetCaretQuickReplyQuery,
      isOpenCaretPopper,
      isOpenDropdownPopper,
      reset,
      saveSelectionOnContentEditable,
      setAgentTypingStatus,
      setCaretQuickReplyQuery,
    ],
  );

  const handleKeyDown = (e) => {
    handleQuickReplyEditableKeyDown(ticket, e);
  };

  const renderWorkingMessage = () => {
    if (!workingMessage) {
      return null;
    }
    if (channelType === 'FACEBOOK_FEED') {
      const { attachments, message } = workingMessage as FacebookFeedType;
      let attachmentComponent: string | React.ReactElement<any> = '';
      if (attachments) {
        const attachment = JSON.parse(attachments);
        switch (attachment.type) {
          case 'photo':
            attachmentComponent = <SocialWorkingMessageImage src={attachment.payload.url} />;
            break;
          case 'video':
            attachmentComponent = (
              <SocialWorkingMessageVideo>
                <video preload="auto" muted={true} src={attachment.payload.url} controls={true} />
              </SocialWorkingMessageVideo>
            );
          // no default
        }
      }
      return (
        <>
          <div>{message}</div>
          {attachmentComponent}
        </>
      );
    }

    if (channelType === 'TWITTER_STATUS') {
      const { text } = workingMessage as MergedTwitterStatus;
      return convertURLsAndEmailsToLinks(text);
    }
  };

  const handleWorkingMessageCloseClick = () => {
    clearWorkingMessage();
  };

  const findFileExceedingSizeLimit = useCallback(
    (files: File[]) => {
      for (const file of files) {
        const sizeLimitInMegabyte = (() => {
          switch (ticket.channelType) {
            case 'TWITTER_STATUS':
            case 'TWITTER_DIRECT_MESSAGE_EVENT':
              return file.type.toLowerCase().startsWith('video') || file.type.toLowerCase() === 'image/gif' ? 15 : 5;
            case 'FACEBOOK_CONVERSATION':
            case 'FACEBOOK_FEED':
              return 25;
            case 'WHATSAPP_MESSAGE':
              return 16;
            default:
              return 0;
          }
        })();

        if (file.size > sizeLimitInMegabyte * BYTES_IN_MEGABYTE) {
          return { file, limit: sizeLimitInMegabyte };
        }
      }
      return undefined;
    },
    [ticket.channelType],
  );

  const appendFiles = (newFiles: File[]) => {
    setFiles((currentFiles) => [
      ...currentFiles,
      ...newFiles.map((file) => ({
        object: file,
        isReading: false,
        isUploading: false,
        twitterMediaId: null,
        url: null,
      })),
    ]);
  };

  const showFileLimitExceededToast = ({ limit, multiple = false }: { limit: number; multiple?: boolean }) => {
    toast.error({
      message: intl.formatMessage(
        {
          id: multiple
            ? 'desk.conversation.input.noti.error.fileSizeLimitExceededMultiple'
            : 'desk.conversation.input.noti.error.fileSizeLimitExceeded',
        },
        { limitInMegabyte: limit },
      ),
    });
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const fileList: File[] = [];
    for (let index = 0; index < e.target.files.length; index += 1) {
      fileList.push(e.target.files.item(index) as File);
    }

    // Clear value to allow user to add the same files again.
    e.target.value = '';

    switch (ticket.channelType) {
      case 'TWITTER_STATUS': {
        if (fileList.some((file) => !isSupportedFileType(file.type))) {
          // Some files have unsupported type.
          toast.error({
            message: intl.formatMessage({ id: 'desk.conversation.input.noti.error.unsupportedFileFormat' }),
          });
          return;
        }

        if (fileList.length > remainingAttachmentFileCount) {
          if (files.some(({ object: file }) => file.type.toLowerCase() === 'image/gif')) {
            toast.error({ message: intl.formatMessage({ id: 'desk.conversation.input.noti.error.onlyOneGif' }) });
          } else if (files.some(({ object: file }) => file.type.toLowerCase().startsWith('video'))) {
            toast.error({ message: intl.formatMessage({ id: 'desk.conversation.input.noti.error.onlyOneVideo' }) });
          } else {
            toast.error({
              message: intl.formatMessage({ id: 'desk.conversation.input.noti.error.maximumFourImages' }),
            });
          }
          return;
        }
        if (fileList.length > 1) {
          // If the user tries to attach a GIF or video with another file, show an error.
          if (fileList.some((file) => file.type.toLowerCase() === 'image/gif')) {
            toast.error({ message: intl.formatMessage({ id: 'desk.conversation.input.noti.error.onlyOneGif' }) });
            return;
          }
          if (fileList.some((file) => file.type.toLowerCase().startsWith('video'))) {
            toast.error({ message: intl.formatMessage({ id: 'desk.conversation.input.noti.error.onlyOneVideo' }) });
            return;
          }
        }
        const tooLargeFileInfo = findFileExceedingSizeLimit(fileList);
        if (tooLargeFileInfo) {
          showFileLimitExceededToast({ multiple: fileList.length > 1, limit: tooLargeFileInfo.limit });
          return;
        }
        break;
      }
      case 'TWITTER_DIRECT_MESSAGE_EVENT': {
        if (fileList.some((file) => !isSupportedFileType(file.type))) {
          // Some files have unsupported type.
          toast.error({
            message: intl.formatMessage({ id: 'desk.conversation.input.noti.error.unsupportedFileFormat' }),
          });
          return;
        }
        if (fileList.length > remainingAttachmentFileCount) {
          if (fileList.some((file) => file.type.toLowerCase() === 'image/gif')) {
            toast.error({ message: intl.formatMessage({ id: 'desk.conversation.input.noti.error.onlyOneGif' }) });
          } else if (fileList.some((file) => file.type.toLowerCase().startsWith('video'))) {
            toast.error({ message: intl.formatMessage({ id: 'desk.conversation.input.noti.error.onlyOneVideo' }) });
          } else {
            toast.error({ message: intl.formatMessage({ id: 'desk.conversation.input.noti.error.onlyOneImage' }) });
          }
          return;
        }
        const tooLargeFileInfo = findFileExceedingSizeLimit(fileList);
        if (tooLargeFileInfo) {
          showFileLimitExceededToast({ multiple: fileList.length > 1, limit: tooLargeFileInfo.limit });
          return;
        }
        break;
      }
      case 'FACEBOOK_FEED':
      case 'FACEBOOK_CONVERSATION': {
        if (fileList.some((file) => !isSupportedFileType(file.type))) {
          // Some files have unsupported type.
          toast.error({
            message: intl.formatMessage({ id: 'desk.conversation.input.noti.error.unsupportedFileFormat' }),
          });
          return;
        }
        if (fileList.length > remainingAttachmentFileCount) {
          if (fileList.some((file) => file.type.toLowerCase().startsWith('video'))) {
            toast.error({ message: intl.formatMessage({ id: 'desk.conversation.input.noti.error.onlyOneVideo' }) });
          } else {
            toast.error({ message: intl.formatMessage({ id: 'desk.conversation.input.noti.error.onlyOneImage' }) });
          }
          return;
        }
        const tooLargeFileInfo = findFileExceedingSizeLimit(fileList);
        if (tooLargeFileInfo) {
          showFileLimitExceededToast({ multiple: fileList.length > 1, limit: tooLargeFileInfo.limit });
          return;
        }

        break;
      }
      case 'WHATSAPP_MESSAGE': {
        const tooLargeFileInfo = findFileExceedingSizeLimit(fileList);
        if (tooLargeFileInfo) {
          showFileLimitExceededToast({ multiple: fileList.length > 1, limit: tooLargeFileInfo.limit });
          return;
        }
        break;
      }
      default:
        return;
    }
    if (canAttachFiles) {
      appendFiles(fileList);
    } else {
      onSubmit('', fileList);
    }

    // Call event handler only if the validation is succeeded.
    onFileChange && onFileChange(e);
  };

  const onEditRecipientsButtonClick = () => {
    onEditRecipientsButtonClickProp && onEditRecipientsButtonClickProp(recipients);
  };

  const onSendFileButtonClick = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  const onContentEditableSubmit = (text: string) => {
    /**
     * Note that only Twitter tickets handle file uploads in this function. For Facebook tickets, a file is sent right
     * after the user selects a file by the file input's change event handler.
     */
    if (!text.trim() && (files.length === 0 || files.some((file) => file.isUploading))) {
      // Nothing to submit
      return;
    }
    onSubmit(
      text,
      files.map((file) => file.twitterMediaId as string),
    );
    // ContentEditable component should have cleared itself.
    setFiles([]);
  };

  const handleSendButtonClick = () => {
    /**
     * Note that only Twitter tickets handle file uploads in this function. For Facebook tickets, a file is sent right
     * after the user selects a file by the file input's change event handler.
     */
    if (files.some((file) => file.isUploading)) {
      // The user must not be able to click the send button until uploading all media completes.
      return;
    }
    if (!contentEditableRef.current) {
      return;
    }
    const text = contentEditableRef.current.getText();
    if (!text.trim() && files.length === 0) {
      // Nothing to submit
      return;
    }
    onSubmit(
      contentEditableRef.current.getText(),
      files.map((file) => file.twitterMediaId as string),
    );
    contentEditableRef.current.setText('');
    setAgentTypingStatus(false);
    setFiles([]);
  };

  const { accountProfileImageURL, accountName, socialInputType } = (() => {
    const socialInputType = {
      FACEBOOK_CONVERSATION: intl.formatMessage({ id: 'desk.conversation.input.lbl.facebookMessage' }),
      FACEBOOK_FEED: intl.formatMessage({ id: 'desk.conversation.input.lbl.facebookComment' }),
      TWITTER_DIRECT_MESSAGE_EVENT: intl.formatMessage({ id: 'desk.conversation.input.lbl.twitterDM' }),
      TWITTER_STATUS: intl.formatMessage({ id: 'desk.conversation.input.lbl.twitterTweet' }),
      INSTAGRAM_COMMENT: intl.formatMessage({ id: 'desk.conversation.input.lbl.instagramComment' }),
    }[channelType];

    if (facebookPage) {
      return {
        accountProfileImageURL: facebookPage.picture.url,
        accountName: facebookPage.name,
        socialInputType,
      };
    }
    if (twitterUser) {
      return {
        accountProfileImageURL: twitterUser.profileImageUrl,
        accountName: twitterUser.name,
        socialInputType,
      };
    }
    if (instagramUser) {
      return {
        accountProfileImageURL: instagramUser.profilePictureUrl,
        accountName: instagramUser.username,
        socialInputType,
      };
    }
    return {};
  })();

  const handleQuickReplyDropdownSelected = (item: QuickReplyTemplate) => (e: React.MouseEvent<HTMLLIElement>) => {
    e?.preventDefault();
    handleAppendQuickReply(ticket)(item);
    setAgentTypingStatus(true);
  };

  const handleQuickReplyDropdownIconClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    outsideEvent.subscribe();
    saveSelectionOnContentEditable();
    handleQuickReplyIconButtonClick(e);
  };

  const isAllowToSendFile = ticket.channelType !== 'INSTAGRAM_COMMENT';
  const isUploadingFiles = files.some((file) => file.isUploading);
  const isSendButtonDisabled = isUploadingFiles || (!agentTyping && files.length === 0);
  const sendButtons = (() => {
    const sendFileButtonTitle = canAttachFiles
      ? intl.formatMessage({ id: 'desk.conversation.input.button.attachFile' })
      : intl.formatMessage({ id: 'desk.conversation.input.button.sendFile' });
    const sendFileButton = (
      <FileInput>
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
          multiple={remainingAttachmentFileCount > 1}
          accept={allowedFileExtensions}
        />
        <IconButton
          icon="attach"
          size="small"
          buttonType="tertiary"
          title={remainingAttachmentFileCount > 0 ? sendFileButtonTitle : undefined}
          onClick={onSendFileButtonClick}
          disabled={remainingAttachmentFileCount === 0}
          data-test-id="SendFileButton"
        />
      </FileInput>
    );

    const sendMessageButton = (
      <SendButton
        icon="send"
        size="small"
        buttonType="primary"
        title={
          isUploadingFiles
            ? intl.formatMessage({ id: 'desk.conversation.input.button.uploadingFiles' })
            : intl.formatMessage({ id: 'desk.conversation.input.button.send' })
        }
        onClick={handleSendButtonClick}
        disabled={isSendButtonDisabled}
        data-test-id="SendMessageButton"
      />
    );

    const quickReplyButton = (
      <IconButtonContainer>
        <QuickRepliesPopper
          isOpen={isOpenDropdownPopper}
          ticket={ticket}
          searchQuery={dropdownQuickReplyQuery}
          toggleRef={toggleQuickRepliesRef}
          onItemClick={handleQuickReplyDropdownSelected}
        />
        <ToggleQuickReplies ref={toggleQuickRepliesRef}>
          <IconButton
            icon="reply-template"
            size="small"
            buttonType="tertiary"
            title={intl.formatMessage({ id: 'desk.conversation.input.button.quickReply' })}
            disabled={Object.values(searchCounts).every((count) => count === 0)}
            onClick={handleQuickReplyDropdownIconClick}
            data-test-id="QuickReplyShortcutButton"
          />
        </ToggleQuickReplies>
      </IconButtonContainer>
    );

    return (
      <>
        {quickReplyButton}
        {isAllowToSendFile ? sendFileButton : null}
        {sendMessageButton}
      </>
    );
  })();

  const socialInputMenu = useMemo(() => {
    if (ticket.channelType === 'WHATSAPP_MESSAGE') {
      return (
        <SocialInputMenu>
          <SocialInputTypes>
            {intl.formatMessage({ id: 'desk.conversation.input.lbl.socialType.whatsapp' })}
          </SocialInputTypes>
          <Account>
            <AccountText>
              {intl.formatMessage(
                { id: 'desk.conversation.input.lbl.replyWithWhatsApp' },
                {
                  em: (text) => (
                    <span
                      css={css`
                        color: ${cssVariables('neutral-10')};
                      `}
                    >
                      {text}
                    </span>
                  ),
                },
              )}
            </AccountText>
          </Account>
        </SocialInputMenu>
      );
    }
    return (
      <SocialInputMenu>
        <SocialInputTypes>{socialInputType}</SocialInputTypes>
        <Account>
          <AccountText>{intl.formatMessage({ id: 'desk.conversation.input.lbl.replyAs' })}</AccountText>
          <AccountProfile>
            <DeskCustomerAvatar
              size="small"
              profileID={accountName || ''}
              imageUrl={accountProfileImageURL || undefined}
            />
          </AccountProfile>
          <AccountText>{accountName}</AccountText>
        </Account>
      </SocialInputMenu>
    );
  }, [accountName, accountProfileImageURL, intl, socialInputType, ticket.channelType]);

  return (
    <StyledSocialInput workingMessage={!!workingMessage} ref={inputContainerRef}>
      <QuickRepliesPopper
        isOpen={isOpenCaretPopper}
        ticket={ticket}
        searchQuery={caretQuickReplyQuery.slice(1)}
        onItemClick={handleCaretItemClick(ticket)}
      />
      {socialInputMenu}
      {recipients.length > 0 && (
        <Recipients>
          <div className="Recipients__label">
            {intl.formatMessage({ id: 'desk.conversation.input.lbl.replyingTo' })}
          </div>
          <div className="Recipients__items">
            <div className="Recipients__itemsMeasurer" ref={recipientsHeightMeasurerRef}>
              {recipients.slice(0, visibleRecipientsLength).map((item) => (
                <Recipient key={item}>{item}</Recipient>
              ))}
              {visibleRecipientsLength < recipients.length && (
                <Recipient>
                  {intl.formatMessage(
                    { id: 'desk.conversation.input.recipients.more' },
                    { nextRecipientsNumber: recipients.length - visibleRecipientsLength },
                  )}
                </Recipient>
              )}
              <button type="button" className="Recipients__editButton" onClick={onEditRecipientsButtonClick}>
                {intl.formatMessage({ id: 'desk.conversation.input.button.editRecipients' })}
              </button>
            </div>
          </div>
        </Recipients>
      )}
      {workingMessage && (
        <SocialWorkingMessage>
          <CloseButton icon="close" size="xsmall" buttonType="tertiary" onClick={handleWorkingMessageCloseClick} />
          <SocialWorkingMessageCustomer>{ticket.customer.displayName}</SocialWorkingMessageCustomer>
          <SocialWorkingMessageMessage>{renderWorkingMessage()}</SocialWorkingMessageMessage>
        </SocialWorkingMessage>
      )}
      {files.length > 0 && (
        <FilePreviewGrid>
          {files.map((file) => {
            const { object, url, isUploading, isReading } = file;
            const key = `${object.type}_${object.name}_${url}`;
            const onRemoveButtonClick = () => {
              setFiles((files) => files.filter((item) => item !== file));
            };
            const fileRenderer = (() => {
              const fetchStatus = isReading || isUploading ? ('fetching' as const) : undefined;
              if (object.type.toLowerCase() === 'image/gif') {
                return (
                  <ImageFileRenderer
                    file={{ type: 'image', url: url || '', fetchStatus }}
                    frameSize={{ width: 'auto', height: 116 }}
                    borderRadius={8}
                  />
                );
              }
              if (object.type.toLowerCase().startsWith('image')) {
                return (
                  <ImageFileRenderer
                    file={{ type: 'image', url: url || '', fetchStatus }}
                    frameSize={{ width: 116, height: 116 }}
                    borderRadius={8}
                  />
                );
              }
              if (object.type.toLowerCase().startsWith('video')) {
                return (
                  <VideoFileRenderer
                    file={{ type: 'video', url: url || '' }}
                    frameSize={{ width: 'auto', height: 116 }}
                    borderRadius={8}
                  />
                );
              }
            })();
            if (fileRenderer) {
              return (
                <FilePreviewItem key={key}>
                  {fileRenderer}
                  <RemoveButton
                    buttonType="secondary"
                    size="small"
                    icon="remove-filled"
                    title={intl.formatMessage({ id: 'desk.conversation.input.button.removeFile' })}
                    onClick={onRemoveButtonClick}
                  />
                </FilePreviewItem>
              );
            }
            return null;
          })}
        </FilePreviewGrid>
      )}
      <DisabledCover isDisabled={!isConnected} />
      <CEWrapper maxHeight={maxHeight}>
        <ContentEditable
          dir={dir}
          ref={contentEditableRef as React.MutableRefObject<ContentEditableRef>}
          isStopDefaultKeyDownEvent={isOpenCaretPopper}
          isEditable={!isFetchingConversation}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={false}
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
          onResize={onResize}
          onSubmit={onContentEditableSubmit}
          placeholder={intl.formatMessage({ id: 'desk.conversation.input.ph.message' })}
          styles={css`
            word-wrap: break-word;
            white-space: pre-wrap;
          `}
        />
      </CEWrapper>
      <FileInputWrapper>{sendButtons}</FileInputWrapper>
    </StyledSocialInput>
  );
};

export const SocialInput = connect(mapStateToProps, mapDispatchToProps)(SocialInputConnectable);
