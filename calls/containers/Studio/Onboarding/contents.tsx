import { FC, FormEvent, forwardRef, ReactNode, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import {
  Body,
  Button,
  ButtonProps,
  cssVariables,
  Headings,
  InlineNotification,
  InputText,
  Link,
  Spinner,
  Subtitles,
  Typography,
} from 'feather';
import trim from 'lodash/trim';

import { RoomType } from '@calls/api/types';
import RoomTypeField from '@calls/components/RoomTypeField';
import { UserCard, UserCardError, UserCardList, UserCardLoading } from '@calls/components/UserCard';
import { createUser } from '@core/api';
import { useAsync, useErrorToast, useInitial, useTypedSelector } from '@hooks';
import { useAppId } from '@hooks/useAppId';

import { AppStore, GooglePlay } from '../components/AppDownload';
import { Image } from '../components/Image';
import { useMobileSigninDialog } from '../dialogs/signinDialogs';
import { useMobileAppUsers } from '../dialogs/useMobileAppUsers';
import { usePhoneboothUser, usePhoneboothUserCreation } from '../dialogs/usePhoneboothUser';
import useRooms from '../useRooms';

type Props = {
  step: { current: number; total: number };
  onNextClick?: () => void;
  onBackClick?: () => void;
};

type StepButtonProps = WithOptional<ButtonProps, 'buttonType' | 'size'>;

const BackButton: FC<StepButtonProps> = ({ buttonType = 'tertiary', size = 'medium', children, ...props }) => {
  const intl = useIntl();

  return (
    <Button buttonType={buttonType} size={size} {...props}>
      {children || intl.formatMessage({ id: 'calls.studio.onboarding.pages.components.back' })}
    </Button>
  );
};

const NextButton = forwardRef<HTMLButtonElement, StepButtonProps>(
  ({ buttonType = 'primary', size = 'medium', children, ...props }, ref) => {
    const intl = useIntl();

    return (
      <Button ref={ref} buttonType={buttonType} size={size} {...props}>
        {children || intl.formatMessage({ id: 'calls.studio.onboarding.pages.components.next' })}
      </Button>
    );
  },
);

const ContentSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 72px;
`;

const ImageSection = styled.section<{ background?: string }>`
  display: flex;
  align-items: center;
  background: ${(props) => props.background ?? cssVariables('neutral-1')};
  padding-left: 32px;

  > img {
    width: 520px;
    height: 480px;
    margin-bottom: 80px;
  }
`;

const Layout = styled.main`
  display: grid;
  grid-template-columns: calc(50% - 56px) calc(50% + 56px);
  height: 100%;
`;

const ButtonsContainer = styled.div`
  display: flex;

  > button + button {
    margin-left: 8px;
  }
`;

const InstructionTemplateContainer = styled.div`
  width: 400px;
  height: 480px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 80px;

  > button {
    align-self: flex-start;
  }

  > small {
    ${Typography['label-02']}
    color: ${cssVariables('neutral-7')};
  }

  > h2 {
    ${Headings['heading-05']}
    color: ${cssVariables('neutral-10')};
  }

  > p {
    ${Body['body-short-01']}
    white-space: pre-wrap;
    color: ${cssVariables('neutral-7')};

    > a {
      font-weight: 600;
    }
  }

  > * + h2 {
    margin-top: 16px;
  }

  > small + h2 {
    margin-top: 8px;
  }

  > h2 + p {
    margin-top: 16px;
  }

  * + ${ButtonsContainer} {
    margin-top: 48px;
  }

  > p + [role='alert'],
  p + div,
  p + form {
    margin-top: 32px;
  }
`;

const InstructionTemplate: FC<{
  step?: string;
  title: ReactNode;
  description: ReactNode;
  content: ReactNode;
  className?: string;
}> = ({ step, title, description, content, className }) => {
  return (
    <InstructionTemplateContainer className={className}>
      {step && <small>{step}</small>}
      <h2>{title}</h2>
      <p>{description}</p>
      {content}
    </InstructionTemplateContainer>
  );
};

const AppDownloadContainer = styled.div`
  > a + a {
    margin-left: 8px;
  }
`;

const InstallContentContainer = styled.div`
  display: flex;
  flex-direction: column;

  > p {
    ${Headings['heading-01']}
  }

  > p + ${AppDownloadContainer} {
    margin-top: 8px;
  }
`;

const Install: FC<Props> = ({ step, onBackClick, onNextClick }) => {
  const intl = useIntl();

  return (
    <Layout id="OnboardingStep1">
      <ContentSection>
        <InstructionTemplate
          step={intl.formatMessage({ id: 'calls.studio.onboarding.pages.step' }, step)}
          title={intl.formatMessage({ id: 'calls.studio.onboarding.pages.install.title' })}
          description={intl.formatMessage({ id: 'calls.studio.onboarding.pages.install.description' })}
          content={
            <InstallContentContainer>
              <p>{intl.formatMessage({ id: 'calls.studio.onboarding.pages.install.content.app.title' })}</p>
              <AppDownloadContainer>
                <AppStore />
                <GooglePlay />
              </AppDownloadContainer>
              <ButtonsContainer>
                <BackButton onClick={onBackClick} />
                <NextButton onClick={onNextClick} />
              </ButtonsContainer>
            </InstallContentContainer>
          }
        />
      </ContentSection>
      <ImageSection>
        <Image
          name="img-calls-studio-onboarding-01"
          alt={intl.formatMessage({ id: 'calls.studio.onboarding.pages.install.image' })}
        />
      </ImageSection>
    </Layout>
  );
};

const UserContentContainer = styled.div`
  display: flex;
  flex-direction: column;

  > button {
    width: fit-content;

    &:last-child {
      margin-top: 32px;
    }
  }

  > p {
    ${Subtitles['subtitle-01']}
    color: ${cssVariables('neutral-10')};
    white-space: pre-wrap;

    a {
      color: ${cssVariables('neutral-10')};
      text-decoration: underline;
    }
  }

  > [role='progressbar'] {
    margin: auto;
  }

  button + p {
    margin-top: 8px;
  }

  > [role='alert'] + form {
    margin-top: 24px;
  }

  > [role='alert'] + ${UserCardList} {
    margin-top: 8px;
  }
`;

const CreateUserFormContainer = styled.form`
  > div + p {
    margin-top: 24px;
  }

  > p {
    ${Body['body-short-01']}
    color: ${cssVariables('neutral-7')};
  }
`;

type UserCreationForm = { userId: string; nickname: string };

const CreateUserForm: FC<{
  description?: ReactNode;
  readOnly?: boolean;
  isLoading?: boolean;
  initialValue?: { userId: string; nickname: string };
  onSubmit: (form: UserCreationForm) => void;
  onBackClick?: () => void;
}> = ({ readOnly, isLoading, initialValue, onSubmit, onBackClick, description }) => {
  const intl = useIntl();
  const [userId, setUserId] = useState(initialValue?.userId ?? '');
  const [nickname, setNickname] = useState(initialValue?.nickname ?? '');
  const isInputInvalid = !trim(userId) || !trim(nickname);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ userId, nickname });
  };
  return (
    <CreateUserFormContainer onSubmit={handleSubmit} data-test-id="CreateUserForm">
      <InputText
        label={intl.formatMessage({ id: 'calls.studio.onboarding.pages.createUserForm.userId' })}
        readOnly={readOnly}
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <InputText
        label={intl.formatMessage({ id: 'calls.studio.onboarding.pages.createUserForm.nickname' })}
        readOnly={readOnly}
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      {description}
      <ButtonsContainer>
        {onBackClick && <BackButton onClick={onBackClick} />}
        <NextButton type="submit" disabled={isInputInvalid || isLoading} isLoading={isLoading} />
      </ButtonsContainer>
    </CreateUserFormContainer>
  );
};

const OperatorExistNotification = () => {
  const intl = useIntl();
  return (
    <InlineNotification
      type="success"
      message={intl.formatMessage({ id: 'calls.studio.onboarding.pages.phonebooth.alreadyExist' })}
    />
  );
};

const ContactExistNotification = () => {
  const intl = useIntl();
  return (
    <InlineNotification
      type="success"
      message={intl.formatMessage({ id: 'calls.studio.onboarding.pages.components.contactExistNotification' })}
    />
  );
};

const Phonebooth: FC<Props> = ({ step, onNextClick, onBackClick }) => {
  const intl = useIntl();
  const { loadUser, user, status, errorMessage } = usePhoneboothUser();
  const { createUser, loading: isSubmitting, error: submitError } = usePhoneboothUserCreation();
  const initialUser = useInitial(user);
  const isFormSubmitted = useRef(false);

  const isSubmitSuccess = status === 'success' && !initialUser && user;

  useEffect(() => {
    if (isFormSubmitted.current && isSubmitSuccess) {
      onNextClick?.();
    }
  }, [isSubmitSuccess, onNextClick]);

  useErrorToast(submitError);

  const handleSubmit = (form: UserCreationForm) => {
    isFormSubmitted.current = true;
    createUser(form);
  };

  return (
    <Layout id="OnboardingStep2">
      <ContentSection>
        <InstructionTemplate
          step={intl.formatMessage({ id: 'calls.studio.onboarding.pages.step' }, step)}
          title={intl.formatMessage({ id: 'calls.studio.onboarding.pages.phonebooth.title' })}
          description={intl.formatMessage({ id: 'calls.studio.onboarding.pages.phonebooth.description' })}
          content={
            <UserContentContainer>
              {status === 'loading' && <Spinner size={48} css="height: 272px;" />}
              {errorMessage && <UserCardError message={errorMessage} onRetry={loadUser} />}
              {initialUser && <OperatorExistNotification />}
              {status === 'success' &&
                (initialUser ? (
                  <>
                    <UserCardList>
                      <UserCard
                        userId={initialUser.userId}
                        nickname={initialUser.nickname}
                        profileUrl={initialUser.profileUrl}
                        deactivated={!initialUser.isActive}
                      />
                    </UserCardList>
                    <ButtonsContainer>
                      {onBackClick && <BackButton onClick={onBackClick} />}
                      <NextButton onClick={onNextClick} />
                    </ButtonsContainer>
                  </>
                ) : (
                  <CreateUserForm
                    description={
                      <p>
                        {intl.formatMessage({ id: 'calls.studio.onboarding.pages.phonebooth.form.accessTokenInfo' })}
                      </p>
                    }
                    isLoading={isSubmitting}
                    onSubmit={handleSubmit}
                    onBackClick={onBackClick}
                  />
                ))}
            </UserContentContainer>
          }
        />
      </ContentSection>
      <ImageSection>
        <Image
          name="img-calls-studio-onboarding-02"
          alt={intl.formatMessage({ id: 'calls.studio.onboarding.pages.phonebooth.image' })}
        />
      </ImageSection>
    </Layout>
  );
};

const createContact = async (appId: string, user: UserCreationForm) =>
  createUser({ appId, ...user, issueAccessToken: true, profileUrl: '' });

const useContacts = ({ onSubmit }: { onSubmit?: () => void }) => {
  const { items, addUser, showAddExistingUserDialog } = useMobileAppUsers();
  const appId = useAppId();
  const [{ data, status, error }, requestContactCreation] = useAsync(
    (form: UserCreationForm) => createContact(appId, form),
    [appId],
  );

  const initialUser = useInitial(items[0]?.data);

  const alreadyExist = !!initialUser?.user_id;
  const isSubmitSuccess = status === 'success' && !initialUser?.user_id && data?.data.user_id;
  const isSubmitting = status === 'loading';

  useEffect(() => {
    if (isSubmitSuccess && data?.data) {
      addUser(data.data);
      onSubmit?.();
    }
  }, [isSubmitSuccess, onSubmit, data, addUser]);

  useErrorToast(error);

  const handleSubmit = (form: UserCreationForm) => {
    if (alreadyExist) {
      onSubmit?.();
      return;
    }
    requestContactCreation(form);
  };

  return {
    alreadyExist,
    showAddExistingUserDialog,
    items,
    initialUser,
    isSubmitting,
    handleSubmit,
  };
};

const ContactsTemplate: FC<{
  id?: string;
  title: ReactNode;
  description: ReactNode;
  step: string;
  image: ReactNode;
  form: ReactNode;
}> = ({ id, title, description, step, image, form }) => {
  return (
    <Layout id={id}>
      <ContentSection>
        <InstructionTemplate
          step={step}
          title={title}
          description={description}
          content={<UserContentContainer>{form ?? <Spinner size={48} css="height: 152px;" />}</UserContentContainer>}
        />
      </ContentSection>
      <ImageSection>{image}</ImageSection>
    </Layout>
  );
};

const DirectCallsContacts: FC<Props> = ({ step, onNextClick, onBackClick }) => {
  const intl = useIntl();
  const { alreadyExist, showAddExistingUserDialog, items, initialUser, isSubmitting, handleSubmit } = useContacts({
    onSubmit: onNextClick,
  });

  const renderForm = () => {
    if (items.length === 0) {
      return <CreateUserForm isLoading={isSubmitting} onSubmit={handleSubmit} onBackClick={onBackClick} />;
    }
    return (
      <>
        <ContactExistNotification />
        <UserCardList>
          {alreadyExist && initialUser ? (
            <UserCard
              userId={initialUser.user_id}
              nickname={initialUser.nickname}
              profileUrl={initialUser.profile_url}
              deactivated={!initialUser.is_active}
            />
          ) : (
            <UserCardLoading />
          )}
        </UserCardList>
        <ButtonsContainer>
          {onBackClick && <BackButton onClick={onBackClick} />}
          <NextButton onClick={onNextClick} />
        </ButtonsContainer>
      </>
    );
  };

  return (
    <ContactsTemplate
      id="OnboardingStep3"
      step={intl.formatMessage({ id: 'calls.studio.onboarding.pages.step' }, step)}
      title={intl.formatMessage({ id: 'calls.studio.onboarding.pages.contacts.title' })}
      description={intl.formatMessage(
        { id: 'calls.studio.onboarding.pages.contacts.description' },
        {
          a: (text) => (
            <Link disabled={alreadyExist} onClick={showAddExistingUserDialog}>
              {text}
            </Link>
          ),
        },
      )}
      image={
        <Image
          name="img-calls-studio-onboarding-03"
          alt={intl.formatMessage({ id: 'calls.studio.onboarding.pages.contacts.image' })}
        />
      }
      form={renderForm()}
    />
  );
};

const useIsDialogOpened = () => useTypedSelector((state) => !!state.dialogs.dialogTypes);

const Signin: FC<Props> = ({ step, onNextClick, onBackClick }) => {
  const intl = useIntl();
  const showSigninDialog = useMobileSigninDialog();
  const { items } = useMobileAppUsers();
  const [isSigninVisited, setIsSigninVisited] = useState(false);
  const doneButtonRef = useRef<HTMLButtonElement>(null);
  const isDialogOpened = useIsDialogOpened();
  const readyToFinish = isSigninVisited && !isDialogOpened;

  const handleClickConnect = (user: SDKUser) => () => {
    showSigninDialog(user);
    setIsSigninVisited(true);
    !readyToFinish && onNextClick?.();
  };

  useEffect(() => {
    readyToFinish && doneButtonRef.current?.focus();
  }, [readyToFinish]);

  return (
    <Layout id="OnboardingStep4">
      <ContentSection>
        <InstructionTemplate
          step={intl.formatMessage({ id: 'calls.studio.onboarding.pages.step' }, step)}
          title={intl.formatMessage({ id: 'calls.studio.onboarding.pages.signin.title' })}
          description={intl.formatMessage({ id: 'calls.studio.onboarding.pages.signin.description' })}
          content={
            <UserContentContainer>
              {items.length > 0 && (
                <UserCardList>
                  {items.map((item) => {
                    return item.isFetching || !item?.data ? (
                      <UserCardLoading key={item.userId} />
                    ) : (
                      <UserCard
                        key={item.userId}
                        userId={item.userId}
                        nickname={item.data.nickname}
                        profileUrl={item.data.profile_url}
                        deactivated={!item.data.is_active}
                        action={
                          <Button buttonType="primary" size="small" onClick={handleClickConnect(item.data)}>
                            {intl.formatMessage({ id: 'calls.studio.onboarding.pages.signin.content.user.connect' })}
                          </Button>
                        }
                      />
                    );
                  })}
                </UserCardList>
              )}
              <ButtonsContainer>
                <BackButton onClick={onBackClick} />
                <NextButton disabled={!readyToFinish} onClick={onNextClick} ref={doneButtonRef}>
                  {intl.formatMessage({ id: 'calls.studio.onboarding.pages.signin.done' })}
                </NextButton>
              </ButtonsContainer>
            </UserContentContainer>
          }
        />
      </ContentSection>
      <ImageSection>
        {readyToFinish ? (
          <Image
            name="img-calls-studio-onboarding-05"
            alt={intl.formatMessage({ id: 'calls.studio.onboarding.pages.signin.image.after' })}
          />
        ) : (
          <Image
            name="img-calls-studio-onboarding-04"
            alt={intl.formatMessage({ id: 'calls.studio.onboarding.pages.signin.image.before' })}
          />
        )}
      </ImageSection>
    </Layout>
  );
};

export const DirectCallsContent = { Install, Phonebooth, Contacts: DirectCallsContacts, Signin };

const getGroupCallsContentId = (step: number) => `GroupCallsOnboardingStep${step}`;

const Operator: FC<Props> = ({ step, onNextClick, onBackClick }) => {
  const intl = useIntl();
  const { loadUser, user, status, errorMessage } = usePhoneboothUser();
  const { createUser, loading: isSubmitting, error: submitError } = usePhoneboothUserCreation();
  const initialUser = useInitial(user);
  const isFormSubmitted = useRef(false);

  const isSubmitSuccess = status === 'success' && !initialUser && user;

  useEffect(() => {
    if (isFormSubmitted.current && isSubmitSuccess) {
      onNextClick?.();
    }
  }, [isSubmitSuccess, onNextClick]);

  useErrorToast(submitError);

  const handleSubmit = (form: UserCreationForm) => {
    isFormSubmitted.current = true;
    createUser(form);
  };

  return (
    <Layout id={getGroupCallsContentId(step.current)}>
      <ContentSection>
        <InstructionTemplate
          step={intl.formatMessage({ id: 'calls.studio.onboarding.pages.step' }, step)}
          title={intl.formatMessage({ id: 'calls.studio.onboarding.pages.group.operator.title' })}
          description={intl.formatMessage({ id: 'calls.studio.onboarding.pages.group.operator.description' })}
          content={
            <UserContentContainer>
              {status === 'loading' && <Spinner size={48} css="height: 272px;" />}
              {errorMessage && <UserCardError message={errorMessage} onRetry={loadUser} />}
              {initialUser && <OperatorExistNotification />}
              {status === 'success' &&
                (initialUser ? (
                  <>
                    <UserCardList>
                      <UserCard
                        userId={initialUser.userId}
                        nickname={initialUser.nickname}
                        profileUrl={initialUser.profileUrl}
                        deactivated={!initialUser.isActive}
                      />
                    </UserCardList>
                    <ButtonsContainer>
                      <BackButton onClick={onBackClick} />
                      <NextButton onClick={onNextClick} />
                    </ButtonsContainer>
                  </>
                ) : (
                  <CreateUserForm
                    description={
                      <p>
                        {intl.formatMessage({
                          id: 'calls.studio.onboarding.pages.group.operator.form.accessTokenInfo',
                        })}
                      </p>
                    }
                    isLoading={isSubmitting}
                    onSubmit={handleSubmit}
                    onBackClick={onBackClick}
                  />
                ))}
            </UserContentContainer>
          }
        />
      </ContentSection>
      <ImageSection>
        <Image
          name="img-calls-studio-onboarding-group-calls-01"
          alt={intl.formatMessage({ id: 'calls.studio.onboarding.pages.group.operator.image' })}
        />
      </ImageSection>
    </Layout>
  );
};

const GroupCallsContacts: FC<Props> = ({ step, onNextClick, onBackClick }) => {
  const intl = useIntl();
  const { alreadyExist, showAddExistingUserDialog, items, initialUser, isSubmitting, handleSubmit } = useContacts({
    onSubmit: onNextClick,
  });

  const renderForm = () => {
    if (items.length === 0) {
      return <CreateUserForm isLoading={isSubmitting} onSubmit={handleSubmit} onBackClick={onBackClick} />;
    }
    return (
      <>
        <ContactExistNotification />
        <UserCardList>
          {alreadyExist && initialUser ? (
            <UserCard
              userId={initialUser.user_id}
              nickname={initialUser.nickname}
              profileUrl={initialUser.profile_url}
              deactivated={!initialUser.is_active}
            />
          ) : (
            <UserCardLoading />
          )}
        </UserCardList>
        <ButtonsContainer>
          {onBackClick && <BackButton onClick={onBackClick} />}
          <NextButton onClick={onNextClick} />
        </ButtonsContainer>
      </>
    );
  };

  return (
    <ContactsTemplate
      id={getGroupCallsContentId(step.current)}
      step={intl.formatMessage({ id: 'calls.studio.onboarding.pages.step' }, step)}
      title={intl.formatMessage({ id: 'calls.studio.onboarding.pages.contacts.title' })}
      description={intl.formatMessage(
        { id: 'calls.studio.onboarding.pages.contacts.description' },
        {
          a: (text) => (
            <Link disabled={alreadyExist} onClick={showAddExistingUserDialog}>
              {text}
            </Link>
          ),
        },
      )}
      image={
        <Image
          name="img-calls-studio-onboarding-group-calls-02"
          alt={intl.formatMessage({ id: 'calls.studio.onboarding.pages.contacts.image' })}
        />
      }
      form={renderForm()}
    />
  );
};

const Room: FC<Props> = ({ step, onNextClick, onBackClick }) => {
  const intl = useIntl();
  const [selected, setSelected] = useState<RoomType>('small_room_for_video');
  const { load, isLoading, isCreating, create, rooms, loadError, createError } = useRooms();

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isCreating && rooms && rooms.length > 0) {
      onNextClick?.();
    }
  }, [isCreating, onNextClick, rooms]);

  useErrorToast(loadError);

  useErrorToast(createError);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    create(selected);
  };

  return (
    <Layout id={getGroupCallsContentId(step.current)}>
      <ContentSection>
        <InstructionTemplate
          step={intl.formatMessage({ id: 'calls.studio.onboarding.pages.step' }, step)}
          title={intl.formatMessage({ id: 'calls.studio.onboarding.pages.group.room.title' })}
          description={intl.formatMessage({ id: 'calls.studio.onboarding.pages.group.room.description' })}
          content={
            <form onSubmit={handleSubmit}>
              <RoomTypeField selected={selected} onChange={setSelected} />
              <ButtonsContainer>
                {onBackClick && <BackButton onClick={onBackClick} />}
                <NextButton type="submit" isLoading={isLoading || isCreating}>
                  {intl.formatMessage({ id: 'calls.studio.onboarding.pages.group.room.done' })}
                </NextButton>
              </ButtonsContainer>
            </form>
          }
        />
      </ContentSection>
      <ImageSection>
        <Image
          name="img-calls-studio-onboarding-group-calls-03"
          alt={intl.formatMessage({ id: 'calls.studio.onboarding.pages.group.room.image' })}
        />
      </ImageSection>
    </Layout>
  );
};

export const GroupCallsContent = { Operator, Contacts: GroupCallsContacts, Room };
