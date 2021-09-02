import { css } from 'styled-components';

export * from './colors';
export * from './zIndexes';

export interface StyledProps {
  styles?: any;
  [key: string]: any;
}

export const MEDIA_SIZES = {
  TABLET: 1280,
  TABLET_VERTICAL: 767,
  MOBILE_LARGE: 992,
  MOBILE_SMALL: 374,
};

export const media = Object.keys(MEDIA_SIZES).reduce((acc, label) => {
  acc[label] = (literals: TemplateStringsArray, ...placeholders: any[]) => css`
    @media (max-width: ${MEDIA_SIZES[label]}px) {
      ${css(literals, ...placeholders)};
    }
  `;

  return acc;
}, {} as Record<keyof typeof MEDIA_SIZES, (l: TemplateStringsArray, ...p: any[]) => string>);
