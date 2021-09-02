import { FC } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Switch, Route, Redirect } from 'react-router-dom';

import { AddProfanityFilterForCustomChannelType } from './AddProfanityFilterForCustomChannelType';
import { EditProfanityFilter } from './EditProfanityFilter';
import { ProfanityFilterList } from './ProfanityFilterList';
import { SettingsForCustomChannelTypesContextProvider } from './SettingsForCustomChannelTypesContextProvider';

export const ProfanityFilterSettings: FC = () => {
  const match = useRouteMatch();

  if (match == null) {
    return <Redirect to="/" />;
  }

  return (
    <SettingsForCustomChannelTypesContextProvider>
      <Switch>
        <Route path={`${match.url}/create`} component={AddProfanityFilterForCustomChannelType} />
        <Route path={`${match.url}/global`} component={EditProfanityFilter} />
        <Route path={`${match.url}/custom-type/:custom_type`} component={EditProfanityFilter} />
        <Route path={match.url} component={ProfanityFilterList} exact={true} />
        <Redirect to={match.url} />
      </Switch>
    </SettingsForCustomChannelTypesContextProvider>
  );
};
