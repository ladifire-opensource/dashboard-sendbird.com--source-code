import { SimpleInterpolation, css } from 'styled-components';

import { IconButton, cssVariables, transitions } from 'feather';

type Props = {
  onClick?: () => void;
  styles?: SimpleInterpolation;
};

export const ListRemoveButton: React.FC<Props> = ({ onClick = () => {} }) => {
  return (
    <IconButton
      buttonType="tertiary"
      icon="close"
      size="xsmall"
      onClick={onClick}
      css={css`
        background: ${cssVariables('bg-2')};
        transition: ${transitions({ properties: ['background'], duration: 0.3 })};

        &:hover {
          background: ${cssVariables('bg-3')} !important;
        }
      `}
    />
  );
};
