import { Observable, of } from 'rxjs';

/**
 * When you have to access the current application in a redux-observable epic, you must check if
 * `state.applicationState.data` is defined and handle the case when it is not defined. This is a handy operator for the
 * purpose. Below is an example code.
 *
 * ```
 * const fetchAgentTicketsEpic: SBEpicWithState = (action$, state$) => {
 *   return action$.pipe(
 *     ofType<FetchAgentTicketsRequestAction>(ConversationActionTypes.FETCH_AGENT_TICKETS_REQUEST),
 *     withLatestFrom(state$),
 *     mergeMap(([action, state]) =>
 *       withCurrentApplication(state)(
 *         application => {
 *           // Do something with the current application
 *
 *           // You must return an observable in this function.
 *           return from([deskActions.fetchAgentTicketsSuccess(tickets)]);
 *         },
 *
 *         // If the current application isn't defined, subscribe to the observable returned by this function.
 *         // You can omit this parameter if you don't need to do anything.
 *         () => {
 *           // You must return an observable in this function.
 *           return of(deskActions.fetchAgentTicketsCancel())
 *         }
 *       )
 *     )
 *   );
 * };
 * ```
 *
 * @param state Current Redux state
 * @returns A function which takes two arguments. The first argument is a function that takes the current application as
 * an argument and returns an observable. The second argument is a function that returns an observable if the current
 * application is null.
 */
export const withCurrentApplication = (state: RootState) => <T, S>(
  project: (application: Application) => Observable<T>,
  projectIfApplicationIsNull?: () => Observable<S>,
) => {
  if (state.applicationState.data) {
    return project(state.applicationState.data);
  }
  if (projectIfApplicationIsNull) {
    return projectIfApplicationIsNull();
  }
  return of({ type: '' });
};
