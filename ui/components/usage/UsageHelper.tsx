import { FC, MouseEventHandler, ReactNode, useCallback } from 'react';

import styled, { css } from 'styled-components';

import { cssVariables, Typography, Subtitles, Button, Link, Icon, IconName } from 'feather';

type UsageHelperActionButton = {
  type: 'button';
  label: string;
  icon?: IconName;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

type UsageHelperActionLink = {
  type: 'link';
  label: string;
  href: string;
  target?: HTMLAnchorElement['target'];
  icon?: IconName;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

type UsageHelperAction = UsageHelperActionButton | UsageHelperActionLink;

export type UsageHelperContent = {
  description?: ReactNode;
  descriptionSuffix?: ReactNode;
  actions?: UsageHelperAction[];
};

type Props = {
  className?: string;
  title: ReactNode;
  contents: UsageHelperContent | UsageHelperContent[];
  isMultipleContents?: boolean;
};

const UsageHelperTitle = styled.h2`
  ${Typography['label-02']};
  color: ${cssVariables('content-3')};
`;

const UsageHelperDescription = styled.p`
  ${Subtitles['subtitle-01']};
  color: ${cssVariables('content-1')};

  b,
  strong {
    font-weight: 600;
  }

  & + & {
    margin-top: 16px;
  }
`;

const UsageHelperActions = styled.ul`
  margin-top: 2px;
`;

const UsageHelperAction = styled.li<{ $type: UsageHelperAction['type'] }>`
  display: flex;
  align-items: center;
  min-height: 32px;
  transform: translateX(${({ $type }) => ($type === 'button' ? -12 : 0)}px);

  & + & {
    margin-left: 24px;
  }
`;

const UsageHelperBox = styled.div<{ isMultipleContents: boolean }>`
  padding: 24px 24px 16px;
  width: 100%;
  background: ${cssVariables('bg-2')};
  border-radius: 4px;

  ${UsageHelperTitle} + ${UsageHelperDescription} {
    margin-top: 4px;
  }

  ${({ isMultipleContents }) =>
    isMultipleContents &&
    css`
      ${UsageHelperTitle} + ${UsageHelperDescription} {
        margin-top: 12px;
      }

      ${UsageHelperDescription} + ${UsageHelperTitle} {
        margin-top: 16px;
      }

      ${UsageHelperActions} + ${UsageHelperDescription} {
        margin-top: 8px;
      }

      ${UsageHelperActions} {
        margin-top: 0;
      }
    `};
`;

const UsageHelper: FC<Props> = ({ className, title, contents, isMultipleContents = false }) => {
  const renderContent = useCallback(({ description, descriptionSuffix, actions }: UsageHelperContent) => {
    return (
      <>
        {description && (
          <UsageHelperDescription>
            {description}
            {descriptionSuffix}
          </UsageHelperDescription>
        )}
        {actions && (
          <UsageHelperActions>
            {actions.map((actionProps, index) => {
              if (actionProps.type === 'link') {
                const { type, label, href, target, icon, onClick } = actionProps;
                return (
                  <UsageHelperAction key={index} $type={type}>
                    <Link href={href} target={target ?? '_blank'} onClick={onClick}>
                      {label} <Icon size={16} icon={icon ?? 'open-in-new'} />
                    </Link>
                  </UsageHelperAction>
                );
              }

              const { type, label, icon, onClick } = actionProps;
              return (
                <UsageHelperAction key={index} $type={type}>
                  <Button
                    buttonType="primary"
                    size="small"
                    icon={icon ?? 'chevron-right'}
                    variant="ghost"
                    onClick={onClick}
                  >
                    {label}
                  </Button>
                </UsageHelperAction>
              );
            })}
          </UsageHelperActions>
        )}
      </>
    );
  }, []);

  return (
    <UsageHelperBox className={className} isMultipleContents={isMultipleContents}>
      <UsageHelperTitle>{title}</UsageHelperTitle>
      {Array.isArray(contents) ? contents.map((content) => renderContent(content)) : renderContent(contents)}
    </UsageHelperBox>
  );
};

export default UsageHelper;
