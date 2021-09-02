import { useRef, FC, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Link, LinkVariant } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useShowDialog } from '@hooks';

type Props = {
  content: string;
  showMoreDialogTitle: string;
};

const Container = styled.div``;

export const EllipsizedText: FC<Props> = ({ content, showMoreDialogTitle }) => {
  const intl = useIntl();
  const containerRef = useRef<HTMLDivElement>(null);
  const [ellipsizedContent, setEllipsizedContent] = useState('');

  const openShowMoreDialog = useShowDialog({
    dialogTypes: DialogType.AnnouncementDataDisplay,
    dialogProps: { title: showMoreDialogTitle, content },
  });

  useEffect(() => {
    if (containerRef.current == null) {
      return;
    }

    const { current: messageWrapper } = containerRef;
    if (messageWrapper.scrollHeight <= 60) {
      return;
    }

    const { textContent } = content.split('').reduce(
      ({ scrollHeight, textContent, isFinal }, cur) => {
        if (isFinal) {
          return { scrollHeight, textContent, isFinal };
        }

        const ellipsizedContent = textContent + cur;
        messageWrapper.textContent = `${ellipsizedContent}... `;
        const fakeMoreButton = document.createElement('span');
        fakeMoreButton.textContent = intl.formatMessage({ id: 'chat.announcements.detail.info.btn.more' });
        fakeMoreButton.setAttribute('style', 'font-weight: 500; vertical-align: baseline;');
        messageWrapper.append(fakeMoreButton);
        if (messageWrapper.scrollHeight > 60 && scrollHeight <= 60) {
          return { scrollHeight, textContent, isFinal: true };
        }
        return { scrollHeight: messageWrapper.scrollHeight, textContent: ellipsizedContent, isFinal: false };
      },
      { scrollHeight: 0, textContent: '', isFinal: false },
    );
    setEllipsizedContent(textContent);
  }, [intl, content]);

  if (!content) {
    return null;
  }

  return (
    <Container ref={containerRef}>
      {ellipsizedContent ? (
        <>
          {ellipsizedContent}...{' '}
          <Link variant={LinkVariant.Inline} role="button" onClick={openShowMoreDialog}>
            {intl.formatMessage({ id: 'chat.announcements.detail.info.btn.more' })}
          </Link>
        </>
      ) : (
        content
      )}
    </Container>
  );
};
