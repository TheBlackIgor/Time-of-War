class Points {
    constructor() {
        this.value = 0;
        this.speed = 10;
        this.unitsButtonsDisabled = false;
    }

    startGame = () => {
        setInterval(this.gain, 10)
    }

    gain = () => {
        if (game.gameEnded) return;

        this.value += this.speed / 100;
        this.update();

        const buttonsDiv = document.querySelector("#units");
        const buttons = buttonsDiv.querySelectorAll("button");
        for (const button of buttons) {
            if (this.value >= units.unitSpawnCost && !this.unitsButtonsDisabled) button.disabled = false;
            else button.disabled = true;
        }
    }

    update = () => {
        upgrades.checkForUpgrade();
        ui.updatePoints(Math.round(this.value));
        ui.updatePointsSpeed(this.speed.toFixed(1));
    }
}