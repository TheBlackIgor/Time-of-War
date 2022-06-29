class Unit extends THREE.Mesh {
    constructor(unitName, unitData) {
        super() // wywołanie konstruktora klasy z której dziedziczymy czyli z Mesha

        this.type = 'unit';
        this.collisionDistance = 25;

        if (unitData == undefined) {
            this.attack = units[unitName].attack;
            this.defaultHealth = units[unitName].health;
            this.health = this.defaultHealth;
            this.speed = units[unitName].speed;
            this.level = units[unitName].level;
            this.side = "player";
        } else {
            this.attack = unitData.attack;
            this.defaultHealth = unitData.health;
            this.health = this.defaultHealth;
            this.speed = unitData.speed;
            this.level = unitData.level;
            this.side = "oponent";
        }
        this.model = this.cloneFbx(units[unitName].model)
        this.animationsFolder = []
        const unitHeight = unitName === "tank" ? 160 : 100
        const unitRadius = unitName === "tank" ? 35 : 20
        this.geometry = new THREE.CylinderGeometry(unitRadius, unitRadius, unitHeight, 16); // radiusTop, radiusBottom, height, radialSegments
        this.material = new THREE.MeshStandardMaterial({ color: '#00ff00', transparent: true, opacity: 0 });
        this.position.y = 10;

        this.healthBar = document.createElement('div');
        this.healthBar.className = 'unitHealthBar';

        const levelText = document.createElement('p');
        levelText.textContent = "level " + this.level
        levelText.className = "unitLevel"
        this.healthBar.appendChild(levelText)

        this.healthBarText = document.createElement('p');
        this.healthBarText.textContent = Math.round(this.health);
        this.healthBar.appendChild(this.healthBarText)

        const healthBarOutside = document.createElement('div')
        healthBarOutside.className = 'unitHealthBarOutside';

        this.healthBarInside = document.createElement('div')
        this.healthBarInside.className = 'unitHealthBarInside';

        healthBarOutside.appendChild(this.healthBarInside);
        this.healthBar.appendChild(healthBarOutside)

        const healthBarLabel = new THREE.CSS2DObject(this.healthBar);
        healthBarLabel.position.set(0, this.geometry.parameters.height / 2, 0);
        this.add(healthBarLabel)

        this.mixer = new THREE.AnimationMixer(this.model);
        if (unitName === 'gladiator') {
            this.animationsFolder.push(this.mixer.clipAction(this.model.animations[2]))
            this.animationsFolder.push(this.mixer.clipAction(this.model.animations[1]))
            this.animationsFolder.push(this.mixer.clipAction(this.model.animations[0]))
        } else if (unitName === 'tank') {
            this.animationsFolder.push(this.mixer.clipAction(this.model.animations[1]))
            this.animationsFolder.push(this.mixer.clipAction(this.model.animations[0]))
            this.animationsFolder.push(this.mixer.clipAction(this.model.animations[2]))
        } else if (unitName === "assassin") {
            this.animationsFolder.push(this.mixer.clipAction(this.model.animations[1]))
            this.animationsFolder.push(this.mixer.clipAction(this.model.animations[0]))
            this.animationsFolder.push(this.mixer.clipAction(this.model.animations[2]))
        }

        this.animationsFolder[1].play()
        this.model.position.y = -8
        this.activeAction = this.animationsFolder[1]
        this.add(this.model)

        this.unitRotated = false;
        this.moveAllowed = true;
    }

    tick = () => {
        if (Math.round(this.health) <= 0) {
            if(this.removed) return;
            this.removed = true;

            setTimeout(() => {
                this.parent.remove(this)
                this.healthBar.remove();
            }, 10)   
        }
        if (this.parent.position.x < 0) this.moveDirection = 1;
        else this.moveDirection = -1

        const worldPosition = new THREE.Vector3();
        this.getWorldPosition(worldPosition)

        const action = this.checkForCollision(worldPosition);
        if (action == "damage") this.dealDamage();
        else if (action == "move") this.move();

        if (!this.unitRotated) {
            if (worldPosition.x < 0) this.rotation.y = Math.PI / 2
            else this.rotation.y = Math.PI / 2 + Math.PI
            this.unitRotated = true;
        }
    }

    checkForCollision = (position) => {
        let stop = false;
        let blockingUnit = undefined;

        const collisionDistance = this.collisionDistance;
        const moveDirection = this.moveDirection;
        const unitRadius = this.geometry.parameters.radiusBottom * moveDirection;
        const thisUnit = this;

        game.scene.traverse(function (node) {
            if (node.type == 'tower' || node.type == 'unit') {
                const nodePosition = new THREE.Vector3();
                node.getWorldPosition(nodePosition)

                let nodeRadius = node.geometry.parameters.radiusBottom * moveDirection;
                const distance = (position.x + unitRadius) - (nodePosition.x - nodeRadius);

                if (thisUnit != node && thisUnit.parent == node.parent && Math.abs(distance) < thisUnit.geometry.parameters.radiusBottom + node.geometry.parameters.radiusBottom) {
                    blockingUnit = node;
                    stop = true;
                    return;
                }

                if (moveDirection > 0 && Math.abs(distance) <= 0 || distance <= -collisionDistance) return;
                if (moveDirection < 0 && Math.abs(distance) <= 0 || distance >= collisionDistance) return;

                blockingUnit = node;
                stop = true;
            }
        });

        if (blockingUnit != undefined) this.blockingUnit = blockingUnit;
        if (stop) {
            return "damage"
        }
        return "move";
    }

    move = () => {
        if (!this.moveAllowed) return;
        this.position.x += (this.speed / 100) * this.moveDirection
        if (this.activeAction !== this.animationsFolder[1]) this.playWalk()
    }

    dealDamage = () => {
        if (this.blockingUnit.parent == this.parent) {
            if (this.activeAction !== this.animationsFolder[0]) {
                this.playStand();
                this.moveAllowed = false;
                setTimeout(() => this.moveAllowed = true, 500)
            }
            return;
        }
        if (this.activeAction !== this.animationsFolder[2]) this.playAttack()
        this.blockingUnit.takeDamage(this.attack / 100)
    }

    takeDamage = (damage) => {
        this.health -= damage;
        this.healthBarText.textContent = Math.round(this.health);
        const healthPercent = (this.health / this.defaultHealth) * 100
        this.healthBarInside.style.height = healthPercent + '%';
    }

    playStand() {
        let lastAction = this.activeAction
        this.activeAction = this.animationsFolder[0]
        lastAction.stop()
        this.activeAction.play()
    }
    playWalk() {
        let lastAction = this.activeAction
        this.activeAction = this.animationsFolder[1]
        lastAction.stop()
        this.activeAction.play()
    }
    playAttack() {
        let lastAction = this.activeAction
        this.activeAction = this.animationsFolder[2]
        lastAction.stop()
        this.activeAction.play()
    }

    cloneFbx(fbx) {
        const fbxClone = skeletonUtilsClone(fbx);
        fbxClone.animations = fbx.animations;
        return fbxClone;
    }
}