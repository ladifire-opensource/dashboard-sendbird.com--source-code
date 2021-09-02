import BaseElement from "./BaseElement";
import { jss, sheet } from "../css/styles.js";

export default class App extends BaseElement {
  constructor({ id, className, pages, styles, args }) {
    super({ id, className, args });
    this.pages = pages;
    this.styles = styles;
    this.sheets = [];

    this.onPageChange = null;
  }

  _applyStyle() {
    this.sheets.forEach(sheet => {
      sheet.detach();
    });

    sheet.attach();
    const customSheet = jss.createStyleSheet(this.styles);
    customSheet.attach();
    this.sheets.push(sheet, customSheet);
  }

  build() {
    this._applyStyle();
    this.route('index', {});
  }

  route(pageName, opt = {}) {
    for (let i = this.children.length - 1 ; i >= 0 ; i--) {
      const child = this.children[i];
      if(child.element.id === 'header' || child.element.id === 'tabtoolbar') {
        if(opt.isRemoveHeader) {
          child.remove();
        }
      } else {
        child.remove();
      }
    }

    const _pageName = this.pages[pageName] ? pageName : 'index';

    const pageClass = this.pages[_pageName];
    const view = new pageClass(opt);
    view.appendToBaseElement(this);
   
    if (this.onPageChange) this.onPageChange(_pageName);
  }
}