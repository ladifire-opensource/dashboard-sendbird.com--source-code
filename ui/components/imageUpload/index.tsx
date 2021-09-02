import { ChangeEventHandler, useState, FC, useRef, useEffect } from 'react';

import styled, { css } from 'styled-components';

import { Avatar, AvatarType, Link } from 'feather';

import DeskAgentAvatar from '@desk/components/DeskAgentAvatar';

import { SDKUserAvatar } from '../SDKUserAvatar';

const InputWrapper = styled.label`
  > input[type='file'] {
    display: none;
  }
`;

const Container = styled.div<{ $flexDirection: 'column' | 'row' }>`
  display: flex;
  align-items: ${({ $flexDirection }) => ($flexDirection === 'row' ? 'center' : 'flex-start')};
  flex-direction: ${({ $flexDirection }) => $flexDirection};
`;

type Props = {
  type: 'user' | 'channel' | 'agent';
  label?: string;
  defaultImage?: string | File;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  previewSize?: number;
  profileID?: string;
  flexDirection?: 'column' | 'row';
};

const placeholderProfileIds = {
  channel: 4,
  user: String.fromCharCode(10),
  deskAgent: '',
};

export const ImageUpload: FC<Props> = ({
  type,
  label = 'Upload photo',
  defaultImage,
  previewSize = 64,
  flexDirection = 'row',
  profileID,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string>(typeof defaultImage === 'string' ? defaultImage : '');

  const setImageUrlFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as any);
    };
    reader.readAsDataURL(file);
  };

  const previewImage = (target: HTMLInputElement) => {
    const { files } = target;
    if (files == null) {
      return;
    }

    const file = Array.from(files).find((item) => item.type.match(/^image.*/));
    if (file) {
      setImageUrlFromFile(file);
    }
  };

  useEffect(() => {
    if (defaultImage && defaultImage instanceof File) {
      setImageUrlFromFile(defaultImage);
    }
  }, [defaultImage]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    previewImage(event.target);
    onChange?.(event);
  };

  const renderAvatar = () => {
    switch (type) {
      case 'user':
        return <SDKUserAvatar userID={placeholderProfileIds.user} size={previewSize} imageUrl={imageUrl} />;
      case 'channel':
        return (
          <Avatar
            type={AvatarType.Channel}
            profileID={placeholderProfileIds.channel}
            size={previewSize}
            imageUrl={imageUrl}
          />
        );
      case 'agent':
        return (
          <DeskAgentAvatar
            profileID={profileID || placeholderProfileIds.deskAgent}
            size={previewSize}
            imageUrl={imageUrl}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container $flexDirection={flexDirection}>
      {renderAvatar()}
      <InputWrapper>
        <Link
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === ' ' || event.key === 'Enter') {
              inputRef.current?.click();
            }
          }}
          css={`
            font-size: 14px;
            line-height: 20px;
            font-weight: 600 !important;
            outline: 0;
            margin-left: 16px;

            ${flexDirection === 'column' &&
            css`
              margin-top: 8px;
              margin-left: 0;
            `}
          `}
        >
          {label}
        </Link>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} data-test-id="ImageFileInput" />
      </InputWrapper>
    </Container>
  );
};
