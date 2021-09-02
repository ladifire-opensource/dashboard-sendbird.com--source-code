import { useDrawer } from '@ui/components/drawer/useDrawer';

type DrawerState = {
  ticket: Ticket;
  onClose?: () => void;
};

export const useProactiveChatViewDrawer = () => {
  const drawer = useDrawer<DrawerState>();
  const { drawerState } = drawer;

  if (drawerState != null && drawerState.ticket != null) {
    return drawer;
  }
  return { ...drawer, drawerState: undefined };
};
