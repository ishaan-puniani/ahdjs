//@ts-nocheck
import { LocalStorage } from "ttl-localstorage";
import {
  TOUR_DATA_STORAGE_KEY,
  HIGHLIGHTS_DATA_STORAGE_KEY,
  AHD_VISITOR_STATS_STORAGE_KEY,
} from '../utils/storage-keys';
import { resolveSlugPatternForUrl } from '../utils/url-matcher';

export class TourApiClient {
  constructor(private options: any) {}

  async fetchFaqs(slug) {
    const response: any = await fetch(
      `${this.options.apiHost}/api/tenant/${this.options.applicationId}/faq-group-list?filter[slug]=${slug}&filter[status]=published&limit=10&orderBy=order_ASC`
    ).then((res) => res.json());

    return response;
  }

  async fetchAndCacheTourData(toursData: any, slug: string, resolveSlug = true) {
    if (slug && resolveSlug) {
      slug = resolveSlugPatternForUrl(slug, toursData);
    }
    const langParam = this.options.language ? `&filter[language]=${this.options.language}` : '';
    const url = `${this.options.apiHost}/api/tenant/${this.options.applicationId}/client/unacknowledged?filter[slug]=${slug}&filter[userId]=${this.options.visitorId}&filter[device]=desktop${langParam}`;
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

  async fetchAndCacheHighlightsData(highlightsData: any) {
    const respons: any = await fetch(
      `${this.options.apiHost}/api/tenant/${this.options.applicationId}/client/highlights?filter[isActive]=true&filter[language]=${this.options.language || ''}`
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

  async fetchAndCachePageVisitsData(visits: any) {
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

  async updateVisitorStats(dataToPatch: any, type: string) {
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

  async acknowledgeStep(type: string, id: string, stepId: string) {
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

  async markPageVisited(slug: string, type: string, entityId: string) {
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
