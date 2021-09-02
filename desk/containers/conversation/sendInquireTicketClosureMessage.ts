import { logException } from '@utils';

const customType = 'SENDBIRD_DESK_RICH_MESSAGE';

export const sendInquireTicketClosureMessage = async (options: {
  ticketId: Ticket['id'];
  channelUrl: string;
  message: string;
}) => {
  if (window.dashboardSB == null) {
    // The possibility this would happen is very low.
    throw new Error('Sendbird instance must be initialized first.');
  }

  const { ticketId, channelUrl, message } = options;

  const data = {
    type: 'SENDBIRD_DESK_INQUIRE_TICKET_CLOSURE',
    body: {
      state: 'WAITING', // CONFIRMED, DECLINED, WAITING
      ticketId,
    },
  };

  const groupChannel = await window.dashboardSB.GroupChannel.getChannel(channelUrl);

  return new Promise<{ userMessage: SendBird.UserMessage; groupChannel: SendBird.GroupChannel }>((resolve, reject) => {
    const params = new window.dashboardSB.UserMessageParams();
    params.message = message;
    params.data = JSON.stringify(data);
    params.customType = customType;

    groupChannel.sendUserMessage(params, (userMessage, error) => {
      if (error) {
        logException({ error });
        reject(error);
        return;
      }
      resolve({
        userMessage: userMessage as SendBird.UserMessage,
        groupChannel,
      });
    });
  });
};
