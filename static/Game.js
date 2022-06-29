class Game {
    constructor() {

        this.gameEnded = false;
        this.towerPosition = 600;
        this.cameraDistance = 400;
        this.cameraSpeed = 5;
        this.currentCameraSpeed = 0;;

        this.clock = new THREE.Clock();

        window.addEventListener('resize', this.onWindowResize, false);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor("#66bfff");
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("root").append(this.renderer.domElement);

        this.labelRenderer = new THREE.CSS2DRenderer();
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        document.getElementById("root").append(this.labelRenderer.domElement);

        this.scene = new THREE.Scene();
        const loader = new THREE.TextureLoader();
        const bgTexture = loader.load('./img/sky.png');
        this.scene.background = bgTexture;

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);

        const axesHelper = new THREE.AxesHelper(1000);
        this.scene.add(axesHelper);

        const light = new THREE.HemisphereLight('#ffffff', '#000000', 2); // skyColor, groundColor, intensity
        this.scene.add(light);

        const groundGeometry = new THREE.PlaneGeometry(10000, 10000);
        const groundMaterial = new THREE.MeshBasicMaterial({
            // color: 0xffff00,
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load('./materials/grass.jpg', function (texture) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.x = 10000 / 90;
                texture.repeat.y = 10000 / 90;
            })
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = Math.PI / 2;
        this.scene.add(this.ground)

        this.dt = 1000 / 30;
        this.timeTarget = 0;

        this.render()
    }



    startGame = (playerSide) => {
        this.playerSide = playerSide; // 0 - pierwszy | 1 - drugi
        this.generatePlayerTower();
        this.generateOponentTower();
        this.generatePath();
        this.generateUnitsGroups();
        this.setCamera();
    }

    generatePlayerTower = () => {
        this.playerTower = new Tower('player', this.towerData);
        this.scene.add(this.playerTower);

        if (this.playerSide) {
            this.playerTower.position.set(this.towerPosition, 0, 0)
        } else {
            this.playerTower.position.set(-this.towerPosition, 0, 0)
        }
        this.playerTower.generateField();
    }

    generateOponentTower = () => {
        this.oponentTower = new Tower('oponent', this.towerData);
        this.scene.add(this.oponentTower);
        this.oponentTower.position.x = -this.playerTower.position.x
        this.oponentTower.generateField();
    }

    generatePath = () => {
        const distanceBetweenTowers = Math.abs(this.oponentTower.position.x) + Math.abs(this.playerTower.position.x);
        const pathLength = distanceBetweenTowers - 2 * this.playerTower.geometry.parameters.radiusBottom;
        const pathGeometry = new THREE.PlaneGeometry(pathLength, 100);
        const pathMaterial = new THREE.MeshBasicMaterial({
            // color: 0xffff00,
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load('./materials/path.jfif', function (texture) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.x = pathLength / 100;
                texture.repeat.y = 100 / 100;
            })
        });
        this.path = new THREE.Mesh(pathGeometry, pathMaterial);
        this.path.rotation.x = Math.PI / 2;
        this.path.position.y = 1;

        this.scene.add(this.path)
    }

    generateUnitsGroups = () => {
        this.playerUnits = new THREE.Group();
        this.playerUnits.position.set(this.playerTower.position.x, this.playerTower.position.y, this.playerTower.position.z);
        if (this.playerUnits.position.x > 0) this.playerUnits.position.x -= this.playerTower.geometry.parameters.radiusBottom;
        else this.playerUnits.position.x += this.playerTower.geometry.parameters.radiusBottom;
        this.scene.add(this.playerUnits)

        this.oponentUnits = new THREE.Group();
        this.oponentUnits.position.set(this.oponentTower.position.x, this.oponentTower.position.y, this.oponentTower.position.z);
        if (this.oponentUnits.position.x > 0) this.oponentUnits.position.x -= this.oponentTower.geometry.parameters.radiusBottom;
        else this.oponentUnits.position.x += this.oponentTower.geometry.parameters.radiusBottom;
        this.scene.add(this.oponentUnits)
    }

    setCamera = () => {
        if (this.playerSide) {
            this.camera.position.set(this.playerTower.position.x - 4 * this.playerTower.geometry.parameters.radiusBottom, 100, -this.cameraDistance)
        } else {
            this.camera.position.set(this.playerTower.position.x + 4 * this.playerTower.geometry.parameters.radiusBottom, 100, this.cameraDistance)
        }
        this.camera.lookAt(this.camera.position.x, this.scene.position.y + 70, this.scene.position.z);

        document.addEventListener("keydown", (e) => {
            if (e.code == 'ArrowLeft') {
                if (this.playerSide) this.currentCameraSpeed = this.cameraSpeed;
                else this.currentCameraSpeed = -this.cameraSpeed;
            }

            if (e.code == 'ArrowRight') {
                if (this.playerSide) this.currentCameraSpeed = -this.cameraSpeed;
                else this.currentCameraSpeed = this.cameraSpeed;
            }

        }, false);

        document.addEventListener("keyup", (e) => {
            if (e.code == 'ArrowLeft' || e.code == 'ArrowRight') {
                this.currentCameraSpeed = 0;
            }
        }, false);
    }

    spawnPlayerUnit = (unit) => {
        if (this.gameEnded) return;

        points.value -= units.unitSpawnCost;

        this.playerUnits.add(new Unit(unit));
        net.unitSpawned(unit, { ...units[unit] })

        // unit spawning delay
        const buttonsDiv = document.querySelector("#units");
        const buttons = buttonsDiv.querySelectorAll("button");
        for (const button of buttons) {
            points.unitsButtonsDisabled = true;
            setTimeout(() => points.unitsButtonsDisabled = false, 1000)
        }
    }

    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    render = () => {
        if (this.gameEnded) return;

        if(Date.now() >= this.timeTarget){
            TWEEN.update();
            this.camera.updateProjectionMatrix();

            // Camera movement
            if (Math.abs(this.camera.position.x + this.currentCameraSpeed) < this.towerPosition) this.camera.position.x += this.currentCameraSpeed;

            // Units movement and attack
            let delta = this.clock.getDelta();

            if (this.playerUnits != undefined && this.oponentUnits != undefined) {
                for (const playerUnit of this.playerUnits.children) {
                    playerUnit.tick();
                    playerUnit.mixer.update(delta);
                }

                for (const oponentUnit of this.oponentUnits.children) {
                    oponentUnit.tick();
                    oponentUnit.mixer.update(delta);
                }
            }

            // Tower field damage
            if(this.playerTower != undefined && this.oponentTower != undefined) {
                this.playerTower.towerFieldCheck();
                this.oponentTower.towerFieldCheck();
            } 

            this.renderer.render(this.scene, this.camera);
            this.labelRenderer.render(this.scene, this.camera);
        
            this.timeTarget += this.dt;
            if(Date.now() >= this.timeTarget){
                this.timeTarget = Date.now();
            }
          }
          requestAnimationFrame(this.render);
    }

    cloneFbx(fbx) {
        const fbxClone = skeletonUtilsClone(fbx);
        fbxClone.animations = fbx.animations;
        return fbxClone;
    }

}