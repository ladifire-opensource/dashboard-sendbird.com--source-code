import { FC, useMemo } from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Link, cssVariables } from 'feather';

import { SettingsGridCard } from '@common/containers/layout/settingsGrid';
import { BYTES_IN_MEGABYTE } from '@constants';
import DeskBotAvatar from '@desk/components/DeskBotAvatar';

import { useBotDetailContext } from '../botDetailContext';

const BotAvatar = styled(DeskBotAvatar)`
  margin-right: 24px;
`;

const PhotoUrlFieldError = styled.div`
  margin-top: 2px;
  line-height: 16px;
  color: ${cssVariables('red-5')};
  font-size: 12px;
`;

const ProfileFileFieldWrapper = styled.div`
  display: flex;
  flex-direction: row;

  a {
    margin-top: 22px;
  }

  label {
    cursor: pointer;
  }

  input {
    display: none;
  }
`;

export const DeskBotPhotoSetting: FC = () => {
  const intl = useIntl();
  const { bot } = useBotDetailContext();
  const { errors, watch, register } = useFormContext<BotFormValues>();

  const watchedProfileFile = watch('profileFile');

  const profileFileFieldValidationOptions: RegisterOptions = {
    validate: {
      sizeLimit: (files: FileList | null) => {
        if (files && files.length > 0) {
          const file = files[0];
          if (file.size > 5 * BYTES_IN_MEGABYTE) {
            return intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botPhoto.error.sizeLimit' });
          }
        }
        return true;
      },
    },
  };

  const botProfileURL = useMemo(() => {
    if (watchedProfileFile && watchedProfileFile.length > 0) {
      return window.URL.createObjectURL(watchedProfileFile[0]);
    }
    return bot?.photoUrl || undefined;
  }, [bot, watchedProfileFile]);

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botPhoto.title' })}
      description={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botPhoto.desc' })}
    >
      <ProfileFileFieldWrapper data-test-id="BotPhotoWrapper">
        <BotAvatar size={64} profileID={bot?.id ?? 0} imageUrl={botProfileURL} />
        <div>
          <Link>
            <label htmlFor="upload">
              <input
                ref={register(profileFileFieldValidationOptions)}
                type="file"
                id="upload"
                name="profileFile"
                accept="image/*"
                data-test-id="BotProfileFile"
              />
              {intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botPhoto.button.upload' })}
            </label>
          </Link>
          {!!errors.profileFile && <PhotoUrlFieldError>{errors.profileFile?.message}</PhotoUrlFieldError>}
        </div>
      </ProfileFileFieldWrapper>
    </SettingsGridCard>
  );
};
