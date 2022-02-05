import { pascalToKebab } from './util.js';

/**
 * 
 * @param {Class} cls The controller class to register
 * @param {string} name [Optional] The tag name to use for the controller (default will be the class name converted to kebab-case)
 * @param {object} opts [Optional] Options to pass to window.customElements.define
 */
const registerController = (cls, { name = null } = {}) => {
    const controllerName = cls.name;
    const controllerTag = name ? name : pascalToKebab(controllerName.replace("Controller", ""));

    if (!controllerTag.includes("-")) {
        console.error(`[${controllerName}] Controller tag name must contain a hyphen but got <${controllerTag}>`);
    }

    // If our controller has a __tag__ property then it
    // extends that tag
    let opts = {};
    if (cls.__extendTag__) opts.extends = cls.__extendTag__;

    window.customElements.define(controllerTag, cls, opts);
};

/**
 * Wrapper around `registerController` for loading multiple controllers at once
 * We need to first set the `data-controller` attr on all controllers or `belongsToController` fails
 * 
 * Example
 * ```js
 * registerControllers(
 *  [ MyController, {} ],
 * )
 * ```
 * @param  {...any} controllers 
 */
const registerControllers = (...controllers) => {
    // TODO: Would be a little nicer if this allowed the controllers to be flat list instead of each item itself having to be a list
    for (let [controller, config = {}] of controllers) {
        const controllerName = controller.name;
        const controllerTag = config && config.name ? config.name : pascalToKebab(controllerName.replace("Controller", ""));
        document.querySelectorAll(controllerTag).forEach(el => el.setAttribute("data-controller", controllerTag.toLowerCase()));
    }

    for (let [controller, config] of controllers) {
        registerController(controller, config);
    }
};

// TODO: We should not export `registerController`, everyone should use `registerControllers` only
export {
    registerController,
    registerControllers,
};
