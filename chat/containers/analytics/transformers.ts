import has from 'lodash/has';

import { StatisticsMetricsLegacy } from '@constants';

interface GetAnalyticsData {
  (
    data: {
      legacy: { date: string; total: number }[];
      active: { date: string; value: number }[];
    },
    dateRangeString: string[],
    segments: string,
  ): AdvancedAnalyticsData;
}

const metricTypeMap: {
  [key: string]: StatisticsMetricsLegacy | '';
} = {
  created_users: StatisticsMetricsLegacy.created_users,
  deactivated_users: StatisticsMetricsLegacy.deactivated_users,
  deleted_users: '',

  created_channels: StatisticsMetricsLegacy.created_channels,
  active_channels: StatisticsMetricsLegacy.active_channels,
  channel_member: StatisticsMetricsLegacy.channel_member,

  messages: StatisticsMetricsLegacy.sent_messages,
  messages_per_user: StatisticsMetricsLegacy.sent_messages_per_user,
};

const segmentsMap = {
  custom_channel_type: '_by_channel_custom_type',
  custom_message_type: '_by_message_custom_type',
  'custom_channel_type,custom_message_type': '_by_channel_custom_type_with_message_custom_type',
};

/**
 * @ref https://stackoverflow.com/questions/42488048/javascript-sum-of-two-object-with-same-properties
 * @param objs: array of the statistics objects
 */
export const sumObjectsByKey = (...objs) => {
  return objs.reduce((a, b) => {
    for (const k in b) {
      if (Object.prototype.hasOwnProperty.call(b, k)) a[k] = (a[k] || 0) + b[k];
    }
    return a;
  }, {});
};

export const convertObjectToChartPointArray = (obj) =>
  Object.keys(obj).map((x) => {
    return { x, y: obj[x] };
  });

export const transformMetricTypeToLegacy: (metricType: string, segments?: string) => string = (
  metricType,
  segments = '',
) => {
  return metricTypeMap[metricType] ? `${metricTypeMap[metricType]}${segments ? segmentsMap[segments] : ''}` : '';
};

type ChartDataset = {
  [key: string]: number;
};

export const transformStatisticsValues: (
  stats: any,
  defaultDataset: ChartDataset,
  keyName: 'total' | 'value',
) => ChartDataset = (stats, defaultDataset, keyName) => {
  if (stats) {
    return stats.reduce(
      (refined, item) => {
        refined[item.date] = item[keyName];
        return refined;
      },
      { ...defaultDataset },
    );
  }
  return {};
};

const getLegacyData = (data, defaultDataset, type?: string) => {
  const customTypeData = {};
  if (type) {
    data.forEach((stats) => {
      if (type === 'both') {
        Object.keys(stats['by_channel_custom_types']).forEach((key) => {
          if (!has(customTypeData, key)) {
            customTypeData[key] = {
              statistics: { ...defaultDataset },
              messageCustomTypeData: {},
            };
          }
          Object.keys(stats['by_channel_custom_types'][key]).forEach((subKey) => {
            if (subKey !== 'total') {
              if (!has(customTypeData[key].messageCustomTypeData, subKey)) {
                customTypeData[key].messageCustomTypeData[subKey] = { ...defaultDataset };
              }
              customTypeData[key].messageCustomTypeData[subKey][stats.date] =
                stats['by_channel_custom_types'][key][subKey];
            }
          });
          customTypeData[key].statistics[stats.date] = stats['by_channel_custom_types'][key]['total'];
        });
      }
      if (type === 'message' || type === 'channel') {
        const key = `by_${type}_custom_types`;
        if (has(stats, key)) {
          Object.entries<number>(stats[key]).forEach(([key, total]) => {
            if (!has(customTypeData, key)) {
              customTypeData[key] = {
                statistics: {
                  ...defaultDataset,
                },
              };
            }
            customTypeData[key].statistics[stats.date] = total;
          });
        }
      }
    });
  }
  return {
    statisticsDataset: transformStatisticsValues(data, defaultDataset, 'total'),
    customTypeData,
  };
};

const getActiveData = (data, defaultDataset, type?: string) => {
  // clone deeply cause we accessing object values in the array
  const customTypeData = {};
  // if key exists it means that we are transforming custom type data
  if (type) {
    const statisticsDataset = {
      ...defaultDataset,
    };
    data.forEach((stats) => {
      if (type === 'both' && has(stats, 'custom_channel_type')) {
        // total of all custom type

        // only assign when both type is null as a default stats
        if (stats.custom_channel_type === null) {
          if (stats.custom_message_type === null) {
            statisticsDataset[stats.date] = stats.value;
          }
        } else {
          // SENDBIRD:DEFAULT type (empty string)
          const customChannelKey = stats.custom_channel_type === '' ? 'SENDBIRD:DEFAULT' : stats.custom_channel_type;

          // initialize default channel custom data
          if (!has(customTypeData, customChannelKey)) {
            customTypeData[customChannelKey] = {
              statistics: { ...defaultDataset },
              messageCustomTypeData: {},
            };
          }
          if (stats.custom_message_type === null) {
            // custom channel value
            customTypeData[customChannelKey].statistics[stats.date] = stats.value;
          } else {
            // message custom type data of the channel custom type
            const customMessageKey = stats.custom_message_type === '' ? 'SENDBIRD:DEFAULT' : stats.custom_message_type;

            if (!has(customTypeData[customChannelKey].messageCustomTypeData, customMessageKey)) {
              // initialize default message custom data
              customTypeData[customChannelKey].messageCustomTypeData[customMessageKey] = {
                ...defaultDataset,
              };
            }
            // assign message custom type value
            customTypeData[customChannelKey].messageCustomTypeData[customMessageKey][stats.date] = stats.value;
          }
        }
      } else {
        const key = `custom_${type}_type`;
        if (has(stats, key)) {
          // total of all custom type
          if (stats[key] === null) {
            statisticsDataset[stats.date] = stats.value;
          } else {
            // SENDBIRD:DEFAULT type (empty string)
            const customKey = stats[key] === '' ? 'SENDBIRD:DEFAULT' : stats[key];
            if (!has(customTypeData, customKey)) {
              customTypeData[customKey] = {
                statistics: { ...defaultDataset },
              };
            }
            customTypeData[customKey].statistics[stats.date] = stats.value;
          }
        }
      }
    });
    return {
      statisticsDataset,
      customTypeData,
    };
  }
  return {
    statisticsDataset: transformStatisticsValues(data, defaultDataset, 'value'),
    customTypeData,
  };
};

const transformData = (data, defaultDataset, dataType?: 'message' | 'channel' | 'both') => {
  const { statisticsDataset: legacyStatisticsDataset, customTypeData: legacyCustomTypeData } = getLegacyData(
    data.legacy,
    defaultDataset,
    dataType,
  );
  const { statisticsDataset, customTypeData } = getActiveData(data.active, defaultDataset, dataType);
  const statistics = convertObjectToChartPointArray(sumObjectsByKey(legacyStatisticsDataset, statisticsDataset));
  const total = statistics.map((stat) => stat.y).reduce((sum, value) => sum + value, 0);
  if (dataType) {
    const allCustomTypes = [...Object.keys(legacyCustomTypeData), ...Object.keys(customTypeData)];
    const mergedCustomTypeData = allCustomTypes.reduce((data, type) => {
      data[type] = {
        statistics: convertObjectToChartPointArray(
          sumObjectsByKey(
            has(legacyCustomTypeData, type) ? legacyCustomTypeData[type].statistics : { ...defaultDataset },
            has(customTypeData, type) ? customTypeData[type].statistics : { ...defaultDataset },
          ),
        ),
      };
      // merge messageCustomTypeData
      if (dataType === 'both') {
        // we should check wheter data has type
        const legacyHasType = has(legacyCustomTypeData, type);
        const activeHasType = has(customTypeData, type);
        const legacyMessageTypes = legacyHasType ? Object.keys(legacyCustomTypeData[type].messageCustomTypeData) : [];
        const activeMessageType = activeHasType ? Object.keys(customTypeData[type].messageCustomTypeData) : [];

        const allMessageCustomTypes = [...legacyMessageTypes, ...activeMessageType];

        const mergedMessageCustomTypeData = allMessageCustomTypes.reduce((subData, subType) => {
          subData[subType] = convertObjectToChartPointArray(
            sumObjectsByKey(
              legacyHasType && has(legacyCustomTypeData[type].messageCustomTypeData, subType)
                ? legacyCustomTypeData[type].messageCustomTypeData[subType]
                : { ...defaultDataset },
              activeHasType && has(customTypeData[type].messageCustomTypeData, subType)
                ? customTypeData[type].messageCustomTypeData[subType]
                : { ...defaultDataset },
            ),
          );
          return subData;
        }, {});
        data[type].messageCustomTypeData = mergedMessageCustomTypeData;
      }
      return data;
    }, {});
    return {
      statistics,
      total,
      average: total / statistics.length || 0,
      channelCustomTypeData: dataType === 'channel' || dataType === 'both' ? mergedCustomTypeData : {},
      messageCustomTypeData: dataType === 'message' ? mergedCustomTypeData : {},
    };
  }

  return {
    statistics,
    total,
    average: total / statistics.length || 0,
    channelCustomTypeData: {},
    messageCustomTypeData: {},
  };
};

export const getAnalyticsData: GetAnalyticsData = (data, dateRangeString, segments) => {
  if (data) {
    const defaultDataset = dateRangeString.reduce((obj, date) => {
      obj[date] = 0;
      return obj;
    }, {});
    if (segments === 'custom_message_type') {
      return transformData(data, defaultDataset, 'message');
    }
    if (segments === 'custom_channel_type') {
      return transformData(data, defaultDataset, 'channel');
    }
    if (segments === 'custom_channel_type,custom_message_type') {
      return transformData(data, defaultDataset, 'both');
    }
    // segments is empty
    return transformData(data, defaultDataset);
  }

  return {
    statistics: [],
    total: 0,
    average: 0,
    channelCustomTypeData: {},
    messageCustomTypeData: {},
  };
};
