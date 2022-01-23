import { registerController } from './binder.js';
import { GridView, GridRow } from './controllers/grid.js';
import { KeyboardView } from './controllers/keyboard.js';

registerController(GridRow);
registerController(GridView);
registerController(KeyboardView);
