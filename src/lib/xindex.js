import GuideChimp from "./GuideChimp";

/* ============
 * Styling
 * ============
 *
 * Import the library styling.
 */
import "./index.scss";

const guideChimp = (...args) => new GuideChimp(...args);

guideChimp.prototype = GuideChimp.prototype;
guideChimp.plugins = new Set();

guideChimp.extend = (plugin, ...args) => {
  if (!guideChimp.plugins.has(plugin)) {
    guideChimp.plugins.add(plugin);
    plugin(GuideChimp, guideChimp, ...args);
  }
  return guideChimp;
};

module.exports = guideChimp;
