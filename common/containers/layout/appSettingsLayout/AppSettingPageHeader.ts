import styled from 'styled-components';

import { cssVariables } from 'feather';

import { PageHeader } from '@ui/components';

export const AppSettingPageHeader: typeof PageHeader = styled(PageHeader)`
  ${PageHeader.Description} {
    margin-top: 16px;
    width: 880px;
    line-height: 20px;
    color: ${cssVariables('neutral-7')};
    font-size: 14px;

    b,
    strong {
      font-weight: 600;
    }
  }
` as any;

AppSettingPageHeader.Title = PageHeader.Title;
AppSettingPageHeader.Description = PageHeader.Description;
AppSettingPageHeader.Actions = PageHeader.Actions;
AppSettingPageHeader.BackButton = PageHeader.BackButton;
