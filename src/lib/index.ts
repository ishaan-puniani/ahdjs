import GuideChimp from "./GuideChimp";
//import  Beacons from "./plugins/beacons";
import "./index.scss";
const Beacons = require("./plugins/beacons");
class ahdjs {
  private guideChimp: any;
  constructor(...args: any) {
    //@ts-ignore
    this.guideChimp = new GuideChimp(...args);

    this.guideChimp.prototype = GuideChimp.prototype;
    this.guideChimp.plugins = new Set();

    //@ts-ignore
    // this.guideChimp.extend = (plugin, ...args) => {
    //   if (!this.guideChimp.plugins.has(plugin)) {
    //     this.guideChimp.plugins.add(plugin);
    //     plugin(GuideChimp, this.guideChimp, ...args);
    //   }
    //   return this.guideChimp;
    // };

    // test beacon extension
    // @ts-ignore

    const plugin = Beacons.default;
    if (!this.guideChimp.plugins.has(plugin)) {
      this.guideChimp.plugins.add(plugin);
      plugin(GuideChimp, this.guideChimp, ...args);
    }
  }

  beacons = (...args: any) => {
    // @ts-ignore
    // this.guideChimp.beacon = new Beacons(...args);
    const b = this.guideChimp.beacons(...args);
    setTimeout(() => {
      b.showAll();
    }, 1000);
  };
  start = (...args: any) => {
    this.guideChimp.start(...args);
  };
  // guideChimp.prototype = GuideChimp.prototype;
  // guideChimp.plugins = new Set();

  // guideChimp.extend = (plugin, ...args) => {
  //     if (!guideChimp.plugins.has(plugin)) {
  //         guideChimp.plugins.add(plugin);
  //         plugin(GuideChimp, guideChimp, ...args);
  //     }
  //     return guideChimp;
  // };

  // module.exports = guideChimp;
}

export default ahdjs;
