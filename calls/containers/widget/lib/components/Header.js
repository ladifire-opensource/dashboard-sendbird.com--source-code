import SendBirdCall from "sendbird-calls";
import BaseElement from "./BaseElement";
import { createDiv, replaceClassName } from "../utils/domUtil";
import Menu from "../components/Menu";
import { sheet, classes } from "../css/styles";

export default class Header extends BaseElement {
  constructor({ id, className, parent, element, args } = {}) {
    super({ id, className, parent, element, args });
    this.element = element;
    this.parent = parent;

    this.settingItems = [
      {
        'label': 'Device Settings',
        'callback': () => { this.sendToParent('show_settings') }
      },
      {
        'label': 'Application information',
        'callback': () => { this.sendToParent('show_app_info') }
      },
      /* Do not enable signout in dashboard phonebooth */
      // {
      //   'label': 'Sign out',
      //   'callback': () => { 
      //       SendBirdCall.deauthenticate();
      //       this.sendToParent('deauthenticate'); 
      //   }
      // }
    ];

    this.parent = parent;
  }

  build() {
    let userDiv = createDiv({ className: `${classes['userDiv']}` });

    let profileImg;
    if (this.args.user && this.args.user.profileUrl) {
      sheet.update({ profileUrl: this.args.user.profileUrl });
      profileImg = createDiv({ className: classes['profileSmall'] });
    } else {
      profileImg = createDiv({ className: `${classes['avatar']}` });
    }

    const headerInfo = createDiv({ className: `${classes['headerInfo']}` });
    const nickname = createDiv({
      className: (this.args.isWidget)
        ? `${classes['headerNickname']} ${classes['fontMidBig']} ${classes['fontDemi']}`
        : `${classes['headerNickname']} ${classes['fontNormal']} ${classes['fontDemi']}`,
      innerText: this.args.user.nickname || '—'
    });
    const userId = createDiv({
      className: `${classes['headerUserId']} ${classes['fontSmall']}`,
      innerText: `User ID: ${this.args.user.userId || ''}`
    });
    headerInfo.appendChild(nickname);
    headerInfo.appendChild(userId);

    userDiv.appendChild(profileImg);
    userDiv.appendChild(headerInfo);

    let userDivMenu;
    if (!this.args.isWidget) {
      const userDetail = userDiv.cloneNode(true);
      replaceClassName(userDetail, classes['userDiv'], classes['userDetail']);

      userDivMenu = new Menu({
        element: userDiv,
        items: [
          {
            element: userDetail,
            disabled: true,
          },
          {
            label: 'Sign out',
            callback: () => {
              SendBirdCall.deauthenticate();
              this.sendToParent('deauthenticate');
            }
          }
        ],
        divider: createDiv({ className: classes['menuDivider']})
      })
    }

    const headerButtons = createDiv({
      className: `${classes['headerButtons']} ${classes['row']} ${classes['center']}`
    });
    const settingsButton = new Menu({
      element: createDiv({ className: `${classes['settingsButton']}` }),
      items: this.settingItems
    });

    const closeButton = createDiv({
      className: `${classes['closeButton']}`
    });
    closeButton.onclick = () => {
      this.parent.sendToParent('widgetclose');
    };
    settingsButton.appendToHTML(headerButtons);
    headerButtons.appendChild(closeButton);

    const divider = createDiv({
      className: classes['headerDivider']
    });

    if (userDivMenu) {
      userDivMenu.appendToBaseElement(this);
    } else {
      this.element.appendChild(userDiv);
    }
    this.element.appendChild(divider);
    this.element.appendChild(headerButtons);

    if (!this.args.isWidget) {
      const headerLogo = createDiv({ id: 'header_logo', className: `${classes['headerLogo']}`});
      this.element.appendChild(headerLogo);
    }
  }
}