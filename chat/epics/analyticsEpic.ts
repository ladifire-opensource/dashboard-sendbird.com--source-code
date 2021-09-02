import { AxiosPromise } from 'axios';
import { toast } from 'feather';
import { ofType } from 'redux-observable';
import { from, forkJoin } from 'rxjs';
import { mergeMap, catchError, withLatestFrom } from 'rxjs/operators';

import { commonActions, chatActions } from '@actions';
import { AnalyticsActionTypes } from '@actions/types';
import { fetchStatisticsLegacy, fetchStatistics } from '@chat/api';
import {
  getAnalyticsDateRange,
  getAnalyticsLegacyParams,
  getAnalyticsActiveParams,
} from '@chat/containers/analytics/converters';
import { transformMetricTypeToLegacy } from '@chat/containers/analytics/transformers';
import { generateBadRequest } from '@epics/generateBadRequest';
import { withCurrentApplication } from '@epics/withCurrentApplication';
import { logException } from '@utils/logException';

export const exportAnalyticsEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(AnalyticsActionTypes.EXPORT_ANALYTICS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) =>
      withCurrentApplication(state)((application) => {
        const appId = application.app_id;

        const promiseArray: AxiosPromise<any>[] = [];

        action.payload.forEach(({ metricType, startDate, endDate, timeDimension, segments }) => {
          const { legacyDateRange, activeDateRange } = getAnalyticsDateRange(metricType, {
            startDate,
            endDate,
          });
          if (legacyDateRange) {
            const params = getAnalyticsLegacyParams({ dateRange: legacyDateRange, timeDimension, exportAsCSV: true });
            promiseArray.push(
              fetchStatisticsLegacy({
                appId,
                metricType: transformMetricTypeToLegacy(metricType, segments),
                timeDimension: metricType === 'active_users' || metricType === 'active_channels' ? timeDimension : '',
                params,
              }),
            );
          }
          if (activeDateRange) {
            const params = getAnalyticsActiveParams({
              metricType,
              dateRange: activeDateRange,
              timeDimension,
              segments,
              exportAsCSV: true,
            });
            promiseArray.push(fetchStatistics({ appId, params }));
          }
        });
        return forkJoin(promiseArray).pipe(
          mergeMap((response) => {
            response.forEach((result, index) => {
              const { url } = (result as any).data;
              setTimeout(() => {
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.href = url;
                a.download = url.substr(url.lastIndexOf('/') + 1);
                a.click();
                document.body.removeChild(a);
              }, 1000 * index);
            });
            toast.success({
              message: 'Analytics data has been exported successfully.',
            });
            return from([chatActions.exportAnalyticsSuccess({}), commonActions.hideDialogsRequest()]);
          }),
          catchError((error) => {
            return from([generateBadRequest(error), chatActions.exportAnalyticsFail(error)]);
          }),
        );
      }),
    ),
    catchError((error) => {
      logException({ error });
      return from([chatActions.exportAnalyticsFail(error)]);
    }),
  );
};
