class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.physics.world.gravity.y = 550;
        this.SCALE = 1.5;
        this.win = false;
        this.enterKey = null;
        this.totalJumps = 1;
        this.currJumps = 1;
        this.timer = 0;
    }

    preload() {
        this.load.scenePlugin("AnimatedTiles", "./lib/AnimatedTiles.js", "animatedTiles", "animatedTiles");
    }

    create() {
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 45);

        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        
        // create r key for reset button
        this.rKey = this.input.keyboard.addKey('R');

        this.tileset = this.map.addTilesetImage("AutumnFarm_tilemap_packed", "tilemap_tiles");
        this.tileset2 = this.map.addTilesetImage("Regular_tilemap_packed", "tilemap_tiles2");
        this.backgroundSet = this.map.addTilesetImage("backgrounds_packed", "tilemap_backgrounds");

        this.helper = this.map.createFromObjects("Helper", {
            name: "help",
            key: "tilemap_sheet",
            frame: 5
        });

        this.background = this.map.createLayer("background", this.backgroundSet, 0, 0);
        this.background.setScrollFactor(0.25, 1);
        this.groundLayer2 = this.map.createLayer("ground-n-objects2", this.tileset2, 0, 0);
        this.groundLayer2.setCollisionByProperty({
            collides: true
        });
        this.groundLayer1 = this.map.createLayer("ground-n-objects1", this.tileset, 0, 0);
        this.groundLayer1.setCollisionByProperty({
            collides: true
        });
        
        this.pumpkin = this.map.createFromObjects("End-Condition", {
            name: "pumpkin",
            key: "tilemap_sheet",
            frame: 5
        });

        this.carrot = this.map.createFromObjects("Power-Ups", {
            name: "carrot",
            key: "tilemap_sheet",
            frame: 56
        });

        this.flags = this.map.createLayer("flags-n-keys", this.tileset, 0, 0);

        // create cursors here to put into player creation
        cursors = this.input.keyboard.createCursorKeys();

        // create shift key to put into player creation for sprint
        this.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // Create player and adjust hit zone to align sprite
        my.sprite.player = new Player(this, 130, 350, 'idle', null, cursors, this.shift);
        my.sprite.player.setSize(24, 24);
        my.sprite.player.setOffset(0, 0);

        this.water = this.map.createLayer("water", this.tileset2, 0, 0);

        this.physics.world.enable(this.pumpkin, Phaser.Physics.Arcade.STATIC_BODY);
        this.pumpkinGroup = this.add.group(this.pumpkin);
        
        this.physics.world.enable(this.helper, Phaser.Physics.Arcade.STATIC_BODY);
        this.helperGroup = this.add.group(this.helper);

        this.physics.world.enable(this.carrot, Phaser.Physics.Arcade.STATIC_BODY);
        this.carrotGroup = this.add.group(this.carrot);

        this.animatedTiles.init(this.map);

        this.physics.world.TILE_BIAS = 36;

        this.physics.add.collider(my.sprite.player, this.groundLayer2);
        this.physics.add.collider(my.sprite.player, this.groundLayer1);
        this.physics.add.collider(my.sprite.player, this.flags);

        this.animatedTiles.init(this.map);

        this.physics.add.overlap(my.sprite.player, this.pumpkinGroup, (obj1, obj2) => {
            this.win = true;
        });

        this.physics.add.overlap(my.sprite.player, this.helperGroup, (obj1, obj2) => {
            this.timer = 30;
        });

        this.physics.add.overlap(my.sprite.player, this.carrotGroup, (obj1, obj2) => {
            obj2.destroy();
            this.totalJumps += 1;
            this.sound.play("sfx_powerup");
        });

        // To be passed onto update for player sprite
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['dirt_02.png', 'dirt_03.png'],
            scale: {start: 0.02, end: 0.05},
            maxAliveParticles: 4,
            lifespan: 150,
            gravityY: -100,
            alpha: {start: 1, end: 0.1},
        });

        my.vfx.walking.stop();

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels + 100);
        this.cameras.main.startFollow(my.sprite.player, true, 1, 0.25, -150, 20); // (target, [,roundPixels][,lerpX][,lerpY], x offset, y offset)
        this.cameras.main.setDeadzone(30, 30);
        this.cameras.main.setZoom(this.SCALE);

        my.text.levelComplete = this.add.bitmapText(this.map.widthInPixels - 425, 100, "blockFont", "         Level complete! \nPress ENTER to continue");
        my.text.levelComplete.visible = false;

        my.text.info = this.add.bitmapText(195, 300, "blockFont", "      Collect carrots to \n        gain more jumps!\nHelp me find my friend!").setScale(0.5);
        my.text.info.visible = false;

        my.text.found = this.add.bitmapText(this.map.widthInPixels - 135, 20, "blockFont", "You found me!").setScale(0.5);
        my.text.found.visible = false;

    }

    update() {
        // Call update function in Player.js for player character
        // Second parameter can be null for no particle affects
        my.sprite.player.update(my.vfx.walking);

        // Player falls off of map, loses!
        if ((my.sprite.player.y > game.config.height && !this.win) || Phaser.Input.Keyboard.JustDown(this.rKey)) {
            // Probably should display some text and stuff
            this.scene.restart();
        }

        // Displays text for a set amount of time when player is within range
        if (this.timer > 0) {
            my.text.info.setVisible(true);
            this.timer--;
        } else {
            my.text.info.setVisible(false);
        }

        // Win condition is met, player is shown text and is able to reset
        // level by pressing ENTER
        if (this.win) {
            my.text.levelComplete.setVisible(true);
            my.text.found.setVisible(true);
            this.cameras.main.stopFollow();
            if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
                this.scene.start("levelTwo");
            }
        }
    }
}