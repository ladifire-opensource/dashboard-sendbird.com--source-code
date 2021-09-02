import { routerMiddleware } from 'connected-react-router';
import { compose, createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import reduxThunk from 'redux-thunk';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { rootEpic } from './epics';
import { createRootReducer } from './reducers';
import { history } from './sbHistory';

const epicMiddleware = createEpicMiddleware();

const { BUILD_MODE } = process.env;

const configureStore = (initialState) => {
  if (BUILD_MODE === 'production') {
    const store = createStore(
      createRootReducer(history),
      initialState,
      compose(applyMiddleware(reduxThunk, routerMiddleware(history), epicMiddleware)),
    );
    epicMiddleware.run(rootEpic);
    return store;
  }
  // const reduxLogger = createLogger({
  //   diff: true,
  // });
  const store = createStore(
    createRootReducer(history),
    initialState,
    compose(
      applyMiddleware(reduxThunk, routerMiddleware(history), epicMiddleware),
      window['__REDUX_DEVTOOLS_EXTENSION__'] ? window['__REDUX_DEVTOOLS_EXTENSION__']() : (f) => f,
    ),
  );

  const epic$ = new BehaviorSubject(rootEpic);
  // Every time a new epic is given to epic$ it
  // will unsubscribe from the previous one then
  // call and subscribe to the new one because of
  // how switchMap works
  const hotReloadingEpic = (...args: any[]) => epic$.pipe(switchMap((epic) => epic.apply(this, args)));

  epicMiddleware.run(hotReloadingEpic as any);

  if ((module as any).hot) {
    (module as any).hot.accept('./epics', () => {
      const nextRootEpic = require('./epics').default;
      epic$.next(nextRootEpic);
    });

    (module as any).hot.accept('./reducers', () => {
      store.replaceReducer(require('./reducers').default);
    });
  }

  return store;
};

export const initializeStore = configureStore({});
