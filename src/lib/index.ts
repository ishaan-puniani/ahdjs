import GuideChimp from "./GuideChimp";
//import  Beacons from "./plugins/beacons";
import "./index.scss";
// import Information from "./plugins/information";
// import Beacons from "./plugins/beacons";
// class AHDjs {
//   private guideChimp: any;
//   private appId: string;
//   private contextToursMapData: any;
//   constructor(applicationId: any, tour: any, options: any) {
//     this.appId = applicationId;
//     //@ts-ignore
//     this.guideChimp = new GuideChimp(tour, options);

//     this.guideChimp.prototype = GuideChimp.prototype;
//     this.guideChimp.plugins = new Set();

//     //@ts-ignore
//     // this.guideChimp.extend = (plugin, ...args) => {
//     //   if (!this.guideChimp.plugins.has(plugin)) {
//     //     this.guideChimp.plugins.add(plugin);
//     //     plugin(GuideChimp, this.guideChimp, ...args);
//     //   }
//     //   return this.guideChimp;
//     // };

//     // test beacon extension
//     // @ts-ignore
//     const pluginsToLoad = [Beacons, Information];
//     pluginsToLoad.forEach((pluginClass) => {
//       const plugin = pluginClass;
//       if (!this.guideChimp.plugins.has(plugin)) {
//         this.guideChimp.plugins.add(plugin);
//         // @ts-ignore
//         plugin(GuideChimp, this.guideChimp, tour, options);
//       }
//     });
//   }

//   updatePageUrl = async (url: string, refetch: boolean) => {
//     await this.stop();
//     // todo: local caching and use https://github.com/pillarjs/path-to-regexp to find exact match
//     const respons: any = await fetch(
//       `https://ahd-be-jggub5n6qq-em.a.run.app/api/tenant/${this.appId}/contexttour?filter[isActive]=true`
//     ).then((res) => res.json());

//     this.contextToursMapData = respons.rows;
//     //if there is anything to open onload
//     const onboardTour = respons.rows
//       .filter((row: any) => !!row.content)
//       .map((row: any) => {
//         return {
//           element: row.selector,
//           title: row.content.title,
//           description: row.content.content,
//           tour: [
//             {
//               title: "Multi Feature",
//               description: "Multi Feature beacon clicked.",
//             },
//           ],
//         };
//       });
//     this.setTour(onboardTour);
//     this.start();
//   };

//   setTour = (tour: any) => {
//     this.guideChimp.setTour(tour);
//   };
//   beacons = (...args: any) => {
//     // @ts-ignore
//     // this.guideChimp.beacon = new Beacons(...args);

//     const tourBeacons = this.contextToursMapData
//       .filter((row: any) => !!row.content)
//       .map((row: any) => {
//         return {
//           element: row.selector,
//           title: row.content.title,
//           description: row.content.content,
//           tour: [
//             {
//               title: "BC Multi Feature",
//               description: "BC Multi Feature beacon clicked.",
//             },
//             {
//               title: "B2C Multi Feature",
//               description: "B2C Multi Feature beacon clicked.",
//             },
//           ],
//         };
//       });

//     const b = this.guideChimp.beacons(tourBeacons);
//     setTimeout(() => {
//       b.showAll();
//     }, 1000);
//   };
//   start = (...args: any) => {
//     this.guideChimp.start(...args);
//   };
//   stop = async (...args: any) => {
//     await this.guideChimp.stop(...args);
//   };
//   showInformation = (...args: any) => {
//     // @ts-ignore
//     // this.guideChimp.beacon = new Beacons(...args);
//     const b = this.guideChimp.information(...args);
//     setTimeout(() => {
//       b.showAll();
//     }, 1000);
//   };
//   // guideChimp.prototype = GuideChimp.prototype;
//   // guideChimp.plugins = new Set();

//   // guideChimp.extend = (plugin, ...args) => {
//   //     if (!guideChimp.plugins.has(plugin)) {
//   //         guideChimp.plugins.add(plugin);
//   //         plugin(GuideChimp, guideChimp, ...args);
//   //     }
//   //     return guideChimp;
//   // };

//   // module.exports = guideChimp;
// }

class AHDjs {
  private guideChimp;
  constructor(...args: any) {
    // @ts-ignore
    this.guideChimp = new GuideChimp(...args);
  }
  public start(...args: any) {
    this.guideChimp.start(...args);
  }
}
export default AHDjs;
