class Title extends Phaser.Scene {
    constructor() {
        super("Title");
    }

    init() {
        this.enterKey = null;
        this.count = 0;
    }

    create() {
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        my.text.intro = this.add.bitmapText(80, 180, "blockFont", "A Hop, Skip, and a Jump \n      Extended Edition\n\n  Press ENTER to start").setScale(2.0);
        my.text.controls = this.add.bitmapText(60, 180, "blockFont", "                           Arrow keys to move and jump\n                                     Hold shift to sprint\nJump while leaning against a wall to wall jump\n                                   Press R to reset level\n\n                                     Press ENTER to start");
        my.text.controls.visible = false;
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            my.text.intro.setVisible(false);
            my.text.controls.setVisible(true);
            this.count++;
            if (this.count > 1) {
                this.scene.start("platformerScene");
            }
        }
    }
}