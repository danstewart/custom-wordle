import { kebabToCamel, permutations, parseDuration } from './util.js';

/**
 * Dynamically create a new Controller class extending an existing element class
 * @param {Element} base The element to inherit from
 * @param {string} name The name of the built in HTML tag to extend
 * @returns Controller class
 */
const makeController = (base=HTMLElement, extendTag=null) => {
    const CoreController = (class extends base {
        static __extendTag__ = extendTag;

        constructor(args) {
            super();
            
            // Store for internal data
            this.__internal__ = {};

            this.tag = this.tagName.toLowerCase();
            this.root = this;

            // Keep track of all attached events
            this.__events__ = [];

            // Handle <self> node
            // By default an empty element will only contain it's `self` content
            // Can also be added manually using <self></self>
            if (this.innerHTML.trim() === "") this.innerHTML = "<self></self>";
            this.self = this.querySelector("self");

            // Add the data-controller attribute to the element
            this.setAttribute("data-controller", this.tag);

            // Some defaults
            this.renderOnInit = this.renderOnInit || "true";

            this.template = this.root.querySelector("template");

            // If the component has a template then we will clone it and render that to the DOM
            // If the template has the :use-shadow attribute then we will clone it onto the shadow DOM
            // This allows isolating the component from the regular DOM (including styles)

            // The template is optional, if not specified then we will do everything directly on the DOM within the component
            if (this.template) {
                this.content = this.template.content.cloneNode(true);

                // Only use the shadowDOM when specified
                if (this.template.hasAttribute(":use-shadow")) {
                    this.attachShadow({ mode: "open" })
                        .appendChild(this.content.cloneNode(true));

                    this.root = this.shadowRoot;
                    this.hasShadow = true;
                } else {
                    this.appendChild(this.content.cloneNode(true));
                    this.hasShadow = false;
                }
            }

            this.rebind();
            this.init(args);

            if (this.autoRender) {
                const interval = parseDuration(this.autoRender);
                this.setAutoRender(interval);
            }
        }

        /**
         * Re-initializes the controller instance
         * Useful when the DOM changes to manually refresh the controller state
         */
        rebind() {
            // TODO: Would be good to bind a specific node/tree

            // We need to delete all events and before rebinding
            // Otherwise we would end up with duplicate events
            this.__events__.forEach(e => e.el.removeEventListener(e.eventType, e.event));
            this.__events__ = [];

            this.#bindEvents();
            this.#bindArgs();
            this.#bindDataValues();
        }

        /**
         * Sets an interval to auto call `this.render()`
         * Overwrites previously set render intervals
         * @param {*} interval Duration in milliseconds
         */
        setAutoRender(interval) {
            if (interval === undefined) {
                console.error(`[${this.tag}] Undefined interval passed to setAutoRender`);
                return;
            }

            if (this.__internal__.autoRenderInterval) {
                window.clearInterval(this.__internal__.autoRenderInterval);
            }

            this.__internal__.autoRenderInterval = window.setInterval(() => this.render(), interval);
        }

        /**
         * Called during application.register() after an element is bound to an instance
         * Expected to be overridden
         * @param {*} args 
         */
        init(args) {}

        /**
         * Called when element is rendered in the DOM
         * See: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks
         */
        connectedCallback() {
            if (!this.isConnected) return;

            if (this.renderOnInit === "true"){ 
                this.render();
            }
        }

        getTag(tag) {
            return this.querySelector(`[data-tag="${tag}"]`) || this.querySelector(`[\\:tag="${tag}"]`);
        }

        getTagAll(tag) {
            return [
                ...this.querySelectorAll(`[data-tag="${tag}"]`),
                ...this.querySelectorAll(`[\\:tag="${tag}"]`),
            ]
        }

        /**
         * Re-renders everything with the @render attribute
         */
        render() {
            // TODO: Might be handy to be able to render one element or element tree
            this.#findRenderableElements().forEach(el => {
                // Store the original template as an attribute on the element on first render
                let template = el.getAttribute('_template');
                if (!template) {
                    template = el.innerText;
                    el.setAttribute('_template', template);
                }

                // If the element has the attribute with .eval then eval the template
                // This should be used sparingly and only when the content is trusted
                const evalMode = el.hasAttribute(`@render.eval`);

                let replacerRegex = /\$\{(.*?)\}/g;  // Find template vars: ${var}

                template.replace(replacerRegex, (replacer, key) => {
                    if (evalMode) {
                        const fn = new Function(`return ${key}`);
                        template = template.replace(replacer, fn.call(this));
                    } else {
                        // If not in `evalMode` then we do an eval-like replacement
                        // We will dig into the controller instance and replace in the variables
                        // This handles dot notation and array notation
                        let pos = null;

                        // Split on dots and brackets and strip out any quotes
                        key.split(/[\.\[\]]/).filter(item => !!item).forEach(part => {
                            part = part.replace(/["']/g, '');  // Strip out square brackets
                            part = part.replace(/\(\)/g, '');  // Strip out function parens

                            if (pos == null && part === "this") {
                                pos = this;
                                return;
                            }

                            if (pos && part in pos) {
                                pos = pos[part];
                            } else {
                                pos = null;
                                return;
                            }
                        });

                        if (pos == null) pos = "";
                        if (typeof pos === "function") pos = pos.call(this);
                        template = template.replace(replacer, pos.toString() || '');
                    }
                });
                
                // TODO: This may be innefecient
                el.innerHTML = template;
            });
        }

        /**
         * Find all elements on the controller which have @render attributes
         * @render is a special action that let's the controller know to render this elements content when the render() method is called
         */
        #findRenderableElements() {
            return [
                ...this.root.querySelectorAll(`[\\@render]`),
                ...this.root.querySelectorAll(`[\\@render\\.eval]`),
            ].filter(el => this.#belongsToController(el))
        }

        /**
         * Bind all attributes on the controller tag into the instance under `this`
         * Convert kebab-case to camelCase
         * EG. <controller :some-arg="150" /> will set `this.someArg = 150`
         */
        #bindArgs() {
            this.getAttributeNames().forEach(attr => {
                const value = this.getAttribute(attr);
                const key = kebabToCamel(attr).replace(':', '');
                this[key] = value;
            });
        }

        /**
         * Finds all events within a controller element
         * Events are in the format `@{eventType}={method}"`
         * EG. @click="handleClick"
         *
         * The attribute key can also end with a combination of modifiers:
         * - `.prevent`: Automatically calls `event.preventDefault()`
         * - `.eval`: Will evaluate the attribute value
         */
        #bindEvents() {
            // Now find all configured events
            const eventTypes = [ 'click', 'change', 'mouseover', 'mouseout', 'keydown', 'keyup', 'load' ];
            const modifiers = [ "", ...permutations([ ".prevent", ".eval" ], true) ];

            const bindEvent = (el, eventType, modifier) => {
                const value = el.getAttribute(`@${eventType}${modifier}`);
                const action = value.replace("this.", "").replace("()", "");

                const callable = (event) => {
                    if (modifier.includes('.prevent')) event.preventDefault();

                    if (modifier.includes('.eval')) {
                        const fn = new Function(`${value}`);
                        fn.call(this);
                    } else {
                        this[action](event);
                    }
                };

                el.addEventListener(eventType, callable);

                this.__events__.push({
                    el: el,
                    event: callable,
                    eventType: eventType,
                });
            };

            eventTypes.forEach(eventType => {
                modifiers.forEach(modifier => {
                    const escapedModifier = modifier.replace(/\./g, "\\.");

                    // Handle events on the root node
                    if (this.root.hasAttribute(`@${eventType}${modifier}`)) {
                        bindEvent(this.root, eventType, modifier);
                    }

                    // Handle events on any children
                    this.root.querySelectorAll(`[\\@${eventType}${escapedModifier}]`).forEach(el => {
                        if (!this.#belongsToController(el)) return;
                        bindEvent(el, eventType, modifier);
                    });
                });
            });
        }


        /**
         * Find all elements within the controller that has a `@bind` attribute
         * Each element will have it's value bound to the controller under `this`
         * The value of the attribute will be converted from kebab-case to camelCase
         * 
         * EG. <input @bind="the-input" /> will have it's value bound to `this.theInput`
         */
        #bindDataValues() {
            const instance = this;

            const tagToEvent = {
                'input|text': 'keyup',
                'default': 'change',
            };

            // Event handlers for various element types
            const handlers = {
                'input|checkbox': (instance, varName, e) => {
                    if (!instance[varName]) instance[varName] = [];
                    if (e.target.checked) {
                        instance[varName].push(e.target.value);
                    } else {
                        instance[varName] = instance[varName].filter(item => item !== e.target.value);
                    }
                },
                'select': (instance, varName, e) => {
                    if (e.target.getAttribute('multiple') !== null) {
                        instance[varName] = Array.from(e.target.selectedOptions).map(item => item.value);
                    } else {
                        instance[varName] = e.target.value;
                    }
                },
                'default': (instance, varName, e) => instance[varName] = e.target.value,
            }

            // Logic to actually bind an element to the controller
            const bindData = (el, modifier) => {
                const elType = this.#getElementType(el);
                const eventType = tagToEvent[elType] || tagToEvent.default;

                el.addEventListener(eventType, e => {
                    const varName = el.getAttribute(`@bind${modifier}`).replace("this.", "");

                    const handler = handlers[elType] || handlers.default;
                    handler(instance, varName, e);

                    // If this element is @reactive this call render()
                    if (modifiers.includes('.render')) instance.render();
                });
            };

            const modifiers = [ "", ...permutations([ ".reactive" ], true) ];
            modifiers.forEach(modifier => {
                // Handle any binds on the root node
                if (this.root.hasAttribute(`@bind${modifier}`)) {
                    bindData(this.root, modifier);
                }

                // Handle any binds on the children
                const escapedModifier = modifier.replace(/\./g, "\\.")
                this.root.querySelectorAll(`[\\@bind${escapedModifier}]`).forEach(el => {
                    if (!this.#belongsToController(el)) return;
                    bindData(el, modifier);
                });
            });
        }

        /**
         * Return the type of an element
         * @param {Element} el The DOM element to check
         * @returns {String} The element type, e.g. 'input|text'
         */
        #getElementType(el) {
            if (el.tagName.toLowerCase() === 'input') {
                return [el.tagName, el.type].map(item => item.toLowerCase()).join('|');
            }
            return el.tagName.toLowerCase();
        }

        /**
         * Return true if the given element belongs to this controller
         * @param {Element} el The controller root DOM element
         * @returns {Boolean} True if the element belongs to the controller
         */
        #belongsToController(el) {
            // If we're using the shadow DOM then we only see this controllers children so it must belong to the controller
            if (this.hasShadow) return true;

            const closestController = el.closest(`[data-controller]`);
            if (closestController == null) return false;
            if (closestController.getAttribute('data-controller') !== this.tag) return false;
            return true;

        }
    });

    return CoreController;
}

const Controller = makeController();

export {
    makeController,
    Controller,
};
