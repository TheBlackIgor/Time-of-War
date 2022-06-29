class Tower extends THREE.Mesh {
    constructor(side, data) {
        super() // wywołanie konstruktora klasy z której dziedziczymy czyli z Mesha

        this.type = 'tower';
        this.side = side;
        this.defaultHealth = data.health;
        this.health = this.defaultHealth;
        this.slow = data.slow;
        this.damage = data.damage;

        this.geometry = new THREE.CylinderGeometry(50, 50, 200, 16); // radiusTop, radiusBottom, height, radialSegments
        this.material = new THREE.MeshStandardMaterial({ color: '#000000', opacity: 0, transparent: false, });
        this.loader = new THREE.FBXLoader()
        this.loader.load('../../models/tower2.fbx', (object) => {
            this.model = object;

            // this.model.scale.set(0.1, 0.1, 0.1);
            this.model.scale.set(.5, .5, .5);

            if(this.position.x > 0) this.model.rotation.y = Math.PI /2 
            else this.model.rotation.y = Math.PI /2 + Math.PI
            
            this.model.traverse(function (child) {
                if (child.isMesh) {
                    child.material.needsUpdate = false;
                    child.receiveShadow = false;
                    child.castShadow = true;
                    child.wireframe = false;
                }
            });
            this.add(this.model)
            this.material.transparent = true;
        })

        const healthBar = document.createElement('div');
        healthBar.className = 'towerHealthBar';

        this.healthBarText = document.createElement('p');
        this.healthBarText.textContent = this.health
        healthBar.appendChild(this.healthBarText)

        const healthBarOutside = document.createElement('div')
        healthBarOutside.className = 'towerHealthBarOutside';

        this.healthBarInside = document.createElement('div')
        this.healthBarInside.className = 'towerHealthBarInside';
        
        healthBarOutside.appendChild(this.healthBarInside);
        healthBar.appendChild(healthBarOutside)
        
        const healthBarLabel = new THREE.CSS2DObject(healthBar);
        healthBarLabel.position.set(0, this.geometry.parameters.height / 2, 0);
        this.rotation.y = Math.PI / 2
        
        this.add(healthBarLabel);    
        
    }
    
    generateField = () => {
        const length = 250;
        const towerFieldGeometry = new THREE.BoxGeometry( 100, 5, length );
        const towerFieldMaterial = new THREE.MeshBasicMaterial( {color: 0xff0000, transparent: true, opacity: 0.5} );

        this.towerField = new THREE.Mesh( towerFieldGeometry, towerFieldMaterial );
        if(this.position.x > 0) this.towerField.position.z -= ( this.geometry.parameters.radiusBottom +  0.5 * length );
        else this.towerField.position.z += ( this.geometry.parameters.radiusBottom + 0.5 * length );

        this.add( this.towerField );
    }

    towerFieldCheck = () => {
        let unitInField;
        const side = this.side;
        const towerFieldlength = this.towerField.geometry.parameters.depth;
        const towerFieldPosition = new THREE.Vector3();
        this.towerField.getWorldPosition(towerFieldPosition)

        game.scene.traverse(function (node) {
            if (node.type != 'unit') return;
            if (node.side == side) return

            const nodePosition = new THREE.Vector3();
            node.getWorldPosition(nodePosition)

            if(towerFieldPosition.x > 0) {
                if(nodePosition.x > (towerFieldPosition.x - 0.5 * towerFieldlength) && nodePosition.x < (towerFieldPosition.x + 0.5 * towerFieldlength)) {
                    if(unitInField == undefined || node.position.x > unitInField.position.x) unitInField = node;
                }
            }else {
                if(nodePosition.x < (towerFieldPosition.x + 0.5 * towerFieldlength) && nodePosition.x > (towerFieldPosition.x - 0.5 * towerFieldlength)) {
                    if(unitInField == undefined || node.position.x < unitInField.position.x) unitInField = node;
                }
            }            
        });

        if(unitInField == undefined) return;

        unitInField.takeDamage(unitInField.health / (1000 / this.damage));
        if(!unitInField.slowed) unitInField.speed = unitInField.speed * this.slow;    
        unitInField.slowed = true;
    }

    takeDamage = (damage) => {
        if (this.health <= 0) {
            game.gameEnded = true;
            fetch("/resetUsers", { method: "post" })

            if (this.side == 'player') ui.gameEnded(false);
            else ui.gameEnded(true);
        }
        this.health -= damage;
        if (this.health < 0) this.health = 0;
        this.healthBarText.textContent = Math.round(this.health);
        const healthPercent = (this.health / this.defaultHealth) * 100
        this.healthBarInside.style.height = healthPercent + '%';
    }
}