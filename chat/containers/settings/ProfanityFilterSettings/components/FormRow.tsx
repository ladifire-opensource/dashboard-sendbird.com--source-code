import { FC } from 'react';

import { SettingsGridCard, SettingsGridCardProps } from '@common/containers/layout';

const FormRow: FC<{ title: string } & Omit<SettingsGridCardProps, 'title'>> = (props) => {
  return <SettingsGridCard role="group" aria-label={props.title} {...props} />;
};

export default FormRow;
