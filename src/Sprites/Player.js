class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);

        this.scene = scene;
        this.VELOCITY = 200;
        this.JUMP_VELOCITY = -250
        this.PARTICLE_VELOCITY = 25;
        this.DRAG = 600;

        return this;
    }

    update(cursors, dust) {
        if (cursors.left.isDown) {
            this.body.setVelocityX(-this.VELOCITY);
            this.resetFlip();
            this.anims.play('walk', true);
            if (dust) {
                dust.startFollow(this, this.displayWidth / 2 - 10, this.displayHeight / 2 - 5, false);

                dust.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                
                // Only play smoke effect if touching the ground
                if (this.body.blocked.down) {
                    dust.start();
                }
                else {
                    dust.stop();
                }
            }
        } 
        else if (cursors.right.isDown) {
            this.body.setVelocityX(this.VELOCITY);
            this.setFlip(true, false);
            this.anims.play('walk', true);
            if (dust) {
                dust.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);

                dust.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

                // Only play smoke effect if touching the ground
                if (my.sprite.player.body.blocked.down) {
                    dust.start();
                }
                else {
                    dust.stop();
                }
            }
        }
        else {
            this.body.setDragX(this.DRAG);
            this.anims.play('idle', true);
            if (dust) {
                dust.stop();
            }
        }

        if (!this.body.blocked.down) {
            this.anims.play('jump');
        } else {
            this.scene.currJumps = this.scene.totalJumps;
        }
        
        if (!this.body.blocked.down && this.scene.currJumps > 0 && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            if (this.scene.currJumps === this.scene.totalJumps){
                this.scene.currJumps--;
            }
            this.body.setVelocityY(this.JUMP_VELOCITY);
            this.scene.currJumps--;
            this.scene.sound.play("sfx_jump");
        }
        if (this.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            this.body.setVelocityY(this.JUMP_VELOCITY);
            this.scene.currJumps = this.scene.totalJumps - 1;
            this.scene.sound.play("sfx_jump");
        }
    }
}