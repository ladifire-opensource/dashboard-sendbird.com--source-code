import { useMemo } from 'react';

import { FileEncryptionOption, TicketStatus } from '@constants';
import { useShallowEqualSelector } from '@hooks';

import { useAuthorization } from './useAuthorization';

/**
 * @method useDeskProjectFileEncryptionPermission
 * This method is exported only for the test code.
 * DO NOT USE THIS outside of this file unless you exactly know what you are doing.
 * You should use @method useDeskEncryptedFileAccessPermission for file access permission value which is sent to Platform API with @param presignedFileUrl
 */
export const useDeskProjectFileEncryptionPermission = () => {
  const { isPermitted } = useAuthorization();

  const { shouldAuthenticateToAccessFiles, project, currentAgent } = useShallowEqualSelector((state) => ({
    shouldAuthenticateToAccessFiles: state.applicationState?.data?.attrs.file_authentication ?? false,
    project: state.desk.project,
    currentAgent: state.desk.agent,
  }));

  const isAgent = isPermitted(['desk.agent']);
  const fileEncryptionPermission = isAgent
    ? project.fileEncryptionAgentPermission
    : project.fileEncryptionAdminPermission;

  return useMemo(
    () => ({
      shouldAuthenticateToAccessFiles,
      fileEncryptionPermission,
      currentAgent,
    }),
    [currentAgent, fileEncryptionPermission, shouldAuthenticateToAccessFiles],
  );
};

const getIsFileAccessPermitted = (params: {
  ticket: Ticket;
  agentId: Agent['id'];
  fileEncryptionPermission: FileEncryptionOption;
}) => {
  const {
    ticket: { status2: ticketStatus, recentAssignment },
    agentId,
    fileEncryptionPermission,
  } = params;

  return (
    fileEncryptionPermission === FileEncryptionOption.ALL ||
    (fileEncryptionPermission === FileEncryptionOption.MY_TICKETS &&
      recentAssignment?.agent.id === agentId &&
      (ticketStatus === TicketStatus.ACTIVE || ticketStatus === TicketStatus.IDLE))
  );
};

export const useDeskEncryptedFileAccessPermission = (params: { ticket: Ticket }) => {
  const {
    shouldAuthenticateToAccessFiles,
    fileEncryptionPermission,
    currentAgent,
  } = useDeskProjectFileEncryptionPermission();
  const { ticket } = params;

  const isFileAccessPermitted = getIsFileAccessPermitted({
    ticket,
    agentId: currentAgent.id,
    fileEncryptionPermission,
  });

  return useMemo(() => !shouldAuthenticateToAccessFiles || isFileAccessPermitted, [
    isFileAccessPermitted,
    shouldAuthenticateToAccessFiles,
  ]);
};

/**
 *
 * @method getDeskEncryptedFileAccessPermission
 * This has exactly same logic with  @method useDeskProjectFileEncryptionPermission, but can be used in non-react scope.
 */
export const getDeskEncryptedFileAccessPermission = (params: {
  ticket: Ticket;
  agentId: Agent['id'];
  shouldAuthenticateToAccessFiles: boolean;
  fileEncryptionPermission: FileEncryptionOption;
}) => {
  const { ticket, agentId, shouldAuthenticateToAccessFiles, fileEncryptionPermission } = params;

  const isFileAccessPermitted = getIsFileAccessPermitted({
    ticket,
    agentId,
    fileEncryptionPermission,
  });

  return !shouldAuthenticateToAccessFiles || isFileAccessPermitted;
};
