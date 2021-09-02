import { FC, useMemo, useCallback, forwardRef, useRef, useImperativeHandle, ReactNode } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import {
  Lozenge,
  LozengeVariant,
  cssVariables,
  transitionDefault,
  Avatar,
  AvatarType,
  Typography,
  Body,
  Dropdown,
  DropdownProps,
  Subtitles,
} from 'feather';

import { usePrevious } from '@hooks';
import { ProfanityFilterTypeEnum } from '@interfaces/core/ChannelSettingsEnums';

type FilterMethod = ProfanityFilterTypeEnum.block | ProfanityFilterTypeEnum.asterisks;

type Props = {
  filterType?: ProfanityFilterTypeEnum;
  error?: ReactNode;
} & Pick<DropdownProps<FilterMethod>, 'onChange' | 'disabled'>;

export type FilterMethodDropdownRef = { focus: () => void };

const FilterTypeWarning = styled(Lozenge)`
  display: inline-block;
  margin-left: 8px;
`;

const ToggleText = styled.span`
  display: flex;
  padding: 0 16px;
  ${Subtitles['subtitle-01']};
`;

const ErrorMessage = styled.div`
  margin-top: 4px;
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  color: ${cssVariables('red-5')};
`;

class ImageElement {
  static Container = styled.div`
    position: relative;
    margin-top: 8px;
    border-radius: 4px;
    background: ${cssVariables('neutral-1')};
    padding: 14px 16px;
    width: 208px;
    height: 76px;
    overflow: hidden;
    user-select: none;

    [hidden] {
      display: none;
    }
  `;

  static Message = styled.div`
    display: grid;
    grid-template-areas:
      'avatar name'
      'avatar message';
    grid-template-rows: 20px 28px;
    grid-template-columns: 48px 1fr;
    grid-gap: 0 16px;
    align-items: end;
    width: 100%;
    height: 100%;
  `;

  static Avatar = styled(Avatar).attrs({ type: AvatarType.Member, profileID: 0, size: 48 })`
    grid-area: avatar;

    *[width][height] {
      fill: ${cssVariables('neutral-3')};
    }

    path {
      fill: ${cssVariables('neutral-6')};
    }
  `;

  static Name = styled.span`
    grid-area: name;
    color: ${cssVariables('neutral-10')};
    ${Typography['label-03']};
  `;

  static Words = styled.p`
    grid-area: message;
    position: relative;
    ${Body['body-03']};
    color: ${cssVariables('neutral-7')};
  `;

  static Char = styled.span<{ show: boolean; delay: number; translateX: number }>`
    transform: translateX(${({ translateX }) => translateX}px);
    transition: 0.3s ${transitionDefault};
    transition-property: opacity, transform;
    transition-delay: ${(props) => props.delay}s;
    opacity: ${(props) => (props.show ? 1 : 0)};
  `;

  static Blocked = styled.div`
    position: absolute;
    top: 50%;
    left: 0;
    margin-top: -8px;
    width: 100%;
    height: 16px;
    text-align: center;
    line-height: 16px;
    font-size: 12px;
    font-style: oblique;
    color: ${cssVariables('neutral-7')};
  `;
}

const Wrapper = styled.div<{ isDisabled?: boolean }>`
  ${(props) =>
    props.isDisabled &&
    css`
      ${ImageElement.Container}, ${ImageElement.Container} * {
        color: ${cssVariables('neutral-5')};
      }
    `}
`;

const badWordChars = 'Shit'.split('');
const asterisks = '******'.split('');

const FilterTypeImage: FC<{ type?: ProfanityFilterTypeEnum }> = ({ type }) => {
  const showBadWord = type === ProfanityFilterTypeEnum.none;
  const showAsterisks = type === ProfanityFilterTypeEnum.asterisks;
  const previousType = usePrevious(type);
  const intl = useIntl();

  return (
    <ImageElement.Container role="img">
      {type == null ? null : (
        <ImageElement.Message hidden={type === ProfanityFilterTypeEnum.block}>
          <ImageElement.Avatar />
          <ImageElement.Name>John Doe</ImageElement.Name>
          <ImageElement.Words>
            {badWordChars.map((letter, index) => (
              <ImageElement.Char
                key={`${letter}-${index}`}
                show={showBadWord}
                translateX={type === ProfanityFilterTypeEnum.asterisks ? 24 : 0}
                delay={previousType === ProfanityFilterTypeEnum.asterisks && showBadWord ? 0.1 * index : 0}
              >
                {letter}
              </ImageElement.Char>
            ))}
          </ImageElement.Words>
          <ImageElement.Words>
            {asterisks.map((letter, index) => (
              <ImageElement.Char
                key={`${letter}-${index}`}
                show={showAsterisks}
                translateX={type === ProfanityFilterTypeEnum.none ? 24 : 0}
                delay={previousType === ProfanityFilterTypeEnum.none && showAsterisks ? 0.1 * index : 0}
              >
                {letter}
              </ImageElement.Char>
            ))}
          </ImageElement.Words>
        </ImageElement.Message>
      )}

      <ImageElement.Blocked hidden={type !== ProfanityFilterTypeEnum.block}>
        {intl.formatMessage({ id: 'chat.settings.profanityFilter.option.block.messagesWontDisplay' })}
      </ImageElement.Blocked>
    </ImageElement.Container>
  );
};

export const FilterMethodDropdown = forwardRef<FilterMethodDropdownRef, Props>(
  ({ filterType, onChange, disabled, error }, ref) => {
    const intl = useIntl();
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        const toggleButton = containerRef.current?.querySelector('button[aria-haspopup="true"]');
        if (toggleButton) {
          (toggleButton as HTMLButtonElement).focus();
        }
      },
    }));

    const dropdownLabels = useMemo(
      () => ({
        [ProfanityFilterTypeEnum.asterisks]: intl.formatMessage({
          id: 'chat.settings.profanityFilter.option.asterisks',
        }),
        [ProfanityFilterTypeEnum.block]: intl.formatMessage({
          id: 'chat.settings.profanityFilter.option.block',
        }),
      }),
      [intl],
    );

    const itemToElement = useCallback(
      (item: FilterMethod) => (
        <>
          {dropdownLabels[item]}{' '}
          {item === ProfanityFilterTypeEnum.asterisks && (
            <FilterTypeWarning color="neutral" variant={LozengeVariant.Dark}>
              {intl.formatMessage({
                id: 'chat.settings.profanityFilter.option.asterisks.lozenge.notAvailableForRegex',
              })}
            </FilterTypeWarning>
          )}
        </>
      ),
      [dropdownLabels, intl],
    );

    const toggleRenderer = useCallback<NonNullable<DropdownProps<FilterMethod>['toggleRenderer']>>(
      ({ selectedItem }) => {
        if (selectedItem == null) {
          return (
            <ToggleText>
              {intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.filterMethod.placeholder' })}
            </ToggleText>
          );
        }
        return <ToggleText>{itemToElement(selectedItem)}</ToggleText>;
      },
      [intl, itemToElement],
    );

    const filterMethod: FilterMethod | null =
      filterType === ProfanityFilterTypeEnum.block || filterType === ProfanityFilterTypeEnum.asterisks
        ? filterType
        : null;

    return (
      <Wrapper ref={containerRef} isDisabled={disabled}>
        <Dropdown<FilterMethod>
          items={[ProfanityFilterTypeEnum.asterisks, ProfanityFilterTypeEnum.block]}
          selectedItem={filterMethod}
          itemToString={(item) => dropdownLabels[item]}
          itemToElement={itemToElement}
          toggleRenderer={toggleRenderer}
          width="100%"
          disabled={disabled}
          onChange={onChange}
          hasError={!!error}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {filterMethod && <FilterTypeImage type={filterType ?? undefined} />}
      </Wrapper>
    );
  },
);
