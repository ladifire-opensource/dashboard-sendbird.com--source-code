import BaseElement from "./BaseElement";
import { createButton, createDiv, createLabel } from "../utils/domUtil";
import { classes } from "../css/styles";

export class Toast extends BaseElement {
  constructor({ id, msg, duration } = {}) {
    super({
      id: id,
      className: `${classes['toast']} ${classes['center']} ${classes['row']}`
    });

    this.msg = msg;
    this.duration = duration;
  }

  build() {
    const icon = createDiv({ className: `${classes['toastErrorIcon']}`});
    const msg = createLabel({
      className: `${classes['toastMsg']} ${classes['fontNormal']}`,
      innerText: this.msg
    });
    const toastCloseBtn = createButton({ className: `${classes['toastCloseBtn']}`});

    toastCloseBtn.onclick = () => {
      this.remove();
    };

    this.element.appendChild(icon);
    this.element.appendChild(msg);
    this.element.appendChild(toastCloseBtn);
  }

  show() {
    this.element.style.visibility = 'visible';
    this.element.classList.add(classes['toastShow']);

    if (this.duration) {
      setTimeout(() => {
        this.element.classList.add(classes['toastHide']);
      }, this.duration);

      setTimeout(() => {
        this.element.style.visibility = 'hidden';
      }, this.duration + 500);
    }
  }
}