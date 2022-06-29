class Units {
    constructor() {
        this.unitSpawnCost = 100;

        this.gladiator = {
            attack: 10,
            health: 10,
            speed: 200,
            level: 1,
            model: null,
        }

        this.tank = {
            attack: 10,
            health: 20,
            speed: 100,
            level: 1,
            model: null
        }

        this.assassin = {
            attack: 5,
            health: 5,
            speed: 300,
            level: 1,
            model: null
        }
    }

    loadUnits = async () => {
        this.loader = new THREE.FBXLoader()
        this.loader.load('models/Gladiator.fbx', (object) => {
            this.gladiator.model = object;

            this.gladiator.model.scale.set(0.3, 0.3, 0.3);

            this.gladiator.model.traverse(function (child) {
                if (child.isMesh) {
                    child.material.needsUpdate = false;
                    child.castShadow = false;
                    child.receiveShadow = false;
                    child.castShadow = false;
                    child.wireframe = false;
                }
            });

        })
        this.loader = new THREE.FBXLoader()
        this.loader.load('models/Tank.fbx', (object) => {
            this.tank.model = object;

            this.tank.model.scale.set(0.5, 0.5, 0.5);

            this.tank.model.traverse(function (child) {
                if (child.isMesh) {
                    child.material.needsUpdate = false;
                    child.castShadow = false;
                    child.receiveShadow = false;
                    child.castShadow = false;
                    child.wireframe = false;
                }
            });

        })

        this.loader = new THREE.FBXLoader()
        this.loader.load('models/Assassyn.fbx', (object) => {
            this.assassin.model = object;

            this.assassin.model.scale.set(0.3, 0.3, 0.3);

            this.assassin.model.traverse(function (child) {
                if (child.isMesh) {
                    child.material.needsUpdate = false;
                    child.castShadow = false;
                    child.receiveShadow = false;
                    child.castShadow = false;
                    child.wireframe = false;
                }
            });

            document.getElementById('loadingScreen').style.display = 'none'
            document.getElementById('inputs').style.display = 'flex';
        })
    }
}