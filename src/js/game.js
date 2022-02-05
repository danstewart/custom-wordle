import { registerControllers } from './binder.js';
import { GameView } from './controllers/game.js';
import { GridView, GridRow } from './controllers/grid.js';
import { KeyboardView } from './controllers/keyboard.js';

// Need to register all controllers before use
registerControllers(
    [GridRow],
    [GridView],
    [KeyboardView],
    [GameView],
);
