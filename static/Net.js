class Net {
    constructor() {
        this.socket = io();
        this.init();
        this.thisSpawned = false;
    }

    init = () => {
        window.addEventListener("beforeunload", function (e) {
            const body = JSON.stringify({ username: net.username });
            const headers = { "Content-Type": "application/json" }
            fetch("/resetUser", { method: "post", body, headers })
            e.returnValue = null;
        }, false);

        this.socket.on("spawnUnit", (args) => {
            if (!this.thisSpawned) game.oponentUnits.add(new Unit(args[0], args[1]));
            else this.thisSpawned = false;
        });
    }

    login = (username) => {
        this.socket.emit("login", username, (response) => {
            if (response.error) {
                document.querySelector('#errorLoginMessage').innerHTML = response.message;
                return;
            }

            this.username = username;

            if (response.message == 'waiting') {
                ui.startWaitingForSecondPlayer();
                this.socket.on("waitingForSecondPlayer", (secondPlayer, data) => {
                    this.secondUsername = secondPlayer;
                    this.assignVariables(data);
                    this.startGame(0);
                    return;
                });
            } else if (response.message == 'starting') {
                this.secondUsername = response.secondUsername;
                this.assignVariables(response.data);
                this.startGame(1);
            }
            return;
        });
    }

    startGame = (playerSide) => {
        points.startGame();
        game.startGame(playerSide);
        ui.startGame();
    }

    unitSpawned = (unit, unitData) => {
        delete unitData.model;
        delete unitData.animationsFolder;
        this.socket.emit("unitSpawned", unit, unitData);
        this.thisSpawned = true;
    }

    assignVariables = (data) => {
        game.towerData = data.towerData;

        for (const [unitName, unitData] of Object.entries(data.unitData)) {
            for (const [statName, statData] of Object.entries(unitData)) {
                units[unitName][statName] = statData;
            }
        }

        for (const [unitUpgradeName, unitUpgradeData] of Object.entries(data.upgradesData)) {
            for (const [upgradeName, upgradeData] of Object.entries(unitUpgradeData)) {
                upgrades.upgrades[unitUpgradeName][upgradeName] = upgradeData;
            }
        }
        game.dt = 1000 / data.gameData.framerate;
        console.log("Fps limit: " + data.gameData.framerate);
    }
}