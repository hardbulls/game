import Phaser from "phaser"
import { IntroScene } from "./IntroScene"

if (process.env["NODE_ENV"] === "production") {
    console.log = () => undefined
}

window.onload = () => {
    const container = window.document.querySelector(".game-canvas") as HTMLElement
    if (container) {
        new Phaser.Game({
            type: Phaser.AUTO,
            width: 600,
            height: 600,
            parent: container,
            pixelArt: true,
            backgroundColor: "#1e8415",
            fps: {
                min: 30,
                limit: 60,
            },
            scene: [IntroScene],
            scale: {
                mode: Phaser.Scale.FIT,
            },
            physics: {
                default: "arcade",
                arcade: {
                    debug: false,
                },
            },
            input: {
                keyboard: true,
            },
        })
    }
}
