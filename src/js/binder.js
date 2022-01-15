import { registerController } from './binder/register.js';
import { Controller, makeController } from './binder/controller.js';

// Allows defining template literals with syntax highlighting
const template = (strings, ...values) => {
    return strings.reduce((acc, str, i) => {
        return acc + str + (values[i] || '');
    }, '');
};

export {
    registerController,
    Controller,
    makeController,
    template as html,
    template as css,
};
