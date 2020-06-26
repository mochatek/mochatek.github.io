//  Import Phaser library.
import Phaser from '../lib/phaser.js'

export default class GameScene extends Phaser.Scene {

    constructor() {
        // Unique key to refer to this scene.
        super('gameScene');
        this._gameStat;
        this._hScore;
        this._lScore;
        this._lifeLeft;
        this._collided;
    }

    init() {
        // Get game high score of user.
        let hScore = localStorage.getItem('hScore')
        if(!hScore) {
            localStorage.setItem('hScore', JSON.stringify(0));
            this._hScore = 0;
        } else {
            this._hScore = JSON.parse(hScore);
        }

        // Get latest score if user want to continue.
        let lScore = localStorage.getItem('lScore')
        if(!lScore) {
            localStorage.setItem('lScore', JSON.stringify(0));
            this._lScore = 0;
        } else {
            this._lScore = JSON.parse(lScore);
        }

        // Get number of lifes left to continue game.(START = 3)
        let lifeLeft = localStorage.getItem('lifeLeft')
        if(!lifeLeft) {
            localStorage.setItem('lifeLeft', JSON.stringify(3));
            this._lifeLeft = 3;
        } else {
            this._lifeLeft = JSON.parse(lifeLeft);
        }

        // Initialize other game values
        this._gameStat = false;
        this._collided = false;
    }

    // Load resource files.
    preload() {
        this.load.image('player', '../assets/player.png');
        this.load.image('enemy', '../assets/enemy.png');
        this.load.image('base', '../assets/base.jpg');
        this.load.image('bg', '../assets/bg.png');
        this.load.image('life', '../assets/life.png');
        this.load.image('playBtn', '../assets/play.png');
        this.load.audio('ambience', '../assets/ambience.mp3')
        this.load.audio('hitSound', '../assets/jump.wav')
    }

    // Draw resources on screen/set animations and physics/events/colliders/overlaps.
    create() {
        // Add audio SFX.
        this.bgMusic = this.sound.add('ambience', {volume: 0.5, loop:true});
        this.hitSound = this.sound.add('hitSound');

        // Add images.
        this.bg = this.add.tileSprite(0, 0, 400, 300, 'bg').setOrigin(0, 0);
        this.base = this.physics.add.staticImage(200, 265, 'base');
        this.player = this.physics.add.sprite(100, 206, 'player').setScale(0.375).setBounce(0.3);
        this.enemy = this.physics.add.sprite(600, 206, 'enemy').setScale(0.375).setAlpha(0.75);
        // Add first 3 lifes.
        this.lifes = this.physics.add.staticGroup({
            key: 'life',
            repeat: this._lifeLeft - 1,
            setXY: {
                x: 320,
                y: 30,
                stepX: 25,
                stepY: 0
            },
            setScale: {
                x: 0.25,
                y: 0.25
            }
        });

        // PlayButton onClick=> start the game.
        this.playBtn = this.add.image(200, 150, 'playBtn').setScale(0.5);
        this.playBtn.setInteractive();           // Mustbe enables for interactivity.
        this.playBtn.on('pointerdown', this.startGame, this);

        // Score Label.
        this.scoreText = this.add.text(20, 20, `SCORE: ${this._lScore}`);

        // Game Physics and Collissions.
        this.physics.world.setBounds(0, 0, 400, 230, false, false, false, true);
        this.enemy.setCollideWorldBounds();
        this.physics.add.collider(this.player, this.base);
        this.physics.add.collider(this.player, this.enemy, this.hitEnemy, null, this);

        // Player Jump on click.
        this.input.on('pointerdown', this.jump, this);

        // Camera for game.
        this.cam = this.cameras.main

        // Show high score of the player.
        document.querySelector('th').innerHTML = `BEST : ${this._hScore}`;

    }

    // Game loop (60 FPS).
    update() {
        if(this._gameStat) {
            // Repeat background
            this.bg.tilePositionX += 0.5;

            // Give a rotaion animation to enemy
            this.enemy.angle -= 5;

            // Reset enemy if he crossed left margin.
            this.checkAndResetEnemy();

            // Restart game if player is dead.
            if(this.player.x <= -100) {
                this.bgMusic.stop();

                // Update highscore if latest score is greater.
                if(this._lScore > this._hScore) {
                    localStorage.setItem('hScore', JSON.stringify(this._lScore));
                }

                // Reduce life by 1 [if its last life, reset life and score to start]
                if(this._lifeLeft == 1) {
                    localStorage.setItem('lifeLeft', JSON.stringify(3));
                    localStorage.setItem('lScore', JSON.stringify(0));
                } else {
                    localStorage.setItem('lifeLeft', JSON.stringify(this._lifeLeft - 1));
                    localStorage.setItem('lScore', JSON.stringify(this._lScore));
                }

                // Restrat game wrt game status
                this.scene.restart();
            }

            // If player jumped out from enemy head, then set collided to false.
            if(!this.enemy.body.touching.up && this._collided) {
                this._collided = false;
            }
        }
    }

    startGame() {
        // Initialise some game properties.
        this._gameStat = true;
        this.enemy.setVelocityX(-200);
        this.bgMusic.play();
        this.playBtn.off('pointerdown'); // turn off listener.
        this.playBtn.destroy(true);
    }

    checkAndResetEnemy() {
        if(this.enemy.body.right <= -100) {
            this.enemy.y = 206;
            this.enemy.x = 500;
            this.enemy.setVelocityX(Phaser.Math.Between(-400, -200));
        } else {
            return;
        }
    }

    jump() {
        // Let player jump only while he is on a physics base.
        if (this.player.body.touching.down && this._gameStat) {
            this.player.setVelocityY(-400);
            this.hitSound.play();
        }
    }

    hitEnemy(player, enemy) {
        // If enemy hit on his head for the first frame.
        if(enemy.body.touching.up && !this._collided) {
            this._lScore += 1;
            this.scoreText.setText(`SCORE: ${this._lScore}`);
            this._collided = true;
            this.cam.shake(200, 0.01);
        }
    }
}

