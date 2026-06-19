//@ts-nocheck
import { normalizeDimensionToStyle } from '../utils/dimension';

export function handleBannerClick(e: MouseEvent) {
  const target = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
  if (!target) return;
  const action = target.getAttribute('data-action');
  if (action === 'postMessageEvent') {
    const eventName = target.getAttribute('data-post-message-event') || (() => {
      try { return JSON.parse(target.getAttribute('data-action-payload') || '{}').postMessageEvent; } catch (_) { return null; }
    })();
    console.log('[AHDjs] postMessageEvent eventName:', eventName);
    if (eventName) {
      e.stopPropagation();
      window.postMessage({ type: eventName }, '*');
      console.log('[AHDjs] postMessage sent:', { type: eventName });
    }
  }
}

export class BannerRenderer {
  _ahd_active_banner: any = null;
  _ahd_carousel: any = null;

  // acknowledgeAppBanner is passed in so BannerRenderer can call it by the same name
  constructor(private acknowledgeAppBanner: (bannerId: string, slideIds: string[]) => void) {}

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
      slide.addEventListener('click', (e) => handleBannerClick(e));
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
      closeBtn.style.setProperty('--gc-close-foreground', bannerRow?.styles?.iconCloseColor || '#000');
      closeBtn.addEventListener('click', () => this.removeModalBanner());
      const contentContainer = document.createElement('div');
      contentContainer.className = 'gc-modal-content';
      contentContainer.appendChild(carousel);
      modal.appendChild(closeBtn);
      modal.appendChild(contentContainer);
      modalOverlay.appendChild(modal);
      modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) this.removeModalBanner(); });
      document.addEventListener('keydown', function escHandler(e: KeyboardEvent) { if (e.key === 'Escape') { document.removeEventListener('keydown', escHandler); } });
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

    this._ahd_carousel = { carousel, state, handlers: { onTouchStart, onTouchMove, onTouchEnd } };
  }

  private destroyCarousel() {
    const inst = this._ahd_carousel;
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
    } catch (e) { }
    this._ahd_carousel = null;
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
      modal.style.width = normalizeDimensionToStyle(bannerData.styles.width);
    }
    if (bannerData?.styles?.height) {
      modal.style.height = normalizeDimensionToStyle(bannerData.styles.height);
    }

    const closeBtn = document.createElement('div');
    closeBtn.className = 'gc-close';
    closeBtn.style.setProperty('--gc-close-foreground', bannerData?.styles?.iconCloseColor || '#000');
    closeBtn.addEventListener('click', () => this.removeModalBanner());

    const contentContainer = document.createElement('div');
    contentContainer.className = 'gc-modal-content';
    contentContainer.innerHTML = content;
    contentContainer.addEventListener('click', (e) => handleBannerClick(e));

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
    const activeBanner = this._ahd_active_banner;
    if (activeBanner) {
      const { bannerId, slideIds } = activeBanner;
      this.acknowledgeAppBanner(bannerId, slideIds);
      this._ahd_active_banner = null;
    }
    const existingModal = document.querySelector('[data-ahd-modal="true"]');
    if (existingModal) {
      existingModal.remove();
      document.body.style.overflow = '';
    }
  }
}
