/**
 * Copyright (C) 2020 Labs64 GmbH
 *
 * This source code is licensed under the European Union Public License, version 1.2
 * located in the LICENSE file
 */
import Beacons from "./Beacons";
import "./assets/style.scss";
import { TRIGGER_EVENTS } from "../../utils/constants";

export default (Class, factory) => {
  // eslint-disable-next-line no-param-reassign
  factory.beacons = (beacons, options = {}) =>
    new (class extends Beacons {
      getDataBeacons(ids) {
        const data = super.getDataBeacons(ids);

        data.forEach((beacon) => {
          const { id, element: el } = beacon;

          let tour = "";

          const dataGlobalTourAttrName = `${this.constructor.getBeaconDataPrefix()}-tour`;
          const dataBeaconTourAttrName = `${this.constructor.getBeaconDataPrefix()}-${id}-tour`;

          if (el.attributes[dataGlobalTourAttrName]) {
            const { value } = el.attributes[dataGlobalTourAttrName];
            tour = value;
          }

          if (el.attributes[dataBeaconTourAttrName]) {
            const { value } = el.attributes[dataBeaconTourAttrName];
            tour = value;
          }

          if (tour) {
            // eslint-disable-next-line no-param-reassign
            beacon.tour = tour;
          }
        });

        return data;
      }

      createGuideInstance(beacon, Class) {
        if (!beacon?.tour) return null;

        if (typeof beacon.tour === "string" || Array.isArray(beacon.tour)) {
          return new Class(beacon.tour);
        }

        if (beacon.tour instanceof Class) {
          return beacon.tour;
        }

        if (typeof beacon.tour === "object") {
          const { steps, options: tourOptions } = beacon.tour;
          return new Class(steps, tourOptions);
        }

        return null;
      }

      runGuide(beacon, GuideClass) {
        const guide = this.createGuideInstance(beacon, GuideClass);
        const hasTooltip = document.querySelector(".gc-tooltip") !== null;

        if (guide && !hasTooltip) {
          guide.start();
        }
      }

      attachGuideEvent(beaconEl, beacon, Class) {
        const trigger = beacon?.trigger;
        const handler = () => this.runGuide(beacon, Class);

        let targetEl = null;
        try {
          targetEl = beacon?.element
            ? beacon.element instanceof HTMLElement
              ? beacon.element
              : document.querySelector(beacon.element)
            : null;
        } catch (e) {
          targetEl = null;
        }

        const attachTo = targetEl || beaconEl;

        switch (trigger) {
          case TRIGGER_EVENTS.onClick:
              attachTo.addEventListener("click", handler);
              if (attachTo !== beaconEl) {
                beaconEl.addEventListener("click", handler, true);
              }
            break;

          case TRIGGER_EVENTS.onHover:
            attachTo.addEventListener("mouseenter", handler);
            if (attachTo !== beaconEl) {
              beaconEl.addEventListener("mouseenter", handler);
            }
            break;

          case TRIGGER_EVENTS.onLongPress: {
            let pressTimer;
            const startPress = () => (pressTimer = setTimeout(handler, 600));
            const clearPress = () => clearTimeout(pressTimer);

            attachTo.addEventListener("mousedown", startPress);
            attachTo.addEventListener("mouseup", clearPress);
            attachTo.addEventListener("mouseleave", clearPress);
            attachTo.addEventListener("touchstart", startPress);
            attachTo.addEventListener("touchend", clearPress);
            if (attachTo !== beaconEl) {
              beaconEl.addEventListener("mousedown", startPress);
              beaconEl.addEventListener("mouseup", clearPress);
              beaconEl.addEventListener("mouseleave", clearPress);
              beaconEl.addEventListener("touchstart", startPress);
              beaconEl.addEventListener("touchend", clearPress);
            }
            break;
          }

          case TRIGGER_EVENTS.onPageLoad:
            if (document.readyState === "loading") {
              document.addEventListener("DOMContentLoaded", handler);
            } else {
              handler();
            }
            break;

          default:
            console.warn(`Unsupported trigger: ${trigger}`);
        }
      }

      createBeaconEl(beacon) {
        const beaconEl = super.createBeaconEl(beacon);
        this.attachGuideEvent(beaconEl, beacon, Class);
        return beaconEl;
      }
    })(beacons, options);
};
