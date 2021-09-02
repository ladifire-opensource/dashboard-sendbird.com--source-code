import { lazy, Suspense, useContext } from 'react';

import { FullScreenModalIDs } from '@constants';
import { FullScreenModalContext } from '@ui/components/FullScreenModal/context';

const CallsVoucherModal = lazy(() => import('./CallsVoucherModal'));

const modals = {
  [FullScreenModalIDs.CallsVoucher]: CallsVoucherModal,
};

export const FullScreenModals = () => {
  const { activeModalID } = useContext(FullScreenModalContext);
  if (activeModalID && Object.keys(modals).includes(activeModalID)) {
    const Component = modals[activeModalID];
    return (
      <Suspense fallback={null}>
        <Component />
      </Suspense>
    );
  }
  return null;
};
