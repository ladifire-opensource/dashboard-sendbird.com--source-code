import { HTMLAttributes } from 'react';

import styled from 'styled-components';

import { cssVariables, Icon } from 'feather';

type Props = {
  /**
   * xmedium(40px), large(64px)
   */
  size: 'xmedium' | 'large' | number;
  id: string;
} & HTMLAttributes<HTMLDivElement>;

const backgroundColors = [
  cssVariables('blue-5'),
  cssVariables('green-5'),
  cssVariables('violet-5'),
  cssVariables('purple-7'),
  cssVariables('neutral-6'),
];

const getHashcode = (value: string) => {
  if (value.length === 0) return 0;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const getSize = (size: Props['size']) =>
  typeof size === 'number'
    ? size
    : {
        xmedium: 40,
        large: 64,
      }[size];

const Wrapper = styled.div<{ $size: number; background: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  background: ${(props) => props.background};
  border-radius: 8px;
`;

const RoomAvatar = styled(({ size, id, ...props }: Props) => {
  const wrapperSize = getSize(size);
  const iconSize = wrapperSize * 0.6;
  const background = backgroundColors[Math.abs(getHashcode(id)) % backgroundColors.length];

  return (
    <Wrapper $size={wrapperSize} background={background} {...props}>
      <Icon size={iconSize} icon="group-call" color="white" />
    </Wrapper>
  );
})``;

export default RoomAvatar;
