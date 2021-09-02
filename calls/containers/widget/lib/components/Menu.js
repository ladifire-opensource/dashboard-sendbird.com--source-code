import BaseElement from "./BaseElement";
import { createButton, createDiv, createLabel } from "../utils/domUtil";
import { classes } from "../css/styles";

export default class Menu extends BaseElement {
  constructor({ id, className, divider, parent, element, items } = {}) {
    super({ id, className, parent, element });

    this.items = items;
    this.divider = divider;
    this.opened = false;
  }

  build() {
    this.element.addEventListener('mouseenter', function(){
      this.style.backgroundColor = '#6440c4';
    });

    this.element.addEventListener('mouseout', function(){
      this.style.backgroundColor = '';
    });
    
    this.menuItemsDiv = createDiv({ className: `${classes['menuItemsDiv']} ${classes['hidden']}` });

    this.items.forEach((item, idx) => {
      const { label, element, disabled, callback } = item;
      const labelElem = element || createLabel({
        className: `${classes['fontNormal']} ${classes['fontHeavy']}`,
        innerText: label
      });
      const itemElem = createButton({
        className: `${classes['btn']} ${disabled ? classes['disabledMenuItem'] : classes['menuItem']}`
      });

      if (callback) {
        itemElem.onclick = () => {
          callback();
        };
      }

      itemElem.appendChild(labelElem);
      this.menuItemsDiv.appendChild(itemElem);

      if (this.divider && idx < (this.items.length - 1)) {
        const divider = this.divider.cloneNode(true);
        this.menuItemsDiv.appendChild(divider);
      }
    });

    this.element.appendChild(this.menuItemsDiv);
    this.element.onclick = (e) => {
      e.stopPropagation();
      if (this.opened) {
        this.hide();
      } else {
        this.show();
      }
    };
    const app = document.querySelector(`.${classes['mainApp']}`);
    app.addEventListener('click', () => {
      this.hide();
    });
  }

  show() {
    this.menuItemsDiv.classList.remove(classes['hidden']);
    this.opened = true;
  }

  hide() {
    this.menuItemsDiv.classList.add(classes['hidden']);
    this.opened = false;
  }
}
