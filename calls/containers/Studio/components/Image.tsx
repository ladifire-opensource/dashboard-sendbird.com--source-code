import { FC, ImgHTMLAttributes } from 'react';

import { CLOUD_FRONT_URL } from '@constants';

type ImageName =
  | 'img-call-studio-guide-mobile-01'
  | 'img-call-studio-guide-web-01'
  | 'img-call-studio-guide-web-02'
  | 'img-calls-studio-main'
  | 'img-calls-studio-onboarding-01'
  | 'img-calls-studio-onboarding-02'
  | 'img-calls-studio-onboarding-03'
  | 'img-calls-studio-onboarding-04'
  | 'img-calls-studio-onboarding-05'
  | 'img-calls-studio-onboarding-group-calls-01'
  | 'img-calls-studio-onboarding-group-calls-02'
  | 'img-calls-studio-onboarding-group-calls-03';

const getSrc = (filename: string, ext: string = 'png') => `${CLOUD_FRONT_URL}/calls/${filename}.${ext}`;

const getSrcset = (filename: string, ext: string = 'png') => {
  return [getSrc(filename, ext), `${getSrc(`${filename}@2x`, ext)} 2x`, `${getSrc(`${filename}@3x`, ext)} 3x`].join(
    ', ',
  );
};

export const Image: FC<
  {
    name: ImageName;
    alt: string;
  } & ImgHTMLAttributes<HTMLImageElement>
> = ({ name, alt, ...props }) => {
  return <img src={getSrc(name)} srcSet={getSrcset(name)} alt={alt} {...props} />;
};
