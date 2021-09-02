import { FC, Suspense, useCallback } from 'react';
import { connect } from 'react-redux';

import { commonActions } from '@actions';
import { Overlay } from '@ui/components';

import { dialogComponents } from './dialogComponents';

const mapStateToProps = (state: RootState) => ({
  dialogs: state.dialogs,
});

const mapDispatchToProps = {
  hideDialogsRequest: commonActions.hideDialogsRequest,
};

type StoreProps = ReturnType<typeof mapStateToProps>;

type ActionProps = typeof mapDispatchToProps;

type Props = StoreProps & ActionProps;

const DialogsConnectable: FC<Props> = ({ dialogs, hideDialogsRequest }) => {
  const closeDialog = useCallback(() => {
    hideDialogsRequest();
  }, [hideDialogsRequest]);

  const { dialogTypes, dialogProps, isFetching } = dialogs;

  if (dialogTypes) {
    const SpecificDialog = dialogTypes ? dialogComponents[dialogTypes] : null;
    return (
      <Overlay
        canOutsideClickClose={false}
        isOpen={true}
        hasBackdrop={true}
        onClose={hideDialogsRequest}
        zIndex={dialogProps?.overlayZIndex}
      >
        <Suspense fallback={null}>
          <SpecificDialog
            dialogTypes={dialogTypes}
            dialogProps={dialogProps}
            isFetching={isFetching}
            onClose={closeDialog}
          />
        </Suspense>
      </Overlay>
    );
  }
  return null;
};

export const Dialogs = connect(mapStateToProps, mapDispatchToProps)(DialogsConnectable);
