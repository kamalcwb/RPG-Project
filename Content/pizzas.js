window.PizzaTypes = {
  normal: "normal",
  spicy: "spicy",
  veggie: "veggie",
  fungi: "fungi",
  chill: "chill",
}

window.Pizzas = {
  "s001": {
    name: "Calabresa",
    description: "Um guerreiro picante",
    type: PizzaTypes.spicy,
    src: "/images/characters/pizzas/s001.png",
    icon: "/images/icons/spicy.png",
    actions: ["saucyStatus", "clumsyStatus", "damage1"],
  },
  "s002": {
    name: "Frango com Bacon",
    description: "Um guerreiro salgado que não teme nada",
    type: PizzaTypes.spicy,
    src: "/images/characters/pizzas/s002.png",
    icon: "/images/icons/spicy.png",
    actions: ["damage1", "saucyStatus", "clumsyStatus"],
  },
  "v001": {
    name: "Manjerona",
    description: "Verde como o Hulk",
    type: PizzaTypes.veggie,
    src: "/images/characters/pizzas/v001.png",
    icon: "/images/icons/veggie.png",
    actions: ["damage1"],
  },
  "f001": {
    name: "Cogumelos",
    description: "Um guerreiro incompreendido",
    type: PizzaTypes.fungi,
    src: "/images/characters/pizzas/f001.png",
    icon: "/images/icons/fungi.png",
    actions: ["damage1"],
  }
}