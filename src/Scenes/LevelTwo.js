class LevelTwo extends Phaser.Scene {
    constructor() {
        super("levelTwo");
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
        this.map = this.add.tilemap("platformer-level-2", 18, 18, 45, 45);

        this.tileset = this.map.addTilesetImage("AutumnFarm_tilemap_packed", "tilemap_tiles");
        this.tileset2 = this.map.addTilesetImage("Regular_tilemap_packed", "tilemap_tiles2");
        this.backgroundSet = this.map.addTilesetImage("backgrounds_packed", "tilemap_backgrounds");

        this.background = this.map.createLayer("background", this.backgroundSet, 0, 0);
        this.background.setScrollFactor(0.25, 1);

        this.groundLayer1 = this.map.createLayer("ground-n-objects1", this.tileset, 0, 0);
        this.groundLayer1.setCollisionByProperty({
            collides: true
        });
        this.groundLayer2 = this.map.createLayer("ground-n-objects2", this.tileset2, 0, 0);
        this.groundLayer2.setCollisionByProperty({
            collides: true
        });

        this.flags = this.map.createLayer("flags-n-keys", this.tileset, 0, 0);

        this.killZone = this.map.createFromObjects("death-zone", {
            name: "liquidDeath",
            key: "tilemap_sheet2",
            frame: 73
        });

        this.physics.world.enable(this.killZone, Phaser.Physics.Arcade.STATIC_BODY);
        this.killZoneGroup = this.add.group(this.killZone);

        // create cursors here to put into player creation
        cursors = this.input.keyboard.createCursorKeys();

        // create shift key to put into player creation for sprint
        this.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        // Create player and adjust hit zone to align sprite        
        my.sprite.player = new Player(this, 130, 786, 'idle', null, cursors, this.shift);
        my.sprite.player.setSize(24, 24);
        my.sprite.player.setOffset(0, 0);

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['dirt_02.png', 'dirt_03.png'],
            scale: {start: 0.02, end: 0.05},
            maxAliveParticles: 4,
            lifespan: 150,
            gravityY: -100,
            alpha: {start: 1, end: 0.1},
        });

        my.vfx.walking.stop();

        this.water = this.map.createLayer("water", this.tileset2, 0, 0);

        this.physics.add.collider(my.sprite.player, this.groundLayer2);
        this.physics.add.collider(my.sprite.player, this.groundLayer1);

        this.physics.add.overlap(my.sprite.player, this.killZoneGroup, (obj1, obj2) => {
            this.scene.restart();
        });

        this.physics.world.TILE_BIAS = 36;

        this.animatedTiles.init(this.map);

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels + 100);
        this.cameras.main.startFollow(my.sprite.player, true, 1, 0.25, -20, 20); // (target, [,roundPixels][,lerpX][,lerpY], x offset, y offset)
        this.cameras.main.setDeadzone(30, 30);
        this.cameras.main.setZoom(this.SCALE);

    }

    update() {
        // Call update function in Player.js for player character
        // Second parameter can be null for no particle affects
        my.sprite.player.update(my.vfx.walking);
    }
}