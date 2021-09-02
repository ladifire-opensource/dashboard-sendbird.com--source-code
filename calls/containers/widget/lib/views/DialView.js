import SendBirdCall from "sendbird-calls";

import BaseElement from "../components/BaseElement";
import { classes } from "../css/styles.js";
import { createButton, createDiv, createInput, createLabel } from "../utils/domUtil";

export default class DialView extends BaseElement {
  constructor({ args }) {
    super({
      id: 'dial_view',
      className: `${classes['container']} ${classes['column']} ${classes['center']} ${classes['view']} ${classes['viewDial']}`,
      args
    });
  }

  onLoaded() {
  }

  build() {
    const content = createDiv({
      id: 'content',
      className: `${classes['content']} ${classes['column']} ${classes['center']}`
    });
    
    const formContainer = createDiv({
      className: `${classes['formContainer']} ${classes['column']} ${classes['center']}`
    });
    const dialTitleDiv = createDiv({ id: 'title', className: `${classes['fontBig']} ${classes['fontDemi']} ${classes['dialTitle']}`, innerText: 'Make a call'});

    const peerId = createInput({
      id: 'peer_id',
      className: `${classes['field']} ${classes['fontNormal']} ${classes['dialField']}`,
      placeholder: 'Enter user ID'
    });
    

    const btns = createDiv({ id: 'buttons', className: `${classes['row']} ${classes['center']} ${classes['btns']}` });
    const btnVideo = createButton({
      id: 'btn_video',
      className: `${classes['btnCircle']} ${classes['btnCall']} ${classes['btnVideo']}`
    });
    const btnAudio = createButton({
      id: 'btn_audio',
      className: `${classes['btnCircle']} ${classes['btnCall']} ${classes['btnAudio']}`
    });

    btns.appendChild(btnVideo);
    btns.appendChild(btnAudio);

    formContainer.appendChild(dialTitleDiv);
    formContainer.appendChild(peerId);
    formContainer.appendChild(btns);

    content.appendChild(formContainer);

    this.element.appendChild(content);

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

    
    this.element.appendChild(versionInfo);

    btnVideo.onclick = () => {
      this.dial(peerId.value, true, null);
    };

    btnAudio.onclick = () => {
      this.dial(peerId.value, false, null);
    };
  }

  dial(peerId, isVideoCall, callOption) {
    this.sendToParent('dial', {
      peerId,
      isVideoCall,
      callOption
    });
  }

  deauthenticate() {
    SendBirdCall.deauthenticate();
    this.sendToParent('deauthenticate');
  }
}
