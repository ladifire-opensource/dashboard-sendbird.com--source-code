import BaseElement from "../components/BaseElement";
import { classes } from "../css/styles";
import { createDiv, createLabel } from "../utils/domUtil";

export default class AppInfoView extends BaseElement {
  constructor({ args }) {
    super({
      id: 'appinfo_view',
      className: `${classes['viewSettings']} ${classes['column']} ${classes['center']}`,
      args
    });
  }

  onLoaded() {
   
  }

  onRemoved() {
    
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
      innerText: 'Application information'
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

    const applicationInfoContainer = createDiv({ id: 'select_container', className: classes['selectContainer'] });
    const applicationNameLabel = createLabel({
      id: 'app_name_label',
      innerText: 'Name',
      className: `${classes['popupItemLabel']} ${classes['fontSmall']} ${classes['fontHeavy']}`
    });
    const applicationName = createLabel({
      id: 'app_name',
      innerText: 'Voice & Video',
      className: `${classes['appInfoLabel']} ${classes['appName']} ${classes['fontNormal']} ${classes['fontReadOnlyColor']}`
    });

    applicationInfoContainer.appendChild(applicationNameLabel);
    applicationInfoContainer.appendChild(applicationName);

    const applicationIDLabel = createLabel({
      id: 'app_id_label',
      innerText: 'ID',
      className: `${classes['popupItemLabel']} ${classes['fontSmall']} ${classes['fontHeavy']}`
    });

    const applicationIdWrap = createDiv({
      id: 'app_id_wrap',
      className: `${classes['appInfoLabelWrap']}`
    });

    const applicationID = createLabel({
      id: 'app_id',
      innerText: this.args.appId,
      className: `${classes['appInfoLabel']} ${classes['appInfoIdLabel']} ${classes['fontNormal']} ${classes['fontReadOnlyColor']}`
    });

    const appInfoIdCopy = createDiv({
      id: 'btn_app_id_copy',
      className: `${classes['appInfoIdCopy']}`
    });

    appInfoIdCopy.onclick = () => {
      navigator.clipboard.writeText(this.args.appId);
    };

    applicationIdWrap.appendChild(applicationID);
    applicationIdWrap.appendChild(appInfoIdCopy);

    applicationInfoContainer.appendChild(applicationIDLabel);
    applicationInfoContainer.appendChild(applicationIdWrap);

    popup.appendChild(popupHeader);
    popup.appendChild(applicationInfoContainer);

    this.element.appendChild(cover);
    this.element.appendChild(popup);
  }
}