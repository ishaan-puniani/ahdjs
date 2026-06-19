//@ts-nocheck
import { LocalStorage } from "ttl-localstorage";
import { AHD_VISITOR_STATS_STORAGE_KEY } from './storage-keys';

const { match } = require("path-to-regexp");

export function resolveSlugPatternForUrl(url: string, cachedData: any): string {
  const allItems = [
    ...(cachedData?.tours || []),
    ...(cachedData?.tooltips || []),
  ];
  for (const item of allItems) {
    if (!item.slug) continue;
    try {
      const matcher = match(item.slug, { decode: decodeURIComponent });
      if (matcher(url)) return item.slug;
    } catch (e) { }
  }
  // Replace MongoDB ObjectIds (24-char hex) or numeric IDs with :id
  return url.replace(/\/([a-f0-9]{24}|[0-9]+)(?=\/|$)/gi, '/:id');
}

export function getApplicabeDataForUrl(
  toursData: any,
  url: string,
  forceShow = false
) {
  const stats = LocalStorage.get(AHD_VISITOR_STATS_STORAGE_KEY) || {};
  const visited = stats?.visited || [];

  return toursData.filter((td) => {
    const slugs = [td.slug, ...(Array.isArray(td.altSlugs) ? td.altSlugs : [])].filter(Boolean);
    const tourFound = slugs.some((slug) => {
      try { return !!match(slug, { decode: decodeURIComponent })(url); } catch (_) { return false; }
    });

    if (!tourFound) return false;
    if (forceShow) return true;
    return !visited.includes(td.slug);
  });
}

export function getUnAcknowledgedHightlightsForUrl(
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
