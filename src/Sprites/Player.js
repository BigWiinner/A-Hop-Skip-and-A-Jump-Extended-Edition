class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture, frame, cursors, shift) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);

        this.scene = scene;
        this.cursors = cursors;
        this.shift = shift;
        this.timer = 0;
        this.wallJump = false;
        this.ACCELERATION = 10;
        this.VELOCITY = 0;
        this.MAXVELOCITY = 200;
        this.JUMP_VELOCITY = -250
        this.PARTICLE_VELOCITY = 25;
        this.DRAG = 600;

        return this;
    }

    // Movement controls
    // and, if given, particle effects
    update(dust) {
        // if shift is down, allow player to dash
        if (this.shift.isDown) {
            this.MAXVELOCITY = 400;
        } else {
            this.MAXVELOCITY = 200;
        }

        if (this.cursors.left.isDown) {
            if (this.VELOCITY >= -this.MAXVELOCITY) {
                // If player is on the ground, slow down like normal
                // if in air, slow down until velocity is about 0
                if (this.body.blocked.down) {
                    this.VELOCITY -= this.ACCELERATION;
                    this.resetFlip();
                }
                else {
                    if (this.VELOCITY > 0) {
                        this.VELOCITY -= this.ACCELERATION * 0.4;
                    }
                    if (this.VELOCITY > -this.MAXVELOCITY) {
                        this.VELOCITY -= this.ACCELERATION * 0.175;
                    }
                }
            }
            if (this.VELOCITY < -this.MAXVELOCITY && this.body.blocked.down) {
                this.VELOCITY += this.ACCELERATION;
            }
            this.body.setVelocityX(this.VELOCITY);
            this.anims.play('walk', true);

            // apply dust effect if given
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
        else if (this.cursors.right.isDown) {
            if(this.VELOCITY <= this.MAXVELOCITY) {
                // If player is on the ground, slow down like normal
                // if in air, slow down until velocity is about 0
                if (this.body.blocked.down) {
                    this.VELOCITY += this.ACCELERATION;
                    this.setFlip(true, false);
                }
                else {
                    if (this.VELOCITY < 0) {
                        this.VELOCITY += this.ACCELERATION * 0.4;
                    }
                    if (this.VELOCITY < this.MAXVELOCITY) {
                        this.VELOCITY += this.ACCELERATION * 0.175;
                    }
                } 
            }
            if (this.VELOCITY > this.MAXVELOCITY && this.body.blocked.down) {
                this.VELOCITY -= this.ACCELERATION;
            }
            this.body.setVelocityX(this.VELOCITY);
            this.anims.play('walk', true);

            // apply dust effect if given
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
            // Slow player down to a halt, resetting its current velocity too
            this.body.setDragX(this.DRAG);
            if (this.VELOCITY > 0) {
                this.VELOCITY -= this.ACCELERATION * 2;
            }
            if (this.VELOCITY < 0) {
                this.VELOCITY += this.ACCELERATION * 2;
            }
            this.anims.play('idle', true);
            if (dust) {
                dust.stop();
            }
        }

        // figure out if the player is jumping, and how many times
        // they can jump mid-air
        if (!this.body.blocked.down) {
            this.anims.play('jump');
        } else {
            this.scene.currJumps = this.scene.totalJumps;
            this.wallJump = false;
        }
        if (this.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.body.setVelocityY(this.JUMP_VELOCITY);
            this.scene.currJumps = this.scene.totalJumps - 1;
            this.scene.sound.play("sfx_jump");
        }

        // timer when player is up against a wall to determine
        // if they can wall jump
        if (this.body.blocked.left || this.body.blocked.right) {
            this.timer++
        }
        else {
            this.timer = 0;
        }
        
        // determine if the player can either wall jump or double jump
        if (!this.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            // wall jumps
            if (this.body.blocked.left && (this.timer > 20 || this.wallJump == true)) {
                this.VELOCITY = 250;
                this.wallJump = true;
                this.body.setVelocityY(this.JUMP_VELOCITY);
                this.setFlip(true, false);
                this.scene.sound.play("sfx_jump");
            }
            else if (this.body.blocked.right && (this.timer > 20 || this.wallJump == true)) {
                this.VELOCITY = -250;
                this.wallJump = true;
                this.body.setVelocityY(this.JUMP_VELOCITY);
                this.resetFlip();
                this.scene.sound.play("sfx_jump");
            }
            // double jumps
            else if (this.scene.currJumps > 0) {
                if (this.scene.currJumps === this.scene.totalJumps){
                    this.scene.currJumps--;
                }
                this.body.setVelocityY(this.JUMP_VELOCITY);
                this.scene.currJumps--;
                this.scene.sound.play("sfx_jump");
            }
        }
    }
}