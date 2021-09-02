import { useState, useEffect, useMemo, FC, ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import {
  Dropdown,
  InputText,
  Icon,
  DropdownProps,
  cssVariables,
  Subtitles,
  transitionDefault,
  ContextualHelp,
  TooltipTargetIcon,
  Body,
  Tile,
  InlineNotification,
  IconName,
} from 'feather';

import { CallsAllowedRegions } from '@constants';
import { getErrorMessage } from '@epics';
import { DialogFormSet, DialogFormLabel, DialogFormBody } from '@ui/components';

type ProductType = 'chat' | 'chat/calls';

interface RegionWithKey extends Region {
  key: string;
}

const sortRegionListByName = (a: Region, b: Region) => {
  if (b.name.includes('North Virginia')) {
    return -1;
  }
  if (a.name.includes('North Virginia')) {
    return 1;
  }
  return a.name.localeCompare(b.name);
};

const Plus = styled(Icon).attrs({ icon: 'plus', size: 16 })``;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  > svg + span {
    margin-top: 9px;
  }

  > span {
    ${Subtitles['subtitle-02']};
  }
`;

const TabsContainer = styled.div<{ disabled?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 8px;
  transition: opacity 0.2s ${transitionDefault};

  ${(props) =>
    props.disabled &&
    css`
      pointer-events: none;
      opacity: 0.5;
    `}
`;

const ProductTab = styled(Tile).attrs(() => ({ selectable: true }))`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 116px;

  &,
  svg,
  span {
    transition: all 0.3s ${transitionDefault};
  }

  /* FIXME: remove after feather update */
  &:focus {
    outline: none;
  }

  ${ContentContainer} {
    svg {
      fill: ${(props) => (props.selected ? cssVariables('purple-7') : cssVariables('neutral-9'))};
    }

    span {
      color: ${(props) => (props.selected ? cssVariables('purple-7') : cssVariables('neutral-10'))};
    }
  }

  & > ${Plus} {
    margin: 8px;
    fill: ${(props) => (props.selected ? cssVariables('purple-7') : cssVariables('neutral-6'))};
  }
`;

const TabContent: FC<{ icon: IconName; title: string }> = ({ icon, title }) => {
  return (
    <ContentContainer>
      <Icon icon={icon} size={24} />
      <span>{title}</span>
    </ContentContainer>
  );
};

const ProductTabs: FC<{
  selected: ProductType;
  disabled?: boolean;
  onChange: (id: ProductType) => void;
}> = ({ selected = 'chat/calls', disabled, onChange }) => {
  const intl = useIntl();
  const chat = (
    <TabContent
      key="chat"
      icon="feature-chat"
      title={intl.formatMessage({ id: 'common.settings.createAppDialog.productType.chat' })}
    />
  );
  const calls = (
    <TabContent
      key="call"
      icon="call"
      title={intl.formatMessage({ id: 'common.settings.createAppDialog.productType.calls' })}
    />
  );
  const plus = <Plus key="plus" />;
  const tabs = [
    { id: 'chat', contents: [chat] },
    { id: 'chat/calls', contents: [chat, plus, calls] },
  ] as const;

  return (
    <TabsContainer disabled={disabled}>
      {tabs.map(({ id, contents }) => (
        <ProductTab key={id} selected={id === selected} onClick={() => onChange(id)}>
          {contents}
        </ProductTab>
      ))}
    </TabsContainer>
  );
};

const RegionItemContainer = styled.div`
  display: flex;
  align-items: center;

  svg {
    margin-right: 6px;
  }
`;

const RegionItem: FC<{ name: string }> = ({ name }) => {
  return (
    <RegionItemContainer>
      <Icon icon="location" size={16} />
      {name}
    </RegionItemContainer>
  );
};

const Error = styled.p<{ show?: boolean }>`
  ${({ show }) =>
    show
      ? css`
           {
            opacity: 1;
            height: 16px;
            transform: translateY(0px);
          }
        `
      : css`
           {
            opacity: 0;
            height: 0px;
            transform: translateY(-16px);
          }
        `};
  transition: 0.2s all ${transitionDefault};
  color: ${cssVariables('red-5')};
  font-size: 12px;
  line-height: 16px;
  margin-top: 4px;
`;

type FieldError = { hasError: boolean; message: string };
type RegionDropdownProps = DropdownProps<RegionWithKey> & { error?: FieldError };

const RegionDropdown = ({ error, ...props }: RegionDropdownProps) => {
  const intl = useIntl();
  return (
    <>
      <Dropdown<RegionWithKey>
        width="100%"
        placeholder={intl.formatMessage({ id: 'common.settings.createAppDialog.region.placeholder' })}
        itemToString={(region) => region.name}
        itemToElement={(region) => <RegionItem name={region.name} />}
        isItemDisabled={(region) => !region.allowed}
        useSearch={true}
        hasError={error?.hasError}
        {...props}
      />
      <Error show={error?.hasError}>{error?.message}</Error>
    </>
  );
};

const RegionFieldInfo: FC = () => {
  const intl = useIntl();
  return (
    <ContextualHelp
      content={intl.formatMessage({ id: 'common.settings.createAppDialog.region.tooltip' })}
      placement="right-start"
      tooltipContentStyle={css`
        max-width: 256px;
        font-weight: 400;
      `}
    >
      <TooltipTargetIcon icon="info" />
    </ContextualHelp>
  );
};

const Description = styled.span`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
  margin-top: 16px;
`;

const ApplicationRemains = styled.p`
  font-size: 14px;
  line-height: 20px;
  color: ${cssVariables('neutral-10')};
  margin-bottom: 22px;
  strong {
    font-weight: 500;
  }
`;

export type Form = { type: ProductType; name: string; region: RegionWithKey | null };

const includes = (source: string, target: string) => source.toLowerCase().includes(target.toLowerCase());

export const CreateAppForm: FC<{
  organization: Organization;
  disabled?: boolean;
  actions?: ReactNode;
  error?: any;
  onSubmit: (form: Form) => void;
}> = ({ organization, disabled, actions, error, onSubmit }) => {
  const intl = useIntl();
  const [query, setQuery] = useState('');
  const { register, control, watch, setValue, handleSubmit, errors } = useForm<Form>({
    defaultValues: { type: 'chat', name: '', region: null },
  });
  const type = watch('type');
  const isCallsSelected = type === 'chat/calls';
  const regions: RegionWithKey[] = useMemo(
    () =>
      Object.keys(organization.regions)
        .map((key) => ({ key, ...organization.regions[key] }))
        .filter((region) => region.allowed) // only show allowed regions
        .filter((region) => includes(region.name, query))
        .filter((region) => !isCallsSelected || CallsAllowedRegions.includes(region.key))
        .sort(sortRegionListByName),
    [isCallsSelected, organization.regions, query],
  );

  useEffect(() => {
    setValue('region', null);
  }, [setValue, type]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogFormBody>
        <ApplicationRemains>
          {intl.formatMessage(
            { id: 'common.applications.maxApplicationCount.withRemains' },
            {
              max: <strong>{organization.max_application_count}</strong>,
              remain: <strong>{organization.max_application_count - organization.total_applications}</strong>,
              remainCount: organization.max_application_count - organization.total_applications,
            },
          )}
        </ApplicationRemains>
        <DialogFormSet
          css={`
            margin-bottom: 24px;
          `}
        >
          <DialogFormLabel>Product type</DialogFormLabel>
          <Controller
            name="type"
            control={control}
            render={({ onChange }) => {
              return <ProductTabs onChange={onChange} selected={type} disabled={disabled} />;
            }}
          />
        </DialogFormSet>
        <DialogFormSet>
          <DialogFormLabel data-test-id="NameField">
            {intl.formatMessage({ id: 'common.settings.createAppDialog.name.label' })}
          </DialogFormLabel>
          <InputText
            name="name"
            ref={register({ required: true })}
            error={{
              hasError: !!errors.name,
              message: intl.formatMessage({ id: 'common.settings.createAppDialog.name.required' }),
            }}
            placeholder={intl.formatMessage({ id: 'common.settings.createAppDialog.name.placeholder' })}
            disabled={disabled}
          />
        </DialogFormSet>
        <DialogFormSet
          css={`
            margin-top: 16px !important;
            ${DialogFormLabel} {
              margin-bottom: 0px;
            }
          `}
        >
          <DialogFormLabel>
            {intl.formatMessage({ id: 'common.settings.createAppDialog.region.label' })}
            <RegionFieldInfo />
          </DialogFormLabel>
          <Controller
            name="region"
            control={control}
            rules={{ required: true }}
            render={({ onChange, value }) => {
              return (
                <RegionDropdown
                  error={{
                    hasError: !!errors.region,
                    message: intl.formatMessage({ id: 'common.settings.createAppDialog.region.required' }),
                  }}
                  items={regions}
                  onItemSelected={onChange}
                  selectedItem={value}
                  disabled={disabled}
                  onSearchChange={setQuery}
                />
              );
            }}
          />
        </DialogFormSet>
        {isCallsSelected && (
          <Description>{intl.formatMessage({ id: 'common.settings.createAppDialog.callsRegionsNotice' })}</Description>
        )}
        {error && (
          <InlineNotification
            type="error"
            message={getErrorMessage(error)}
            css={`
              margin-top: 16px;
            `}
          />
        )}
      </DialogFormBody>
      {actions}
    </form>
  );
};
