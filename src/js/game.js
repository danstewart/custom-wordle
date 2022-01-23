import { registerController } from './binder.js';
import { GameView } from './controllers/game.js';
import { GridView, GridRow } from './controllers/grid.js';
import { KeyboardView } from './controllers/keyboard.js';

// Need to register all controllers before use
registerController(GridRow);
registerController(GridView);
registerController(KeyboardView);
registerController(GameView);
