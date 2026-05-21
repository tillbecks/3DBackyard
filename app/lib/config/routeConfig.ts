export const mainScenarios = {
    backyard: "BACKYARD",
    showcase: "SHOWCASE"
}

export const scenarios = {
    backyard: {main: mainScenarios.backyard},
    showcase: {main: mainScenarios.showcase, sub: mainScenarios.showcase},
    birdShowcase: {main: mainScenarios.showcase, sub: "BIRD_SHOWCASE"},
    tree: {main: mainScenarios.showcase, sub: "TREE"}
}