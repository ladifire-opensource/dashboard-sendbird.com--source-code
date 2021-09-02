import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { Body, cssVariables, Headings, Icon, Link, Spinner, transitionDefault } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { DeskMessageRenderMode } from '@constants';
import { useShowDialog } from '@hooks';

type Props = { data: any; messageRenderMode?: 'default' | 'compact' };

interface FAQBotAnswerItem {
  category: string;
  question: string;
  answer: string;
  keyword: string;
  url: string;
  image_url: string;
  objectID: string;
}

const dataHasFAQBotAnswers = (data: any): data is { results: FAQBotAnswerItem[] } => {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.results) &&
    (data.results as any[]).every(
      (item) =>
        typeof item === 'object' &&
        typeof item.question === 'string' &&
        typeof item.answer === 'string' &&
        typeof item.objectID === 'string',
    )
  );
};

const ImageWrapper = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${cssVariables('neutral-1')};
  width: 64px;
  height: 64px;
  overflow: hidden;
`;

const InnerShadow = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  opacity: 0.08;
  border: 1px solid ${cssVariables('neutral-9')};
  border-radius: 8px;
`;

const AnswerParagraph = styled.p`
  white-space: pre-line;
  word-break: break-word;
`;

const Image = styled(({ src, className }: { src: string; className?: string }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState<'init' | 'error' | 'loaded'>('init');
  return (
    <ImageWrapper className={className}>
      {status === 'error' && <Icon size={24} icon="no-thumbnail" color={cssVariables('neutral-5')} />}
      {status === 'init' && <Spinner size={20} stroke={cssVariables('neutral-5')} />}
      <img
        ref={imageRef}
        src={src}
        css={`
          width: 100%;
          height: 100%;
          object-fit: cover;

          ${status !== 'loaded' &&
          css`
            width: 0;
            opacity: 0;
          `}
        `}
        onLoad={() => {
          setStatus('loaded');
        }}
        onError={() => {
          setStatus('error');
        }}
        alt="" //[TODO] alt text
      />
      <InnerShadow />
    </ImageWrapper>
  );
})``;

const FAQAnswerListItem = styled.button<{ $hasImage: boolean; $messageRenderMode: DeskMessageRenderMode }>`
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 8px;
  background: none;
  cursor: pointer;
  padding: 12px;
  width: ${(props) => (props.$messageRenderMode === 'compact' ? '100%' : '340px')};
  text-align: left;
  transition: 0.2s ${transitionDefault};
  transition-property: border, background;

  ${Body['body-short-01']}

  &:hover {
    border-color: ${cssVariables('purple-7')};
  }

  &:focus {
    outline: 0;
    border-color: ${cssVariables('purple-7')};
    background: ${cssVariables('purple-2')};
  }

  & + & {
    margin-top: 8px;
  }

  ${(props) =>
    props.$hasImage &&
    (props.$messageRenderMode === 'default'
      ? css`
          padding-left: 88px;

          ${Image} {
            position: absolute;
            top: 12px;
            left: 12px;
          }
        `
      : css`
          ${Image} {
            margin-bottom: 8px;
          }
        `)}

  a {
    margin-top: 8px;
  }
`;

const TextWrapper = styled.div<{ $isClipped: boolean }>`
  max-height: 64px;
  overflow: hidden;

  dt {
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    overflow: hidden;
    ${Headings['heading-01']}
  }

  dd {
    -webkit-box-orient: vertical;
    -webkit-line-clamp: ${(props) => (props.$isClipped ? 1 : 2)};
    display: -webkit-box;
    margin-top: 4px;
    overflow: hidden;
    word-break: break-word;
  }
`;

const useFullTextDialog = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();

  const showFullTextDialog = useCallback(
    ({ question, answer, image_url, url }: FAQBotAnswerItem) => {
      showDialog({
        dialogTypes: DialogType.Custom,
        dialogProps: {
          title: question,
          body: (
            <div
              css={`
                display: flex;
                flex-direction: row;
              `}
            >
              {image_url && (
                <Image
                  src={image_url}
                  css={`
                    flex: none;
                    margin-right: 16px;
                  `}
                />
              )}
              <div
                css={`
                  ${Body['body-short-01']}
                `}
              >
                <AnswerParagraph>{answer}</AnswerParagraph>
                {url && (
                  <Link
                    href={url}
                    target="_blank"
                    iconProps={{ icon: 'open-in-new', size: 16 }}
                    css="margin-top: 16px;"
                  >
                    {intl.formatMessage({ id: 'desk.conversation.faqbot.btn.seeMore' })}
                  </Link>
                )}
              </div>
            </div>
          ),
          isNegativeButtonHidden: true,
        },
      });
    },
    [intl, showDialog],
  );

  return showFullTextDialog;
};

const Text: FC<Pick<FAQBotAnswerItem, 'question' | 'answer'>> = ({ question, answer }) => {
  const [isClipped, setIsClipped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setIsClipped(containerRef.current.clientHeight < containerRef.current.scrollHeight);
    }
  }, []);

  return (
    <TextWrapper ref={containerRef} $isClipped={isClipped}>
      <dt>{question}</dt>
      <dd>{answer}</dd>
    </TextWrapper>
  );
};

export const FAQBotAnswers: FC<Props> = ({ data, messageRenderMode = 'default' }) => {
  const intl = useIntl();
  const showFullTextDialog = useFullTextDialog();

  if (!dataHasFAQBotAnswers(data)) {
    return null;
  }

  return (
    <dl>
      {data.results.map((item) => {
        const { objectID, question, answer, image_url, url } = item;
        return (
          <FAQAnswerListItem
            key={objectID}
            $hasImage={!!image_url}
            $messageRenderMode={messageRenderMode}
            onClick={() => showFullTextDialog(item)}
          >
            {image_url && <Image src={image_url} />}
            <Text question={question} answer={answer} />

            {url && (
              <Link
                href={url}
                target="_blank"
                iconProps={{ icon: 'open-in-new', size: 16 }}
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                {intl.formatMessage({ id: 'desk.conversation.faqbot.btn.seeMore' })}
              </Link>
            )}
          </FAQAnswerListItem>
        );
      })}
    </dl>
  );
};
