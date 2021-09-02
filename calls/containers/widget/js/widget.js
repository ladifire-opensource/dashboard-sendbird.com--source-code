import SendBirdCall, { SoundType } from "sendbird-calls";
import LoginView from "../lib/views/LoginView";
import CallView from "../lib/views/CallView";
import DialView from "../lib/views/DialView";
import CallLogView from "../lib/views/CallLogView";
import WidgetApp from "../lib/components/WidgetApp";
import DialingSound from "../lib/assets/Dialing.mp3";
import RingingSound from "../lib/assets/Ringing.mp3";

import { styleOverrides as styles } from './styleOverrides';

export function onLoadedHandler({ appId, userId, accessToken, isAccessTokenNeeded, icon }) {
  const widgetDiv = document.querySelector('#widget');
  const app = new WidgetApp({
    id: 'widget_app',
    pages: {
      'index': LoginView,
      'login_view': LoginView,
      'dial_view': DialView,
      'call_view': CallView,
      'calllog_view': CallLogView
    },
    styles,
    args: {
      appId,
      userId,
      accessToken,
      isAccessTokenNeeded
    },
    icon
  });
  app.appendToHTML(widgetDiv);
  return app;
}

export const initSound = () => {
  try {
    SendBirdCall.addDirectCallSound(SoundType.DIALING, DialingSound);
    SendBirdCall.addDirectCallSound(SoundType.RINGING, RingingSound);
    return true;
  } catch (error) {
    return false;
  }
}
