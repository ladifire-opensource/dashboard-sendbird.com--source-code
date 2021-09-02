import { createDiv, createLabel } from "../utils/domUtil";
import { classes } from "../css/styles";

export class CallButton {
  constructor({ buttonClass, labelClass, labelText, type }) {
    const wrapper = createDiv({ className: `${classes['column']} ${classes['center']} ${classes['hidden']}` });
    const icon = createDiv({ className: buttonClass });
    const label = createLabel({ className: labelClass, innerText: labelText });
    wrapper.appendChild(icon);
    wrapper.appendChild(label);

    this.element = wrapper;
    this.type = type || 'mutual';
    this.icon = icon;
    this.label = label;
  }

  set onclick(value) {
    this.icon.onclick = value;
  }
}