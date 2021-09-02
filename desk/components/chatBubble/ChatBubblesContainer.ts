import styled from 'styled-components';

/**
 * Chat bubbles must be placed inside a flex container to be automatically-sized based on their content,
 * or, they will always populate the whole width of their parent because they are block elements.
 */
const ChatBubblesContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
`;

export default ChatBubblesContainer;
