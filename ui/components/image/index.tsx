import styled from 'styled-components';

import { StyledProps } from '@ui';

const StyledImage = styled.img<StyledProps>`
  ${(props) => props.styles};
`;

export const Image = ({ src, styles, alt, ...props }) => {
  return <StyledImage alt={alt} src={src} styles={styles} {...props} />;
};
