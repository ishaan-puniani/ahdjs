//@ts-nocheck
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

  attachPlugins() {
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

  private normalizeDimension(val: any): string | number | undefined {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      return trimmed.endsWith('%') ? trimmed : trimmed;
    }
    return typeof val === 'number' ? val : parseInt(val);
  }

  async showPageTour(url: string,) {
    await this.stop();
    let toursData = LocalStorage.get(TOUR_DATA_STORAGE_KEY);

    if (!toursData || !toursData.tours || !Array.isArray(toursData.tours)) {
      return;
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
              width: this.normalizeDimension(step.canvasWidth || step.styles?.width),
              height: this.normalizeDimension(step.canvasHeight || step.styles?.height),
              top: this.normalizeDimension(step.styles?.top || step.top),
              left: this.normalizeDimension(step.styles?.left || step.left),
              stepId: step.id,
              id: row.id,
              type: row.type || "tour",
              iconCloseColor: step.style?.iconCloseColor ?? step.behaviour?.iconCloseColor,
              navigationMode: step?.behaviour?.navigationMode || step.navigationMode,
              navigationDelay: step?.behaviour?.navigationDelay || step.navigationDelay
            }))
          : []
      );
      console.log('Tour', onboardTour);
      this.setTour(onboardTour);
      this.start();
    }
  }

  async showAppBanner(identifier: string, refetch: boolean) {
    let appBannerData = LocalStorage.get(APP_BANNER_DATA_STORAGE_KEY);

    if (!appBannerData || refetch) {
      appBannerData = await this.fetchAndCacheBannerData(identifier);
    }

    return appBannerData;
  }
  async renderAppBanner(identifier: string, refetch: boolean) {
    let appBannerData = LocalStorage.get(APP_BANNER_DATA_STORAGE_KEY);
    if (!appBannerData || refetch) {
      appBannerData = await this.fetchAndCacheBannerData(identifier);
    }

    const firstRow = Array.isArray(appBannerData)
      ? appBannerData[0]
      : appBannerData;


    const bannerContent =
      firstRow?.content?.content ||
      firstRow?.content ||
      (Array.isArray(firstRow?.slides)
        ? firstRow.slides.find((s: any) => s && s.content)?.content
        : undefined);


    if (firstRow?.type === 'carousel') {
      this.renderCarouselBanner(firstRow, identifier);
    } else if (firstRow?.type === 'modal') {
      this.renderModalBanner(bannerContent, firstRow);
    } else if (identifier) {
      console.log('Rendering banner in ', identifier);
      let container = null;
      try {
        container = document.querySelector(identifier);
      } catch (e) {
        container = null;
      }
      if (!container && identifier && !identifier.startsWith('#')) {
        try {
          container = document.querySelector('#' + identifier);
        } catch (e) {
          container = null;
        }
      }
      if (container && bannerContent) {
        container.innerHTML = bannerContent;
      }
    }
    return appBannerData;
  }

  async renderCarouselBanner(bannerRow: any, identifier?: string) {
    this.destroyCarousel();
    const slides = Array.isArray(bannerRow.slides) ? bannerRow.slides : [];
    if (!slides.length) return;

    const carousel = document.createElement('div');
    carousel.className = 'gc-carousel';
    carousel.setAttribute('data-ahd-carousel', 'true');
    carousel.setAttribute('role', 'region');
    carousel.setAttribute('aria-roledescription', 'carousel');
    carousel.setAttribute('aria-label', bannerRow.title || 'Carousel');

    const slidesWrap = document.createElement('div');
    slidesWrap.className = 'gc-carousel-slides';
    slidesWrap.setAttribute('data-current-index', '0');

    slides.forEach((s: any, idx: number) => {
      const slide = document.createElement('div');
      slide.className = 'gc-carousel-slide';
      slide.setAttribute('data-slide-index', String(idx));
      const slideContent = s?.content?.content || s?.content || '';
      slide.innerHTML = slideContent;
      slidesWrap.appendChild(slide);
    });

    const prevBtn = document.createElement('button');
    prevBtn.className = 'gc-carousel-prev';
    prevBtn.setAttribute('aria-label', 'Previous slide');
    prevBtn.innerText = '‹';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'gc-carousel-next';
    nextBtn.setAttribute('aria-label', 'Next slide');
    nextBtn.innerText = '›';

    const indicators = document.createElement('div');
    indicators.className = 'gc-carousel-indicators';

    slides.forEach((_: any, i: number) => {
      const dot = document.createElement('button');
      dot.className = 'gc-carousel-indicator';
      dot.setAttribute('data-slide', String(i));
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === 0) dot.setAttribute('aria-current', 'true');
      indicators.appendChild(dot);
    });

    carousel.appendChild(slidesWrap);
    carousel.appendChild(prevBtn);
    carousel.appendChild(nextBtn);
    carousel.appendChild(indicators);

    let mountParent: Element | null = null;
    const renderAsModal = bannerRow?.behaviour?.renderAs === 'modal' || (!identifier && bannerRow?.type === 'carousel');
    if (renderAsModal) {
      this.removeModalBanner();
      const modalOverlay = document.createElement('div');
      modalOverlay.className = 'gc-modal-overlay';
      modalOverlay.setAttribute('data-ahd-modal', 'true');
      const modal = document.createElement('div');
      modal.className = 'gc-modal';
      const closeBtn = document.createElement('div');
      closeBtn.className = 'gc-close';
      if (bannerRow?.styles?.iconCloseColor) {
        closeBtn.style.setProperty('--gc-close-foreground', bannerRow.styles.iconCloseColor);
      }
      closeBtn.addEventListener('click', () => this.removeModalBanner());
      const contentContainer = document.createElement('div');
      contentContainer.className = 'gc-modal-content';
      contentContainer.appendChild(carousel);
      modal.appendChild(closeBtn);
      modal.appendChild(contentContainer);
      modalOverlay.appendChild(modal);
      modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) this.removeModalBanner(); });
      document.addEventListener('keydown', function escHandler(e: KeyboardEvent) { if (e.key === 'Escape') { document.removeEventListener('keydown', escHandler); }});
      document.body.style.overflow = 'hidden';
      document.body.appendChild(modalOverlay);
      mountParent = carousel;
    } else if (identifier) {
      const container = document.querySelector(identifier);
      if (container) {
        container.innerHTML = '';
        container.appendChild(carousel);
        mountParent = carousel;
      }
    }

    const state: any = {
      index: 0,
      slidesCount: slides.length,
      slidesWrap,
      timer: null,
    };

    const goTo = (i: number) => {
      if (!state) return;
      const idx = ((i % state.slidesCount) + state.slidesCount) % state.slidesCount;
      state.index = idx;
      const x = -idx * 100;
      state.slidesWrap.style.transform = `translateX(${x}%)`;
      const dots = indicators.querySelectorAll('.gc-carousel-indicator');
      dots.forEach((d: Element, di: number) => {
        if (di === idx) (d as HTMLElement).setAttribute('aria-current', 'true'); else (d as HTMLElement).removeAttribute('aria-current');
      });
    };

    prevBtn.addEventListener('click', () => goTo(state.index - 1));
    nextBtn.addEventListener('click', () => goTo(state.index + 1));
    indicators.querySelectorAll('.gc-carousel-indicator').forEach((b: Element) => {
      b.addEventListener('click', (ev) => {
        const target = ev.currentTarget as HTMLElement;
        const si = parseInt(target.getAttribute('data-slide') || '0', 10);
        goTo(si);
      });
    });

    const autoplay = !!bannerRow?.behaviour?.autoplay;
    const delay = bannerRow?.behaviour?.autoplayDelay || 5000;
    if (autoplay) {
      state.timer = window.setInterval(() => goTo(state.index + 1), delay);
      carousel.addEventListener('mouseenter', () => { if (state.timer) clearInterval(state.timer); });
      carousel.addEventListener('mouseleave', () => { state.timer = window.setInterval(() => goTo(state.index + 1), delay); });
    }

    let startX = 0;
    let deltaX = 0;
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onTouchMove = (e: TouchEvent) => { deltaX = e.touches[0].clientX - startX; };
    const onTouchEnd = () => {
      const threshold = 50;
      if (deltaX > threshold) goTo(state.index - 1);
      else if (deltaX < -threshold) goTo(state.index + 1);
      startX = 0; deltaX = 0;
    };
    carousel.addEventListener('touchstart', onTouchStart, { passive: true });
    carousel.addEventListener('touchmove', onTouchMove, { passive: true });
    carousel.addEventListener('touchend', onTouchEnd);

    (this as any)._ahd_carousel = { carousel, state, handlers: { onTouchStart, onTouchMove, onTouchEnd } };
  }

  private destroyCarousel() {
    const inst = (this as any)._ahd_carousel;
    if (!inst) return;
    try {
      const { carousel, state, handlers } = inst;
      if (state && state.timer) clearInterval(state.timer);
      if (carousel) {
        carousel.removeEventListener('touchstart', handlers.onTouchStart);
        carousel.removeEventListener('touchmove', handlers.onTouchMove);
        carousel.removeEventListener('touchend', handlers.onTouchEnd);
        if (carousel.parentElement) carousel.parentElement.removeChild(carousel);
      }
    } catch (e) {}
    delete (this as any)._ahd_carousel;
  }

  async renderModalBanner(content: string, bannerData: any) {
    this.removeModalBanner();

    if (!content) return;
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'gc-modal-overlay';
    modalOverlay.setAttribute('data-ahd-modal', 'true');
    const modal = document.createElement('div');
    modal.className = 'gc-modal';
    if (bannerData?.styles?.width) {
      modal.style.width = this.normalizeDimensionToStyle(bannerData.styles.width);
    }
    if (bannerData?.styles?.height) {
      modal.style.height = this.normalizeDimensionToStyle(bannerData.styles.height);
    }

    const closeBtn = document.createElement('div');
    closeBtn.className = 'gc-close';
    if (bannerData?.styles?.iconCloseColor) {
      closeBtn.style.setProperty('--gc-close-foreground', bannerData.styles.iconCloseColor);
    }
    closeBtn.addEventListener('click', () => this.removeModalBanner());

    const contentContainer = document.createElement('div');
    contentContainer.className = 'gc-modal-content';
    contentContainer.innerHTML = content;

    modal.appendChild(closeBtn);
    modal.appendChild(contentContainer);
    modalOverlay.appendChild(modal);

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        this.removeModalBanner();
      }
    });

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.removeModalBanner();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    document.body.appendChild(modalOverlay);
  }

  removeModalBanner() {
    const existingModal = document.querySelector('[data-ahd-modal="true"]');
    if (existingModal) {
      existingModal.remove();
      document.body.style.overflow = '';
    }
  }

  private normalizeDimensionToStyle(val: any): string {
    if (val === undefined || val === null) return '';
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (/[a-z%]/i.test(trimmed)) {
        return trimmed;
      }
      return `${trimmed}px`;
    }
    return typeof val === 'number' ? `${val}px` : '';
  }

  async fetchFaqs(slug) {
    const response: any = await fetch(
      `${this.options.apiHost}/api/tenant/${this.options.applicationId}/faq-group-list?filter[slug]=${slug}&filter[status]=published&limit=10&orderBy=order_ASC`
    ).then((res) => res.json());

    return response;
  }

  async showPageBeacons(url: string) {
    await this.stop();

    if (AHDjs.beacons && typeof AHDjs.beacons === 'function') {
      try {
        const beaconInstance = AHDjs.beacons([]);
        if (beaconInstance && typeof beaconInstance.removeAll === 'function') {
          beaconInstance.removeAll();
        }
      } catch (e) {
      }
    }

    let toursData = LocalStorage.get(TOUR_DATA_STORAGE_KEY);

    if (!toursData || !toursData.tooltips || !Array.isArray(toursData.tooltips)) {
      return;
    }

    const applicableTours = this.getApplicabeDataForUrl(
      toursData.tooltips,
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
                stepId: step.id,
                id: tour.id,
                type: "tooltip",
                showProgressbar: this.options.showProgressbar,
              },
            ];

            const beacon: any = {
              element: step.selector || behavior.selector,
              position: step.position || behavior.position || "right",
              boundary: "outer",
              class: "beacon-labs64",
              triggerMode: step.triggerMode || behavior.triggerMode,
              trigger: step.triggerBehaviour || behavior.triggerBehaviour ,
              tour: {
                steps: tourSteps,
                options: this.options
              },
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
                // opacity: triggerIconData.opacity ?? 1,
                isAnimated: triggerIconData.isAnimated || false,
              };
            } else if (beacon.triggerMode === "label" && triggerLabelData) {
              beacon.triggerLabel = {
                text: triggerLabelData.text,
                color: triggerLabelData.color || "#000000",
                background: triggerLabelData.background || "#d01e1e",
              };
            }

            return beacon;
          });
      });
      console.log('Beacons', beacons);
      AHDjs.beacons(beacons, {
        boundary: "outer",
      }).showAll(true);
    }
  }
  async setBeacons(beacons) {
    AHDjs.beacons(beacons, {
      boundary: "outer",
    }).showAll();
  }

  async showHighlights(url: string, refetch: boolean) {
    await this.stop();

    if (AHDjs.beacons && typeof AHDjs.beacons === 'function') {
      try {
        const beaconInstance = AHDjs.beacons([]);
        if (beaconInstance && typeof beaconInstance.removeAll === 'function') {
          beaconInstance.removeAll();
        }
      } catch (e) {
      
      }
    }

    let toursData = LocalStorage.get(TOUR_DATA_STORAGE_KEY);
    if (!toursData || refetch) {
      toursData = await this.fetchAndCacheTourData(toursData, url);
    }

    if (toursData && toursData.tours?.length > 0) {
      this.showPageTour(url);
    }
    if (toursData && toursData.tooltips?.length > 0) {
      this.showPageBeacons(url);
    }
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
      if (forceShow) {
        return true;
      }
      else {
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
    const url = `${this.options.apiHost}/api/tenant/${this.options.applicationId}/client/unacknowledged?filter[slug]=${slug}&filter[userId]=${this.options.visitorId}&filter[device]=desktop`;
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


  private async fetchAndCacheBannerData(identifier: string) {
    let appBannerData;
    const respons: any = await fetch(
      `${this.options.apiHost}/api/tenant/${this.options.applicationId}/client/app-banner-v2?filter[status]=live&filter[identifier]=${encodeURIComponent(
        identifier
      )}`
    ).then((res) => res.json());
    if (respons.rows) {
      appBannerData = respons.rows.filter((row: any) => {
        if (row && row.content) return true;
        if (row && Array.isArray(row.slides)) {
          return row.slides.some((slide: any) => !!slide && !!slide.content);
        }
        return false;
      });
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

  private async acknowledgeStep(type: string, id: string, stepId: string) {
    // console.log('acknowledgeStep', type, id);
    if (!this.options.visitorId) {
      console.warn('acknowledgeStep: visitorId is not defined, skipping acknowledgment');
      return;
    }
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    const respons: any = await fetch(
      `${this.options.apiHost}/api/tenant/${this.options.applicationId}/client/acknowledge?userId=${this.options.visitorId}&id=${id}&type=${type}&stepId=${stepId}&device=desktop`,
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

// const BASE_WIDTH = 2560;

// function applyGuideChimpScaling() {
//   const scale = Math.min(window.innerWidth / BASE_WIDTH, 1).toFixed(2);

//   const originMap: { [key: string]: string } = {
//     'top': 'bottom center',
//     'top-left': 'bottom right',
//     'top-right': 'bottom left',
//     'bottom': 'right top',
//     'bottom-left': 'top right',
//     'bottom-right': 'top left',
//     'left': ' right',
//     'right': ' left',
//     'floating': 'floating',
//   };

//   document.querySelectorAll('[data-guidechimp-position]').forEach((el) => {
//     const position = (el as Element).getAttribute('data-guidechimp-position') || '';
//     const origin = originMap[position];
//     if (origin === 'floating') {
//       (el as HTMLElement).style.transformOrigin = 'none';
//       (el as HTMLElement).style.transform = ` translate(-50%, -50%)`;
//       return;
//     }
//     else {
//       (el as HTMLElement).style.transformOrigin = originMap[position];
//       (el as HTMLElement).style.transform = `scale(${(parseFloat(scale) + 0.25).toFixed(2)})`;
//     }
//   });
// }

// applyGuideChimpScaling();
// window.addEventListener('resize', applyGuideChimpScaling);
// window.addEventListener('load', applyGuideChimpScaling);

export default AHDjs;
