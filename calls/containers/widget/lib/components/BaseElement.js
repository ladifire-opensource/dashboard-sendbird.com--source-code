import { createDiv } from "../utils/domUtil";

export default class BaseElement {
  constructor({ id, className, element, args } = {}) {
    this.children = [];
    this.args = args || {};

    this.element = element || createDiv({});
    if (id) {
      this.element.id = id;
    }
    this.element.className = this.element.className || '' + ' ' + className || '';
  }

  build() {
    throw ("Implement this in subclass.");
  }

  onLoaded() {
  }

  _passArgs(args) {
    this.args = args;
  }

  appendToHTML(htmlElement) {
    this.build();
    htmlElement.appendChild(this.element);

    if (this.onLoaded) {
      this.onLoaded();
    }
  }

  appendToBaseElement(baseElement) {
    this._passArgs(baseElement.args);
    this.build();
    const element = baseElement.element;

    element.appendChild(this.element);

    this.parent = baseElement;
    baseElement.children.push(this);

    if (this.onLoaded) {
      this.onLoaded();
    }
  }

  sendToParent(name, value) {
    if (this.parent) this.parent.recvMessage(name, value);
  }

  sendToChildren(name, value) {
    this.children.map(child => child.recvMessage(name, value));
  }

  recvMessage(name, value) {
  }

  remove() {
    if (this.removed) return;
    this.removed = true;

    if (this.onRemoved) {
      this.onRemoved();
    }
    // detach from parent BaseElement
    if (this.parent) {
      const index = this.parent.children.indexOf(this);
      if (index > -1) {
        this.parent.children.splice(index, 1);
      }
      this.parent = null;
    }

    // detach from parent HTMLElement
    if (this.element.parentElement) this.element.parentElement.removeChild(this.element);

    // detach every child from itself
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child = this.children[i];
      child.remove();
    }

    this.element = undefined;
    return true;
  }
}