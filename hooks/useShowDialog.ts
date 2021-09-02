import { useRef, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { commonActions } from '@actions';

export function useShowDialog(options: ShowDialogsPayload): () => void;
export function useShowDialog(): (payload: ShowDialogsPayload) => void;

export function useShowDialog(options?): any {
  const dispatch = useDispatch();
  const optionsRef = useRef(options);

  // save options in ref to keep the reference of returned function.
  useEffect(() => {
    optionsRef.current = options;
  });

  return useCallback(
    (payload?: ShowDialogsPayload) => {
      if (optionsRef.current) {
        dispatch(commonActions.showDialogsRequest(optionsRef.current));
        return;
      }
      if (payload) {
        dispatch(commonActions.showDialogsRequest(payload));
      }
    },
    [dispatch],
  );
}
