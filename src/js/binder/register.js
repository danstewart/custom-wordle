import { pascalToKebab } from './util.js';

/**
 * 
 * @param {Class} cls The controller class to register
 * @param {string} name [Optional] The tag name to use for the controller (default will be the class name converted to kebab-case)
 * @param {object} opts [Optional] Options to pass to window.customElements.define
 */
const registerController = (cls, name = null) => {
    const controllerName = cls.name;
    const controllerTag = name ? name : pascalToKebab(controllerName);

    if (!controllerTag.includes("-")) {
        console.error(`[${controllerName}] Controller tag name must contain a hyphen but got <${controllerTag}>`);
    }

    // If our controller has a __tag__ property then it
    // extends that tag
    let opts = {};
    if (cls.__extendTag__) opts.extends = cls.__extendTag__;

    window.customElements.define(controllerTag, cls, opts);
};

export {
    registerController,
};
