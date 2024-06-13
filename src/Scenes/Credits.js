class Credits extends Phaser.Scene {
    constructor() {
        super("Credits");
    }

    init() {
        this.enterKey = null;
    }

    create() {
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        my.text.intro = this.add.bitmapText(50, 180, "blockFont", "    Thank you for playing!\n Made by Nathan Wiinikka\n       and Braden Humphrey\n\nPress ENTER to play again").setScale(2.0);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.scene.start("Title");
        }
    }
}