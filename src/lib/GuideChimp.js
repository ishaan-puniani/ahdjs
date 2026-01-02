/* eslint-disable class-methods-use-this */
/**
 * Copyright (C) 2020 Labs64 GmbH
 *
 * This source code is licensed under the European Union Public License, version 1.2
 * located in the LICENSE file
 */

/**
 * Lodash functions
 * @see https://lodash.com/docs
 */
import _uniqueId from 'lodash/uniqueId';

// utils
import domTemplate from './utils/domTemplate';
import isHtmlElement from './utils/isHtmlElement';

// templates
import overlayTmpl from './templates/overlay.html';
import preloaderTmpl from './templates/preloader.html';
import interactionTmpl from './templates/interaction.html';
import controlTmpl from './templates/control.html';
import tooltipTmpl from './templates/tooltip.html';
import progressbarTmpl from './templates/progressbar.html';
import titleTmpl from './templates/title.html';
import descriptionTmpl from './templates/description.html';
import customButtonsTmpl from './templates/custom-buttons.html';
import previousTmpl from './templates/previous.html';
import paginationTmpl from './templates/pagination.html';
import nextTmpl from './templates/next.html';
import closeTmpl from './templates/close.html';
import copyrightTmpl from './templates/copyright.html';
import notificationTmpl from './templates/notification.html';
import fakeStepTmpl from './templates/fake-step.html';
import { animationMode, DISMISSAL_SETTINGS } from './utils/constants';

export default class GuideChimp {
    /**
     * GuideChimp constructor
     * @param tour
     * @param options
     */
    constructor(tour, options = {}) {
        Object.defineProperty(this, 'uid', {
            value: _uniqueId(),
            enumerable: false,
            configurable: false,
            writable: false,
        });

        this.setDefaults();

        this.cache = new Map();

        this.listeners = {};

        this.observers = {};

        this.options = {};
        this.setOptions(options);

        this.tour = null;
        this.setTour(tour);

        this.notifications = [];

        this.elements = new Map();

        this.init();

        this._rootSpec = this.options.root || null;
        this.rootEl = this.resolveRoot(this._rootSpec);

        this.actions = {
            onNextStep: this.onNextStep.bind(this),
            onPrevStep: this.onPrevStep.bind(this),
            onCloseStep: this.onCloseStep.bind(this),
            onGotoStep: this.onGotoStep.bind(this),
        };


        if (document) {
            document.addEventListener("click", (e) => this.handleClick(e));
        }


    }

    resolveRoot(root) {
        if (!root) return null;
        try {
            if (typeof root === 'string') {
                const el = document.querySelector(root) || null;
                if (!el) {
                    // keep the spec for lazy resolution later
                    return null;
                }
                const tag = (el.tagName || '').toUpperCase();
                const voidTags = new Set(['IMG', 'INPUT', 'BR', 'HR', 'META', 'LINK', 'SOURCE', 'TRACK', 'WBR']);
                if (voidTags.has(tag)) {
                    this.referenceEl = el;
                    this.rootEl = el.parentElement || document.body;
                    return this.rootEl;
                }
                this.referenceEl = el;
                this.rootEl = el;
                return el;
            }
            if (isHtmlElement(root)) {
                const tag = (root.tagName || '').toUpperCase();
                const voidTags = new Set(['IMG', 'INPUT', 'BR', 'HR', 'META', 'LINK', 'SOURCE', 'TRACK', 'WBR']);
                if (voidTags.has(tag)) {
                    this.referenceEl = root;
                    this.rootEl = root.parentElement || document.body;
                    return this.rootEl;
                }
                this.referenceEl = root;
                this.rootEl = root;
                return root;
            }
        } catch (err) {
            return null;
        }
        return null;
    }

    getRootEl() {
        // attempt lazy resolution if a root spec was provided but not yet found
        if (!this.rootEl && this._rootSpec) {
            const resolved = this.resolveRoot(this._rootSpec);
            if (resolved) {
                this.rootEl = resolved;
                return this.rootEl;
            }
        }
        return this.rootEl || document.body;
    }

    getViewportDims() {
        const root = this.getRootEl();
        if (this.referenceEl) {
            const r = this.getElementVisibleRect(this.referenceEl);
            return {
                innerWidth: r.width,
                innerHeight: r.height,
                left: r.left,
                top: r.top,
                right: r.right,
                bottom: r.bottom,
            };
        }
        if (root && root !== document.body) {
            const rect = root.getBoundingClientRect();
            return {
                innerWidth: rect.width,
                innerHeight: rect.height,
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
            };
        }
        return {
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            left: 0,
            top: 0,
            right: window.innerWidth,
            bottom: window.innerHeight,
        };
    }


    getElementVisibleRect(el) {
        if (!el) return new DOMRect(0, 0, 0, 0);
        try {
            const tag = (el.tagName || '').toUpperCase();
            if (tag === 'IMG' && el.naturalWidth && el.naturalHeight) {
                const cs = getComputedStyle(el);
                const objectFit = cs.getPropertyValue('object-fit') || cs.objectFit;
                if (objectFit === 'contain') {
                    const rect = el.getBoundingClientRect();
                    const clientW = Math.max(0, el.clientWidth || rect.width || 0);
                    const clientH = Math.max(0, el.clientHeight || rect.height || 0);
                    const scale = Math.min(clientW / el.naturalWidth, clientH / el.naturalHeight);
                    const dispW = Math.round(el.naturalWidth * scale);
                    const dispH = Math.round(el.naturalHeight * scale);
                    const offsetX = Math.round((clientW - dispW) / 2);
                    const offsetY = Math.round((clientH - dispH) / 2);
                    const left = rect.left + offsetX;
                    const top = rect.top + offsetY;
                    return {
                        left,
                        top,
                        right: left + dispW,
                        bottom: top + dispH,
                        width: dispW,
                        height: dispH,
                        x: left,
                        y: top,
                    };
                }
            }
        } catch (err) {
            // fall back to default bounding rect on any error
        }
        return el.getBoundingClientRect();
    }

    /**
     * Called after construction, this hook allows you to add some extra setup
     * logic without having to override the constructor.
     */
    init() {

    }


    handleClick(e) {

        const action = e.target.getAttribute("data-action");
        if (action && this.actions[action]) {
            this.actions[action]();
        }
    }

    onNextStep() {
        this.next({ event: "change" })
    }

    onPrevStep() {
        this.previous({ event: "change" })
    }

    onCloseStep() {
        this.stop({ event: "change" })
    }
    onGotoStep(index) {
        this.unobserveStep();
        this.unmountStep();
        this.go(index, true, { event: "change" })
    }


    // options -------------------------
    /**
     * Default options
     * @return {Object}
     */
    static getDefaultOptions() {
        return {
            position: 'bottom',
            useKeyboard: true,
            exitEscape: true,
            exitOverlay: false,
            showPagination: true,
            showNavigation: true,
            showProgressbar: true,
            paginationTheme: 'numbers', // if="paginationTheme === 'numbers' || steps.length >= paginationCirclesMaxItems"
            paginationCirclesMaxItems: 10,
            interaction: true,
            padding: 4,
            scrollPadding: 10,
            scrollBehavior: 'auto',
            apiHost: 'https://ahd-be-jggub5n6qq-em.a.run.app',
            toursRefetchIntervalInSec: 86400,
            helpRefetchIntervalInSec: 86400,
            statsCacheIntervalInSec: 86400,
        };
    }

    static getDefaultKeyboardCodes() {
        const escCode = 27;
        const arrowLeftCode = 37;
        const arrowRightCode = 39;
        const enterCode = 13;
        const spaceCode = 32;

        return {
            previous: [arrowLeftCode],
            next: [arrowRightCode, enterCode, spaceCode],
            stop: [escCode],
        };
    }

    static getEventListenersPriorities() {
        return ['low', 'medium', 'high', 'critical'];
    }

    static getBodyClass() {
        return 'gc';
    }

    static getLoadingClass() {
        return 'gc-loading';
    }



    static getFixedClass() {
        return 'gc-fixed';
    }

    static getRelativePositionClass() {
        return 'gc-relative';
    }

    /**
     * Get element offset
     * @param el
     * @return {{top: number, left: number, width: number, height: number}}
     */
    static getOffset(el) {
        const { body, documentElement, defaultView: view } = el.ownerDocument;
        const scrollTop = view.pageYOffset || documentElement.scrollTop || body.scrollTop;
        const scrollLeft = view.pageXOffset || documentElement.scrollLeft || body.scrollLeft;
        const { top, right, bottom, left, width, height, x, y } = el.getBoundingClientRect();
        return { right, bottom, width, height, x, y, top: top + scrollTop, left: left + scrollLeft };
    }

    /**
     * Check if el or his parent has fixed position
     * @param el
     * @return {boolean}
     */
    static isFixed(el) {
        const { parentNode } = el;

        if (!parentNode || parentNode.nodeName === 'HTML') {
            return false;
        }

        const elStyle = getComputedStyle(el);

        if (elStyle.getPropertyValue('position') === 'fixed') {
            return true;
        }

        return this.isFixed(parentNode);
    }

    setDefaults() {
        this.previousStep = null;
        this.currentStep = null;
        this.nextStep = null;
        this.fromStep = null;
        this.toStep = null;

        this.previousStepIndex = -1;
        this.currentStepIndex = -1;
        this.nextStepIndex = -1;
        this.fromStepIndex = -1;
        this.toStepIndex = -1;

        this.steps = [];

        this.isDisplayed = false;

        return this;
    }

    /**
     * Set tour name or steps
     * @param tour
     * @return {this}
     */
    setTour(tour, options = {}) {
        this.tour = tour;
        // this.setOptions(options)
        return this;
    }

    /**
     * Get tour name or steps
     */
    getTour() {
        return this.tour;
    }

    /**
     * Set tour options
     * @param options
     * @return {this}
     */
    setOptions(options) {
        if (!this.options || Object.keys(this.options).length === 0) {
            this.options = { ...this.constructor.getDefaultOptions(), ...options };
        } else {
            this.options = { ...this.options, ...options };
        }
        if (options && Object.prototype.hasOwnProperty.call(options, 'root')) {
            this._rootSpec = options.root;
            const resolved = this.resolveRoot(this._rootSpec);
            if (resolved) this.rootEl = resolved;
        }
        return this;
    }

    /**
     * Get tour options
     */
    getOptions() {
        return this.options;
    }

    /**
     * Start tour
     * @param number step number or it index
     * @param useIndex whether to use step number or index
     * @return {Promise<boolean>}
     */
    async start(number = 0, useIndex = true, ...args) {
        this.isDisplayed = true;

        const root = this.getRootEl();
        if (root && root !== document.body) {
            const rootStyle = getComputedStyle(root);
            if (rootStyle.position === 'static') {
                root.style.position = 'relative';
            }
        }

        this.mountOverlayEl();

        this.startPreloader();

        // emit start event
        await this.emit('onStart', ...args);

        this.stopPreloader();

        if (!this.tour || !this.tour.length) {
            this.removeOverlayEl();
            this.isDisplayed = false;
            return false;
        }

        this.steps = this.sortSteps(this.getSteps(this.tour));

        if (!this.steps.length) {
            this.removeOverlayEl();
            this.isDisplayed = false;
            return false;
        }

        // add a class that increase the specificity of the classes
        document.body.classList.add(this.constructor.getBodyClass());

        const isStarted = await this.go(number, useIndex, ...args);

        this.isDisplayed = isStarted;

        document.body.classList.toggle(this.constructor.getBodyClass(), isStarted);

        if (isStarted) {
            // turn on keyboard navigation
            if (this.options.useKeyboard) {
                this.addOnKeydownListener();
            }

            // on window resize
            this.addOnWindowResizeListener();

            // on window scroll
            this.addOnWindowScrollListener();
            // also listen to root scroll (if different from document.body)
            this.addOnRootScrollListener();
        }

        return isStarted;
    }

    /**
     * Go to step
     * @param number step number or it index
     * @param useIndex whether to use step number or index
     * @param args
     * @return {Promise<boolean>}
     */
    async go(number, useIndex = true, ...args) {
        if (!this.isDisplayed || !this.steps.length) {
            return false;
        }

        const stepNumber = (useIndex) ? parseInt(number, 10) : number;

        if (this.currentStep) {
            // skip if this step is already displayed
            const isSameStep = (useIndex)
                ? (this.currentStepIndex === stepNumber)
                : (this.currentStep.step === stepNumber);

            if (isSameStep) {
                return false;
            }
        }

        const fromStep = this.currentStep;
        const fromStepIndex = this.currentStepIndex;

        const currentStep = (useIndex)
            ? this.steps[stepNumber]
            : this.steps.filter(({ step }) => step === stepNumber)[0];

        if (!currentStep) {
            return false;
        }

        const currentStepIndex = this.steps.indexOf(currentStep);

        const toStep = currentStep;
        const toStepIndex = currentStepIndex;

        const { onBeforeChange, onAfterChange } = toStep;

        this.startPreloader();

        let abort = false;

        if (onBeforeChange) {
            if (await Promise.resolve().then(() => onBeforeChange.call(this, toStep, fromStep, ...args)) === false) {
                abort = true;
            }
        }

        if ((await this.emit('onBeforeChange', toStep, fromStep, ...args)).some((r) => r === false)) {
            abort = true;
        }

        this.stopPreloader();

        if (abort) {
            return false;
        }
        if (fromStep) {
            this.unmountStep();
            this.unobserveStep();
        }
        this.beforeChangeStep({ toStep, toStepIndex, currentStep, currentStepIndex, fromStep, fromStepIndex });

        this.toStep = toStep;
        this.toStepIndex = toStepIndex;

        this.currentStep = currentStep;
        this.currentStepIndex = currentStepIndex;

        this.fromStep = fromStep;
        this.fromStepIndex = fromStepIndex;

        this.previousStep = this.steps[this.currentStepIndex - 1] || null;
        this.previousStepIndex = (this.previousStep) ? this.currentStepIndex - 1 : -1;

        this.nextStep = this.steps[this.currentStepIndex + 1] || null;
        this.nextStepIndex = (this.nextStep) ? this.currentStepIndex + 1 : -1;

        const { scrollBehavior } = this.options;
        const { scrollPadding = this.options.scrollPadding } = this.currentStep;

        // scroll to element
        this.scrollParentsToStepEl();
        this.scrollTo(this.getStepEl(this.currentStep, true), scrollBehavior, scrollPadding);

        this.mountStep();

        setTimeout(() => {
            if (this.getEl('tooltip')) {
                this.scrollTo(this.getEl('tooltip'), scrollBehavior, scrollPadding);
            }
        }, 300);

        if (onAfterChange) {
            onAfterChange.call(this, this.toStep, this.fromStep, ...args);
        }

        this.emit('onAfterChange', this.toStep, this.fromStep, ...args);

        return true;
    }

    async previous(...args) {
        if (!this.isDisplayed || !this.currentStep || !this.previousStep) {
            return false;
        }

        const { onPrevious } = this.currentStep;

        this.startPreloader();

        if (onPrevious) {
            if (await Promise.resolve()
                .then(() => onPrevious.call(this, this.previousStep, this.currentStep, ...args)) === false) {
                this.stopPreloader();
                return false;
            }
        }

        if ((await this.emit('onPrevious', this.previousStep, this.currentStep, ...args)).some((r) => r === false)) {
            this.stopPreloader();
            return false;
        }

        this.stopPreloader();

        return this.go(this.previousStepIndex, true, ...args);
    }

    async next(...args) {
        if (!this.isDisplayed || !this.currentStep || !this.nextStep) {
            return false;
        }

        const { type, id, onNext, stepId } = this.currentStep;

        this.startPreloader();

        if (onNext) {
            if (await Promise.resolve()
                .then(() => onNext.call(this, this.nextStep, this.currentStep, ...args)) === false) {
                this.stopPreloader();
                return false;
            }
        }

        if ((await this.emit('onNext', this.nextStep, this.currentStep, ...args)).some((r) => r === false)) {
            this.stopPreloader();
            return false;
        }

        this.stopPreloader();
        this.acknowledgeStep(type, id, stepId)
        return this.go(this.nextStepIndex, true, ...args);
    }

    async stop(...args) {
        if (!this.isDisplayed) {
            return this;
        }
        const { type, id, stepId } = this.currentStep;
        if (this.currentStepIndex === this.steps.length - 1) {
            this.startPreloader();
            await this.emit('onComplete', ...args);
            this.stopPreloader();
        }

        this.startPreloader();

        // emit stop event
        await this.emit('onStop', ...args);

        this.stopPreloader();

        // remove the class that increase the specificity of the classes
        document.body.classList.remove(this.constructor.getBodyClass());

        // remove events listeners
        this.removeListeners();

        // disconnect observers
        this.unobserveStep();

        // remove all layers and keys
        this.unmountStep();

        this.removeOverlayEl();

        this.cache.clear();
        this.elements.clear();


        this.setDefaults();
        this.acknowledgeStep(type, id, stepId)
        return this;
    }

    getSteps(tour) {
        if (!tour || !tour.length) {
            return [];
        }

        return (typeof tour === 'string')
            ? this.getDataSteps(tour)
            : this.getJsSteps(tour);
    }

    getDataSteps(tour) {
        const dataPrefix = 'data-guidechimp';
        let tourStepsEl = Array.from(document.querySelectorAll(`[${dataPrefix}-tour*='${tour}']`));
        tourStepsEl = tourStepsEl.filter((v) => {
            const tours = v.getAttribute(`${dataPrefix}-tour`).split(',');
            return tours.includes(this.tour);
        });

        const dataTourRegExp = new RegExp(`^${dataPrefix}-${tour}-[^-]+$`);
        const dataGlobalRegExp = new RegExp(`^${dataPrefix}-[^-]+$`);

        return tourStepsEl.map((el, i) => {
            const stepAttrs = {};

            for (let j = 0; j < el.attributes.length; j++) {
                const { name: attrName, value: attrValue } = el.attributes[j];

                const isTourAttr = dataTourRegExp.test(attrName);
                const isGlobalAttr = (isTourAttr) ? false : dataGlobalRegExp.test(attrName);

                if (isTourAttr || isGlobalAttr) {
                    const attrShortName = (isTourAttr)
                        ? attrName.replace(`${dataPrefix}-${tour}-`, '')
                        : attrName.replace(`${dataPrefix}-`, '');

                    if (attrShortName !== 'tour') {
                        if (isTourAttr || (isGlobalAttr && !stepAttrs[attrShortName])) {
                            stepAttrs[attrShortName] = attrValue;
                        }
                    }
                }
            }

            return {
                step: i,
                title: '',
                description: '',
                position: this.options.position,
                interaction: this.options.interaction,
                ...stepAttrs,
                element: el,
            };
        });
    }

    getJsSteps(tour) {
        return tour.map((v, i) => ({ ...v, step: v.step || i }));
    }

    sortSteps(steps) {
        const copy = [...steps];

        return copy.sort((a, b) => {
            if (a.step < b.step) {
                return -1;
            }
            if (a.step > b.step) {
                return 1;
            }
            return 0;
        });
    }

    getStepEl(step) {
        const { element, top, left, width, height, canvasWidth, canvasHeight } = step || {};

        if (element) {
            const getEl = (selector, def = null) => {
                try {
                    const el = (typeof selector === 'string')
                        ? document.querySelector(selector)
                        : selector;
                    return el || def;
                } catch (error) {
                    return def;
                }
            };

            let el = getEl(element);

            if (!el ||
                el.style.display === 'none' ||
                el.style.visibility === 'hidden' ||
                (el.offsetWidth === 0 && el.offsetHeight === 0)) {
                el = this.getEl('fakeStep') ? this.getEl('fakeStep') : this.mountFakeStepEl();
            }

            return el;
        }

        if (top !== undefined && left !== undefined && width && height) {
            return this.mountOffsetFakeStepEl({ top, left, width, height, canvasWidth, canvasHeight });
        }
        return this.mountFakeStepEl();
    }

    scrollParentsToStepEl() {
        const { scrollPadding = this.options.scrollPadding } = this.currentStep;
        return this.scrollParentsToEl(this.getStepEl(this.currentStep), scrollPadding);
    }

    getScrollableParentsEls(el) {
        const parents = [];
        let htmlEl = el;

        while (htmlEl && htmlEl !== htmlEl.ownerDocument.body) {
            htmlEl = this.getScrollableParentEl(htmlEl);
            parents.push(htmlEl);
        }

        return parents;
    }

    getScrollableParentEl(el) {
        const regex = /(auto|scroll)/;
        const elStyle = getComputedStyle(el);
        const elDocument = el.ownerDocument;

        const getClosestScrollableParent = (parent) => {
            if (!parent || parent === elDocument.body) {
                return elDocument.body;
            }

            const parentStyle = getComputedStyle(parent);

            if (elStyle.getPropertyValue('position') === 'fixed'
                && parentStyle.getPropertyValue('position') === 'static') {
                return getClosestScrollableParent(parent.parentElement);
            }

            const overflowX = parentStyle.getPropertyValue('overflow-x');
            const overflowY = parentStyle.getPropertyValue('overflow-y');

            if (regex.test(overflowX) || regex.test(overflowY)) {
                return parent;
            }

            return getClosestScrollableParent(parent.parentElement);
        };

        return (elStyle.getPropertyValue('position') === 'fixed')
            ? elDocument.body
            : getClosestScrollableParent(el.parentElement);
    }

    scrollParentsToEl(el, scrollPadding = 0) {
        const parents = this.getScrollableParentsEls(el);

        parents.forEach((parent) => {
            if (parent !== document.body) {
                // eslint-disable-next-line no-param-reassign
                parent.scrollTop = el.offsetTop - parent.offsetTop - scrollPadding;
                // eslint-disable-next-line no-param-reassign
                parent.scrollLeft = el.offsetLeft - parent.offsetLeft - scrollPadding;
            }
        });

        return this;
    }

    scrollTo(el, behavior = 'auto', scrollPadding = 0) {
        const { top, bottom, left, right } = el.getBoundingClientRect();
        const { innerWidth, innerHeight } = this.getViewportDims();

        if (!(left >= 0 && right <= innerWidth)) {
            window.scrollBy({ behavior, left: left - scrollPadding });
        }

        if (!(top >= 0 && bottom <= innerHeight)) {
            window.scrollBy({ behavior, top: top - scrollPadding });
        }

        return this;
    }

    highlightStepEl(animation = false) {
        const el = this.getStepEl(this.currentStep);

        const overlay = this.getEl('overlay');

        if (overlay) {
            const path = overlay.querySelector('path');
            const animate = path.querySelector('animate');

            const hasElement = this.currentStep?.element;
            const hasTop = this.currentStep?.top !== undefined;
            const hasLeft = this.currentStep?.left !== undefined;
            const hasWidth = this.currentStep?.width;
            const hasHeight = this.currentStep?.height;

            const isCurrentElFake = this.isEl(el, 'fakeStep');
            const isTopLeftWithDimensions = !hasElement && hasTop && hasLeft && hasWidth && hasHeight;

            const to = (isCurrentElFake && !isTopLeftWithDimensions)
                ? this.getOverlayDocumentPath()
                : this.getOverlayStepPath(this.currentStep);

            path.setAttribute('d', to);

            if (animate) {
                const lock = animate.getAttribute('lock');

                if (!lock) {
                    animate.setAttribute('from', to);
                    animate.setAttribute('to', to);
                }

                if (animation) {
                    const isFromElFake = this.isEl(this.getStepEl(this.fromStep), 'fakeStep');

                    const from = (this.fromStep && !isFromElFake && !isCurrentElFake)
                        ? this.getOverlayStepPath(this.fromStep)
                        : null;

                    if (from) {
                        animate.setAttribute('from', from);
                        animate.setAttribute('to', to);
                    }

                    animate.setAttribute('lock', 'true');
                }

                animate.onend = () => {
                    animate.removeAttribute('lock');
                };

                animate.beginElement();
            }
        }

        const hasElement = this.currentStep?.element;
        const hasCoordinates = !hasElement &&
            this.currentStep?.top !== undefined &&
            this.currentStep?.left !== undefined &&
            this.currentStep?.width &&
            this.currentStep?.height;

        if (!hasCoordinates) {
            const elStyle = getComputedStyle(el);

            if (!['absolute', 'relative', 'fixed'].includes(elStyle.getPropertyValue('position'))) {
                el.classList.add(this.constructor.getRelativePositionClass());
            }

        }

        el.setAttribute(`data-guidechimp-${this.uid}`, 'highlight');
        this.elements.set('highlight', el);

        return this;
    }

    resetHighlightStepEl() {
        const overlay = this.getEl('overlay');

        if (overlay) {
            const path = overlay.querySelector('path');
            const animate = overlay.querySelector('animate');

            path.setAttribute('d', this.getOverlayDocumentPath());

            if (animate) {
                animate.removeAttribute('from');
                animate.removeAttribute('to');
            }
        }

        const el = this.getStepEl(this.currentStep);

        const hasElement = this.currentStep?.element;
        const hasCoordinates = !hasElement &&
            this.currentStep?.top !== undefined &&
            this.currentStep?.left !== undefined &&
            this.currentStep?.width &&
            this.currentStep?.height;

        if (!hasCoordinates) {
            el.classList.remove(this.constructor.getRelativePositionClass());
        }

        el.removeAttribute(`data-guidechimp-${this.uid}`);
        this.elements.delete('highlight');

        return this;
    }

    setInteractionPosition(interactionEl) {
        const hasElement = this.currentStep?.element;
        const hasTop = this.currentStep?.top !== undefined;
        const hasLeft = this.currentStep?.left !== undefined;
        const hasWidth = this.currentStep?.width;
        const hasHeight = this.currentStep?.height;

        if (!hasElement && hasTop && hasLeft && hasWidth && hasHeight) {
            if (!interactionEl) {
                return this;
            }

            let { padding } = this.options;

            const { innerWidth, innerHeight } = this.getViewportDims();
            const convertToPx = (value, axis) => {
                if (typeof value === 'string' && value.trim().endsWith('%')) {
                    const percentage = parseFloat(value) || 0;
                    return (axis === 'x')
                        ? (percentage / 100) * innerWidth
                        : (percentage / 100) * innerHeight;
                }
                return typeof value === 'number' ? value : parseFloat(value) || 0;
            };

            const root = this.getRootEl();
            const hasCustomRoot = root && root !== document.body;

            // Coordinates are root-relative
            const top = convertToPx(this.currentStep.top, 'y');
            const left = convertToPx(this.currentStep.left, 'x');
            const width = convertToPx(this.currentStep.width, 'x');
            const height = convertToPx(this.currentStep.height, 'y');

            const { style } = interactionEl;

            if (hasCustomRoot) {
                style.cssText = `position: absolute;
                width: ${width + padding}px;
                height: ${height + padding}px;
                top: ${top - (padding / 2)}px;
                left: ${left - (padding / 2)}px;
                z-index: 6403;`;
            } else {
                style.cssText = `position: fixed;
                width: ${width + padding}px;
                height: ${height + padding}px;
                top: ${top - (padding / 2)}px;
                left: ${left - (padding / 2)}px;
                z-index: 6403;`;
            }

            return this;
        }

        const el = this.getStepEl(this.currentStep);

        if (!interactionEl || !el) {
            return this;
        }

        let { padding } = this.options;

        const elStyle = getComputedStyle(el);

        if (elStyle.getPropertyValue('position') === 'floating') {
            padding = 0;
        }

        const { width, height, top, left } = this.constructor.getOffset(el);

        interactionEl.classList.toggle(this.constructor.getFixedClass(), this.constructor.isFixed(el));

        const { style } = interactionEl;

        style.cssText = `width: ${width + padding}px;
        height: ${height + padding}px;
        top: ${top - (padding / 2)}px;
        left: ${left - (padding / 2)}px;`;

        return this;
    }

    setControlPosition(controlEl) {
        const hasElement = this.currentStep?.element;
        const hasTop = this.currentStep?.top !== undefined;
        const hasLeft = this.currentStep?.left !== undefined;
        const hasWidth = this.currentStep?.width;
        const hasHeight = this.currentStep?.height;

        if (!hasElement && hasTop && hasLeft && hasWidth && hasHeight) {
            if (!controlEl) {
                return this;
            }

            const { style } = controlEl;
            style.position = 'fixed';
            style.width = 'auto';
            style.height = 'auto';
            style.top = '0';
            style.left = '0';
            style.right = '0';
            style.bottom = '0';
            style.pointerEvents = 'auto';
            style.visibility = 'visible';

            return this;
        }

        const el = this.getStepEl(this.currentStep);
        if (this.options.type === "snackbar") {
            switch (this.currentStep.position) {
                case "top": {
                    el.style.top = 0;
                    break;
                }
                case "topRight": {
                    el.style.top = "100px";
                    el.style.left = "400px";

                    controlEl.style.top = "100px";
                    controlEl.style.left = "400px";

                }
            }
        }
        if (!controlEl || !el) {
            return this;
        }

        let { padding } = this.options;

        const elStyle = getComputedStyle(el);

        if (elStyle.getPropertyValue('position') === 'floating') {
            padding = 0;
        }

        const { pageXOffset } = el.ownerDocument.defaultView;
        const { width: docElWidth } = el.ownerDocument.documentElement.getBoundingClientRect();
        const { height: elHeight, top: elTop, left: elLeft, right: elRight } = this.constructor.getOffset(el);

        const height = elHeight + padding;
        const top = elTop - (padding / 2);
        const left = (pageXOffset < pageXOffset + (elLeft - (padding / 2))) ? pageXOffset : (elLeft - (padding / 2));
        let width = (pageXOffset + docElWidth > pageXOffset + (elRight + (padding / 2)))
            ? docElWidth
            : (elRight + (padding / 2));

        // Clamp width so the control doesn't overflow the viewport when 'left' is non-zero
        const maxAvailableWidth = Math.max(0, (pageXOffset + docElWidth) - left);
        width = Math.max(0, Math.min(width, maxAvailableWidth));

        controlEl.classList.toggle(this.constructor.getFixedClass(), this.constructor.isFixed(el));
        const { style } = controlEl;
        style.cssText = `width: ${width}px;
        height: ${height}px;
        top: ${top}px;
        left: ${left}px;`;

        return this;
    }

    setTooltipPosition(tooltipEl, options = {}) {
        if (!this.currentStep) {
            return this;
        }

        if (!tooltipEl) {
            return this;
        }

        const clampToViewport = (el, pad = 0, depth = 0) => {
            if (!el) return;
            try {
                const elStyleCheck = el.style || {};
                if (elStyleCheck.transform && elStyleCheck.transform.indexOf('translate(-50%') !== -1) {
                    return;
                }
            } catch (err) {
                console.log(err)
            }
            const gutter = Math.max(pad, 0);
            const root = this.getRootEl();
            const hasCustomRoot = root && root !== document.body;
            const { innerWidth, innerHeight } = this.getViewportDims();
            const elRect = el.getBoundingClientRect();
            const { width, height } = elRect;

            let left, top;
            if (hasCustomRoot) {
                const rootRect = root.getBoundingClientRect();
                left = elRect.left - rootRect.left;
                top = elRect.top - rootRect.top;
            } else {
                left = elRect.left;
                top = elRect.top;
            }

            let newLeft = left;
            let newTop = top;
            let changed = false;

            if (left < gutter) {
                newLeft = gutter;
                changed = true;
            } else if (left + width > innerWidth - gutter) {
                newLeft = Math.max(gutter, innerWidth - gutter - width);
                changed = true;
            }

            if (top < gutter) {
                newTop = gutter;
                changed = true;
            } else if (top + height > innerHeight - gutter) {
                newTop = Math.max(gutter, innerHeight - gutter - height);
                changed = true;
            }

            const s = el.style;
            if (!s.top || s.top === 'auto') {
                s.top = `${top}px`;
                changed = true;
            }
            if (!s.left || s.left === 'auto') {
                s.left = `${left}px`;
                changed = true;
            }

            if (changed) {
                s.right = 'auto';
                s.bottom = 'auto';
                // s.transform = 'none';
                s.left = `${newLeft}px`;
                s.top = `${newTop}px`;
            }

            if (depth < 2) {
                requestAnimationFrame(() => {
                    const elRect2 = el.getBoundingClientRect();
                    let l2, t2;
                    if (hasCustomRoot) {
                        const rootRect2 = root.getBoundingClientRect();
                        l2 = elRect2.left - rootRect2.left;
                        t2 = elRect2.top - rootRect2.top;
                    } else {
                        l2 = elRect2.left;
                        t2 = elRect2.top;
                    }
                    const w2 = elRect2.width;
                    const h2 = elRect2.height;
                    if (
                        l2 < gutter ||
                        l2 + w2 > innerWidth - gutter ||
                        t2 < gutter ||
                        t2 + h2 > innerHeight - gutter
                    ) {
                        clampToViewport(el, 0, depth + 1);
                    }
                });
                setTimeout(() => clampToViewport(el, 0, depth + 1), 50);
            }
        };

        let { boundary, position: pos } = options;
        let { padding } = this.options;

        boundary = boundary || window;

        pos = pos || this.currentStep.position;
        pos = pos || this.options.position;

        let [position, alignment] = pos.split('-');

        const { style: tooltipStyle } = tooltipEl;

        tooltipStyle.top = null;
        tooltipStyle.right = null;
        tooltipStyle.bottom = null;
        tooltipStyle.left = null;
        tooltipStyle.transform = null;
        tooltipStyle.animation = null;
        tooltipStyle.position = 'fixed';
        tooltipStyle.zIndex = '10001';
        tooltipStyle.visibility = "hidden";
        setTimeout(() => {
            tooltipStyle.visibility = "visible";
        }, this.currentStep.delay || 1000);


        const overlayEls = document.getElementsByClassName("gc-overlay");

        if (overlayEls.length > 0) {
            const overlayEl = overlayEls[0];
            if (this.currentStep && this.currentStep.isBackdrop) {
                overlayEl.classList.remove("gc-overlay-hidden");
            } else {
                overlayEl.classList.add("gc-overlay-hidden");
            }
        }

        if (this.currentStep?.dismissalSetting === DISMISSAL_SETTINGS.dismissButtonClickOnly
            || this.currentStep?.dismissalSetting === DISMISSAL_SETTINGS.buttonClickOnly
        ) {
            this.setOptions({
                exitOverlay: false,
            })
        } else {
            this.setOptions({
                exitOverlay: true,
            })
        }

        if (this.currentStep?.dismissalSetting === DISMISSAL_SETTINGS.onOutsideClick) {
            this.setOptions({
                exitOverlay: true,
            })
        }

        const hasElement = this.currentStep.element;
        const hasTop = this.currentStep?.top !== undefined;
        const hasLeft = this.currentStep?.left !== undefined;
        const hasWidth = this.currentStep?.width;
        const hasHeight = this.currentStep?.height;

        if (!hasElement && hasTop && hasLeft && hasWidth && hasHeight) {
            const root = this.getRootEl();
            const hasCustomRoot = root && root !== document.body;

            tooltipEl.setAttribute('data-guidechimp-position', 'top-left');
            tooltipStyle.position = hasCustomRoot ? 'absolute' : 'fixed';
            tooltipStyle.zIndex = '10000';
            tooltipStyle.visibility = 'visible';
            tooltipStyle.pointerEvents = 'auto';

            const parsePct = (v, axis) => {
                const { innerWidth, innerHeight } = this.getViewportDims();
                if (typeof v === 'string' && v.trim().endsWith('%')) {
                    const pct = parseFloat(v) || 0;
                    const px = (axis === 'x') ? (pct / 100) * innerWidth : (pct / 100) * innerHeight;
                    return { isPct: true, pct, px, raw: v.trim() };
                }
                const px = (typeof v === 'number') ? v : parseFloat(v) || 0;
                return { isPct: false, px, raw: `${px}px` };
            };

            const topInfo = parsePct(this.currentStep.top, 'y');
            const leftInfo = parsePct(this.currentStep.left, 'x');
            const widthInfo = parsePct(this.currentStep.width, 'x');
            const heightInfo = parsePct(this.currentStep.height, 'y');
            const widthPx = widthInfo.px;
            const heightPx = heightInfo.px;

            const topPx = topInfo.px;
            const leftPx = leftInfo.px;

            const { padding } = this.options;
            const { height: tooltipHeight, width: tooltipWidth } = tooltipEl.getBoundingClientRect();

            const { innerWidth: viewportWidth, innerHeight: viewportHeight } = this.getViewportDims();

            const spaceRight = viewportWidth - (leftInfo.px + widthPx);
            const spaceLeft = leftInfo.px;
            const spaceBottom = viewportHeight - (topInfo.px + heightPx);
            const spaceTop = topInfo.px;


            tooltipStyle.top = 'auto';
            tooltipStyle.left = 'auto';
            tooltipStyle.right = 'auto';
            tooltipStyle.bottom = 'auto';
            // tooltipStyle.transform = 'none';


            let configuredPosition = this.currentStep.position || pos || 'right';

            const canFitTop = spaceTop >= tooltipHeight + padding;
            const canFitBottom = spaceBottom >= tooltipHeight + padding;
            const canFitLeft = spaceLeft >= tooltipWidth + padding;
            const canFitRight = spaceRight >= tooltipWidth + padding;

            if (!canFitTop && !canFitBottom && !canFitLeft && !canFitRight) {
                const maxSpace = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
                if (maxSpace === spaceRight) configuredPosition = 'right';
                else if (maxSpace === spaceBottom) configuredPosition = 'bottom';
                else if (maxSpace === spaceLeft) configuredPosition = 'left';
                else configuredPosition = 'top';
            } else {
                switch (configuredPosition) {
                    case 'top':
                    case 'top-left':
                    case 'top-right':
                        if (!canFitTop) {
                            if (canFitBottom) configuredPosition = 'bottom';
                            else if (canFitRight) configuredPosition = 'right';
                            else if (canFitLeft) configuredPosition = 'left';
                        }
                        break;
                    case 'bottom':
                    case 'bottom-left':
                    case 'bottom-right':
                        if (!canFitBottom) {
                            if (canFitTop) configuredPosition = 'top';
                            else if (canFitRight) configuredPosition = 'right';
                            else if (canFitLeft) configuredPosition = 'left';
                        }
                        break;
                    case 'left':
                        if (!canFitLeft) {
                            if (canFitRight) configuredPosition = 'right';
                            else if (canFitBottom) configuredPosition = 'bottom';
                            else if (canFitTop) configuredPosition = 'top';
                        }
                        break;
                    case 'right':
                        if (!canFitRight) {
                            if (canFitLeft) configuredPosition = 'left';
                            else if (canFitBottom) configuredPosition = 'bottom';
                            else if (canFitTop) configuredPosition = 'top';
                        }
                        break;
                }
            }
            switch (configuredPosition) {
                case 'top':
                    position = 'top';
                    tooltipStyle.bottom = `${viewportHeight - topPx + padding}px`;
                    tooltipStyle.left = `${leftPx + (widthPx / 2) - (tooltipWidth / 2)}px`;
                    break;
                case 'top-left':
                    position = 'top-left';
                    tooltipStyle.top = `${topPx - tooltipHeight - padding}px`;
                    tooltipStyle.right = `${viewportWidth - leftPx + padding}px`;

                    break;
                case 'top-right':
                    position = 'top-right';
                    tooltipStyle.top = `${topPx - tooltipHeight - padding}px`;
                    tooltipStyle.left = `${leftPx + widthPx + padding}px`;
                    break;
                case 'bottom':
                    position = 'bottom';
                    tooltipStyle.top = `${topPx + heightPx + padding}px`;
                    tooltipStyle.left = `${leftPx + (widthPx / 2) - (tooltipWidth / 2)}px`;
                    break;
                case 'bottom-left':
                    position = 'bottom-left';

                    tooltipStyle.top = `${topPx + heightPx + padding}px`;
                    tooltipStyle.right = `${viewportWidth - leftPx + padding}px`;
                    break;
                case 'bottom-right':
                    position = 'bottom-right';
                    tooltipStyle.top = `${topPx + heightPx + padding}px`;
                    tooltipStyle.left = `${leftPx + widthPx + padding}px`;
                    break;
                case 'left':
                    position = 'left';
                    tooltipStyle.top = `${topPx + (heightPx / 2) - (tooltipHeight / 2)}px`;
                    tooltipStyle.left = `${leftPx - tooltipWidth}px`;
                    break;
                case 'center':
                    position = 'center';
                    tooltipStyle.top = `${topPx + (heightPx / 2) - (tooltipHeight / 2)}px`;
                    tooltipStyle.left = `${leftPx + (widthPx / 2) - (tooltipWidth / 2)}px`;
                    break;
                case 'right':
                default:
                    position = 'right';
                    tooltipStyle.top = `${topPx + (heightPx / 2) - (tooltipHeight / 2)}px`;
                    tooltipStyle.left = `${leftPx + widthPx + padding}px`;
                    break;
            }

            const clamp = (v, a, b) => Math.max(a, Math.min(v, b));

            let computedTop = null;
            if (tooltipStyle.top && tooltipStyle.top !== 'auto') {
                computedTop = parseFloat(tooltipStyle.top) || 0;
            } else if (tooltipStyle.bottom && tooltipStyle.bottom !== 'auto') {
                const bottomPx = parseFloat(tooltipStyle.bottom) || 0;
                computedTop = viewportHeight - bottomPx - tooltipHeight;
            }

            let computedLeft = null;
            if (tooltipStyle.left && tooltipStyle.left !== 'auto') {
                computedLeft = parseFloat(tooltipStyle.left) || 0;
            } else if (tooltipStyle.right && tooltipStyle.right !== 'auto') {
                const rightPx = parseFloat(tooltipStyle.right) || 0;
                computedLeft = viewportWidth - rightPx - tooltipWidth;
            }

            const pad = (viewportWidth >= 1024) ? 0 : Math.max(0, padding || 0);
            if (computedTop !== null) {
                const clampedTop = clamp(computedTop, pad, Math.max(pad, viewportHeight - tooltipHeight - pad));
                tooltipStyle.top = `${clampedTop}px`;
                tooltipStyle.bottom = 'auto';
            }
            if (computedLeft !== null) {
                const clampedLeft = clamp(computedLeft, pad, Math.max(pad, viewportWidth - tooltipWidth - pad));
                tooltipStyle.left = `${clampedLeft}px`;
                tooltipStyle.right = 'auto';
            }

            tooltipEl.setAttribute('data-guidechimp-position', `${position}`);

            if (overlayEls.length > 0) {
                const overlayEl = overlayEls[0];
                if (this.currentStep && this.currentStep.isBackdrop) {
                    overlayEl.classList.remove("gc-overlay-hidden");
                } else {
                    overlayEl.classList.add("gc-overlay-hidden");
                }
            }

            if (this.currentStep.animationType) {
                tooltipStyle.animation = animationMode(this.currentStep.animationType);
            }

            clampToViewport(tooltipEl, 0);
            return this;
        } else if (!hasElement && (hasTop || hasLeft)) {
            tooltipEl.setAttribute('data-guidechimp-position', 'top-left');
            tooltipStyle.position = 'fixed';
            tooltipStyle.zIndex = '10000';
            tooltipStyle.visibility = 'visible';

            const root = this.getRootEl();
            const hasCustomRoot = root && root !== document.body;
            const { innerWidth, innerHeight } = this.getViewportDims();

            tooltipStyle.position = hasCustomRoot ? 'absolute' : 'fixed';

            if (hasTop) {
                const topVal = this.currentStep.top;
                let topPx;
                if (typeof topVal === 'string' && topVal.trim().endsWith('%')) {
                    topPx = (parseFloat(topVal) || 0) / 100 * innerHeight;
                } else {
                    topPx = (typeof topVal === 'number') ? topVal : parseFloat(topVal) || 0;
                }
                tooltipStyle.top = `${topPx}px`;
            }
            if (hasLeft) {
                const leftVal = this.currentStep.left;
                let leftPx;
                if (typeof leftVal === 'string' && leftVal.trim().endsWith('%')) {
                    leftPx = (parseFloat(leftVal) || 0) / 100 * innerWidth;
                } else {
                    leftPx = (typeof leftVal === 'number') ? leftVal : parseFloat(leftVal) || 0;
                }
                tooltipStyle.left = `${leftPx}px`;
            }

            if (overlayEls.length > 0) {
                const overlayEl = overlayEls[0];
                if (this.currentStep && this.currentStep.isBackdrop) {
                    overlayEl.classList.remove("gc-overlay-hidden");
                } else {
                    overlayEl.classList.add("gc-overlay-hidden");
                }
            }

            if (this.currentStep.animationType) {
                tooltipStyle.animation = animationMode(this.currentStep.animationType);
            }

            clampToViewport(tooltipEl, 0);
            return this;
        } else if (!hasElement && !hasTop && !hasLeft) {
            const root = this.getRootEl();
            const hasCustomRoot = root && root !== document.body;

            tooltipEl.setAttribute('data-guidechimp-position', 'floating');
            tooltipStyle.position = hasCustomRoot ? 'absolute' : 'fixed';
            tooltipStyle.left = '50%';
            tooltipStyle.top = '50%';
            tooltipStyle.transform = 'translate(-50%, -50%)';
            tooltipStyle.zIndex = '10000';
            tooltipStyle.visibility = 'visible';

            if (overlayEls.length > 0) {
                const overlayEl = overlayEls[0];
                if (!overlayEl.classList.contains("gc-overlay-hidden")) {
                    overlayEl.classList.add("gc-overlay-hidden");
                }
            }

            if (this.currentStep.animationType) {
                tooltipStyle.animation = animationMode(this.currentStep.animationType);
            }

            clampToViewport(tooltipEl, 0);
            return this;
        } else {
            const el = this.getStepEl(this.currentStep);

            if (!el) {
                return this;
            }

            const elStyle = getComputedStyle(el);

            if (elStyle.getPropertyValue('position') === 'floating') {
                padding = 0;
            }

            const isFakeOrNotFound = this.isEl(el, 'fakeStep');

            if (isFakeOrNotFound) {
                tooltipEl.setAttribute('data-guidechimp-position', 'floating');
                tooltipStyle.position = 'fixed';
                tooltipStyle.left = '50%';
                tooltipStyle.top = '50%';
                tooltipStyle.transform = 'translate(-50%, -50%)';
                tooltipStyle.zIndex = '10000';
                tooltipStyle.visibility = 'visible';

                if (overlayEls.length > 0) {
                    const overlayEl = overlayEls[0];
                    if (this.currentStep && this.currentStep.isBackdrop) {
                        overlayEl.classList.remove("gc-overlay-hidden");
                    } else {
                        overlayEl.classList.add("gc-overlay-hidden");
                    }
                }

                if (this.currentStep.animationType) {
                    tooltipStyle.animation = animationMode(this.currentStep.animationType);
                }

                clampToViewport(tooltipEl, 0);
                return this;
            }

            const elRect = this.getElementVisibleRect(el);
            const {
                top: elTop,
                bottom: elBottom,
                left: elLeft,
                right: elRight,
                width: elWidth,
                height: elHeight,
            } = elRect;

            const { height: tooltipHeight, width: tooltipWith } = tooltipEl.getBoundingClientRect();

            const cloneTooltip = tooltipEl.cloneNode(true);
            cloneTooltip.style.visibility = 'hidden';
            cloneTooltip.innerHTML = '';

            tooltipEl.parentElement.appendChild(cloneTooltip);

            const { width: minTooltipWidth } = cloneTooltip.getBoundingClientRect();

            cloneTooltip.parentElement.removeChild(cloneTooltip);

            let boundaryRect = new DOMRect(0, 0, window.innerWidth, window.innerHeight);

            if (!(boundary instanceof Window)) {
                const { x, y } = boundary.getBoundingClientRect();
                boundaryRect = new DOMRect(x, y, boundary.scrollWidth, boundary.scrollHeight);
            }

            const {
                top: boundaryTop,
                bottom: boundaryBottom,
                left: boundaryLeft,
                right: boundaryRight,
            } = boundaryRect;
            if (this.isEl(el, 'fakeStep')) {
                position = 'floating';
            } else {
                const positions = ['bottom', 'right', 'left', 'top'];
                let {
                    marginTop: tooltipMarginTop,
                    marginLeft: tooltipMarginLeft,
                    marginRight: tooltipMarginRight,
                    marginBottom: tooltipMarginBottom,
                } = getComputedStyle(tooltipEl);

                tooltipMarginTop = parseInt(tooltipMarginTop, 10);
                tooltipMarginLeft = parseInt(tooltipMarginLeft, 10);
                tooltipMarginRight = parseInt(tooltipMarginRight, 10);
                tooltipMarginBottom = parseInt(tooltipMarginBottom, 10);

                if (tooltipHeight + tooltipMarginTop + tooltipMarginBottom > (elTop - boundaryTop)) {
                    positions.splice(positions.indexOf('top'), 1);
                }

                if (tooltipHeight + tooltipMarginTop + tooltipMarginBottom > boundaryBottom - elBottom) {
                    positions.splice(positions.indexOf('bottom'), 1);
                }

                if (minTooltipWidth + tooltipMarginLeft + tooltipMarginRight > elLeft - boundaryLeft) {
                    positions.splice(positions.indexOf('left'), 1);
                }

                if (minTooltipWidth + tooltipMarginLeft + tooltipMarginRight > boundaryRight - elRight) {
                    positions.splice(positions.indexOf('right'), 1);
                }

                if (positions.length) {
                    position = positions.includes(position) ? position : positions[0];
                } else {
                    position = 'floating';
                }

                if (position === 'top' || position === 'bottom') {
                    const alignments = ['left', 'right', 'middle'];

                    if (boundaryRight - elLeft < minTooltipWidth) {
                        alignments.splice(alignments.indexOf('left'), 1);
                    }

                    if (elRight - boundaryLeft < minTooltipWidth) {
                        alignments.splice(alignments.indexOf('right'), 1);
                    }

                    if (((elLeft + (elWidth / 2)) - boundaryLeft) < (minTooltipWidth / 2)
                        || (boundaryRight - (elRight - (elWidth / 2))) < (minTooltipWidth / 2)) {
                        alignments.splice(alignments.indexOf('middle'), 1);
                    }

                    if (alignments.length) {
                        alignment = alignments.includes(alignment) ? alignment : alignments[0];
                    } else {
                        alignment = 'middle';
                    }
                }
            }

            tooltipEl.setAttribute('data-guidechimp-position', position);

            const root = document.documentElement;

            if (this.currentStep.animationType) {
                tooltipStyle.animation = animationMode(this.currentStep.animationType);
            }

            // compute tooltip top/left in viewport coordinates and clamp to viewport
            const elCenterY = elTop + (elHeight / 2);
            const elCenterX = elLeft + (elWidth / 2);

            let computedTop = null;
            let computedLeft = null;

            switch (position) {
                case 'top':
                    computedTop = Math.round(elTop - tooltipHeight - padding);
                    computedLeft = Math.round(elCenterX - (tooltipWith / 2));
                    break;
                case 'right':
                    computedLeft = Math.round(elRight + padding);
                    computedTop = Math.round(elCenterY - (tooltipHeight / 2));
                    break;
                case 'left':
                    computedLeft = Math.round(elLeft - tooltipWith - padding);
                    computedTop = Math.round(elCenterY - (tooltipHeight / 2));
                    break;
                case 'bottom':
                    computedTop = Math.round(elBottom + padding);
                    computedLeft = Math.round(elCenterX - (tooltipWith / 2));
                    break;
                default:
                    {
                        const { innerWidth, innerHeight } = this.getViewportDims();
                        computedLeft = Math.round((innerWidth / 2) - (tooltipWith / 2));
                        computedTop = Math.round((innerHeight / 2) - (tooltipHeight / 2));
                    }
            }

            // alignment adjustments for top/bottom positions
            if (position === 'top' || position === 'bottom') {
                if (alignment === 'left') {
                    computedLeft = Math.round(elLeft - (padding / 2));
                } else if (alignment === 'right') {
                    computedLeft = Math.round(elRight - tooltipWith + (padding / 2));
                }
            }

            // clamp to viewport
            const clamp = (v, a, b) => Math.max(a, Math.min(v, b));
            if (computedTop !== null) {
                const { innerHeight } = this.getViewportDims();
                const topClamped = clamp(computedTop, 0, Math.max(0, innerHeight - tooltipHeight));
                tooltipStyle.top = `${topClamped}px`;
            }
            if (computedLeft !== null) {
                const { innerWidth } = this.getViewportDims();
                const leftClamped = clamp(computedLeft, 0, Math.max(0, innerWidth - tooltipWith));
                tooltipStyle.left = `${leftClamped}px`;
            }
            tooltipEl.removeAttribute('data-guidechimp-alignment');

            if (alignment) {
                tooltipEl.setAttribute('data-guidechimp-alignment', alignment);
                const { innerWidth: vpWidth } = this.getViewportDims();
                const clampLeft = (val) => Math.max(0, Math.min(val, vpWidth - tooltipWith));
                switch (alignment) {
                    case 'left': {
                        tooltipStyle.left = `${clampLeft(elLeft - (padding / 2))}px`;
                        break;
                    }
                    case 'right': {
                        const rightVal = elRight - tooltipWith + (padding / 2);
                        tooltipStyle.left = `${clampLeft(rightVal)}px`;
                        tooltipStyle.right = 'auto';
                        break;
                    }
                    default: {
                        const centerLeft = elLeft + (elWidth / 2) - (tooltipWith / 2);
                        tooltipStyle.left = `${clampLeft(centerLeft)}px`;
                    }
                }
            }
        }


        if (this.referenceEl) {
            try {
                const rootEl = this.getRootEl();
                const rootRect = rootEl.getBoundingClientRect();

              const tooltipRect = tooltipEl.getBoundingClientRect();

                const rootScrollTop = rootEl.scrollTop || 0;
                const rootScrollLeft = rootEl.scrollLeft || 0;

                const topRel = tooltipRect.top - rootRect.top + rootScrollTop;
                const leftRel = tooltipRect.left - rootRect.left + rootScrollLeft;

                tooltipStyle.top = `${Math.round(topRel)}px`;
                tooltipStyle.left = `${Math.round(leftRel)}px`;

                try {
                    const rs = getComputedStyle(rootEl);
                    if (rs.position === 'static') {
                        rootEl.style.position = 'relative';
                    }
                } catch (e) {
                    // ignore
                }

                tooltipStyle.position = 'absolute';
            } catch (err) {
                // ignore
            }
        }

        clampToViewport(tooltipEl, 0);
        return this;
    }

    startPreloader() {
        document.body.classList.add(this.constructor.getLoadingClass());

        const overlay = this.getEl('overlay');

        if (overlay) {
            const path = overlay.querySelector('path');
            const animate = overlay.querySelector('animate');

            const preloaderCache = new Map();
            preloaderCache.set('d', path.getAttribute('d'));

            path.setAttribute('d', this.getOverlayDocumentPath());

            if (animate) {
                preloaderCache.set('from', animate.getAttribute('from'));
                preloaderCache.set('to', animate.getAttribute('to'));

                animate.removeAttribute('from');
                animate.removeAttribute('to');
            }

            this.cache.set('preloaderCache', preloaderCache);
        }

        const preloader = this.mountPreloaderEl();
        preloader.hidden = true;

        setTimeout(() => {
            preloader.hidden = false;
        }, 100);

        return this;
    }

    stopPreloader() {
        document.body.classList.remove(this.constructor.getLoadingClass());

        const overlay = this.getEl('overlay');

        if (overlay) {
            const path = overlay.querySelector('path');
            const animate = overlay.querySelector('animate');

            const preloaderCache = this.cache.get('preloaderCache') || new Map();

            if (preloaderCache.has('d')) {
                path.setAttribute('d', preloaderCache.get('d'));
            }

            if (animate) {
                if (preloaderCache.has('from')) {
                    animate.setAttribute('from', preloaderCache.get('from'));
                }

                if (preloaderCache.has('to')) {
                    animate.setAttribute('to', preloaderCache.get('to'));
                }
            }

            this.cache.delete('preloaderCache');
        }

        this.removePreloaderEl();
        return this;
    }

    getDefaultTmplData() {
        return {
            previousStep: this.previousStep,
            currentStep: this.currentStep,
            nextStep: this.nextStep,
            fromStep: this.fromStep,
            toStep: this.toStep,

            previousStepIndex: this.previousStepIndex,
            currentStepIndex: this.currentStepIndex,
            nextStepIndex: this.nextStepIndex,
            fromStepIndex: this.fromStepIndex,
            toStepIndex: this.toStepIndex,

            steps: this.steps,

            go: (...args) => this.go(...args),
            previous: (...args) => this.previous(...args),
            next: (...args) => this.next(...args),
            stop: (...args) => this.stop(...args),
        };
    }

    mountStep() {
        const interactionEl = this.mountInteractionEl();
        const controlEl = this.mountControlEl();

        this.setInteractionPosition(interactionEl);
        this.setControlPosition(controlEl);

        const tooltipEl = this.getEl('tooltip');
        const rootEl = this.getRootEl();
        if (tooltipEl && tooltipEl.parentElement && tooltipEl.parentElement !== rootEl) {
            try {
                rootEl.appendChild(tooltipEl);
            } catch (err) {
                // ignore
            }
        }

        this.setTooltipPosition(this.getEl('tooltip'));

     if (this.referenceEl) {
            this.startPositionPoll();
        }

        this.observeStep();

        this.highlightStepEl(true);

        return this;
    }

    unmountStep() {
        this.resetHighlightStepEl();
        this.stopPositionPoll();
        try {
            this.removeEl('tooltip');
        } catch (err) {
            // ignore
        }

        this.removeInteractionEl();
        this.removeControlEl();
        this.removePreloaderEl();
        this.removeFakeStepEl();

        return this;
    }

    createEl(name, tmpl, data = {}) {
        const el = domTemplate(tmpl, data);

        if (el) {
            el.setAttribute(`data-quidechimp-${this.uid}`, name);
        }

        return el;
    }

    getEl(key, def = null) {
        let el = this.elements.get(key);

        if (!el) {
            el = document.querySelector(`[data-quidechimp-${this.uid}="${key}"]`);
        }

        return el || def;
    }

    mountEl(el, parent) {
        if (el) {
            const els = el.querySelectorAll(`[data-quidechimp-${this.uid}]`);
            [el, ...els].forEach((v) => {
                const key = v.getAttribute(`data-quidechimp-${this.uid}`);
                if (key) {
                    this.removeEl(key);
                    this.elements.set(key, v);
                }
            });

            const targetParent = (parent === document.body) ? this.getRootEl() : (parent || this.getRootEl());
            targetParent.appendChild(el);
        }

        return el;
    }

    removeEl(key) {
        const el = this.getEl(key);

        if (el) {
            if (el.parentElement && typeof el.parentElement.removeChild === 'function') {
                el.parentElement.removeChild(el);
            } else if (typeof el.remove === 'function') {
                el.remove();
            }
        }

        this.elements.delete(key);

        return this;
    }

    isEl(el, key) {
        return (this.getEl(key))
            ? el === this.getEl(key)
            : el.getAttribute(`data-quidechimp-${this.uid}`) === key;
    }

    getFakeStepTmpl() {
        return fakeStepTmpl;
    }

    createFakeStepEl(data = {}) {
        return this.createEl('fakeStep', this.getFakeStepTmpl(), { ...this.getDefaultTmplData(), ...data });
    }

    mountFakeStepEl(data = {}) {
        return this.mountEl(this.createFakeStepEl(data), this.getRootEl());
    }

    removeFakeStepEl() {
        return this.removeEl('fakeStep');
    }

    mountOffsetFakeStepEl(data = {}) {
        const { top, left, width, height, canvasWidth, canvasHeight } = data;

        this.removeFakeStepEl();

        const fakeEl = this.createFakeStepEl(data);

        if (fakeEl && top !== undefined && left !== undefined && width && height) {
            const { innerWidth: refWidthDefault, innerHeight: refHeightDefault } = this.getViewportDims();
            const refWidth = canvasWidth || refWidthDefault;
            const refHeight = canvasHeight || refHeightDefault;

            const root = this.getRootEl();
            const hasCustomRoot = root && root !== document.body;
            const rootRect = hasCustomRoot ? root.getBoundingClientRect() : { left: 0, top: 0 };

            let topPx;
            let leftPx;
            let widthPx;
            let heightPx;

            if (typeof top === 'string' && top.trim().endsWith('%')) {
                topPx = (parseFloat(top) || 0) / 100 * refHeight;
            } else if (typeof top === 'number') {
                topPx = top;
            } else {
                topPx = parseFloat(top) || 0;
            }

            if (typeof left === 'string' && left.trim().endsWith('%')) {
                leftPx = (parseFloat(left) || 0) / 100 * refWidth;
            } else if (typeof left === 'number') {
                leftPx = left;
            } else {
                leftPx = parseFloat(left) || 0;
            }

            if (typeof width === 'string' && width.trim().endsWith('%')) {
                widthPx = (parseFloat(width) || 0) / 100 * refWidth;
            } else if (typeof width === 'number') {
                widthPx = width;
            } else {
                widthPx = parseFloat(width) || 0;
            }

            if (typeof height === 'string' && height.trim().endsWith('%')) {
                heightPx = (parseFloat(height) || 0) / 100 * refHeight;
            } else if (typeof height === 'number') {
                heightPx = height;
            } else {
                heightPx = parseFloat(height) || 0;
            }

            if (hasCustomRoot) {
                fakeEl.style.cssText = `
                    position: absolute !important;
                    top: ${topPx}px !important;
                    left: ${leftPx}px !important;
                    width: ${widthPx}px !important;
                    height: ${heightPx}px !important;
                    visibility: hidden !important;
                    pointer-events: none !important;
                    z-index: -1 !important;
                `;
            } else {
                fakeEl.style.cssText = `
                    position: fixed !important;
                    top: ${topPx}px !important;
                    left: ${leftPx}px !important;
                    width: ${widthPx}px !important;
                    height: ${heightPx}px !important;
                    visibility: hidden !important;
                    pointer-events: none !important;
                    z-index: -1 !important;
                `;
            }
        }

        return this.mountEl(fakeEl, this.getRootEl());
    }

    getPreloaderTmpl() {
        return preloaderTmpl;
    }

    createPreloaderEl(data = {}) {
        return this.createEl('preloader', this.getPreloaderTmpl(), data);
    }

    mountPreloaderEl(data = {}) {
        return this.mountEl(this.createPreloaderEl(data), this.getRootEl());
    }

    removePreloaderEl() {
        return this.removeEl('preloader');
    }

    getOverlayDocumentPath() {
        const root = this.getRootEl();
        const hasCustomRoot = root && root !== document.body;
        const { innerWidth, innerHeight } = this.getViewportDims();

        if (hasCustomRoot) {
            return `M 0 0 H ${innerWidth} V ${innerHeight} H 0 V 0 Z`;
        }

        const { body: { scrollWidth, scrollHeight } } = document;
        const width = (innerWidth > scrollWidth) ? innerWidth : scrollWidth;
        const height = (innerHeight > scrollHeight) ? innerHeight : scrollHeight;

        return `M 0 0 H ${width} V ${height} H 0 V 0 Z`;
    }

    getOverlayStepPath(step) {
        const hasElement = step && step.element;
        const hasCoordinates = step && step.top !== undefined && step.left !== undefined && step.width && step.height;

        if (!hasElement && hasCoordinates) {
            return this.getOverlayOffsetPath(step);
        }
        return this.getOverlayElPath(this.getStepEl(step));
    }

    getOverlayOffsetPath(step) {
        let { padding } = this.options;
        padding = (padding) ? padding / 2 : 0;

        const { top, left, width, height } = step;

        const root = this.getRootEl();
        const hasCustomRoot = root && root !== document.body;
        const rootRect = hasCustomRoot ? root.getBoundingClientRect() : { left: 0, top: 0 };

        const convertToPx = (value, axis) => {
            if (typeof value === 'string' && value.trim().endsWith('%')) {
                const percentage = parseFloat(value) || 0;
                const { innerWidth, innerHeight } = this.getViewportDims();
                return (axis === 'x')
                    ? (percentage / 100) * innerWidth
                    : (percentage / 100) * innerHeight;
            }
            return typeof value === 'number' ? value : parseFloat(value) || 0;
        };

        const topValue = convertToPx(top, 'y');
        const leftValue = convertToPx(left, 'x');
        const widthValue = convertToPx(width, 'x');
        const heightValue = convertToPx(height, 'y');

        const r = 4;

        let path = this.getOverlayDocumentPath();

        path += `M ${leftValue + r} ${topValue}
                 a ${r},${r} 0 0 0 -${r},${r}
                 V ${heightValue + topValue - r}
                 a ${r},${r} 0 0 0 ${r},${r}
                 H ${widthValue + leftValue - r}
                 a ${r},${r} 0 0 0 ${r},-${r}
                 V ${topValue + r}
                 a ${r},${r} 0 0 0 -${r},-${r}Z`;

        return path;
    }

    getOverlayElPath(el) {
        let { padding } = this.options;
        padding = (padding) ? padding / 2 : 0;

        const root = this.getRootEl();
        const hasCustomRoot = root && root !== document.body;

        const _elRect = this.getElementVisibleRect(el);
        let { left, top, width, height } = _elRect;

        if (hasCustomRoot) {
            const rootRect = root.getBoundingClientRect();
            left = left - rootRect.left;
            top = top - rootRect.top;
        }

        const r = 4;

        let path = this.getOverlayDocumentPath();

        const x1 = Math.max(0, left - padding + r);
        const { innerWidth } = this.getViewportDims();
        const x2 = Math.min(innerWidth, width + left + padding - r);

        path += `M ${x1} ${top}
         a ${r},${r} 0 0 0 -${r},${r}
         V ${height + top - r}
         a ${r},${r} 0 0 0 ${r},${r}
         H ${x2}
         a ${r},${r} 0 0 0 ${r},-${r}
         V ${top + r}
         a ${r},${r} 0 0 0 -${r},-${r} Z`;

        return path;
    }

    getOverlayTmpl() {
        return overlayTmpl;
    }

    createOverlayEl(data = {}) {
        const defaults = {
            stop: async (...args) => {
                if (this.options.exitOverlay) {
                    await this.stop(...args);
                }
            },
            path: this.getOverlayDocumentPath(),
        };

        return this.createEl('overlay', this.getOverlayTmpl(), { ...defaults, ...data });
    }

    mountOverlayEl(data = {}) {
        const el = this.createOverlayEl(data);
        const root = this.getRootEl();
        const hasCustomRoot = root && root !== document.body;

        if (hasCustomRoot && el) {
            el.style.setProperty('position', 'absolute', 'important');
            el.style.setProperty('top', '0', 'important');
            el.style.setProperty('left', '0', 'important');
            el.style.setProperty('right', '0', 'important');
            el.style.setProperty('bottom', '0', 'important');
        }

        return this.mountEl(el, root);
    }

    removeOverlayEl() {
        return this.removeEl('overlay');
    }

    getInteractionTmpl() {
        return interactionTmpl;
    }

    createInteractionEl(data = {}) {
        let { interaction } = this.options;

        if (typeof this.currentStep.interaction === 'boolean') {
            interaction = this.currentStep.interaction;
        }

        const defaults = {
            ...this.getDefaultTmplData(),
            interaction,
        };

        return this.createEl('interaction', this.getInteractionTmpl(), { ...defaults, ...data });
    }

    mountInteractionEl(data = {}) {
        return this.mountEl(this.createInteractionEl(data), this.getRootEl());
    }

    removeInteractionEl() {
        return this.removeEl('interaction');
    }

    getControlTmpl() {
        return controlTmpl;
    }

    createControlEl(data = {}) {
        return this.createEl(
            'control',
            this.getControlTmpl(),
            { ...this.getDefaultTmplData(), tooltipEl: this.createTooltipEl(data), ...data },
        );
    }

    mountControlEl(data = {}) {
        return this.mountEl(this.createControlEl(data), this.getRootEl());
    }

    removeControlEl() {
        return this.removeEl('control');
    }

    getTooltipTmpl() {
        return tooltipTmpl;
    }

    createTooltipEl(data = {}) {
        const defaults = {
            ...this.getDefaultTmplData(),
            progressbar: this.createProgressbarEl(data),
            // title: this.createTitleEl(data),
            description: this.createDescriptionEl(data),
            close: this.createCloseEl(data),
            customButtons: this.createCustomButtonsEl(data),
            previous: this.createPreviousEl(data),
            pagination: this.createPaginationEl(data),
            next: this.createNextEl(data),
            copyright: this.createCopyrightEl(data),
            notification: this.createNotificationEl(data),
            isCaret: this.currentStep?.isCaret,
        };

        return this.createEl('tooltip', this.getTooltipTmpl(), { ...defaults, ...data });
    }

    getCloseTmpl() {
        return closeTmpl;
    }

    createCloseEl(data = {}) {
        const step = this.currentStep || {};
        let iconCloseColor = step?.iconCloseColor;

        if (typeof iconCloseColor !== 'string' || !iconCloseColor.trim()) {
            iconCloseColor = '#000000';
        }

        return this.createEl('close', this.getCloseTmpl(), {
            ...this.getDefaultTmplData(),
            iconCloseColor,
            ...data,
        });
    }

    getProgressbarTmpl() {
        return progressbarTmpl;
    }

    createProgressbarEl(data = {}) {
        let { showProgressbar } = this.options;

        if (typeof this.currentStep.showProgressbar === 'boolean') {
            showProgressbar = this.currentStep.showProgressbar;
        }

        const progressMax = 100;
        const progressMin = 0;
        const progress = ((this.currentStepIndex + 1) / this.steps.length) * 100;

        const defaults = {
            ...this.getDefaultTmplData(),
            showProgressbar,
            progressMax,
            progressMin,
            progress,
        };

        return this.createEl('progressbar', this.getProgressbarTmpl(), { ...defaults, ...data });
    }

    getTitleTmpl() {
        return titleTmpl;
    }

    createTitleEl(data = {}) {
        const { title = '' } = this.currentStep;
        return this.createEl('title', this.getTitleTmpl(), { ...this.getDefaultTmplData(), title, ...data });
    }

    getDescriptionTmpl() {
        return descriptionTmpl;
    }

    createDescriptionEl(data = {}) {
        const { description = '' } = this.currentStep;

        return this.createEl(
            'description',
            this.getDescriptionTmpl(),
            { ...this.getDefaultTmplData(), description, ...data },
        );
    }

    getCustomButtonsTmpl() {
        return customButtonsTmpl;
    }

    createCustomButtonsEl(data = {}) {
        const buttons = [];

        if (this.currentStep.buttons) {
            this.currentStep.buttons.forEach((button) => {
                let buttonEl = button;

                if (!isHtmlElement(buttonEl)) {
                    const { onClick, tagName = 'button', title = '', class: className } = button;

                    buttonEl = document.createElement(tagName);
                    buttonEl.innerHTML = title;

                    if (className) {
                        buttonEl.className = className;
                    }

                    if (onClick) {
                        buttonEl.addEventListener('click', (e) => {
                            onClick.call(this, e);
                        });
                    }
                }

                buttons.push(buttonEl);
            });
        }

        return this.createEl(
            'customButtons',
            this.getCustomButtonsTmpl(),
            { ...this.getDefaultTmplData(), buttons, ...data },
        );
    }

    getPaginationTmpl() {
        return paginationTmpl;
    }

    createPaginationEl(data = {}) {
        const {
            paginationTheme = this.options.paginationTheme,
            paginationCirclesMaxItems = this.options.paginationCirclesMaxItems,
        } = this.currentStep;

        let { showPagination } = this.options;

        if (typeof this.currentStep.showPagination === 'boolean') {
            showPagination = this.currentStep.showPagination;
        }

        return this.createEl(
            'pagination',
            this.getPaginationTmpl(),
            {
                ...this.getDefaultTmplData(),
                showPagination,
                paginationTheme,
                paginationCirclesMaxItems,
                ...data,
            },
        );
    }

    getPreviousTmpl() {
        return previousTmpl;
    }

    createPreviousEl(data = {}) {
        let { showNavigation } = this.options;

        if (typeof this.currentStep.showNavigation === 'boolean') {
            showNavigation = this.currentStep.showNavigation;
        }

        return this.createEl(
            'previous',
            this.getPreviousTmpl(),
            { ...this.getDefaultTmplData(), showNavigation, ...data },
        );
    }

    getNextTmpl() {
        return nextTmpl;
    }

    createNextEl(data = {}) {
        let { showNavigation } = this.options;

        if (typeof this.currentStep.showNavigation === 'boolean') {
            showNavigation = this.currentStep.showNavigation;
        }

        return this.createEl(
            'next',
            this.getNextTmpl(),
            { ...this.getDefaultTmplData(), showNavigation, ...data },
        );
    }

    getCopyrightTmpl() {
        return copyrightTmpl;
    }

    createCopyrightEl(data = {}) {
        return this.createEl('copyright', this.getCopyrightTmpl(), { ...this.getDefaultTmplData(), ...data });
    }

    getNotificationTmpl() {
        return notificationTmpl;
    }

    createNotificationEl(data = {}) {
        return this.createEl(
            'notification',
            this.getNotificationTmpl(),
            { ...this.getDefaultTmplData(), messages: this.notifications, ...data },
        );
    }

    notify(message) {
        this.notifications.push(message);

        const notificationEl = this.getEl('notification');

        if (notificationEl) {
            this.mountEl(this.createNotificationEl(), notificationEl.parentElement);
        }

        return this;
    }

    /**
     * Register an event listener for a tour event.
     *
     * Event names can be comma-separated to register multiple events.
     *
     * @param {string} event The name of the event to listen for.
     * @param {function} listener The event listener, accepts context.
     * @param {object} options Listener options
     * @return {this}
     */
    on(event, listener, options = {}) {
        // priorities from low to high
        const priorities = this.constructor.getEventListenersPriorities();

        let [priority] = priorities;

        if (options.priority && priorities.includes(options.priority)) {
            priority = options.priority;
        }

        const e = event.trim();

        this.listeners[e] = this.listeners[e] || {};
        this.listeners[e][priority] = this.listeners[e][priority] || [];
        this.listeners[e][priority].push(listener);

        return this;
    }

    /**
     * Emits an event by name to all registered listeners on that event.
     * Listeners will be called in the order that they were added. If a listener
     * returns `false`, no other listeners will be called.
     *
     * @param {string} event    The name of the event to emit.
     * @param args  The context args of the event, passed to listeners.
     * @returns {Promise}
     */
    emit(event, ...args) {
        // from high to low
        const priorities = [...this.constructor.getEventListenersPriorities()].reverse();

        const e = event.trim();

        let result = [];
        let promise = Promise.resolve(result);

        if (this.listeners[e]) {
            priorities.forEach((priority) => {
                const { [priority]: listeners } = this.listeners[e];

                if (listeners) {
                    promise = promise
                        .then(() => Promise.all(
                            listeners.map((f) => Promise.resolve().then(() => f.apply(this, args))),
                        ))
                        .then((r) => {
                            result = [...result, ...r];
                            return result;
                        });
                }
            });
        }

        return promise;
    }

    /**
     * Add keydown event listener
     * @return {this}
     */
    addOnKeydownListener() {
        // turn on keyboard navigation
        this.cache.set('onKeydownListener', this.getOnKeydownListener());
        window.addEventListener('keydown', this.cache.get('onKeydownListener'), true);

        return this;
    }

    /**
     * Return on key down event listener function
     * @returns {function}
     */
    getOnKeydownListener() {
        return (event) => {
            const { keyCode } = event;

            const { previous: previousCodes, next: nextCodes, stop: stopCodes } = {
                ...this.constructor.getDefaultKeyboardCodes(),
                ...this.options.useKeyboard,
            };

            //  stop tour
            if (stopCodes && stopCodes.includes(keyCode)) {
                this.stop({ event });
                return;
            }

            // go to the previous step
            if (previousCodes && previousCodes.includes(keyCode)) {
                this.previous({ event });
                return;
            }

            // go to the next step
            if (nextCodes && nextCodes.includes(keyCode)) {
                this.next({ event });
            }
        };
    }

    /**
     * Remove keydown event listener
     * @return {this}
     */
    removeOnKeydownListener() {
        if (this.cache.has('onKeydownListener')) {
            window.removeEventListener('keydown', this.cache.get('onKeydownListener'), true);
            this.cache.delete('onKeydownListener');
        }

        return this;
    }

    /**
     * Add window resize event listener
     * @return {this}
     */
    addOnWindowResizeListener() {
        // turn on keyboard navigation
        this.cache.set('onWindowResizeListener', this.getOnWindowResizeListener());
        window.addEventListener('resize', this.cache.get('onWindowResizeListener'), true);

        return this;
    }

    /**
     * Return on window resize event listener function
     * @returns {function}
     */
    getOnWindowResizeListener() {
        return () => this.refresh();
    }

    /**
     * Remove window resize event listener
     * @return {this}
     */
    removeOnWindowResizeListener() {
        if (this.cache.has('onWindowResizeListener')) {
            window.removeEventListener('resize', this.cache.get('onWindowResizeListener'), true);
            this.cache.delete('onWindowResizeListener');
        }

        return this;
    }

    /**
     * Add window scroll event listener
     * @returns {GuideChimp}
     */
    addOnWindowScrollListener() {
        this.cache.set('onWindowScrollListener', this.getOnWindowScrollListener());
        window.addEventListener('scroll', this.cache.get('onWindowScrollListener'), true);

        return this;
    }

    addOnRootScrollListener() {
        const rootEl = this.getRootEl();
        if (!rootEl || rootEl === document.body) return this;
        this.cache.set('onRootScrollListener', () => this.refresh());
        rootEl.addEventListener('scroll', this.cache.get('onRootScrollListener'), true);
        return this;
    }

    /**
     * Return on window scroll event listener function
     * @returns {function}
     */
    getOnWindowScrollListener() {
        return () => this.refresh();
    }

    /**
     * Remove window resize event listener
     * @return {this}
     */
    removeOnWindowScrollListener() {
        if (this.cache.has('onWindowScrollListener')) {
            window.removeEventListener('scroll', this.cache.get('onWindowScrollListener'), true);
            this.cache.delete('onWindowScrollListener');
        }

        return this;
    }

    removeOnRootScrollListener() {
        const rootEl = this.getRootEl();
        if (!rootEl || rootEl === document.body) return this;
        if (this.cache.has('onRootScrollListener')) {
            rootEl.removeEventListener('scroll', this.cache.get('onRootScrollListener'), true);
            this.cache.delete('onRootScrollListener');
        }
        return this;
    }

    removeListeners() {
        this.removeOnKeydownListener();
        this.removeOnWindowResizeListener();
        this.removeOnWindowScrollListener();
        this.removeOnRootScrollListener();
        this.stopPositionPoll();
    }

    startPositionPoll() {
        if (!this.referenceEl) return this;
        if (this.cache.has('positionPoll')) return this;

        const poll = { rafId: null, lastKey: null };

        const tick = () => {
            try {
                const r = this.getElementVisibleRect(this.referenceEl);
                const key = `${Math.round(r.left)}|${Math.round(r.top)}|${Math.round(r.width)}|${Math.round(r.height)}`;
                if (poll.lastKey !== key) {
                    poll.lastKey = key;
                    this.refresh();
                }
            } catch (e) {
                // ignore
            }
            poll.rafId = requestAnimationFrame(tick);
        };

        poll.rafId = requestAnimationFrame(tick);
        this.cache.set('positionPoll', poll);
        return this;
    }

    stopPositionPoll() {
        const poll = this.cache.get('positionPoll');
        if (poll) {
            try {
                if (poll.rafId) cancelAnimationFrame(poll.rafId);
            } catch (e) {
                // ignore
            }
            this.cache.delete('positionPoll');
        }

        return this;
    }

    observeStep() {
        this.observeResizing();
        this.observeMutation();
    }

    observeResizing(options = { box: 'border-box' }) {
        let { resizingObserver: observer } = this.observers;

        if (!observer && typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(() => {
                if (!this && !this.currentStep) {
                    return;
                }
                this.refresh();
            });

            this.observers.resizingObserver = observer;
        }

        if (observer) {
            // observe elements
            observer.observe(this.getStepEl(this.currentStep), options);
            return true;
        }

        return false;
    }

    unobserveResizing() {
        const { resizingObserver: observer } = this.observers;

        if (observer) {
            observer.disconnect();
            return true;
        }

        return false;
    }

    observeMutation() {
        let { mutationObserver: observer } = this.observers;

        if (!observer) {
            observer = new MutationObserver((mutations) => {
                if (!this && !this.currentStep) {
                    return;
                }

                const { element } = this.currentStep;

                if (!element) {
                    return;
                }

                let el = this.getStepEl(this.currentStep);

                const isElExists = () => el && !this.isEl(el, 'fakeStep');

                mutations.forEach((record) => {
                    if (isElExists()) {
                        if (record.type === 'childList' && record.removedNodes.length) {
                            record.removedNodes.forEach((node) => {
                                if (node === el || node.contains(el)) {
                                    el = this.getStepEl(this.currentStep);
                                    this.scrollParentsToStepEl();
                                    this.refresh();
                                }
                            });
                        }
                    } else if (record.type === 'childList' && record.addedNodes.length) {
                        el = this.getStepEl(this.currentStep);

                        if (isElExists()) {
                            this.scrollParentsToStepEl();
                            this.refresh();
                        }
                    }
                });
            });

            this.observers.mutationObserver = observer;
        }

        observer.observe(this.getStepEl(this.currentStep).ownerDocument.body, {
            childList: true,
            subtree: true,
        });

        return true;
    }

    unobserveMutation() {
        const { mutationObserver: observer } = this.observers;

        if (observer) {
            observer.disconnect();
            return true;
        }

        return false;
    }

    unobserveStep() {
        this.unobserveResizing();
        this.unobserveMutation();
    }

    beforeChangeStep() {
        const currentStep = this.currentStep;
        this.unmountStep();
        this.unobserveStep();
    }

    /**
     * Refresh layers position
     * @returns {this}
     */
    refresh() {
        if (!this.currentStep) {
            return this;
        }

        this.highlightStepEl();

        this.setControlPosition(this.getEl('control'));
        this.setInteractionPosition(this.getEl('interaction'));
        this.setTooltipPosition(this.getEl('tooltip'));

        return this;
    }
}