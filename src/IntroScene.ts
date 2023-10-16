import Sprite = Phaser.GameObjects.Sprite
import Animation = Phaser.Animations.Animation
import ANIMATION_COMPLETE = Phaser.Animations.Events.ANIMATION_COMPLETE
import ANIMATION_UPDATE = Phaser.Animations.Events.ANIMATION_UPDATE

import IMAGE_FIELD from "./assets/field.png"
import IMAGE_BULLS_LOGO from "./assets/bulls_logo.png"
import IMAGE_CATCHER from "./assets/catcher/catcher_1.png"
import IMAGE_BATTER_SPRITESHEET from "./assets/batter/batter_spritesheet.png"
import IMAGE_PITCHER_SPRITESHEET from "./assets/pitcher/pitcher_spritesheet.png"
import IMAGE_BALL_SPRITESHEET from "./assets/ball_spritesheet.png"

export class IntroScene extends Phaser.Scene {
    private batter: Sprite
    private pitcher: Sprite
    private catcher: Sprite
    private ball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    private initialBallPosition: Phaser.Math.Vector2
    private ballCatcherTarget: Phaser.Math.Vector2
    private initialCatcherTarget: Phaser.Math.Vector2
    private ballStrikeZoneEndTarget: Phaser.Math.Vector2
    private ballStrikeZoneStartTarget: Phaser.Math.Vector2
    private ballFlyTarget: Phaser.Math.Vector2

    private ballInStrikeZone = false
    private ballIsHit = false
    private balls = 0
    private strikes = 0
    private hits = 0
    private strikeOuts = 0

    private ballsText: Phaser.GameObjects.Text
    private strikesText: Phaser.GameObjects.Text
    private strikeOutsText: Phaser.GameObjects.Text
    private hitsText: Phaser.GameObjects.Text
    private strikeOutCallText: Phaser.GameObjects.Text

    constructor() {
        super({ key: "IntroScene", active: true })
    }

    preload() {
        this.load.image("field", IMAGE_FIELD)
        this.load.image("bulls_logo", IMAGE_BULLS_LOGO)
        this.load.image("catcher", IMAGE_CATCHER)
        this.load.spritesheet("batter", IMAGE_BATTER_SPRITESHEET, { frameWidth: 32, frameHeight: 32 })
        this.load.spritesheet("pitcher", IMAGE_PITCHER_SPRITESHEET, { frameWidth: 32, frameHeight: 32 })
        this.load.spritesheet("ball", IMAGE_BALL_SPRITESHEET, { frameWidth: 16, frameHeight: 16 })
    }

    create() {
        this.make
            .image({
                x: this.game.canvas.width / 2,
                y: this.game.canvas.height / 2,
                key: "field",
                add: true,
            })
            .setScale(2)

        this.make.image({
            x: 288,
            y: 514,
            key: "bulls_logo",
            add: true,
        })

        this.anims.create({
            key: "batter_idle",
            frames: this.anims.generateFrameNumbers("batter", { frames: [0, 1, 0] }),
            frameRate: 2,
            repeat: -1,
        })

        this.anims.create({
            key: "batter_swing",
            frames: this.anims.generateFrameNumbers("batter", { frames: [0, 1, 2, 3, 4] }),
            frameRate: 8,
            repeat: 0,
        })

        this.anims.create({
            key: "pitcher_idle",
            frames: this.anims.generateFrameNumbers("pitcher", { frames: [0, 1] }),
            frameRate: 2,
            repeat: -1,
        })

        this.anims.create({
            key: "pitcher_throw",
            frames: this.anims.generateFrameNumbers("pitcher", { frames: [0, 1, 2, 3, 4, 5, 6, 7, 7] }),
            frameRate: 4,
            repeat: 0,
        })

        this.anims.create({
            key: "ball_moving",
            frames: this.anims.generateFrameNumbers("ball", { frames: [0, 1] }),
            frameRate: 4,
            repeat: -1,
        })

        this.initialBallPosition = new Phaser.Math.Vector2(269, 182)
        this.ball = this.physics.add.sprite(this.initialBallPosition.x, this.initialBallPosition.y, "ball")
        this.ball.setVisible(false)
        this.ball.setScale(0.6)
        this.ball.setDepth(1)

        this.batter = this.add.sprite(268, 384, "batter")
        this.batter.setScale(2)
        this.batter.play("batter_idle")
        this.batter.setDepth(2)

        this.pitcher = this.add.sprite(279, 182, "pitcher")
        this.pitcher.setScale(2)
        this.pitcher.play("pitcher_idle")

        this.catcher = this.add.sprite(286, 412, "catcher")
        this.catcher.setScale(2)
        this.catcher.setDepth(3)

        this.initialCatcherTarget = new Phaser.Math.Vector2({
            x: 286,
            y: 412,
        })
        this.ballCatcherTarget = this.initialCatcherTarget.clone()

        this.ballStrikeZoneEndTarget = new Phaser.Math.Vector2({
            x: 286,
            y: 390,
        })

        this.ballStrikeZoneStartTarget = new Phaser.Math.Vector2({
            x: 286,
            y: 365,
        })

        if (this.physics.getConfig().debug) {
            this.physics.add.sprite(286, 390, "_").setVisible(false)
            this.physics.add.sprite(286, 365, "_").setVisible(false)
        }

        this.ballFlyTarget = new Phaser.Math.Vector2({
            x: 286,
            y: 0,
        })

        this.batter.on(ANIMATION_COMPLETE, (animation: Animation) => {
            if (animation.key === "batter_swing") {
                this.batter.play("batter_idle")
            }
        })

        this.pitcher.on(ANIMATION_COMPLETE, (animation: Animation) => {
            if (animation.key === "pitcher_throw") {
                this.pitcher.play("pitcher_idle")
            }
        })

        this.pitcher.on(ANIMATION_UPDATE, (animation: Animation, frame: Phaser.Animations.AnimationFrame) => {
            if (frame.index === 9) {
                this.ball.setVisible(true)
                this.ball.play("ball_moving")
                this.physics.moveToObject(this.ball, this.ballCatcherTarget, Phaser.Math.Between(100, 230))
            }
        })

        this.batter.on(ANIMATION_UPDATE, (animation: Animation, frame: Phaser.Animations.AnimationFrame) => {
            if (frame.index === 4 && this.ballInStrikeZone) {
                this.hitBall()
            }
        })

        this.input.keyboard?.addKeys({
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
        })

        const fontStyle = {
            fontFamily: "Courier New, Times, serif",
            color: "#000",
            fontSize: "32px",
            backgroundColor: "#949494",
        }
        this.ballsText = this.add.text(10, this.game.canvas.height - 156, `balls: ${this.balls}`, fontStyle)
        this.strikesText = this.add.text(10, this.game.canvas.height - 120, `strikes: ${this.strikes}`, fontStyle)
        this.hitsText = this.add.text(10, this.game.canvas.height - 84, `hits: ${this.strikes}`, fontStyle)
        this.strikeOutsText = this.add.text(10, this.game.canvas.height - 48, `strike outs: ${this.strikes}`, fontStyle)

        this.strikeOutCallText = this.add
            .text(200, this.game.canvas.height / 2, `Strikeout!`, {
                color: "#E20514",
                fontSize: "48px",
            })
            .setVisible(false)

        this.start()
    }

    private start() {
        this.throwPitch()
    }

    private hitBall() {
        this.hits++
        this.resetCount()
        this.updateText()
        this.physics.moveToObject(this.ball, this.ballFlyTarget, Phaser.Math.Between(200, 400))
        this.ballIsHit = true
    }

    private throwPitch() {
        const randomBallLocation = new Phaser.Math.Vector2(Phaser.Math.Between(-14, 14), 0)
        this.ballCatcherTarget.set(this.initialCatcherTarget.x + randomBallLocation.x, this.initialCatcherTarget.y)

        this.catcher.setPosition(this.ballCatcherTarget.x, this.ballCatcherTarget.y)
        this.ball.setVisible(false)
        this.ballInStrikeZone = false
        this.ballIsHit = false
        this.ball.body.reset(this.initialBallPosition.x, this.initialBallPosition.y)
        const delay = Phaser.Math.Between(2000, 4000)

        const pitcherThrows = () => {
            this.pitcher.play("pitcher_throw")
        }

        this.time.delayedCall(delay, pitcherThrows)
    }

    private callStrike() {
        if (this.strikes === 2) {
            this.callStrikeOut()
            this.resetCount()
        } else {
            this.strikes++
        }

        this.updateText()
        this.throwPitch()
    }

    private callStrikeOut() {
        this.strikeOuts++
        this.strikeOutCallText.setVisible(true)
        this.updateText()
        const hideText = () => {
            this.strikeOutCallText.setVisible(false)
        }

        this.time.delayedCall(2000, hideText)
    }

    private resetCount() {
        this.strikes = 0
        this.balls = 0
    }

    private updateText() {
        this.strikeOutsText.setText(`strike outs: ${this.strikeOuts}`)
        this.strikesText.setText(`strikes: ${this.strikes}`)
        this.ballsText.setText(`balls: ${this.balls}`)
        this.hitsText.setText(`hits: ${this.hits}`)
    }

    private callBall() {
        if (this.balls === 3) {
            this.resetCount()
        } else {
            this.balls++
        }

        this.updateText()

        this.throwPitch()
    }

    override update() {
        const cursors = this.input.keyboard?.createCursorKeys()
        const pointer = this.input.activePointer

        if (!cursors && !pointer) {
            return
        }

        if (cursors?.space.isDown || pointer.isDown) {
            this.batter.play("batter_swing")
        }

        const tolerance = (200 * 1.5) / this.game.loop.targetFps
        const distanceToFlyBall = Phaser.Math.Distance.BetweenPoints(this.ball, this.ballFlyTarget)

        if (!this.ballIsHit) {
            const strikeZoneTolerance = Phaser.Math.Distance.BetweenPoints(
                this.ballStrikeZoneStartTarget,
                this.ballStrikeZoneEndTarget
            )
            const distanceToStrikeZone = Phaser.Math.Distance.BetweenPoints(this.ball, this.ballStrikeZoneEndTarget)
            const distanceToCatcher = Phaser.Math.Distance.BetweenPoints(this.ball, this.ballCatcherTarget)

            if (this.ball.body?.speed > 0) {
                if (!this.ballInStrikeZone && distanceToStrikeZone < strikeZoneTolerance) {
                    this.ballInStrikeZone = true
                } else if (distanceToCatcher < tolerance) {
                    if (
                        this.ballCatcherTarget.x > this.ballStrikeZoneEndTarget.x + 10 ||
                        this.ballCatcherTarget.x < this.ballStrikeZoneEndTarget.x - 10
                    ) {
                        this.callBall()
                    } else {
                        this.callStrike()
                    }
                }
            }
        } else if (distanceToFlyBall < tolerance) {
            this.throwPitch()
        }
    }
}
