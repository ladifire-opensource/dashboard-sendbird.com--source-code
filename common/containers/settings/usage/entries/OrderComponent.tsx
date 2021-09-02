import { FC } from 'react';

import styled from 'styled-components';

const OrderContainer = styled.div``;

type Props = {
  id?: string;
};

const OrderComponent: FC<Props> = ({ id, children }) => <OrderContainer id={id}>{children}</OrderContainer>;

export default OrderComponent;
