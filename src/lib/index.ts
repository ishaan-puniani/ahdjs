//@ts-nocheck

/**
 * Copyright (C) 2020 Labs64 GmbH
 *
 * This source code is licensed under the European Union Public License, version 1.2
 * located in the LICENSE file
 */

import GuideChimp from "./GuideChimp";
import { LocalStorage } from "ttl-localstorage";
import Beacons from "./plugins/beacons";
import { googleFonts, createGoogleFontsURL } from './fonts';
import "./index.scss";

import {
  HELP_DATA_STORAGE_KEY,
  TOUR_DATA_STORAGE_KEY,
  HIGHLIGHTS_DATA_STORAGE_KEY,
  AHD_VISITOR_STATS_STORAGE_KEY,
} from './utils/storage-keys';
import { TourApiClient } from './api/tour-api';
import { BannerRenderer, handleBannerClick } from './banners/banner-renderer';
import { normalizeDimension } from './utils/dimension';
import { getApplicabeDataForUrl, getUnAcknowledgedHightlightsForUrl } from './utils/url-matcher';

const { match } = require("path-to-regexp");

class AHD extends GuideChimp {
  private static _instances: Set<AHD> = new Set();

  private _lastPageUrl: string = '';
  private _lastRenderedIdentifier: string = '';
  private _api: TourApiClient;
  private _bannerRenderer: BannerRenderer;

  constructor(tour, options = {}) {

    if (options.userId && !options.visitorId) {
      options.visitorId = options.userId;
    }
    if (!options.language) {
      options.language = '';
    }
    super(tour, options);
    this._api = new TourApiClient(options);
    this._bannerRenderer = new BannerRenderer(this.acknowledgeAppBanner.bind(this));
    AHD._instances.add(this);
    this.attachPlugins();
  }

  stop(...args) {
    if ((this as any).isDisplayed) {
      super.stop(...args);
      this.removeModalBanner();
    }
    AHD._instances.forEach(instance => {
      if (instance !== this) {
        try {
          if ((instance as any).isDisplayed) {
            instance.stop(...args);
          }
        } catch (e) {}
      }
    });
  }

  attachPlugins() {
    const pluginsToLoad = [Beacons];
    pluginsToLoad.forEach((pluginClass) => {
      AHDjs.extend(pluginClass);
    });
  }

  async initializeSiteMap(refetch: boolean) {
    let toursData = LocalStorage.get(TOUR_DATA_STORAGE_KEY);
    if (!toursData || refetch) {
      toursData = await this._api.fetchAndCacheTourData(toursData);
    }
    let stats = LocalStorage.get(AHD_VISITOR_STATS_STORAGE_KEY);
    if (!stats || refetch) {
      stats = await this._api.fetchAndCachePageVisitsData(stats);
    }
  }

  async getHelpContent(url: string, refetch: boolean) {
    let helpData = LocalStorage.get(TOUR_DATA_STORAGE_KEY);

    if (!helpData || refetch) {
      helpData = await this._api.fetchAndCacheTourData(helpData);
    }

    const applicableHelp = getApplicabeDataForUrl(
      helpData,
      url,
      "help",
      true
    );
    return applicableHelp;
  }

  async showPageTour(url: string) {
    this._lastPageUrl = url;
    await this.stop();
    let toursData = LocalStorage.get(TOUR_DATA_STORAGE_KEY);
    if (!toursData || !toursData.tours || !Array.isArray(toursData.tours)) {
      return;
    }

    const applicableTours = getApplicabeDataForUrl(
      toursData.tours,
      url,
      true
    );
    if (applicableTours?.length > 0) {
      const stats = LocalStorage.get(AHD_VISITOR_STATS_STORAGE_KEY) || {};
      const visited = stats?.visited || [];
      const nVisited = new Set(visited);

      applicableTours.forEach((tour: any) => {
        if (!nVisited.has(tour.slug)) {
          nVisited.add(tour.slug);
          const entityId = tour.id || tour._id;
          this._api.markPageVisited(tour.slug, "tour", entityId);
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
              width: normalizeDimension(step.canvasWidth || step.styles?.width),
              height: normalizeDimension(step.canvasHeight || step.styles?.height),
              top: normalizeDimension(step.styles?.top || step.top),
              left: normalizeDimension(step.styles?.left || step.left),
              stepId: step.id,
              id: row.id,
              type: row.type || "tour",
              iconCloseColor: step.style?.iconCloseColor ?? step.behaviour?.iconCloseColor,
              navigationMode: step?.behaviour?.navigationMode || step.navigationMode,
              navigationDelay: step?.behaviour?.navigationDelay || step.navigationDelay,
              showStep: step?.behaviour?.showStep
            }))
          : []
      );
      console.log('Tour', onboardTour);
      this.setTour(onboardTour);
      this.start();
    }
  }

  async showAppBanner(identifier: string, refetch: boolean) {
    let toursData = LocalStorage.get(TOUR_DATA_STORAGE_KEY);

    if (!toursData || refetch) {
      toursData = await this._api.fetchAndCacheTourData(toursData, identifier, false);
    }

    const appBannerData = Array.isArray(toursData?.appBanners)
      ? toursData.appBanners.filter((b: any) => b.identifier === identifier)
      : [];

    return appBannerData;
  }

  async renderAppBanner(identifier: string, refetch: boolean) {
    this._lastRenderedIdentifier = identifier;
    let toursData = LocalStorage.get(TOUR_DATA_STORAGE_KEY);
    if (refetch) {
      toursData = await this._api.fetchAndCacheTourData(toursData, identifier, false);
    }

    const appBannerData = Array.isArray(toursData?.appBanners)
      ? toursData.appBanners.filter((b: any) => b.identifier === identifier)
      : [];

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
        const isSimpleBanner = !firstRow?.type || firstRow?.type === 'simpleBanner';
        if (isSimpleBanner) {
          const bannerId = firstRow?.id || firstRow?._id;
          const slideIds = Array.isArray(firstRow?.slides)
            ? firstRow.slides.map((s: any) => s.id || s._id).filter(Boolean)
            : [];

          const wrapper = document.createElement('div');
          wrapper.className = 'gc-simple-banner';
          wrapper.setAttribute('data-ahd-simple-banner', 'true');
          wrapper.style.position = 'relative';
          wrapper.innerHTML = bannerContent;

          const slideBehaviour = firstRow?.slides?.[0]?.behaviour || firstRow?.behaviour || {};
          const showClose = slideBehaviour?.showCloseIcon
            || firstRow?.slides?.[0]?.showCloseIcon
            || firstRow?.showCloseIcon;
          console.log('Closing banner ', bannerId, slideIds);

          if (showClose) {
            const closeBtn = document.createElement('div');
            closeBtn.className = 'gc-close';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '0';
            closeBtn.style.right = '0';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.zIndex = '10';
            closeBtn.style.setProperty(
              '--gc-close-foreground',
              slideBehaviour?.iconCloseColor || firstRow?.styles?.iconCloseColor || '#000'
            );
            closeBtn.addEventListener('click', () => {
              if (bannerId) {
                this.acknowledgeAppBanner(bannerId, slideIds);
              }
              wrapper.remove();
              this._bannerRenderer._ahd_active_banner = null;
            });
            wrapper.appendChild(closeBtn);
          }
          container.innerHTML = '';
          container.appendChild(wrapper);
          wrapper.addEventListener('click', (e) => handleBannerClick(e));
        } else {
          container.innerHTML = bannerContent;
          container.addEventListener('click', (e) => handleBannerClick(e));
        }
      }
    }

    if (firstRow) {
      const bannerId = firstRow.id || firstRow._id;
      const slideIds = Array.isArray(firstRow.slides)
        ? firstRow.slides.map((s: any) => s.id || s._id).filter(Boolean)
        : [];
      this._bannerRenderer._ahd_active_banner = { bannerId, slideIds };
      const isSimpleBanner = !firstRow?.type || firstRow?.type === 'simpleBanner';
      const isModal = firstRow?.type === 'modal';
      if (!isSimpleBanner && !isModal) {
        this.acknowledgeAppBanner(bannerId, slideIds);
      }
    }

    return appBannerData;
  }

  async renderCarouselBanner(bannerRow: any, identifier?: string) {
    return this._bannerRenderer.renderCarouselBanner(bannerRow, identifier);
  }

  async renderModalBanner(content: string, bannerData: any) {
    return this._bannerRenderer.renderModalBanner(content, bannerData);
  }

  removeModalBanner() {
    return this._bannerRenderer.removeModalBanner();
  }

  async fetchFaqs(slug) {
    return this._api.fetchFaqs(slug);
  }

  async showPageBeacons(url: string) {
    this._lastPageUrl = url;
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

    const applicableTours = getApplicabeDataForUrl(
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
          this._api.markPageVisited(tour.slug, "tooltip", entityId);
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
            const behavior = step.behaviour || step.contentMetadata?.document?.root?.data?.behaviour || {};

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
              trigger: step.triggerBehaviour || behavior.triggerBehaviour,
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
    this._lastPageUrl = url;
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
      toursData = await this._api.fetchAndCacheTourData(toursData, url);
    }

    const matchesUrl = (td: any, u: string) => {
      const slugs = [td.slug, ...(Array.isArray(td.altSlugs) ? td.altSlugs : [])].filter(Boolean);
      return slugs.some((slug) => {
        try { return !!match(slug, { decode: decodeURIComponent })(u); } catch (_) { return false; }
      });
    };
    const matchingTours = toursData?.tours?.filter((td) => matchesUrl(td, url)) || [];
    const matchingTooltips = toursData?.tooltips?.filter((td) => matchesUrl(td, url)) || [];
   if (matchingTours.length > 0) {
      this.showPageTour(url);
    }
    if (matchingTooltips.length > 0) {
      this.showPageBeacons(url);
    }
  }

  async showPageHighlights(url: string, refetch: boolean, force = false) {
    await this.stop();
    let highlightsData = LocalStorage.get(HIGHLIGHTS_DATA_STORAGE_KEY);

    const applicableHighlights = getUnAcknowledgedHightlightsForUrl(
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

  async setLanguage(lang: string) {
    this.options.language = lang;
    await this.clearCachedData();
    if (this._lastPageUrl) {
      await this.showHighlights(this._lastPageUrl, true);
    }
    if (this._lastRenderedIdentifier) {
      await this.renderAppBanner(this._lastRenderedIdentifier, true);
    }
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
    this._api.updateVisitorStats({ ack: [id] }, "highlight");
  }

  async markUnacknowledge(slugOrIdentifier: string) {
    const toursData = LocalStorage.get(TOUR_DATA_STORAGE_KEY);

    let match: any = null;
    let type: string = null;

    if (toursData) {
      const banner = (toursData.appBanners || []).find((b: any) => b.identifier === slugOrIdentifier);
      const tour = !banner && (toursData.tours || []).find((t: any) => t.slug === slugOrIdentifier);
      const tooltip = !banner && !tour && (toursData.tooltips || []).find((t: any) => t.slug === slugOrIdentifier);

      if (banner) { match = banner; type = 'app-banner'; }
      else if (tour) { match = tour; type = 'tour'; }
      else if (tooltip) { match = tooltip; type = 'tooltip'; }
    }

    if (!match) {
      console.warn(`markUnacknowledge: no item found for "${slugOrIdentifier}" in TOUR_DATA_STORAGE_KEY`);
      return;
    }

    const ackId = match._id || match.id;

    const url = `${this.options.apiHost}/api/tenant/${this.options.applicationId}/stats/mark-unacknowledged/${this.options.visitorId}/${ackId}`;
    await fetch(url, { method: 'GET', redirect: 'follow' }).then((res) => res.json());

    const stats = LocalStorage.get(AHD_VISITOR_STATS_STORAGE_KEY) || {};
    const acknowledged: string[] = stats?.ack || [];
    LocalStorage.put(
      AHD_VISITOR_STATS_STORAGE_KEY,
      { ...stats, ack: acknowledged.filter((id: string) => id !== ackId) },
      86400
    );

    await this._api.fetchAndCachePageVisitsData(null);

    if (type === 'app-banner') {
      await this.renderAppBanner(slugOrIdentifier, true);
    } else {
      await this.showHighlights(window.location.href, true);
    }
  }

  private generateDescription(content: any) {
    let description = content.content || "";
    const fontLinkId = 'ahd-google-fonts';
    if (!document.getElementById(fontLinkId)) {
      const link = document.createElement('link');
      link.id = fontLinkId;
      link.rel = 'stylesheet';
      link.href = createGoogleFontsURL(googleFonts);
      document.head.appendChild(link);
    }
    return description;
  }

  private acknowledgeAppBanner(bannerId: string, slideIds: string[]) {
    if (!bannerId) return;
    slideIds.forEach((slideId) => {
      this._api.acknowledgeStep('app-banner', bannerId, slideId);
    });
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
