import { useReducer } from 'react';

type FormErrors = {
  organizationName: FormError;
  contact: FormError;
};

type State = {
  step: 0 | 1;
  organizationName: string;
  contact: string;
  errors: FormErrors;
};

interface SetFieldValuePayload {
  field: 'organizationName' | 'contact';
  value: string;
}

type Action =
  | { type: 'SET_STEP'; payload: 0 | 1 }
  | { type: 'SET_FIELD_VALUE'; payload: SetFieldValuePayload }
  | { type: 'SET_ERRORS'; payload: FormErrors }
  | {
      type: 'SET_ERROR';
      payload: { name: keyof FormErrors; error: FormError };
    };

export const OnboardingInitialState: State = {
  step: 0,
  organizationName: '',
  contact: '',
  errors: {
    organizationName: {
      hasError: false,
      message: '',
    },
    contact: {
      hasError: false,
      message: '',
    },
  },
};

const onboardingReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        step: action.payload,
      };
    case 'SET_FIELD_VALUE':
      return {
        ...state,
        [action.payload.field]: action.payload.value,
      };
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.name]: action.payload.error,
        },
      };
    default:
      return state;
  }
};

export const useOnboardingReducer = () => {
  const [state, dispatch] = useReducer(onboardingReducer, OnboardingInitialState);

  const setStep = (payload: 0 | 1) => {
    dispatch({ type: 'SET_STEP', payload });
  };

  const setFieldValue = (payload: SetFieldValuePayload) => {
    dispatch({ type: 'SET_FIELD_VALUE', payload });
  };

  const setErrors = (payload: FormErrors) => {
    dispatch({ type: 'SET_ERRORS', payload });
  };

  const setError = (payload: { name: 'organizationName' | 'contact'; error: FormError }) => {
    dispatch({ type: 'SET_ERROR', payload });
  };

  return {
    state,
    dispatch,
    actions: {
      setStep,
      setFieldValue,
      setErrors,
      setError,
    },
  };
};
