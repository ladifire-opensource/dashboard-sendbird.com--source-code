import React from 'react';

import styled from 'styled-components';

import { Icon, cssVariables } from 'feather';

type Props = {
  thumbnail?: { name: string; url: string };
};

const ThumbnailContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;
  background: ${cssVariables('bg-3')};
`;

export const IntegrationThumbnail: React.FC<Props> = ({ thumbnail }) => {
  return (
    <ThumbnailContainer>
      {thumbnail ? (
        <img src={thumbnail.url} alt={thumbnail.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <Icon icon="link" size={24} color={cssVariables('neutral-5')} />
      )}
    </ThumbnailContainer>
  );
};
