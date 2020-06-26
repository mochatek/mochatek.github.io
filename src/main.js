/* This is our entry point to the game. */

// Import Phser library.
import Phaser from './lib/phaser.js';

// Import our custom made scenes here.
import GameScene from './scenes/game.js'

// Create Cofigurations for the game.
const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 300,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 800
            },
            debug: false
        }
    },
    scene: [GameScene]
};

// Export the game object.
export default new Phaser.Game(config);



