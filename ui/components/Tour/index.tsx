import { useState, FC, useEffect, useRef, useMemo } from 'react';
import { useIntl } from 'react-intl';
import Joyride, { Step, EVENTS, STATUS, status as StatusType, Styles, TooltipRenderProps } from 'react-joyride';

import styled, { keyframes } from 'styled-components';

import { cssVariables, Button, Headings, Lozenge, LozengeVariant, Link, Body, IconButton, cssColors } from 'feather';

type CoverImageProps = {
  src?: string;
  srcSet?: string;
};

type CoverImageType = CoverImageProps | null;

type SpotlightOffset = { x?: number; y?: number };

type CustomProps = {
  isDialog: boolean;
  cover: CoverImageType;
  stageNumber: number;
  spotlight: {
    offset: SpotlightOffset;
    isHidden: boolean;
  };
};

export type StepAddon = {
  cover?: CoverImageType;
  isDialog?: boolean;
  spotlight?: {
    offset?: SpotlightOffset;
    isHidden?: boolean;
  };
};

type Props = {
  steps: (Step & StepAddon)[];
  onStepChange?: (currentStep: number) => void;
  onStepEnd?: (status: StatusType) => void;
};

const animationSpotlight = () => keyframes`
  0% {
    opacity: 0.5;
    transform: scale(0.7);
  }
  100% {
    opacity: 0.05;
    transform: scale(1);
  }
`;

const StyledTour = styled.div`
  background: white;
  border-radius: 4px;
  overflow: hidden;
`;

const TourTitle = styled.h1`
  ${Headings['heading-01']};
  display: flex;
  align-items: center;
  font-size: 14px;
  margin: 0 0 4px;

  div {
    margin-left: 8px;
  }
`;

const TourDialogTitle = styled.h1`
  ${Headings['heading-04']};
  font-size: 20;
  font-weight: 600;
  margin: 2px 0 0;
`;

const TourDialogContent = styled.div`
  margin-top: 16px;
  padding-bottom: 16px;
  ${Body['body-short-01']};
`;

const TourDialogClose = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
`;

const TourBody = styled.div`
  position: relative;
  padding: 16px 24px;
  text-align: left;
`;

const TourContent = styled.div`
  ${Body['body-short-01']};

  strong {
    font-weight: 600;
  }
`;

const TourActions = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  a {
    font-size: 14px;
    font-weight: 600;
    &:hover {
      font-weight: 600;
    }
  }
`;

const Spotlight = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: rgba(47, 186, 159, 1);
  z-index: 999999;
  position: fixed;
  animation-name: ${animationSpotlight};
  animation-duration: 1.9s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-out;
  animation-fill-mode: both;
`;

const TourImage = styled.img`
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  height: 145px;
`;

const TourComponent: FC<TooltipRenderProps & { customProps: CustomProps[] }> = ({
  index,
  size,
  step,
  customProps,
  skipProps,
  primaryProps,
  tooltipProps,
}) => {
  const intl = useIntl();
  const { isDialog, cover, stageNumber } = customProps[index];
  const totalSteps = customProps.filter(({ stageNumber }) => stageNumber > 0).length;

  return (
    <StyledTour {...tooltipProps} style={{ width: isDialog ? 480 : 320, ...step.styles?.tooltipContainer }}>
      {isDialog ? (
        <TourBody>
          <TourDialogClose {...skipProps}>
            <IconButton icon="close" buttonType="secondary" size="small" />
          </TourDialogClose>
          <TourDialogTitle>{step.title}</TourDialogTitle>
          <TourDialogContent>{step.content}</TourDialogContent>
          <TourActions>
            {index >= 0 && (
              <Link {...skipProps}>{intl.formatMessage({ id: 'common.onboarding.tour.button.noThanks' })}</Link>
            )}
            {index + 1 <= size && (
              <Button buttonType="primary" style={{ width: 104 }} {...primaryProps} data-action="none">
                {intl.formatMessage({ id: 'common.onboarding.tour.button.start' })}
              </Button>
            )}
          </TourActions>
        </TourBody>
      ) : (
        <>
          {!!cover && (
            <TourImage
              src={(cover as CoverImageProps).src}
              srcSet={(cover as CoverImageProps).srcSet}
              data-test-id="TourImage"
            />
          )}
          <TourBody>
            {step.title && (
              <TourTitle>
                {step.title}{' '}
                <Lozenge variant={LozengeVariant.Light} color="neutral">
                  {intl.formatMessage(
                    { id: 'common.onboarding.tour.lozenge.stepStage' },
                    {
                      current: stageNumber,
                      max: totalSteps,
                    },
                  )}
                </Lozenge>
              </TourTitle>
            )}
            <TourContent>{step.content}</TourContent>
            <TourActions style={index + 1 === size ? { justifyContent: 'flex-end' } : {}}>
              {index >= 0 && size !== index + 1 && (
                <Link {...skipProps}>{intl.formatMessage({ id: 'common.onboarding.tour.button.skip' })}</Link>
              )}
              {index + 1 < size && (
                <Button buttonType="primary" size="small" style={{ width: 64 }} {...primaryProps} data-action="none">
                  {intl.formatMessage({ id: 'common.onboarding.tour.button.next' })}
                </Button>
              )}
              {index + 1 === size && (
                <Button buttonType="primary" size="small" style={{ width: 64 }} {...primaryProps} data-action="none">
                  {intl.formatMessage({ id: 'common.onboarding.tour.button.done' })}
                </Button>
              )}
            </TourActions>
          </TourBody>
        </>
      )}
    </StyledTour>
  );
};

const defaultStepStyle: Styles = {
  overlay: {
    mixBlendMode: 'inherit',
    cursor: 'arrow',
  },
  spotlight: {
    background: 'transparent',
  },
};

const Tour: FC<Props> = ({ steps, onStepChange, onStepEnd }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(true);
  const [activeRect, setActiveRect] = useState<DOMRect>();

  const currentStepRef = useRef(-1);

  const customProps: CustomProps[] = useMemo(() => {
    let currentStageNumber = 1;
    return steps.map(({ isDialog, cover, spotlight }) => {
      const customProp = {
        cover: cover || null,
        isDialog: isDialog || false,
        stageNumber: isDialog ? -1 : currentStageNumber,
        spotlight: {
          offset: spotlight?.offset ?? { x: 0, y: 0 },
          isHidden: spotlight?.isHidden ?? false,
        },
      };

      if (!isDialog) {
        currentStageNumber++;
      }

      return customProp;
    });
  }, [steps]);

  useEffect(() => {
    // prevent calling multiple onStepChang by the updates of its parents
    if (currentStepRef.current !== currentStep) {
      onStepChange?.(currentStep);
      currentStepRef.current = currentStep;
    }
  }, [currentStep, onStepChange]);

  const handleJoyride = (data) => {
    const { index, status, type } = data;

    if (type === EVENTS.STEP_AFTER) {
      setCurrentStep(index + 1);
      if (steps.length === index + 1) {
        setShow(false);
      }
      if (steps[index + 1] && steps[index + 1].target) {
        setActiveRect(document.querySelector(steps[index + 1].target as string)?.getBoundingClientRect());
      }
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      onStepEnd?.(status);
      setShow(false);
    }
  };

  const currentStepSpotlightProp = customProps[currentStep]?.spotlight;

  const spotlightStyle = activeRect
    ? {
        top: activeRect.y + activeRect.height / 2 - 24 + (currentStepSpotlightProp?.offset.y ?? 0),
        left: activeRect.x + activeRect.width / 2 - 24 + (currentStepSpotlightProp?.offset.x ?? 0),
      }
    : { display: 'none' };

  const shouldShowCurrentStepSpotlight = !currentStepSpotlightProp?.isHidden;

  return (
    <>
      <Joyride
        steps={steps.map(({ isDialog, cover, spotlight, ...nativeStep }) => ({
          ...nativeStep,
          styles: { ...defaultStepStyle, ...nativeStep.styles },
        }))}
        callback={handleJoyride}
        tooltipComponent={(tooltipRenderProps) => <TourComponent {...tooltipRenderProps} customProps={customProps} />}
        styles={{
          options: {
            overlayColor: steps[currentStep]?.isDialog ? cssColors('bg-overlay-4') : 'transparent',
            zIndex: 999998,
          },
        }}
        floaterProps={{
          disableAnimation: true,
          options: {
            preventOverflow: {
              enabled: false,
            },
          },
          styles: {
            arrow: {
              spread: 16,
              length: 8,
            },
            floater: {
              filter: `drop-shadow(${cssColors('bg-overlay-2')} 0px 3px 5px) drop-shadow(${cssColors(
                'bg-overlay-2',
              )} 0px 4px 6px) drop-shadow(${cssColors('bg-overlay-3')} 0px 8px 11px)`,
            },
          },
        }}
        getHelpers={({ go }) => {
          go(currentStep);
        }}
      />
      {shouldShowCurrentStepSpotlight && show && <Spotlight style={spotlightStyle} />}
    </>
  );
};

export default Tour;
