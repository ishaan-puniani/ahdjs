// @ts-nocheck
// import GuideChimp from "./GuideChimp";
// //import  Beacons from "./plugins/beacons";
// import "./index.scss";
// // import Information from "./plugins/information";
// // import Beacons from "./plugins/beacons";
// // class AHDjs {
// //   private guideChimp: any;
// //   private appId: string;
// //   private contextToursMapData: any;
// //   constructor(applicationId: any, tour: any, options: any) {
// //     this.appId = applicationId;
// //     //@ts-ignore
// //     this.guideChimp = new GuideChimp(tour, options);

// //     this.guideChimp.prototype = GuideChimp.prototype;
// //     this.guideChimp.plugins = new Set();

// //     //@ts-ignore
// //     // this.guideChimp.extend = (plugin, ...args) => {
// //     //   if (!this.guideChimp.plugins.has(plugin)) {
// //     //     this.guideChimp.plugins.add(plugin);
// //     //     plugin(GuideChimp, this.guideChimp, ...args);
// //     //   }
// //     //   return this.guideChimp;
// //     // };

// //     // test beacon extension
// //     // @ts-ignore
// //     const pluginsToLoad = [Beacons, Information];
// //     pluginsToLoad.forEach((pluginClass) => {
// //       const plugin = pluginClass;
// //       if (!this.guideChimp.plugins.has(plugin)) {
// //         this.guideChimp.plugins.add(plugin);
// //         // @ts-ignore
// //         plugin(GuideChimp, this.guideChimp, tour, options);
// //       }
// //     });
// //   }

// //   updatePageUrl = async (url: string, refetch: boolean) => {
// //     await this.stop();
// //     // todo: local caching and use https://github.com/pillarjs/path-to-regexp to find exact match
// //     const respons: any = await fetch(
// //       `https://ahd-be-jggub5n6qq-em.a.run.app/api/tenant/${this.appId}/contexttour?filter[isActive]=true`
// //     ).then((res) => res.json());

// //     this.contextToursMapData = respons.rows;
// //     //if there is anything to open onload
// //     const onboardTour = respons.rows
// //       .filter((row: any) => !!row.content)
// //       .map((row: any) => {
// //         return {
// //           element: row.selector,
// //           title: row.content.title,
// //           description: row.content.content,
// //           tour: [
// //             {
// //               title: "Multi Feature",
// //               description: "Multi Feature beacon clicked.",
// //             },
// //           ],
// //         };
// //       });
// //     this.setTour(onboardTour);
// //     this.start();
// //   };

// //   setTour = (tour: any) => {
// //     this.guideChimp.setTour(tour);
// //   };
// //   beacons = (...args: any) => {
// //     // @ts-ignore
// //     // this.guideChimp.beacon = new Beacons(...args);

// //     const tourBeacons = this.contextToursMapData
// //       .filter((row: any) => !!row.content)
// //       .map((row: any) => {
// //         return {
// //           element: row.selector,
// //           title: row.content.title,
// //           description: row.content.content,
// //           tour: [
// //             {
// //               title: "BC Multi Feature",
// //               description: "BC Multi Feature beacon clicked.",
// //             },
// //             {
// //               title: "B2C Multi Feature",
// //               description: "B2C Multi Feature beacon clicked.",
// //             },
// //           ],
// //         };
// //       });

// //     const b = this.guideChimp.beacons(tourBeacons);
// //     setTimeout(() => {
// //       b.showAll();
// //     }, 1000);
// //   };
// //   start = (...args: any) => {
// //     this.guideChimp.start(...args);
// //   };
// //   stop = async (...args: any) => {
// //     await this.guideChimp.stop(...args);
// //   };
// //   showInformation = (...args: any) => {
// //     // @ts-ignore
// //     // this.guideChimp.beacon = new Beacons(...args);
// //     const b = this.guideChimp.information(...args);
// //     setTimeout(() => {
// //       b.showAll();
// //     }, 1000);
// //   };
// //   // guideChimp.prototype = GuideChimp.prototype;
// //   // guideChimp.plugins = new Set();

// //   // guideChimp.extend = (plugin, ...args) => {
// //   //     if (!guideChimp.plugins.has(plugin)) {
// //   //         guideChimp.plugins.add(plugin);
// //   //         plugin(GuideChimp, guideChimp, ...args);
// //   //     }
// //   //     return guideChimp;
// //   // };

// //   // module.exports = guideChimp;
// // }

// class AHDjs {
//   private guideChimp;
//   constructor(...args: any) {
//     // @ts-ignore
//     this.guideChimp = new GuideChimp(...args);
//   }
//   public start(...args: any) {
//     this.guideChimp.start(...args);
//   }
// }
// export default AHDjs;

/**
 * Copyright (C) 2020 Labs64 GmbH
 *
 * This source code is licensed under the European Union Public License, version 1.2
 * located in the LICENSE file
 */

import GuideChimp from "./GuideChimp";
import { LocalStorage } from "ttl-localstorage";
import Beacons from "./plugins/beacons";
/* ============
 * Styling
 * ============
 *
 * Import the library styling.
 */
import "./index.scss";

const { match } = require("path-to-regexp");

const HELP_DATA_STORAGE_KEY = "AHD_HELP_DATA";
const TOUR_DATA_STORAGE_KEY = "AHD_TOUR_DATA";
const APP_BANNER_DATA_STORAGE_KEY = "APP_BANNER_DATA";
const HIGHLIGHTS_DATA_STORAGE_KEY = "AHD_HIGHLIGHTS_DATA";
const AHD_VISITOR_STATS_STORAGE_KEY = "AHD_VISITOR_STATS";

class AHD extends GuideChimp {
  constructor(tour, options = {}) {
   
    if (options.userId && !options.visitorId) {
      options.visitorId = options.userId;
    }
    super(tour, options);
    this.attachPlugins();
  }

  async attachPlugins() {
    const pluginsToLoad = [Beacons];
    pluginsToLoad.forEach((pluginClass) => {
      AHDjs.extend(pluginClass);
    });
  }

  async initializeSiteMap(refetch: boolean) {
    let highlightsData = LocalStorage.get(HIGHLIGHTS_DATA_STORAGE_KEY);
    if (!highlightsData || refetch) {
      // highlightsData = await this.fetchAndCacheHighlightsData(highlightsData);
    }
    let toursData = LocalStorage.get(TOUR_DATA_STORAGE_KEY);
    if (!toursData || refetch) {
      toursData = await this.fetchAndCacheTourData(toursData);
    }
    // let helpData = LocalStorage.get(HELP_DATA_STORAGE_KEY);
    // if (!helpData || refetch) {
    //   helpData = await this.fetchAndCacheHelpData(helpData);
    // }
    let stats = LocalStorage.get(AHD_VISITOR_STATS_STORAGE_KEY);
    if (!stats || refetch) {
      stats = await this.fetchAndCachePageVisitsData(stats);
    }
  }

  async getHelpContent(url: string, refetch: boolean) {
    let helpData = LocalStorage.get(TOUR_DATA_STORAGE_KEY);

    if (!helpData || refetch) {
      helpData = await this.fetchAndCacheTourData(helpData);
    }

    const applicableHelp = this.getApplicabeDataForUrl(
      helpData,
      url,
      "help",
      true
    );
    return applicableHelp;
  }

  async showPageTour(url: string, refetch: boolean,) {
    await this.stop();
    let toursData = LocalStorage.get(TOUR_DATA_STORAGE_KEY);

    if (!toursData || refetch) {
      toursData = await this.fetchAndCacheTourData(toursData, url);
    }
    const applicableTours = this.getApplicabeDataForUrl(
      toursData.tours,
      url,
      false
    );

    if (applicableTours?.length > 0) {
      const stats = LocalStorage.get(AHD_VISITOR_STATS_STORAGE_KEY) || {};
      const visited = stats?.visited || [];
      const nVisited = new Set(visited);

      applicableTours.forEach((tour: any) => {
        if (!nVisited.has(tour.slug)) {
          nVisited.add(tour.slug);
          const entityId = tour.id || tour._id;
          this.markPageVisited(tour.slug, "tour", entityId);
        }
      });

      LocalStorage.put(
        AHD_VISITOR_STATS_STORAGE_KEY,
        { ...stats, visited: [...nVisited] },
        86400
      );

      const onboardTour = applicableTours.flatMap((row: any) =>
        Array.isArray(row.steps)
          ? row.steps
            .filter((step: any) => !!step.content)
            .map((step: any) => ({
              element: step.selector,
              description: step.content,
              position: step.position,
              animationType: step.animationType,
              delay: step.delay,
              isBackdrop: step.isBackdrop,
              isCaret: step.isCaret,
              dismissalSetting: step.dismissalSetting,
              showProgressbar: this.options.showProgressbar,
              width: parseInt(step.width),
              height: parseInt(step.height),
              top: parseInt(step.top),
              left: parseInt(step.left),
              id:step.id,
              type: "tour",
            }))
          : []
      );
      console.log('Tour', onboardTour);
      this.setTour(onboardTour);
      this.start();
    }
  }

  async showAppBanner(url: string, refetch: boolean) {
    let appBannerData = LocalStorage.get(APP_BANNER_DATA_STORAGE_KEY);

    if (!appBannerData || refetch) {
      appBannerData = await this.fetchAndCacheBannerData(appBannerData);
    }

    return appBannerData;
  }

  async fetchFaqs(slug) {
    const response: any = await fetch(
      `${this.options.apiHost}/api/tenant/${this.options.applicationId}/faq-group-list?filter[slug]=${slug}&filter[status]=published&limit=10&orderBy=order_ASC`
    ).then((res) => res.json());

    return response;
  }

  async showPageBeacons(url: string, refetch: boolean) {
    await this.stop();
    debugger;
    let tooltipData = LocalStorage.get(TOUR_DATA_STORAGE_KEY);

    if (!tooltipData || refetch) {
      tooltipData = await this.fetchAndCacheTourData(tooltipData, url);
    }
    const applicableTours = this.getApplicabeDataForUrl(
      tooltipData.tooltips,
      url,
      true
    );
    if (applicableTours.length > 0) {
      const stats = LocalStorage.get(AHD_VISITOR_STATS_STORAGE_KEY) || {};
      const visited = stats?.visited || [];
      const nVisited = new Set(visited);
      applicableTours.forEach((tour: any) => {
        if (!nVisited.has(tour.slug)) {
          nVisited.add(tour.slug);
          const entityId = applicableTours[0].id || applicableTours[0]._id;
          this.markPageVisited(tour.slug, "tooltip", entityId);
        }
      });

      LocalStorage.put(
        AHD_VISITOR_STATS_STORAGE_KEY,
        { ...stats, visited: [...nVisited] },
        86400
      );
      const beacons = applicableTours.flatMap((tour: any) => {
        const stepsArray = Array.isArray(tour.step) ? tour.step : tour.step ? [tour.step] : [];

        return stepsArray
          .filter((step: any) => !!step.content)
          .map((step: any) => {
            const behavior = step.contentMetadata?.document?.root?.data?.behaviour || {};

            const tourSteps = [
              {
                element: step.selector,
                title: step.title,
                description: step.content,
                animationType: step.animationType || behavior.animationType || "fadeIn",
                delay: step.delay || behavior.delay || 0,
                isBackdrop:
                  step.isBackdrop !== undefined
                    ? step.isBackdrop
                    : behavior.isBackdrop !== undefined
                      ? behavior.isBackdrop
                      : true,
                isCaret:
                  step.isCaret !== undefined
                    ? step.isCaret
                    : behavior.isCaret !== undefined
                      ? behavior.isCaret
                      : true,
                position: step.position || behavior.position,
                top: parseInt(step.top),
                left: parseInt(step.left),
                width: parseInt(step.width),
                height: parseInt(step.height),
                id:step.id,
                type: "tooltip",
              },
            ];

            const beacon: any = {
              element: step.selector || behavior.selector,
              position: step.position || behavior.position || "right",
              boundary: "outer",
              class: "beacon-labs64",
              triggerMode: step.triggerMode || behavior.triggerMode,
              trigger: step.triggerBehaviour || behavior.triggerBehaviour || "onClick",
              tour: tourSteps,
            };

            const triggerIconData = step.triggerIcon || behavior.triggerIcon;
            const triggerLabelData = step.triggerLabel || behavior.triggerLabel;

            if (beacon.triggerMode === "icon" && triggerIconData) {
              let iconType = "beacon";
              if (triggerIconData.type === "info") iconType = "info";
              if (triggerIconData.type === "success") iconType = "success";
              if (triggerIconData.type === "warning") iconType = "warning";
              if (triggerIconData.type === "helpIcon") iconType = "helpIcon";

              beacon.triggerIcon = {
                type: iconType,
                color: triggerIconData.color || "#000000",
                opacity: triggerIconData.opacity ? triggerIconData.opacity / 100 : 1,
                isAnimated: triggerIconData.isAnimated || false,
              };
            } else if (beacon.triggerMode === "label" && triggerLabelData) {
              beacon.triggerLabel = {
                text: triggerLabelData.text,
                color: triggerLabelData.color || "#000000",
                background: triggerLabelData.backgroundColor || "#ffffff",
              };
            }

            return beacon;
          });
      });
      console.log('beacons', beacons);

      AHDjs.beacons(beacons, {
        boundary: "outer",
      }).showAll();
    }
  }
  async setBeacons(beacons) {

    AHDjs.beacons(beacons, {
      boundary: "outer",
    }).showAll();
  }

  async showPageHighlights(url: string, refetch: boolean, force = false) {
    await this.stop();
    let highlightsData = LocalStorage.get(HIGHLIGHTS_DATA_STORAGE_KEY);

    if (!highlightsData || refetch) {
      // highlightsData = await this.fetchAndCacheHighlightsData(highlightsData);
    }
    const applicableHighlights = this.getUnAcknowledgedHightlightsForUrl(
      highlightsData,
      url,
      "highlight",
      force
    );

    //if there is anything to open
    const beacons = applicableHighlights.map((row: any) => {
      return {
        element: row.selector,
        position: row.position,
        onClick: async () => {
          this.acknowledgeHighlight(row.id);
        },
        tour: [
          {
            element: row.selector,
            position: row.position,
            title: row.content.title,
            description: this.generateDescription(row.content),
          },
        ],
      };
    });

    AHDjs.beacons(beacons, {
      boundary: "outer",
    }).showAll();
  }

  async clearCachedData() {
    LocalStorage.removeKey(HIGHLIGHTS_DATA_STORAGE_KEY);
    LocalStorage.removeKey(HELP_DATA_STORAGE_KEY);
    LocalStorage.removeKey(TOUR_DATA_STORAGE_KEY);
    LocalStorage.removeKey(AHD_VISITOR_STATS_STORAGE_KEY);
  }

  async acknowledgeHighlight(id: string) {
    const stats = LocalStorage.get(AHD_VISITOR_STATS_STORAGE_KEY) || {};
    const acknowledged = stats?.ack || [];
    const nAckonowledged = new Set(acknowledged);
    if (!nAckonowledged.has(id)) {
      nAckonowledged.add(id);
    }
    LocalStorage.put(
      AHD_VISITOR_STATS_STORAGE_KEY,
      { ...stats, ack: [...nAckonowledged] },
      86400
    );
    this.updateVisitorStats({ ack: [id] }, "highlight");
  }

  private generateDescription(content: any) {
    let description = content.content || "";
    // debugger;
    // if (content.video) {
    //   content.video.forEach((vid) => {
    //     description += `<br/><video  width="320" height="240" controls><source src="${vid.downloadUrl}" type="video/mp4"></video>`;
    //   });
    // }
    // if (content.image) {
    //   content.image.forEach((img) => {
    //     description += `<br/><img  width="320" height="240" src="${img.downloadUrl}" />`;
    //   });
    // }
    return description;
  }

  private getUnAcknowledgedHightlightsForUrl(
    highlightsData: any,
    url: string,
    type: string,
    forceShow = false
  ) {
    // exlude visitied
    const stats = LocalStorage.get(AHD_VISITOR_STATS_STORAGE_KEY) || {};
    const acknowledged = stats?.ack || [];
    return highlightsData.filter((td) => {
      if (forceShow || !acknowledged || !acknowledged.includes(td.id)) {
        const matcher = match(td.slug, { decode: decodeURIComponent });
        const highlightound = matcher(url);

        return highlightound;
      }
      return false;
    });
  }

  private getApplicabeDataForUrl(
    toursData: any,
    url: string,
    forceShow = false
  ) {
    const stats = LocalStorage.get(AHD_VISITOR_STATS_STORAGE_KEY) || {};
    const visited = stats?.visited || [];

    return toursData.filter((td) => {
      const matcher = match(td.slug, { decode: decodeURIComponent });
      const tourFound = matcher(url);

      if (!tourFound) {
        return false;
      }
      const isOneTimeOnly = td.oneTimeOnly === true;
      const hasBeenVisited = visited.includes(td.slug);
      if (forceShow) {
        return true;
      }
      if (isOneTimeOnly) {
        return !hasBeenVisited;
      } else {
        return true;
      }
    });
  }
  private async fetchAndCacheHighlightsData(highlightsData: any) {
    const respons: any = await fetch(
      `${this.options.apiHost}/api/tenant/${this.options.applicationId}/client/highlights?filter[isActive]=true`
    ).then((res) => res.json());
    if (respons.rows) {
      highlightsData = respons.rows.filter((row: any) => !!row.content);
      LocalStorage.put(
        HIGHLIGHTS_DATA_STORAGE_KEY,
        highlightsData,
        this.options.highlightRefetchIntervalInSec
      );
    }
    return highlightsData;
  }

  private async fetchAndCacheTourData(toursData: any, slug: string) {
    const url = `${this.options.apiHost}/api/tenant/${this.options.applicationId}/client/unacknowledged?filter[slug]=${slug}&filter[userId]=${this.options.visitorId}&filter[device]=web`;
    const response: any = await fetch(url).then((res) => res.json());
    if (response) {
      toursData = response;
      LocalStorage.put(
        TOUR_DATA_STORAGE_KEY,
        toursData,
        this.options.toursRefetchIntervalInSec
      );

    }
    return toursData;
  }


  private async fetchAndCacheBannerData(appBannerData: any) {
    const respons: any = await fetch(
      `${this.options.apiHost}/api/tenant/${this.options.applicationId}/client/app-banners?filter[isActive]=true`
    ).then((res) => res.json());
    if (respons.rows) {
      appBannerData = respons.rows.filter((row: any) => !!row.content);
      LocalStorage.put(
        APP_BANNER_DATA_STORAGE_KEY,
        appBannerData,
        this.options.appBannerRefetchIntervalInSec
      );
    }
    return appBannerData;
  }

  // private async fetchAndCacheHelpData(helpData: any) {
  //   const respons: any = await fetch(
  //     `${this.options.apiHost}/api/tenant/${this.options.applicationId}/context-help?filter[isActive]=true`
  //   ).then((res) => res.json());
  //   if (respons.rows) {
  //     helpData = respons.rows.filter((row: any) => !!row.content);
  //     LocalStorage.put(
  //       HELP_DATA_STORAGE_KEY,
  //       helpData,
  //       this.options.helpRefetchIntervalInSec
  //     );
  //   }
  //   return helpData;
  // }

  private async fetchAndCachePageVisitsData(visits: any) {
    const respons: any = await fetch(
      `${this.options.apiHost}/api/tenant/${this.options.applicationId}/client/stats/${this.options.visitorId}?filter[device]=web`
    ).then((res) => res.json());
    if (respons) {
      LocalStorage.put(
        AHD_VISITOR_STATS_STORAGE_KEY,
        respons,
        this.options.statsCacheIntervalInSec
      );
    }
    return visits;
  }

  private async updateVisitorStats(dataToPatch: any, type: string) {
    let visits;
    const respons: any = await fetch(
      `${this.options.apiHost}/api/tenant/${this.options.applicationId}/client/visitor-stats`,
      {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({
          data: {
            dataToPatch,
            visitorId: this.options.visitorId,
            channel: "web",
            type,
          },
        }), // body data type must match "Content-Type" header
      }
    ).then((res) => res.json());
    if (respons) {
      LocalStorage.put(
        AHD_VISITOR_STATS_STORAGE_KEY,
        respons,
        this.options.visitsCacheIntervalInSec
      );
    }
    return visits;
  }

  private async acknowledgeStep(type: string, id: string) {
    // console.log('acknowledgeStep', type, id);
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    const respons: any = await fetch(
      `${this.options.apiHost}/api/tenant/${this.options.applicationId}/client/acknowledge?userId=${this.options.visitorId}&id=${id}&type=${type}`,
      requestOptions
    ).then((res) => res.json());

  }

  private async markPageVisited(slug: string, type: string, entityId: string) {
    let visits;
    const respons: any = await fetch(
      `${this.options.apiHost}/api/tenant/${this.options.applicationId}/visitor-stats`,
      {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({
          data: {
            slug,
            visitorId: this.options.visitorId,
            entityId: entityId,
            channel: "web",
            type,
          },
        }), // body data type must match "Content-Type" header
      }
    ).then((res) => res.json());
    if (respons) {
      LocalStorage.put(
        AHD_VISITOR_STATS_STORAGE_KEY,
        respons,
        this.options.visitsCacheIntervalInSec
      );
    }
    return visits;
  }
}

const AHDjs = (...args) => new AHD(...args);

AHDjs.prototype = AHD.prototype;
AHDjs.plugins = new Set();

AHDjs.extend = (plugin, ...args) => {
  if (!AHDjs.plugins.has(plugin)) {
    AHDjs.plugins.add(plugin);
    plugin(AHD, AHDjs, ...args);
  }
  return AHDjs;
};

export default AHDjs;
