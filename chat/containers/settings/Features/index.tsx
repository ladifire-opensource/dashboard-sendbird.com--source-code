import { FC } from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router-dom';

import { Unsaved } from '@hooks';

import { FeaturesContextProvider } from './FeaturesContext';
import { FeaturesDetail } from './FeaturesDetail';
import { FeaturesList } from './FeaturesList';

type UnsavedProps = {
  setUnsaved: Unsaved['setUnsaved'];
};

type Props = UnsavedProps & RouteComponentProps;

export const FeaturesSettings: FC<Props> = ({ match }) => {
  return (
    <FeaturesContextProvider>
      <Switch>
        <Route path={`${match.url}/:featureKey`} component={FeaturesDetail} />
        <Route path={`${match.url}`} component={FeaturesList} />
      </Switch>
    </FeaturesContextProvider>
  );
};
