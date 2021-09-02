import SendBirdCall, { SoundType } from "sendbird-calls";

import BaseElement from "../components/BaseElement";
import { createButton, createDiv, createInput, createLabel } from "../utils/domUtil";
import { classes } from "../css/styles.js";
import DialingSound from "../assets/Dialing.mp3";
import RingingSound from "../assets/Ringing.mp3";
import ReconnectingSound from '../assets/Reconnecting.mp3';
import ReconnectedSound from '../assets/Reconnected.mp3';

export default class LoginView extends BaseElement {
  constructor({ args }) {
    super({ id: 'login_view', className: `${classes['column']} ${classes['center']} ${classes['view']} ${classes['viewLogin']}`, args });
  }

  onLoaded() {
    if (this.args.userId) {
      this.setCredentials(this.args.userId, this.args.accessToken);
    }
  }

  build() {
    const closeButton = createDiv({
      id: 'close_button',
      className: `${classes['closeButton']}`
    });
    closeButton.onclick = () => {
      this.sendToParent('widgetclose');
    };

    const content = createDiv({
      id: 'content',
      className: `${classes['content']} ${classes['column']} ${classes['center']}`
    });

    const oval = createDiv({ id: 'logo_oval', className: classes['logoMid'] });

    const loginTitleDiv = createDiv({ id: 'login_title_div', className: classes['loginTitleDiv'] });
    const loginTitle = createLabel({
      id: 'login_title',
      innerText: 'Sendbird Calls',
      className: `${classes['fontBig']} ${classes['fontDemi']}`
    });
    loginTitleDiv.appendChild(loginTitle);

    const formContainer = createDiv({ id: 'form_container', className: classes['formContainer'] });
    const inputAppIdLabel = createLabel({ id: 'input_app_id_label', htmlFor: 'input_app_id', innerText: 'Application ID', className: `${classes['fieldLabel']} ${classes['fontSmall']} ${classes['fontHeavy']}` });
    const inputAppId = createInput({ id: 'input_app_id', className: `${classes['field']} ${classes['fontNormal']}` });
    const inputIdLabel = createLabel({ id: 'input_id_label', htmlFor: 'input_id', innerText: 'User ID', className: `${classes['fieldLabel']} ${classes['fontSmall']} ${classes['fontHeavy']}` });
    const inputId = createInput({ id: 'input_id', className: `${classes['field']} ${classes['fontNormal']}` });
    const inputAccessTokenLabel = createLabel({ id: 'input_access_token_label', htmlFor: 'input_access_token', innerText: 'Access token', className: `${classes['fieldLabel']} ${classes['fontSmall']} ${classes['fontHeavy']}` });
    const inputAccessToken = createInput({ id: 'input_access_token', className: `${classes['field']} ${classes['fontNormal']}` });

    const btnLogin = createButton({ id: 'btn_login', className: `${classes['btn']} ${classes['btnPrimary']} ${classes['btnMid']} ${classes['loginButton']} ${classes['fontNormal']}`, });
    const loginLabel = createLabel({ id: 'login_label', className: `${classes['fontNormal']} ${classes['fontColorWhite']} ${classes['fontDemi']}`, innerText: 'Sign in' });
    btnLogin.appendChild(loginLabel);
    btnLogin.onclick = () => {
      const appId = inputAppId.value;
      const userId = inputId.value;
      const accessToken = inputAccessToken.value;
      if (appId) this.setAppId(appId);
      this.setCredentials(userId, accessToken);

      SendBirdCall.addDirectCallSound(SoundType.DIALING, DialingSound)
      SendBirdCall.addDirectCallSound(SoundType.RINGING, RingingSound)
      SendBirdCall.addDirectCallSound(SoundType.RECONNECTING, ReconnectingSound)
      SendBirdCall.addDirectCallSound(SoundType.RECONNECTED, ReconnectedSound)
    };

    if (!this.args.appId) {
      formContainer.appendChild(inputAppIdLabel);
      formContainer.appendChild(inputAppId);
    }
    formContainer.appendChild(inputIdLabel);
    formContainer.appendChild(inputId);
    if (this.args.isAccessTokenNeeded) {
      formContainer.appendChild(inputAccessTokenLabel);
      formContainer.appendChild(inputAccessToken);
    }
    formContainer.appendChild(btnLogin);

    content.appendChild(oval);
    content.appendChild(loginTitleDiv);
    content.appendChild(formContainer);

    const sdkVersion = SendBirdCall.sdkVersion;
    const versionInfo = createDiv({
      id: 'version_info',
      className: `${classes['versionInfo']} ${classes['row']} ${classes['center']}`
    });
    const sdkVersionLabel = createLabel({
      id: 'sdk_version_label',
      className: `${classes['fontSmall']} ${classes['versionLabel']}`,
      innerText: `SDK ${sdkVersion}`
    });
    versionInfo.appendChild(sdkVersionLabel);


    this.element.appendChild(closeButton);
    this.element.appendChild(content);
    this.element.appendChild(versionInfo);
  }

  async setAppId(appId) {
    this.sendToParent('appId', appId);
  }

  async setCredentials(userId, accessToken) {
    const credentials = { userId: userId, accessToken: accessToken };
    this.sendToParent('credentials', credentials);
  }
}