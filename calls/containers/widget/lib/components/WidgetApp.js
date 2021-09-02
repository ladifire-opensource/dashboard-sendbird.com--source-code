import BaseElement from "./BaseElement";
import MainApp from "./MainApp";
import { classes } from "../css/styles.js";
import { createButton, createDiv } from "../utils/domUtil";

export default class WidgetApp extends BaseElement {
  constructor({ id, className, pages, styles, icon, args }) {
    const _className = `${classes['widgetApp']} ${className}`;
    super({ id, className: _className, args });

    this.pages = pages;
    this.styles = styles;
    this.mainApp = null;
    this.widgetIcon = icon || null;
    this.opened = false;

    this.onMainAppOpened = null;
    this.onMainAppClosed = null;
  }

  set onPageChange(handler) {
    if (this.mainApp) {
      this.mainApp.onPageChange = handler;
    }
  }

  set onLoginSuccess(handler) {
    if (this.mainApp) {
      this.mainApp.onLoginSuccess = handler;
    }
  }

  set onLoginFailure(handler) {
    if (this.mainApp) {
      this.mainApp.onLoginFailure = handler;
    }
  }

  async setAppId(appId) {
    await this.mainApp.setAppId(appId);
  }

  async setCredentials(userId, accessToken) {
    await this.mainApp.setCredentials(userId, accessToken);
  }

  onLoaded() {
  }

  openWidget() {
    this.mainApp.element.classList.remove(classes['hidden']);
    this.widgetIcon.classList.add(classes['hidden']);

    if (this.onMainAppOpened) this.onMainAppOpened();
  }

  closeWidget() {
    this.mainApp.element.classList.add(classes['hidden']);
    this.widgetIcon.classList.remove(classes['hidden']);

    if (this.onMainAppClosed) this.onMainAppClosed();
  }

  build() {
    if (!this.widgetIcon) this.widgetIcon = createDiv({ id: 'widget_icon', className: classes['widgetIcon'] });
    this.args.isWidget = true;
    this.mainApp = new MainApp({
      className: `${classes['widgetDiv']} ${classes['hidden']}`,
      pages: this.pages,
      styles: this.styles,
      args: this.args
    });

    this.widgetIcon.onclick = () => {
      if (this.opened) {
        this.closeWidget();
      } else {
        this.openWidget();
      }
    };

    this.element.appendChild(this.widgetIcon);
    this.mainApp.appendToBaseElement(this);
  }

  recvMessage(name, value) {
    switch(name) {
      case 'widgetringing':
        this.sendToParent(name, value);
        this.recvRinging(value);
        break;
      case 'widgetclose':
        this.recvWidgetClose();
        break;
      default:
        break;
    }
  }

  recvWidgetClose() {
    this.closeWidget();
  }

  recvRinging() {
    if (!this.opened) this.openWidget();
  }
}
