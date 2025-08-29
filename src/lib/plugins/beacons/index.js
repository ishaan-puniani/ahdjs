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

      // Start guide if instance can be created
      runGuide(beacon, GuideClass) {
        const guide = this.createGuideInstance(beacon, GuideClass);
        const hasTooltip = document.querySelector(".gc-tooltip") !== null;

        if (guide && !hasTooltip) {
          guide.start();
        }
      }

      // Attach event listener dynamically based on beacon.trigger
      attachGuideEvent(el, beacon, Class) {
        const trigger = beacon?.trigger;
        const handler = () => this.runGuide(beacon, Class);

        switch (trigger) {
          case TRIGGER_EVENTS.onClick:
            el.addEventListener("click", handler);
            break;

          case TRIGGER_EVENTS.onHover:
            el.addEventListener("mouseenter", handler);
            break;

          case TRIGGER_EVENTS.onLongPress: {
            let pressTimer;
            const startPress = () => (pressTimer = setTimeout(handler, 600));
            const clearPress = () => clearTimeout(pressTimer);

            el.addEventListener("mousedown", startPress);
            el.addEventListener("mouseup", clearPress);
            el.addEventListener("mouseleave", clearPress);
            el.addEventListener("touchstart", startPress);
            el.addEventListener("touchend", clearPress);
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

      // Creates beacon element and attaches events
      createBeaconEl(beacon) {
        const el = super.createBeaconEl(beacon);
        this.attachGuideEvent(el, beacon, Class);
        return el;
      }
    })(beacons, options);
};
