export const getQuickReplyProperties = (ticket: Ticket) => [
  { key: 'ticketName', value: ticket.channelName },
  { key: 'agentName', value: ticket.recentAssignment?.agent.displayName ?? '' },
  { key: 'customerName', value: ticket.customer.displayName },
];

export const replacePropertiesToTicketValue = (ticket: Ticket, replaceTarget: string) => {
  const properties = getQuickReplyProperties(ticket);

  return properties.reduce((acc, { key, value }) => {
    const regex = new RegExp(`{${key}}`, 'g');
    if (replaceTarget.match(regex)) {
      acc = acc.replace(regex, value);
    }
    return acc;
  }, replaceTarget);
};
