import { createContext, useContext } from 'react';

import { QueryParamsWithUpdate } from '@hooks/useQueryString';

export enum DeskBotFormMode {
  CREATE,
  EDIT,
  DUPLICATE,
}

export type BotDetailContextValues = {
  mode: DeskBotFormMode;
  bot?: DeskBotDetail;
  queryParams: DeskBotDetailQueryParams;
  updateParams: QueryParamsWithUpdate<DeskBotDetailQueryParams>['updateParams'];
  fetchDeskBotRequest: () => void;
};

export const BotDetailContext = createContext({} as BotDetailContextValues);

export const useBotDetailContext = () => useContext(BotDetailContext);
