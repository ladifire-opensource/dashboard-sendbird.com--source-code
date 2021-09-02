import { useState, ReactNode, useRef, useLayoutEffect, useEffect, HTMLAttributes } from 'react';

import styled, { css } from 'styled-components';

import { IconName, cssVariables, Icon, Subtitles, transitionDefault } from 'feather';

const Toggle = styled(({ on, ...props }) => <Icon size={20} icon="chevron-right" {...props} />)`
  transform: rotate(${(props) => (props.on ? 90 : 0)}deg);
  transition: transform 0.3s ${transitionDefault};
`;

const IconContainer = styled.div``;

const BodyContainer = styled.section<{ expanded: boolean; maxHeight?: number }>`
  position: relative;
  overflow: hidden;
  max-height: ${({ expanded, maxHeight }) => (expanded ? maxHeight : 0)}px;
  transition: max-height 0.3s ${transitionDefault};
`;

const Body = styled.section<{ withIcon: boolean }>`
  padding: 0px 71px 40px ${(props) => (props.withIcon ? 71 : 31)}px;
`;

const HeadContainer = styled.section`
  display: flex;
  position: relative;
  padding: 24px;

  ${Toggle} {
    position: absolute;
    margin: auto;
    right: 24px;
    top: 0px;
    bottom: 0px;
  }
`;

export const Container = styled.section<{ expandable: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;

  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;

  ${IconContainer} {
    margin-top: 8px;
    margin-right: 24px;
  }

  ${(props) =>
    props.expandable &&
    css`
      ${HeadContainer} {
        cursor: pointer;
      }

      &:hover {
        border: 1px solid ${cssVariables('purple-7')};
        ${Toggle} {
          fill: ${cssVariables('purple-7')};
        }
      }
    `}
`;

const Title = styled.h1`
  ${Subtitles['subtitle-02']}
`;

type Props = {
  initial?: boolean;
  expandable?: boolean;
  icon?: IconName;
  title: ReactNode;
  content?: ReactNode;
  onToggle?: (value: boolean) => void;
} & Omit<HTMLAttributes<HTMLDivElement>, 'title'>;

export const Tile = styled(
  ({ initial = false, expandable = true, title, content, icon, onToggle, ...props }: Props) => {
    const bodyRef = useRef<HTMLDivElement>(null);

    const [expanded, setExpanded] = useState(initial);
    const [bodyHeight, setBodyHeight] = useState(bodyRef.current?.clientHeight);

    const onToggleRef = useRef<typeof onToggle | null>(null);

    useEffect(() => {
      onToggleRef.current?.(expanded);
    }, [expanded]);

    useEffect(() => {
      onToggleRef.current = onToggle;
    }, [onToggle]);

    const toggle = () => {
      setExpanded((prev) => !prev);
    };

    const handleClickHead = () => {
      expandable && toggle();
    };

    useLayoutEffect(() => {
      setBodyHeight(bodyRef.current?.clientHeight);
    }, [content]);

    return (
      <Container expandable={expandable} {...props}>
        <HeadContainer onClick={handleClickHead} data-test-id="HeadContainer">
          {icon && (
            <IconContainer>
              <Icon icon={icon} size={24} />
            </IconContainer>
          )}
          <Title>{title}</Title>
          {expandable && <Toggle on={expanded} />}
        </HeadContainer>
        <BodyContainer expanded={expanded} maxHeight={bodyHeight} aria-hidden={!expanded} data-test-id="BodyContainer">
          <Body withIcon={!!icon} ref={bodyRef}>
            {content}
          </Body>
        </BodyContainer>
      </Container>
    );
  },
)``;
