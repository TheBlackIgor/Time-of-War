let game, net, ui, points, upgrades, units;

window.onload = () => {
    points = new Points();
    units = new Units();
    game = new Game();
    net = new Net();
    upgrades = new Upgrades();
    ui = new Ui();
}