import BaseElement from "../components/BaseElement";
import { createDiv, replaceClassName } from "../utils/domUtil";
import { classes } from "../css/styles.js";
import { CallButton } from "./CallButton";
import { CallTextButton } from "./CallTextButton";

export default class CallButtons extends BaseElement {
  constructor({ id, parent, element, args, call } = {}) {
    super({ id, parent, element, args });

    this.acceptBtn = null;
    this.muteBtn = null;
    this.endBtn = null;
    this.videoBtn = null;
    this.btnEnd = null;
    this.closeBtn = null;
    this.activeButtons = [];
    this.call = call;
  }

  build() {
    let element = null;
    if (this.args.isWidget) {
      element = createDiv({ className: `${classes['row']} ${classes['center']} ${classes['callButtonsWidget']}` });  
    } else {
      element = createDiv({ className: `${classes['row']} ${classes['center']} ${classes['callButtons']}` });
    }
    
    this.element = element;

    if (this.call.isVideoCall) {
      this.acceptBtn = new CallButton({
        buttonClass: `${classes['btnCircle']} ${classes['btnCall']} ${classes['btnVideoAccept']}`,
        labelClass: classes['fontSmall'],
        type: 'mutual'
      });
    } else {
      this.acceptBtn = new CallButton({
        buttonClass: `${classes['btnCircle']} ${classes['btnCall']} ${classes['btnAccept']}`,
        labelClass: classes['fontSmall'],
        type: 'mutual'
      });
    }

    this.muteBtn = new CallButton({
      buttonClass: `${classes['btnCircle']} ${classes['btnCall']} ${classes['btnMute']}`,
      labelClass: classes['fontSmall'],
      type: 'mutual'
    });

    this.videoBtn = new CallButton({
      buttonClass: `${classes['btnCircle']} ${classes['btnCall']} ${classes['btnStopVideo']}`,
      labelClass: classes['fontSmall'],
      type: 'video'
    });

    this.endBtn = new CallButton({
      buttonClass: `${classes['btnCircle']} ${classes['btnCall']} ${classes['btnEnd']}`,
      labelClass: classes['fontSmall'],
      type: 'mutual'
    });

    this.closeBtn = new CallTextButton({
      buttonClass: `${classes['btnClose']} ${classes['fontNormal']}`,
      labelText: 'Back',
      type: 'mutual'
    });

    element.appendChild(this.acceptBtn.element);
    element.appendChild(this.muteBtn.element);
    element.appendChild(this.videoBtn.element);
    element.appendChild(this.endBtn.element);
    element.appendChild(this.closeBtn.element);

    this.acceptBtn.onclick = () => {
      this.setAccepting();
      this.sendToParent('click_accept');
    };

    this.muteBtn.onclick = () => {
      this.invertMuteIcon();
      this.sendToParent('click_mute');
    };

    this.videoBtn.onclick = () => {
      this.invertVideoIcon();
      this.sendToParent('click_video');
    };

    this.endBtn.onclick = () => {
      this.sendToParent('click_end');
    };

    this.closeBtn.onclick = () => {
      this.sendToParent('click_close');
    };
  }

  invertMuteIcon() {
    if (this.call.isLocalAudioEnabled) {
      replaceClassName(this.muteBtn.icon, classes['btnMute'], classes['btnUnmute']);
    } else {
      replaceClassName(this.muteBtn.icon, classes['btnUnmute'], classes['btnMute']);
    }
  }

  invertVideoIcon() {
    if (this.call.isLocalVideoEnabled) {
      replaceClassName(this.videoBtn.icon, classes['btnStopVideo'], classes['btnStartVideo']);
    } else {
      replaceClassName(this.videoBtn.icon, classes['btnStartVideo'], classes['btnStopVideo']);
    }
  }

  recvMessage(name, value) {
    switch (name) {
      case 'dialing':
        this.setDialing();
        break;
      case 'ringing':
        this.setRinging();
        break;
      case 'connected':
        this.setConnected();
        break;
      case 'ended':
        this.setEnded();
        break;
      default:
        break;
    }
  }

  setAccepting() {
    this.hideActiveButtons();
    this.showButtons(this.endBtn);
  }

  setDialing() {
    this.hideActiveButtons();
    this.showButtons(this.muteBtn, this.videoBtn, this.endBtn);
  }

  setRinging() {
    this.hideActiveButtons();
    this.showButtons(this.muteBtn, this.videoBtn, this.acceptBtn, this.endBtn);
  }

  setConnected() {
    this.hideActiveButtons();
    this.showButtons(this.muteBtn, this.videoBtn, this.endBtn);
  }

  setEnded() {
    this.hideActiveButtons();
    this.showButtons(this.closeBtn);
  }

  hideActiveButtons() {
    for (const btn of this.activeButtons) {
      btn.element.classList.add(classes['hidden']);
    }
    this.activeButtons = [];
  }

  showButtons(...btns) {
    for (const btn of btns) {
      if (!this.call.isVideoCall && btn.type === 'video'
        || this.call.isVideoCall && btn.type === 'audio') {
        continue;
      }

      btn.element.classList.remove(classes['hidden']);
    }

    this.activeButtons.push(...btns);
  }
}
