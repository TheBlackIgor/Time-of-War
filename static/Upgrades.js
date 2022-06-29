class Upgrades {
    constructor() {
        this.upgrades = {
            points: {
                multiplayer: 0,
                cost: 0,
                costMultiplayer: 0,
                buttonElement: document.getElementById('pointsUpgradeButton')
            },

            gladiator: {
                attack: 0,
                health: 0,
                speed: 0,
                cost: 0,
                costMultiplayer: 0,
                buttonElement: document.getElementById('gladiatorUpgradeButton')
            },

            tank: {
                attack: 0,
                health: 0,
                speed: 0,
                cost: 0,
                costMultiplayer: 0,
                buttonElement: document.getElementById('tankUpgradeButton')
            },

            assassin: {
                attack: 0,
                health: 0,
                speed: 0,
                cost: 0,
                costMultiplayer: 0,
                buttonElement: document.getElementById('assassinUpgradeButton')
            }
        }
    }


    upgrade = (element) => {
        element = element.id.replace('UpgradeButton', '');

        if(points.value < this.upgrades[element].cost) return;

        points.value -= this.upgrades[element].cost;
        this.upgrades[element].cost = this.upgrades[element].cost * this.upgrades[element].costMultiplayer;

        if(element == 'points') {
            points.speed = points.speed * this.upgrades.points.multiplayer;
            return
        }

        units[element].attack = units[element].attack * this.upgrades[element].attack;
        units[element].health = units[element].health * this.upgrades[element].health;
        units[element].speed = units[element].speed * this.upgrades[element].speed;
        units[element].level += 1;
    }


    checkForUpgrade = () => {
        ui.refreshUpgrades();

        for(const [key, upgrade] of Object.entries(this.upgrades)) {
            if(upgrade.cost <= points.value) {
                upgrade.buttonElement.disabled = false;
                if(upgrade.buttonElement.parentElement.querySelector(':hover') == upgrade.buttonElement) this.showNextStats(upgrade.buttonElement)
            }else {
                upgrade.buttonElement.disabled = true;
            }
        }
    }

    showNextStats = (element) => {
        element = element.id.replace('UpgradeButton', '');

        if(element == 'points') {
            document.getElementById('currentPointsSpeed').innerHTML = (points.speed * this.upgrades.points.multiplayer).toFixed(1);
            document.getElementById('currentPointsSpeed').style.color = 'green';
            return;
        }

        document.getElementById(`${element}Attack`).innerHTML = Math.round(units[element].attack * this.upgrades[element].attack);
        document.getElementById(`${element}Attack`).style.color = 'green';
        document.getElementById(`${element}Health`).innerHTML = Math.round(units[element].health * this.upgrades[element].health);
        document.getElementById(`${element}Health`).style.color = 'green';
        document.getElementById(`${element}Speed`).innerHTML = Math.round(units[element].speed * this.upgrades[element].speed);
        document.getElementById(`${element}Speed`).style.color = 'green';
        document.getElementById(`${element}Level`).innerHTML = Math.round(units[element].level + 1);
        document.getElementById(`${element}Level`).style.color = 'green';
    }
}