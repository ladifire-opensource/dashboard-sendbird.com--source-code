import { FC, useRef, MouseEventHandler, useMemo, ReactNode } from 'react';

import styled, { css } from 'styled-components';

import { Tooltip, TooltipTrigger, TooltipRef, IconButtonProps } from 'feather';

import { ZIndexes } from '@ui';

import { CopyButton } from '../button/copyButton';
import { EllipsizedSingleLineText } from '../ellipsisText/ellipsizedSingleLineText';

type Props = {
  className?: string;
  content: string;
  copyButtonProps?: Partial<Omit<IconButtonProps, 'onClick'>>;
  render?: (content: string) => ReactNode;
  /**
   * If this prop is undefined, the tooltip will not appear.
   */
  tooltipContent?: string;

  /**
   * If true, it will show a copy button which copies the content of `content` prop.
   */
  isCopyable?: boolean;
};

const wrapperCSS = css`
  display: flex;
  align-items: center;
  height: 20px;
  overflow: visible;
`;

const WrapperTooltip = styled(Tooltip)`
  ${wrapperCSS}
`;

export const CellContentWithTooltip: FC<Props> = ({
  className,
  content,
  render,
  tooltipContent,
  copyButtonProps,
  isCopyable = false,
}) => {
  const tooltipRef = useRef<TooltipRef>(null);

  const onTextMouseEnter: MouseEventHandler<HTMLSpanElement> = () => {
    tooltipRef.current?.show();
  };

  const onTextMouseLeave: MouseEventHandler<HTMLSpanElement> = () => {
    tooltipRef.current?.hide();
  };

  const Wrapper: FC = useMemo(
    () =>
      tooltipContent
        ? ({ children }) => (
            <WrapperTooltip
              ref={tooltipRef}
              className={className}
              placement="top"
              popperProps={{ modifiers: { offset: { offset: '0, 10' } } }}
              content={tooltipContent}
              tooltipContentStyle={`max-width: initial; padding: 8px 16px; z-index: ${ZIndexes.tooltipOverNavigation};`}
              trigger={TooltipTrigger.Manual}
            >
              {children}
            </WrapperTooltip>
          )
        : ({ children }) => <div css={wrapperCSS}>{children}</div>,
    [className, tooltipContent],
  );

  return (
    <Wrapper>
      <EllipsizedSingleLineText onMouseEnter={onTextMouseEnter} onMouseLeave={onTextMouseLeave}>
        {render ? render(content) : content}
      </EllipsizedSingleLineText>
      {isCopyable && <CopyButton {...copyButtonProps} copyableText={content} />}
    </Wrapper>
  );
};
