import { createDiv, createLabel, createButton } from "../utils/domUtil";
import { classes } from "../css/styles";

export class CallTextButton {
  constructor({ buttonClass, labelText, type }) {
    const wrapper = createDiv({ className: `${classes['column']} ${classes['center']} ${classes['hidden']}` });
    const icon = createButton({ className: buttonClass });
    const label = createLabel({ innerText: labelText });
    icon.appendChild(label);
    wrapper.appendChild(icon);

    this.element = wrapper;
    this.type = type || 'mutual';
    this.icon = icon;
    this.label = label;
  }

  set onclick(value) {
    this.icon.onclick = value;
  }
}