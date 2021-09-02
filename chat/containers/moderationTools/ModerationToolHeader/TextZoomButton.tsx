import { FC, useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Manager, Reference, Popper } from 'react-popper';

import styled from 'styled-components';

import {
  Button,
  Icon,
  cssVariables,
  IconButton,
  shadow,
  Typography,
  Tooltip,
  TooltipVariant,
  TooltipRef,
  ZIndexes,
} from 'feather';

import { useOutsideEventByRef } from '@hooks';

import { useDropdownButtonTooltip } from './useDropdownButtonTooltip';

const zoomLevels = [500, 400, 300, 250, 200, 175, 150, 125, 110, 100, 90, 80, 75, 67, 50, 33] as const;
const baseZoomLevel = 100;

export type ZoomLevelPercentageValue = typeof zoomLevels[number];

type Props = {
  className?: string;
  value: ZoomLevelPercentageValue;
  onChange: (value: ZoomLevelPercentageValue) => void;
};

const ZoomInOutButton = styled(IconButton).attrs({
  buttonType: 'secondary',
  size: 'xsmall',
  tooltipPlacement: 'bottom',
})``;

const Menu = styled.div`
  display: flex;
  align-items: center;
  z-index: ${ZIndexes.dropdownMenu};
  border-radius: 4px;
  background: white;
  padding-right: 12px;
  padding-left: 16px;
  height: 44px;
  color: ${cssVariables('neutral-7')};
  ${Typography['label-02']};
  ${shadow[8]};
`;

export const TextZoomButton: FC<Props> = ({ className, value, onChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const intl = useIntl();
  const buttonRef = useRef<HTMLElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const scheduleUpdateRef = useRef(() => {});
  const { getTooltipProps, getButtonProps } = useDropdownButtonTooltip({ isMenuOpen });

  const { subscribe, unsubscribe } = useOutsideEventByRef({
    ref: popoverRef,
    exceptionRefs: [buttonRef],
    isExceptionsPreventOutsideClickEvent: true,
    onOutsideClick: () => {
      setIsMenuOpen(false);
    },
  });

  useEffect(() => {
    if (isMenuOpen) {
      subscribe();

      return () => {
        unsubscribe();
      };
    }
  }, [isMenuOpen, subscribe, unsubscribe]);

  useEffect(() => {
    scheduleUpdateRef.current();
  }, [value]);

  const isMaxZoomLevel = zoomLevels.indexOf(value) === 0;
  const isMinZoomLevel = zoomLevels.indexOf(value) === zoomLevels.length - 1;

  const tooltipRef = useRef<TooltipRef>(null);

  useEffect(() => {
    if (isMenuOpen) {
      tooltipRef.current?.hide();
    }
  }, [isMenuOpen]);

  return (
    <Manager>
      <Reference innerRef={buttonRef}>
        {({ ref }) => (
          <Tooltip
            {...getTooltipProps()}
            content={intl.formatMessage({ id: 'chat.channelDetail.header.btn.zoom' })}
            variant={TooltipVariant.Dark}
          >
            <Button
              {...getButtonProps()}
              ref={ref}
              className={className}
              buttonType="tertiary"
              variant="ghost"
              size="small"
              aria-label={intl.formatMessage({ id: 'chat.channelDetail.header.btn.zoom' })}
              onClick={() => {
                setIsMenuOpen((isMenuOpen) => !isMenuOpen);
              }}
              aria-pressed={isMenuOpen}
              css={`
                padding: 0 6px;
                min-width: 0;

                // override default Button style using !important
                color: ${cssVariables('neutral-10')} !important;

                &[aria-pressed='true'] {
                  background-color: ${cssVariables('neutral-3')} !important;
                }
              `}
            >
              <Icon icon="text-size" color="currentColor" size={20} />
              <Icon icon="chevron-down" color="currentColor" size={16} css="margin-left: 4px;" />
            </Button>
          </Tooltip>
        )}
      </Reference>
      {isMenuOpen && (
        <Popper placement="bottom-end" positionFixed={true} innerRef={popoverRef}>
          {({ ref, style, scheduleUpdate }) => {
            scheduleUpdateRef.current = scheduleUpdate;

            return (
              <Menu ref={ref} style={style}>
                <span css="margin-right: 12px;" data-test-id="TextScale">
                  {intl.formatNumber(value / 100, { style: 'percent' })}
                </span>
                <ZoomInOutButton
                  icon="sign-minus"
                  title={intl.formatMessage({ id: 'chat.channelDetail.header.btn.zoomOut' })}
                  onClick={() => onChange(zoomLevels[zoomLevels.indexOf(value) + 1] ?? baseZoomLevel)}
                  disabled={isMinZoomLevel}
                />
                <ZoomInOutButton
                  icon="plus"
                  title={intl.formatMessage({ id: 'chat.channelDetail.header.btn.zoomIn' })}
                  onClick={() => onChange(zoomLevels[zoomLevels.indexOf(value) - 1] ?? baseZoomLevel)}
                  disabled={isMaxZoomLevel}
                />
              </Menu>
            );
          }}
        </Popper>
      )}
    </Manager>
  );
};
