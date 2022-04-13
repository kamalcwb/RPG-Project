window.Actions = {
  damage1: {
    name: "Metralhadora de Calabresa",
    description: "Ataque com calabresa",
    success: [
      { type: "textMessage", text: "{CASTER} usa {ACTION}!" },
      { type: "animation", animation: "spin" },
      { type: "stateChange", damage: 10 }
    ]
  },
  saucyStatus: {
    name: "Adicional de Catupiry",
    description: "Aplica encorajamento",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} usa {ACTION}!" },
      { type: "stateChange", status: { type: "saucy", expiresIn: 3 } }
    ]
  },
  clumsyStatus: {
    name: "Azeite de Oliva",
    description: "Confusão escorregadia",
    success: [
      { type: "textMessage", text: "{CASTER} usa {ACTION}!" },
      { type: "animation", animation: "glob", color: "#dafd2a" },
      { type: "stateChange", status: { type: "clumsy", expiresIn: 3 } },
      { type: "textMessage", text: "{TARGET} está escorregando ao redor!" },
    ]
  },
  //Items
  item_recoverStatus: {
    name: "Direto do Forno",
    description: "Sentido-se aquecido",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} usa {ACTION}!" },
      { type: "stateChange", status: null },
      { type: "textMessage", text: "Sentido-se aquecido!", },
    ]
  },
  item_recoverHp: {
    name: "Parmesão",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} borrifa algum {ACTION}!", },
      { type: "stateChange", recover: 10, },
      { type: "textMessage", text: "{CASTER} recupera HP!", },
    ]
  },
}