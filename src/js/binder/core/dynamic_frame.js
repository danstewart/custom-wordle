import { Controller } from '../controller.js';
import { parseDuration } from '../util.js';

/*
This is the base controller for DynamicFrames
Extend this and override params() and optionally replaceContent()

The root HTML node must have a `:url` attribute - this can be relative or absolute
To pass params use the attribute format `:param-name`

Example HTML:
<dynamic-frame :url="/some/url" :param-day="Monday"></dynamic-frame>
*/

class DynamicFrame extends Controller {
    /**
     * Setup the DynamicFrame and do the initial request/load
     * @property mountPoint - A selector used to find the element to mount to within the element (defaults to the root element)
     * @property autoRefresh - Will call `refresh()` automatically at the specified interval (Intervals are in the format `${num}${unit}` where unit is one of ms, s, m, h: `10s` = 10 seconds)
     * @property delay - An artificial delay applied before displaying the content
     */
    async init() {
        this.contents = '';

        // Keep track of pending requests so we can cancel when updating multiple things
        this._reqAbort = [];

        if (this.autoRefresh) {
            const interval = parseDuration(this.autoRefresh);
            this.setAutoRefresh(interval);
        }

        if (!this.delay) this.delay = 0;
        this.loadContent();
    }

    /**
     * Calls `this.loadContent()` then `this.render()`
     * Essentially refreshes the frame
     */
    refresh() {
        this.loadContent();
        this.render();
    }

    /**
     * Call the base `rebind()` and re-find the mountPoint
     * TODO: Can't remember why this is here, but there is a reason...
     */
    rebind() {
        super.rebind();

        // Find the mount point
        if (this.mountPoint && typeof(this.mountPoint) === 'string') {
            this.mountPoint = this.querySelector(this.mountPoint);
        }

        if (!this.mountPoint) {
            console.debug(`${this.tag}: No mount point specified, defaulting to self`);
            this.mountPoint = this.root;
        }
    }

    /**
     * Sets an interval to auto call `this.refresh()`
     * Overwrites previously set refresh intervals
     * @param {*} interval Duration in milliseconds
     */
    setAutoRefresh(interval) {
        if (interval === undefined) {
            console.error(`[${this.tag}] Undefined interval passed to setAutoRefresh`);
            return;
        }

        if (this.__internal__.autoRefreshInterval) {
            window.clearInterval(this.__internal__.autoRefreshInterval);
        }

        this.__internal__.autoRefreshInterval = window.setInterval(() => this.refresh(), interval);
    }

    /**
     * [async] Makes a new request and replaces or appends the response to the mountPoint
     * Returns true on success
     * Multiple calls will abort previous requests and return false
     * @param mode - replace or append
     * @returns boolean - true on success
     */
    async loadContent(e, mode='replace') {
        let url = this.endpoint();
        url.search = new URLSearchParams(this.params());

        // Keep track of all pending requests so we can abort them on duplicate calls
        this._reqAbort.forEach(controller => controller.abort())
        this._reqAbort = [];

        const abortController = new AbortController();
        this._reqAbort.push(abortController);

        let ok = true;
        const sendReq = async () => {
            try {
                let response = await fetch(url, { signal: abortController.signal });
                let text = await response.text();
                this.updateContent(text);
            } catch (err) {
                console.error(err);
                ok = false;
            }
        };

        await Promise.allSettled([
            new Promise(resolve => setTimeout(resolve, this.delay)),
            sendReq(),
        ]);

        return ok;
    }

    /**
     * Actually updates the content
     * This is where the artificial delay is applied
     * @param content - The content to use
     * @param mode - replace or append
     */
    updateContent(content, mode='replace') {
        // TODO: Might want to use morphdom here
        if (mode === 'replace') {
            this.mountPoint.innerHTML = content;
        } else if (mode === 'append') {
            this.mountPoint.insertAdjacentHTML('beforeEnd', content);
        }
    }

    /**
     * Returns the query string params for the request - expected to be overridden
     * Handles arrays as duplicated params (ie. a: [1,2] => ?a=1&a=2)
     * @returns {URLSearchParams}
     */
    params(values={}) {
        let params = new URLSearchParams(values);

        // Annoyingly URLSearchParams can't handle array params unless you call .append each time
        // So find any array params and re-add them manually
        Object.entries(values).forEach(([key, val]) => {
            if (Array.isArray(val)) {
                params.delete(key);
                val.forEach(item => params.append(key, item))
            }
        });

        for (let attr of this.root.attributes) {
            if (attr.nodeName.startsWith(":param-")) {
                params.append(attr.nodeName.substr(7), attr.nodeValue);
            }
        }

        return params;
    }

    /**
     * Returns the endpoint to call - from the data-url attr on the root element
     * @returns {string}
     */
    endpoint() {
        let url = this.url;

        if (!this.url) {
            console.error(`${this.tag}: No :url attribute specified`);
            return;
        }

        if (!url.startsWith('http')) url = window.location.origin + url;
        return new URL(url);
    }
}

export { DynamicFrame };

