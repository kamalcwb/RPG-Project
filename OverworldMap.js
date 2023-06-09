class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.isPaused = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    )
  }

  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {

      let object = this.gameObjects[key];
      object.id = key;

      object.mount(this);

    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      const result = await eventHandler.init();
      if (result === "LOST_BATTLE") {
        break;
      }
    }

    this.isCutscenePlaying = false;

    Object.values(this.gameObjects).forEach(object => {
      const current = object.behaviorLoop[object.behaviorLoopIndex];
      if (current && current.type === "stand") {
        object.doBehaviorEvent(this);
      }
    })

  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {

      const relevantScenario = match.talking.find(scenario => {
        return (scenario.required || []).every(sf => {
          return playerState.storyFlags[sf]
        })
      })
      relevantScenario && this.startCutscene(relevantScenario.events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene(match[0].events)
    }
  }

  addWall(x, y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x, y) {
    delete this.walls[`${x},${y}`]
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const { x, y } = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x, y);
  }

}

window.OverworldMaps = {
  DemoRoom: {
    id: "DemoRoom",
    lowerSrc: "/images/maps/DemoLower.png",
    upperSrc: "/images/maps/DemoUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      npcA: new Person({
        x: utils.withGrid(9),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "walk", direction: "left", },
          { type: "walk", direction: "down", },
          { type: "walk", direction: "right", },
          { type: "walk", direction: "up", },
          { type: "stand", direction: "up", time: 400, },
        ],
        talking: [
          {
            required: ["DEFEATED_BETH"],
            events: [
              { type: "textMessage", text: "Betina diz: Foi uma ótima batalha...", faceHero: "npcA" },
            ]
          },
          {
            events: [
              { type: "textMessage", text: "Betina diz: Eu vou esmagar você!", faceHero: "npcA" },
              { type: "battle", enemyId: "beth" },
              { type: "addStoryFlag", flag: "DEFEATED_BETH" },
              { type: "textMessage", text: "Betina diz: Você acabou comigo.", faceHero: "npcA" },
              { type: "textMessage", text: "Vá embora!" }
            ]
          }
        ]
      }),
      npcC: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "stand", direction: "left", time: 1500, },
          { type: "stand", direction: "down", time: 2500, },
          { type: "stand", direction: "right", time: 1500, },
          { type: "stand", direction: "up", time: 3500, },
        ],
        talking: [
          {
            // required: ["DEFEATED_BETH"],
            events: [
              { type: "textMessage", text: "Lisa diz: Você já usou a Pedra da Pizza?", faceHero: "npcC" },
            ]
          },
        ]
      }),
      npcB: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "/images/characters/people/erio.png",
        talking: [
          {
            required: ["DEFEATED_ERIO"],
            events: [
              { type: "textMessage", text: "Erio diz: Parabéns, você realmente é muito forte!", faceHero: "npcB" },
              { type: "addStoryFlag", flag: "TALKED_TO_ERIO" }
            ]
          },
          {
            events: [
              { type: "textMessage", text: "Erio diz: Hahaha, vamos batalhar!", faceHero: "npcB" },
              { type: "addStoryFlag", flag: "DEFEATED_ERIO" },
              { type: "battle", enemyId: "erio" }
            ]
          }
        ],
        behaviorLoop: [
          { type: "walk", direction: "left" },
          { type: "stand", direction: "up", time: 800 },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
        ]
      }),
      pizzaStone: new PizzaStone({
        x: utils.withGrid(2),
        y: utils.withGrid(7),
        storyFlag: "USED_PIZZA_STONE",
        pizzas: ["v001", "f001"],
      }),
    },
    walls: {
      [utils.asGridCoord(7, 6)]: true,
      [utils.asGridCoord(8, 6)]: true,
      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(8, 7)]: true,
      [utils.asGridCoord(6, 4)]: true,
      [utils.asGridCoord(8, 4)]: true,
      [utils.asGridCoord(0, 3)]: true,
      [utils.asGridCoord(1, 3)]: true,
      [utils.asGridCoord(2, 3)]: true,
      [utils.asGridCoord(3, 3)]: true,
      [utils.asGridCoord(4, 3)]: true,
      [utils.asGridCoord(5, 3)]: true,
      [utils.asGridCoord(6, 3)]: true,
      [utils.asGridCoord(7, 3)]: true,
      [utils.asGridCoord(8, 3)]: true,
      [utils.asGridCoord(9, 3)]: true,
      [utils.asGridCoord(10, 3)]: true,
      [utils.asGridCoord(0, 0)]: true,
      [utils.asGridCoord(0, 1)]: true,
      [utils.asGridCoord(0, 2)]: true,
      [utils.asGridCoord(0, 3)]: true,
      [utils.asGridCoord(0, 4)]: true,
      [utils.asGridCoord(0, 5)]: true,
      [utils.asGridCoord(0, 6)]: true,
      [utils.asGridCoord(0, 7)]: true,
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(0, 9)]: true,
      [utils.asGridCoord(0, 10)]: true,
      [utils.asGridCoord(0, 11)]: true,
      [utils.asGridCoord(11, 0)]: true,
      [utils.asGridCoord(11, 1)]: true,
      [utils.asGridCoord(11, 2)]: true,
      [utils.asGridCoord(11, 3)]: true,
      [utils.asGridCoord(11, 4)]: true,
      [utils.asGridCoord(11, 5)]: true,
      [utils.asGridCoord(11, 6)]: true,
      [utils.asGridCoord(11, 7)]: true,
      [utils.asGridCoord(11, 8)]: true,
      [utils.asGridCoord(11, 9)]: true,
      [utils.asGridCoord(11, 10)]: true,
      [utils.asGridCoord(11, 11)]: true,
      [utils.asGridCoord(0, 10)]: true,
      [utils.asGridCoord(1, 10)]: true,
      [utils.asGridCoord(2, 10)]: true,
      [utils.asGridCoord(3, 10)]: true,
      [utils.asGridCoord(4, 10)]: true,
      [utils.asGridCoord(6, 10)]: true,
      [utils.asGridCoord(7, 10)]: true,
      [utils.asGridCoord(8, 10)]: true,
      [utils.asGridCoord(9, 10)]: true,
      [utils.asGridCoord(10, 10)]: true,
      [utils.asGridCoord(11, 10)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7, 4)]: [
        {
          events: [
            { who: "npcB", type: "walk", direction: "left" },
            { who: "npcB", type: "stand", direction: "up", time: 500 },
            { type: "textMessage", text: "Voce não pode entrar aqui!" },
            { who: "npcB", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "walk", direction: "left" },
          ]
        }
      ],
      [utils.asGridCoord(5, 10)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Street",
              x: utils.withGrid(5),
              y: utils.withGrid(9),
              direction: "down"
            }
          ]
        }
      ]
    }

  },
  Kitchen: {
    id: "Kitchen",
    lowerSrc: "/images/maps/KitchenLower.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      npcB: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc3.png",
        talking: [
          {
            required: ["DEFEATED_BETH", "DEFEATED_ERIO"],
            events: [
              { type: "textMessage", text: "Bilu diz: Você conseguiu, provou ser forte!", faceHero: "npcB" },
              { type: "textMessage", text: "Mas ainda tem um último desafio!", faceHero: "npcB" },
              { type: "textMessage", text: "Precisa me derrotar para provar ser o mais forte de todos!", faceHero: "npcB" },
              { type: "battle", enemyId: "bilu" }
            ]
          },
          {
            events: [
              { type: "textMessage", text: "Bilu diz: Você ainda não é forte o suficiente", faceHero: "npcB" },
            ]
          }
        ]
      })
    },
    walls: {
      [utils.asGridCoord(0, 4)]: true,
      [utils.asGridCoord(1, 4)]: true,
      [utils.asGridCoord(2, 4)]: true,
      [utils.asGridCoord(3, 4)]: true,
      [utils.asGridCoord(4, 3)]: true,
      [utils.asGridCoord(5, 4)]: true,
      [utils.asGridCoord(6, 4)]: true,
      [utils.asGridCoord(7, 4)]: true,
      [utils.asGridCoord(8, 4)]: true,
      [utils.asGridCoord(9, 4)]: true,
      [utils.asGridCoord(10, 4)]: true,
      [utils.asGridCoord(11, 5)]: true,
      [utils.asGridCoord(12, 5)]: true,
      [utils.asGridCoord(1, 5)]: true,
      [utils.asGridCoord(1, 6)]: true,
      [utils.asGridCoord(1, 7)]: true,
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(1, 9)]: true,
      [utils.asGridCoord(13, 6)]: true,
      [utils.asGridCoord(13, 7)]: true,
      [utils.asGridCoord(13, 8)]: true,
      [utils.asGridCoord(13, 9)]: true,
      [utils.asGridCoord(13, 10)]: true,
      [utils.asGridCoord(2, 9)]: true,
      [utils.asGridCoord(3, 10)]: true,
      [utils.asGridCoord(4, 10)]: true,
      [utils.asGridCoord(5, 11)]: true,
      [utils.asGridCoord(6, 10)]: true,
      [utils.asGridCoord(7, 10)]: true,
      [utils.asGridCoord(8, 10)]: true,
      [utils.asGridCoord(9, 10)]: true,
      [utils.asGridCoord(10, 10)]: true,
      [utils.asGridCoord(11, 10)]: true,
      [utils.asGridCoord(12, 10)]: true,
      [utils.asGridCoord(6, 7)]: true,
      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(9, 7)]: true,
      [utils.asGridCoord(10, 7)]: true,
      [utils.asGridCoord(9, 9)]: true,
      [utils.asGridCoord(10, 9)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5, 10)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Street",
              x: utils.withGrid(29),
              y: utils.withGrid(9),
              direction: "down"
            }
          ]
        }
      ]
    }
  },
  Street: {
    id: "Street",
    lowerSrc: "/images/maps/StreetLower.png",
    upperSrc: "/images/maps/StreetUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(30),
        y: utils.withGrid(10),
      }),
      // npcE: new Person({
      //   x: utils.withGrid(8),
      //   y: utils.withGrid(5),
      //   src: "/images/characters/people/erio.png",
      //   talking: [
      //     {
      //       events: [
      //         { type: "textMessage", text: "Hahaha!", faceHero: "npcB" },
      //         { type: "addStoryFlag", flag: "TALKED_TO_ERIO" },
      //         { type: "battle", enemyId: "erio" }
      //       ]
      //     }
      //   ],
      //   behaviorLoop: [
      //     { type: "walk", direction: "left" },
      //     { type: "stand", direction: "up", time: 800 },
      //     { type: "walk", direction: "up" },
      //     { type: "walk", direction: "right" },
      //     { type: "walk", direction: "down" },
      //   ]
      // }),
    },
    walls: {
      [utils.asGridCoord(4, 9)]: true,
      [utils.asGridCoord(5, 8)]: true,
      [utils.asGridCoord(6, 9)]: true,
      [utils.asGridCoord(7, 9)]: true,
      [utils.asGridCoord(8, 9)]: true,
      [utils.asGridCoord(9, 9)]: true,
      [utils.asGridCoord(10, 9)]: true,
      [utils.asGridCoord(11, 9)]: true,
      [utils.asGridCoord(12, 9)]: true,
      [utils.asGridCoord(13, 8)]: true,
      [utils.asGridCoord(14, 8)]: true,
      [utils.asGridCoord(15, 7)]: true,
      [utils.asGridCoord(16, 7)]: true,
      [utils.asGridCoord(17, 7)]: true,
      [utils.asGridCoord(18, 7)]: true,
      [utils.asGridCoord(19, 7)]: true,
      [utils.asGridCoord(20, 7)]: true,
      [utils.asGridCoord(21, 7)]: true,
      [utils.asGridCoord(22, 7)]: true,
      [utils.asGridCoord(23, 7)]: true,
      [utils.asGridCoord(24, 7)]: true,
      [utils.asGridCoord(24, 6)]: true,
      [utils.asGridCoord(24, 5)]: true,
      [utils.asGridCoord(25, 5)]: true,
      [utils.asGridCoord(26, 6)]: true,
      [utils.asGridCoord(26, 7)]: true,
      [utils.asGridCoord(27, 7)]: true,
      [utils.asGridCoord(28, 8)]: true,
      [utils.asGridCoord(28, 9)]: true,
      [utils.asGridCoord(29, 8)]: true,
      [utils.asGridCoord(28, 9)]: true,
      [utils.asGridCoord(30, 9)]: true,
      [utils.asGridCoord(31, 9)]: true,
      [utils.asGridCoord(32, 9)]: true,
      [utils.asGridCoord(33, 9)]: true,
      [utils.asGridCoord(34, 10)]: true,
      [utils.asGridCoord(34, 11)]: true,
      [utils.asGridCoord(34, 12)]: true,
      [utils.asGridCoord(34, 13)]: true,
      [utils.asGridCoord(4, 14)]: true,
      [utils.asGridCoord(5, 14)]: true,
      [utils.asGridCoord(6, 14)]: true,
      [utils.asGridCoord(7, 14)]: true,
      [utils.asGridCoord(8, 14)]: true,
      [utils.asGridCoord(9, 14)]: true,
      [utils.asGridCoord(10, 14)]: true,
      [utils.asGridCoord(11, 14)]: true,
      [utils.asGridCoord(12, 14)]: true,
      [utils.asGridCoord(13, 14)]: true,
      [utils.asGridCoord(14, 14)]: true,
      [utils.asGridCoord(15, 14)]: true,
      [utils.asGridCoord(16, 14)]: true,
      [utils.asGridCoord(17, 14)]: true,
      [utils.asGridCoord(18, 14)]: true,
      [utils.asGridCoord(19, 14)]: true,
      [utils.asGridCoord(20, 14)]: true,
      [utils.asGridCoord(21, 14)]: true,
      [utils.asGridCoord(22, 14)]: true,
      [utils.asGridCoord(23, 14)]: true,
      [utils.asGridCoord(24, 14)]: true,
      [utils.asGridCoord(25, 14)]: true,
      [utils.asGridCoord(26, 14)]: true,
      [utils.asGridCoord(27, 14)]: true,
      [utils.asGridCoord(28, 14)]: true,
      [utils.asGridCoord(29, 14)]: true,
      [utils.asGridCoord(30, 14)]: true,
      [utils.asGridCoord(31, 14)]: true,
      [utils.asGridCoord(32, 14)]: true,
      [utils.asGridCoord(33, 14)]: true,
      [utils.asGridCoord(3, 10)]: true,
      [utils.asGridCoord(3, 11)]: true,
      [utils.asGridCoord(3, 12)]: true,
      [utils.asGridCoord(3, 13)]: true,
      [utils.asGridCoord(16, 9)]: true,
      [utils.asGridCoord(16, 10)]: true,
      [utils.asGridCoord(16, 11)]: true,
      [utils.asGridCoord(17, 9)]: true,
      [utils.asGridCoord(17, 10)]: true,
      [utils.asGridCoord(17, 11)]: true,
      [utils.asGridCoord(25, 9)]: true,
      [utils.asGridCoord(25, 10)]: true,
      [utils.asGridCoord(25, 11)]: true,
      [utils.asGridCoord(26, 9)]: true,
      [utils.asGridCoord(26, 10)]: true,
      [utils.asGridCoord(26, 11)]: true,
      [utils.asGridCoord(18, 11)]: true,
      [utils.asGridCoord(19, 11)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(29, 9)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Kitchen",
              x: utils.withGrid(5),
              y: utils.withGrid(10),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(5, 9)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "DemoRoom",
              x: utils.withGrid(5),
              y: utils.withGrid(10),
              direction: "up"
            }
          ]
        }
      ]
    }
  }
}