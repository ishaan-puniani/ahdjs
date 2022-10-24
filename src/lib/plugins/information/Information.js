/* eslint-disable class-methods-use-this */
/**
 * Copyright (C) 2020 Labs64 GmbH
 *
 * This source code is licensed under the European Union Public License, version 1.2
 * located in the LICENSE file
 */
// utils
import domTemplate from "../../utils/domTemplate";

// templates
import informationTpl from "./templates/information.html";

export default class Information {
  constructor(informations, options = {}) {
    this.informations = [];

    this.options = {};

    // observers
    this.observers = {};

    if (typeof ResizeObserver !== "undefined") {
      this.observers.elementResizeObserver = new ResizeObserver(() =>
        this.refresh()
      );
    }

    this.cache = new Map();
    this.elements = new Map();

    this.setOptions(options);
    this.setInformations(informations);

    this.init();
  }

  /**
   * Called after construction, this hook allows you to add some extra setup
   * logic without having to override the constructor.
   */
  init() {}

  /**
   * Default options
   * @return {Object}
   */
  static getDefaultOptions() {
    return {
      position: "center",
      boundary: "inner",
    };
  }

  static getFixedClass() {
    return "gc-information-fixed";
  }

  static getInformationDataPrefix() {
    return "data-information";
  }

  /**
   * Check if el or his parent has fixed position
   * @param el
   * @return {boolean}
   */
  static isFixed(el) {
    const { parentNode } = el;

    if (!parentNode || parentNode.nodeName === "HTML") {
      return false;
    }

    const elStyle = getComputedStyle(el);

    if (elStyle.getPropertyValue("position") === "fixed") {
      return true;
    }

    return this.isFixed(parentNode);
  }

  /**
   * Set informations options
   * @param options
   * @return {this}
   */
  setOptions(options) {
    this.options = { ...this.constructor.getDefaultOptions(), ...options };
    return this;
  }

  setInformations(informations) {
    // cleanup for previous informations
    this.removeAll();
    this.informations =
      !informations ||
      typeof informations === "string" ||
      (Array.isArray(informations) &&
        informations.every((v) => typeof v === "string"))
        ? this.getDataInformations(informations)
        : this.getJsInformations(informations);

    if (this.informations.length) {
      this.informations.forEach((information) => {
        const { element } = information;

        if (!element) {
          return;
        }

        const el = this.getEl(element);

        if (!el) {
          return;
        }

        const informationEl = this.createInformationEl(information);
        informationEl.hidden = true;

        if (this.constructor.isFixed(el)) {
          informationEl.classList.add(this.constructor.getFixedClass());
        }

        const parentEl =
          !el.parentElement || el.parentElement === document.body
            ? document.body
            : el.parentElement;

        parentEl.append(informationEl);
        this.elements.set(information, informationEl);
        this.setInformationPosition(el, informationEl, information);

        // fire observers
        this.observeResizing(el);
      });

      this.addOnWindowResizeListener();
    }

    return this;
  }

  getInformations() {
    return this.informations;
  }

  getInformation(id, def) {
    const [information] =
      id && typeof id === "object"
        ? [id]
        : this.informations.filter((v) => v.id === id);
    return information || def;
  }

  getDataInformations(ids) {
    const informationsIds =
      typeof ids === "string" ? ids.split(",").map((v) => v.trim()) : ids;

    let informationsSelector = [
      `[${this.constructor.getInformationDataPrefix()}]`,
    ];

    if (informationsIds) {
      informationsSelector = [];

      informationsIds.forEach((id) => {
        informationsSelector.push(
          `[${this.constructor.getInformationDataPrefix()}*='${id}']`
        );
      });
    }

    const informationsEl = Array.from(
      document.querySelectorAll(informationsSelector.join(","))
    );
    const dataGlobalRegExp = new RegExp(
      `^${this.constructor.getInformationDataPrefix()}-([^-]+)$`
    );

    const informations = [];

    informationsEl.forEach((el) => {
      const { value: informationsIdsAttrValue } =
        el.attributes[this.constructor.getInformationDataPrefix()];

      if (!informationsIdsAttrValue) {
        return;
      }

      const elInformationsIds = informationsIdsAttrValue.split(",");

      elInformationsIds.forEach((id) => {
        if (informationsIds && !informationsIds.includes(id)) {
          return;
        }

        const globalInformationAttrs = {};
        const informationAttrs = {};

        const dataInformationRegExp = new RegExp(
          `^${this.constructor.getInformationDataPrefix()}-${id}-([^-]+)$`
        );

        // parse attributes
        for (let j = 0; j < el.attributes.length; j++) {
          const { name: attrName, value: attrValue } = el.attributes[j];

          const isGlobalAttr = dataGlobalRegExp.test(attrName);
          const isInformationAttr = dataInformationRegExp.test(attrName);

          if (isGlobalAttr) {
            const [, shortAttrName] = attrName.match(dataGlobalRegExp);

            globalInformationAttrs[shortAttrName] = attrValue;
          } else if (isInformationAttr) {
            const [, shortAttrName] = attrName.match(dataInformationRegExp);

            informationAttrs[shortAttrName] = attrValue;
          }
        }

        const information = {
          id,
          position: this.options.position,
          ...globalInformationAttrs,
          ...informationAttrs,
          element: el,
        };

        // change onclick event
        const onClick = information.onclick || information.onClick;

        if (onClick) {
          delete information.onclick;

          information.onClick = (e) => {
            // eslint-disable-next-line no-eval
            const onClickCode = eval(onClick);

            if (typeof onClickCode === "function") {
              onClickCode.call(e, information);
            }
          };
        }

        informations.push(information);
      });
    });

    return informations;
  }

  getJsInformations(informations) {
    // cast to array
    const array = !Array.isArray(informations) ? [informations] : informations;

    return array.map((v, i) => ({ ...v, id: v.id || i }));
  }

  getInformationTpl() {
    return informationTpl;
  }

  createInformationEl(information) {
    const data = { ...information };

    data.onClick = (e) => {
      e.stopPropagation();
      if (information.onClick) {
        information.onClick.call(this, e, information);
      }
    };

    return domTemplate(this.getInformationTpl(), { information: data });
  }

  getEl(selector) {
    return selector instanceof HTMLElement
      ? selector
      : document.querySelector(selector);
  }

  setInformationPosition(el, informationEl, options = {}) {
    let { position, boundary } = options;

    position = position || this.options.position;
    boundary = boundary || this.options.boundary;
    boundary = boundary === "inner" ? "inner" : "outer";

    const {
      offsetLeft: elLeft,
      offsetTop: elTop,
      offsetWidth: elWidth,
      offsetHeight: elHeight,
    } = el;
    const { style: informationStyle } = informationEl;
    let { width: informationWidth, height: informationHeight } =
      getComputedStyle(informationEl);

    informationWidth = parseInt(informationWidth, 10);
    informationHeight = parseInt(informationHeight, 10);

    informationEl.removeAttribute("data-information-position");
    informationEl.removeAttribute("data-information-boundary");

    informationEl.setAttribute("data-information-position", position);
    informationEl.setAttribute("data-information-boundary", boundary);

    switch (position) {
      case "top-left": {
        if (boundary === "inner") {
          informationStyle.left = `${elLeft}px`;
          informationStyle.top = `${elTop}px`;
        } else {
          informationStyle.left = `${elLeft - informationWidth}px`;
          informationStyle.top = `${elTop - informationHeight}px`;
        }

        break;
      }

      case "top": {
        informationStyle.left = `${
          elLeft + (elWidth - informationWidth) / 2
        }px`;
        informationStyle.top =
          boundary === "inner"
            ? `${elTop}px`
            : `${elTop - informationHeight}px`;

        break;
      }

      case "top-right": {
        if (boundary === "inner") {
          informationStyle.left = `${elWidth + elLeft - informationWidth}px`;
          informationStyle.top = `${elTop}px`;
        } else {
          informationStyle.left = `${elWidth + elLeft}px`;
          informationStyle.top = `${elTop - informationHeight}px`;
        }

        break;
      }

      case "left": {
        informationStyle.left =
          boundary === "inner"
            ? `${elLeft}px`
            : `${elLeft - informationWidth}px`;
        informationStyle.top = `${
          elTop + (elHeight - informationHeight) / 2
        }px`;

        break;
      }

      case "right": {
        informationStyle.left =
          boundary === "inner"
            ? `${elLeft + elWidth - informationWidth}px`
            : `${elLeft + elWidth}px`;
        informationStyle.top = `${
          elTop + (elHeight - informationHeight) / 2
        }px`;

        break;
      }

      case "bottom-left": {
        if (boundary === "inner") {
          informationStyle.left = `${elLeft}px`;
          informationStyle.top = `${elTop + elHeight - informationHeight}px`;
        } else {
          informationStyle.left = `${elLeft - informationWidth}px`;
          informationStyle.top = `${elTop + elHeight}px`;
        }

        break;
      }

      case "bottom": {
        informationStyle.left = `${
          elLeft + (elWidth - informationWidth) / 2
        }px`;
        informationStyle.top =
          boundary === "inner"
            ? `${elTop + elHeight - informationHeight}px`
            : `${elTop + elHeight}px`;

        break;
      }

      case "bottom-right": {
        if (boundary === "inner") {
          informationStyle.left = `${elWidth + elLeft - informationWidth}px`;
          informationStyle.top = `${elTop + elHeight - informationHeight}px`;
        } else {
          informationStyle.left = `${elWidth + elLeft}px`;
          informationStyle.top = `${elTop + elHeight}px`;
        }

        break;
      }

      case "center":
      default: {
        informationEl.setAttribute("data-information-position", "center");
        informationStyle.left = `${
          elLeft + (elWidth - informationWidth) / 2
        }px`;
        informationStyle.top = `${
          elTop + (elHeight - informationHeight) / 2
        }px`;

        break;
      }
    }

    return this;
  }

  isCanShowInformation({ canShow }) {
    if (canShow !== undefined) {
      if (!canShow || (typeof canShow === "function" && canShow() === false)) {
        return false;
      }
    }

    return true;
  }

  showAll(force = false) {
    this.informations.forEach((information) => {
      this.show(information, force);
    });

    return this;
  }

  show(id, force = false) {
    const information = this.getInformation(id);

    if (information) {
      const informationEl = this.elements.get(information);

      if (informationEl) {
        if (force || this.isCanShowInformation(information)) {
          informationEl.hidden = false;
        }
      }
    }

    return this;
  }

  hideAll() {
    this.informations.forEach((information) => {
      this.hide(information);
    });

    return this;
  }

  hide(id) {
    const information = this.getInformation(id);

    if (information) {
      const el = this.elements.get(information);

      if (el) {
        el.hidden = true;
      }
    }

    return this;
  }

  removeAll() {
    this.informations.forEach((information) => {
      this.remove(information);
    });

    this.informations = [];
    this.unobserveResizeAllElements();
    this.removeOnWindowResizeListener();

    return this;
  }

  remove(id) {
    const information = this.getInformation(id);

    const informationEl = this.elements.get(information);

    if (informationEl) {
      informationEl.parentNode.removeChild(informationEl);
      const informationIndex = this.informations.indexOf(information);

      if (informationIndex !== -1) {
        this.informations.splice(this.informations.indexOf(information), 1);
      }

      this.elements.delete(information);

      const el = this.getEl(information.element);

      if (el) {
        this.unobserveResizing(el);
      }
    }

    if (!this.informations.length) {
      this.removeOnWindowResizeListener();
    }

    return this;
  }

  refresh() {
    this.informations.forEach((information) => {
      const { element } = information;

      if (!element) {
        return;
      }

      const el = this.getEl(element);
      const informationEl = this.elements.get(information);

      if (el && informationEl) {
        this.setInformationPosition(el, informationEl, information);
      }
    });

    return this;
  }

  /**
   * Add window resize event listener
   * @return {this}
   */
  addOnWindowResizeListener() {
    this.cache.set("onWindowResizeListener", this.getOnWindowResizeListener());
    window.addEventListener(
      "resize",
      this.cache.get("onWindowResizeListener"),
      true
    );

    return this;
  }

  /**
   * Return on window resize event listener function
   * @returns {function}
   */
  getOnWindowResizeListener() {
    return () => this.refresh();
  }

  /**
   * Remove window resize event listener
   * @return {this}
   */
  removeOnWindowResizeListener() {
    if (this.cache.has("onWindowResizeListener")) {
      window.removeEventListener(
        "resize",
        this.cache.get("onWindowResizeListener"),
        true
      );
      this.cache.delete("onWindowResizeListener");
    }

    return this;
  }

  /**
   * Observe resize step element
   * @return {this}
   */
  observeResizing(el, options = { box: "border-box" }) {
    const { elementResizeObserver: observer } = this.observers;

    if (observer) {
      observer.observe(el, options);
    }

    return this;
  }

  /**
   * Unobserve resize step element
   * @param el
   * @return {this}
   */
  unobserveResizing(el) {
    const { elementResizeObserver: observer } = this.observers;

    if (observer) {
      observer.unobserve(el);
    }

    return this;
  }

  /**
   * Unobserve all resize steps elements
   * @return {this}
   */
  unobserveResizeAllElements() {
    const { elementResizeObserver: observer } = this.observers;

    if (observer) {
      observer.disconnect();
    }

    return this;
  }
}
