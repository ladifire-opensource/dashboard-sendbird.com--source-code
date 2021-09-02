import { createAction } from '@actions/createAction';
import { AgentGroupActionTypes } from '@actions/types';

export const AgentGroupsActions: AgentGroupsActionCreators = {
  fetchAgentGroupsRequest: (payload) => createAction(AgentGroupActionTypes.FETCH_AGENT_GROUPS_REQUEST, payload),
  fetchAgentGroupsSuccess: (payload) => createAction(AgentGroupActionTypes.FETCH_AGENT_GROUPS_SUCCESS, payload),
  fetchAgentGroupsFail: (payload) => createAction(AgentGroupActionTypes.FETCH_AGENT_GROUPS_FAIL, payload),

  fetchAgentGroupRequest: (payload) => createAction(AgentGroupActionTypes.FETCH_AGENT_GROUP_REQUEST, payload),
  fetchAgentGroupSuccess: (payload) => createAction(AgentGroupActionTypes.FETCH_AGENT_GROUP_SUCCESS, payload),
  fetchAgentGroupFail: (payload) => createAction(AgentGroupActionTypes.FETCH_AGENT_GROUP_FAIL, payload),

  fetchCurrentAgentsRequest: () => createAction(AgentGroupActionTypes.FETCH_CURRENT_AGENTS_REQUEST),
  fetchCurrentAgentsSuccess: (payload) => createAction(AgentGroupActionTypes.FETCH_CURRENT_AGENTS_SUCCESS, payload),
  fetchCurrentAgentsFail: (payload) => createAction(AgentGroupActionTypes.FETCH_CURRENT_AGENTS_FAIL, payload),

  createAgentGroupRequest: (payload) => createAction(AgentGroupActionTypes.CREATE_AGENT_GROUP_REQUEST, payload),
  createAgentGroupSuccess: (payload) => createAction(AgentGroupActionTypes.CREATE_AGENT_GROUP_SUCCESS, payload),
  createAgentGroupFail: (payload) => createAction(AgentGroupActionTypes.CREATE_AGENT_GROUP_FAIL, payload),

  updateAgentGroupRequest: (payload) => createAction(AgentGroupActionTypes.UPDATE_AGENT_GROUP_REQUEST, payload),
  updateAgentGroupSuccess: (payload) => createAction(AgentGroupActionTypes.UPDATE_AGENT_GROUP_SUCCESS, payload),
  updateAgentGroupFail: (payload) => createAction(AgentGroupActionTypes.UPDATE_AGENT_GROUP_FAIL, payload),

  updateAgentGroupMembers: (payload) => createAction(AgentGroupActionTypes.UPDATE_AGENT_GROUP_MEMBERS, payload),
  updateAgentGroupQuery: (payload) => createAction(AgentGroupActionTypes.UPDATE_AGENT_GROUP_QUERY, payload),
  updateCurrentAgentSearchQuery: (payload) =>
    createAction(AgentGroupActionTypes.UPDATE_CURRENT_AGENT_SEARCH_QUERY, payload),

  deleteAgentGroupRequest: (payload) => createAction(AgentGroupActionTypes.DELETE_AGENT_GROUP_REQUEST, payload),
  deleteAgentGroupSuccess: (payload) => createAction(AgentGroupActionTypes.DELETE_AGENT_GROUP_SUCCESS, payload),
  deleteAgentGroupFail: (payload) => createAction(AgentGroupActionTypes.DELETE_AGENT_GROUP_FAIL, payload),

  resetAgentGroups: () => createAction(AgentGroupActionTypes.RESET_AGENT_GROUPS),
  resetAgentGroupFormItem: () => createAction(AgentGroupActionTypes.RESET_AGENT_GROUP_FORM_ITEM),
};
