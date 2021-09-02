import SendBirdCall from "sendbird-calls";
import BaseElement from "../components/BaseElement";
import { classes } from "../css/styles";
import { createDiv, createLabel, createOption, createSelect } from "../utils/domUtil";

export default class Settings extends BaseElement {
  constructor({ args }) {
    super({
      id: 'settings_view',
      className: `${classes['viewSettings']} ${classes['column']} ${classes['center']}`,
      args
    });

    this.microphone = null;
    this.speaker = null;
    this.camera = null;
  }

  onLoaded() {
    this.mediaAccess = SendBirdCall.useMedia({ audio: true, video: true });

    this.refreshDeviceList(this.microphone, SendBirdCall.getCurrentAudioInputDevice(), SendBirdCall.getAvailableAudioInputDevices());
    this.refreshDeviceList(this.speaker, SendBirdCall.getCurrentAudioOutputDevice(), SendBirdCall.getAvailableAudioOutputDevices());
    this.refreshDeviceList(this.camera, SendBirdCall.getCurrentVideoInputDevice(), SendBirdCall.getAvailableVideoInputDevices());
  }

  onRemoved() {
    this.revokeMediaAccess();
  }

  revokeMediaAccess() {
    if (this.mediaAccess) {
      this.mediaAccess.dispose();
      this.mediaAccess = null;
    }
  }

  build() {
    const cover = createDiv({ id: 'cover', className: classes['cover'] });
    cover.onclick = () => {
      this.remove();
    };
    let popup;
    if (this.args.isWidget) {
      popup = createDiv({ id: 'settings_popup', className: `${classes['popup']} ${classes['widgetpopup']}` });
    } else {
      popup = createDiv({ id: 'settings_popup', className: classes['popup'] });
    }

    const popupHeader = createDiv({
      id: 'settings_popup_header',
      className: `${classes['popupHeader']}`
    });

    const popupTitle = createDiv({
      id: 'settings_popup_title',
      className: `${classes['popupTitle']} ${classes['font20']} ${classes['fontDemi']}`,
      innerText: 'Device Settings'
    });
    const closeButton = createDiv({
      id: 'popup_close_button',
      className: `${classes['settingsCloseButton']}`
    });
    closeButton.onclick = () => {
      this.remove();
    };
    popupHeader.appendChild(popupTitle);
    popupHeader.appendChild(closeButton);

    const selectContainer = createDiv({ id: 'select_container', className: classes['selectContainer'] });
    const microphoneLabel = createLabel({
      id: 'microphone_label',
      htmlFor: 'microphone_select',
      innerText: 'Microphone',
      className: `${classes['selectLabel']} ${classes['fontSmall']} ${classes['fontHeavy']}`
    });
    this.microphone = createSelect({
      id: 'microphone_select',
      className: `${classes['blockSelect']} ${classes['fontNormal']}`
    });
    this.microphone.onchange = () => {
      const deviceId = this.microphone.value;
      const devices = SendBirdCall.getAvailableAudioInputDevices();
      const mediaInfo = devices.find(device => device.deviceId === deviceId);
      SendBirdCall.selectAudioInputDevice(mediaInfo);
    };

    const speakerLabel = createLabel({
      id: 'speaker_label',
      htmlFor: 'speaker_select',
      innerText: 'Speaker',
      className: `${classes['selectLabel']} ${classes['fontSmall']} ${classes['fontHeavy']}`
    });
    this.speaker = createSelect({
      id: 'speaker_select',
      className: `${classes['blockSelect']} ${classes['fontNormal']}`
    });
    this.speaker.onchange = () => {
      const deviceId = this.speaker.value;
      const devices = SendBirdCall.getAvailableAudioOutputDevices();
      const mediaInfo = devices.find(device => device.deviceId === deviceId);
      SendBirdCall.selectAudioOutputDevice(mediaInfo);
    };

    const cameraLabel = createLabel({
      id: 'camera_label',
      htmlFor: 'camera_select',
      innerText: 'Camera',
      className: `${classes['selectLabel']} ${classes['fontSmall']} ${classes['fontHeavy']}`
    });
    this.camera = createSelect({
      id: 'camera_select',
      className: `${classes['blockSelect']} ${classes['fontNormal']}`
    });
    this.camera.onchange = () => {
      const deviceId = this.camera.value;
      const devices = SendBirdCall.getAvailableVideoInputDevices();
      const mediaInfo = devices.find(device => device.deviceId === deviceId);
      SendBirdCall.selectVideoInputDevice(mediaInfo);
    };

    selectContainer.appendChild(microphoneLabel);
    selectContainer.appendChild(this.microphone);
    selectContainer.appendChild(speakerLabel);
    selectContainer.appendChild(this.speaker);
    selectContainer.appendChild(cameraLabel);
    selectContainer.appendChild(this.camera);

    popup.appendChild(popupHeader);
    popup.appendChild(selectContainer);

    this.element.appendChild(cover);
    this.element.appendChild(popup);
  }

  recvMessage(name, value) {
    switch (name) {
      case 'audio_input_device_change':
        this.refreshDeviceList(this.microphone, value.currentDevice, value.availableDevices);
        break;
      case 'audio_output_device_change':
        this.refreshDeviceList(this.speaker, value.currentDevice, value.availableDevices);
        break;
      case 'video_input_device_change':
        this.refreshDeviceList(this.camera, value.currentDevice, value.availableDevices);
        break;
    }
  }

  refreshDeviceList(selectTag, currentDevice, availableDevices) {
    selectTag.innerHTML = '';

    availableDevices.forEach((device) => {
      const option = createOption({
        value: device.deviceId,
        innerText: device.label
      });

      if (device.deviceId === currentDevice.deviceId) {
        option.selected = true;
      }

      selectTag.appendChild(option);
    });
  }
}
