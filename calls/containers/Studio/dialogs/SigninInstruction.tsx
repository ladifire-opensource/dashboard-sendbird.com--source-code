import { FC, ImgHTMLAttributes } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Typography } from 'feather';

import { CLOUD_FRONT_URL } from '@constants';

const getSrc = (filename: string) => `${CLOUD_FRONT_URL}/calls/${filename}`;

const ImageContainer = styled.div`
  position: relative;
`;

const StepContainer = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 160px;

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    ${Typography['label-01']}
    color: ${cssVariables('neutral-9')};
    width: 20px;
    height: 20px;
    background: ${cssVariables('neutral-3')};
    border-radius: 50%;
    position: absolute;
    top: 0;
    left: -20px;
  }

  p {
    ${Typography['caption-01']}
    color: ${cssVariables('neutral-10')};
    text-align: center;
    max-width: 112px;
  }

  ${ImageContainer} + p {
    margin-top: 8px;
  }
`;

const Step: FC<{
  step: number;
  image: ImgHTMLAttributes<HTMLImageElement>;
  text: string;
}> = ({ step, image, text }) => {
  const { src, alt, srcSet } = image;

  return (
    <StepContainer>
      <ImageContainer>
        <span>{step}</span>
        <img src={src} alt={alt} srcSet={srcSet} />
      </ImageContainer>
      <p>{text}</p>
    </StepContainer>
  );
};

const Container = styled.ol`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${cssVariables('neutral-1')};
  padding: 24px 40px;
  width: 100%;
  border-radius: 4px;

  ${StepContainer} + ${StepContainer} {
    margin-left: 16px;
  }
`;

const SigninInstructionStylable: FC = (props) => {
  const steps = [
    {
      src: 'img-call-studio-guide-01.png',
      srcSet: [
        'img-call-studio-guide-01.png',
        'img-call-studio-guide-01@2x.png 2x',
        'img-call-studio-guide-01@3x.png 3x',
      ],
      altKey: 'calls.studio.mobileApp.signinDialog.step1_lbl.alt',
      textKey: 'calls.studio.mobileApp.signinDialog.step1_lbl.text',
    },
    {
      src: 'img-call-studio-guide-02.png',
      srcSet: [
        'img-call-studio-guide-02.png',
        'img-call-studio-guide-02@2x.png 2x',
        'img-call-studio-guide-02@3x.png 3x',
      ],
      altKey: 'calls.studio.mobileApp.signinDialog.step2_lbl.alt',
      textKey: 'calls.studio.mobileApp.signinDialog.step2_lbl.text',
    },
    {
      src: 'img-call-studio-guide-03.png',
      srcSet: [
        'img-call-studio-guide-03.png',
        'img-call-studio-guide-03@2x.png 2x',
        'img-call-studio-guide-03@3x.png 3x',
      ],
      altKey: 'calls.studio.mobileApp.signinDialog.step3_lbl.alt',
      textKey: 'calls.studio.mobileApp.signinDialog.step3_lbl.text',
    },
  ];
  const intl = useIntl();
  return (
    <Container {...props}>
      {steps.map(({ src, srcSet, altKey, textKey }, index) => (
        <Step
          key={src}
          step={index + 1}
          text={intl.formatMessage({ id: textKey })}
          image={{
            srcSet: srcSet.map((src) => getSrc(src)).join(', '),
            src: getSrc(src),
            alt: intl.formatMessage({ id: altKey }),
          }}
        />
      ))}
    </Container>
  );
};

export const SigninInstruction = styled(SigninInstructionStylable)``;
