import { FC, lazy, Suspense } from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';

import { SpinnerFull } from 'feather';

import { useAppId, useCallsActivationVisibility, useIsCallsEnabled, useIsCallsStudioEnabled } from '@hooks';

const Activation = lazy(() => import('./activation'));
const DirectCalls = lazy(() => import('./DirectCalls'));
const CallDetail = lazy(() => import('./DirectCalls/CallDetail'));
const GroupCalls = lazy(() => import('./GroupCalls'));
const Room = lazy(() => import('./GroupCalls/Room'));
const Settings = lazy(() => import('./Setting'));
const Studio = lazy(() => import('./Studio'));

type Path = string | string[];
type RouteProps = { path: Path; component: FC; exact?: boolean };

const getPathString = (path: Path) => (Array.isArray(path) ? path[0] : path);

const Calls: FC = () => {
  const appId = useAppId();
  const matchURL = useRouteMatch()?.url;
  const isCallsEnabled = useIsCallsEnabled();
  const isCallsActivationVisible = useCallsActivationVisibility();
  const isCallsStudioVisible = useIsCallsStudioEnabled();

  if (!appId) {
    return <SpinnerFull />;
  }

  if (isCallsEnabled) {
    const routes: RouteProps[] = [
      isCallsStudioVisible && {
        path: [`${matchURL}/studio`, `${matchURL}/studio/:tab`],
        exact: true,
        component: Studio,
      },
      { path: `${matchURL}/direct-calls`, component: DirectCalls, exact: true },
      { path: `${matchURL}/direct-calls/:callId`, component: CallDetail },
      { path: `${matchURL}/group-calls`, component: GroupCalls, exact: true },
      { path: `${matchURL}/group-calls/:roomId`, component: Room },
      { path: `${matchURL}/settings`, component: Settings },
    ].filter((v): v is Exclude<typeof v, false> => !!v);

    const [defaultRoute] = routes;

    return (
      <Suspense fallback={null}>
        <Switch>
          {routes.map((route) => (
            <Route key={getPathString(route.path)} {...route} />
          ))}
          <Redirect to={getPathString(defaultRoute.path)} />
        </Switch>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={null}>
      <Switch>
        {isCallsActivationVisible && <Route component={Activation} />}
        <Redirect to={appId ? `/${appId}` : '/'} />
      </Switch>
    </Suspense>
  );
};

export default Calls;
