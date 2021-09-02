import styled from 'styled-components';

import { PageHeader } from '@ui/components';

export const OrgSettingPageHeader: typeof PageHeader = styled(PageHeader)`
  & + * {
    margin-top: 24px;
  }

  ${PageHeader.BackButton} {
    left: 0;
    margin-right: 8px;
  }
` as any;

OrgSettingPageHeader.Title = PageHeader.Title;
OrgSettingPageHeader.Description = PageHeader.Description;
OrgSettingPageHeader.Actions = PageHeader.Actions;
OrgSettingPageHeader.BackButton = PageHeader.BackButton;
