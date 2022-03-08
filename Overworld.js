class Overworld {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d")
    }
    init() {
        const image = new Image();
        image.onload = () => {
            this.ctx.drawImage(image)
        };
        image.src = "/images/maps/DemoLower.png"

        const x = 5
        const y = 6

        const shadow = new Image()
        shadow.onload = () => {
            this.ctx.drawImage(
                shadow,
                0, //left cut
                0,  //top cut
                32, //whidth cut
                32, //hight cut
                x,
                y,
                32,
                32
            )

        }
        shadow.src = "./images/characters/shadow"
        const hero = new Image()
        hero.onload = () => {
            this.ctx.drawImage(
                hero,
                0, //left cut
                0,  //top cut
                32, //whidth cut
                32, //hight cut
                x,
                y,
                32,
                32
            )

        }
        hero.src = "./images/characters/people/hero.png"
    }
}