module BABYLON {
    export class Main {
        // Public members
        public scene: Scene;

        // Private members
        private _ground: GroundMesh = null;
        private _ball: Mesh = null;
        private _skybox: Mesh = null;
        private _obstacles: Mesh[] = [];
        private _blocks: Mesh[] = [];

        private _light: PointLight = null;

        private _camera: FreeCamera = null;

        constructor(scene: Scene) {
            this.scene = scene;
        }

        // Setup a basic shader
        public setupBasicShader(): void {
            // Why not :)
            var material = new ShaderMaterial("shaderMaterial", this.scene,
                {
                    vertex: "IT",
                    fragment: "IT"
                },
                {
                    // Options
                    attributes: ["position", "uv"],
                    uniforms: ["worldViewProjection", "time"],
                    samplers: ["makiTexture"]
                }
            );

            var time = 0;
            material.onBind = (mesh: AbstractMesh) => {
                time += 16;
                material.setFloat("time", time);
            };

            material.setTexture("makiTexture", new Texture("assets/ball.png", this.scene));

            // this._ball.material = material;
        }

        // Setups the physics bodies of each meshes
        public setupPhysics(): void {
            // Setup physics in scene
            this.scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin());

            // Set physics bodies
            this._ground.setPhysicsState(PhysicsEngine.BoxImpostor, { mass: 0 });

            // Set physics bodies of obstacles
            this._obstacles.forEach((o) => o.setPhysicsState(PhysicsEngine.BoxImpostor, { mass: 0 }));

            this._blocks.forEach(b => {
                b.actionManager = new ActionManager(this.scene);
                b.actionManager.registerAction(
                    new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, (evt) => {

                        if (!b.getPhysicsImpostor()) this._blocks.forEach(block => block.setPhysicsState(PhysicsEngine.BoxImpostor, { mass: 1 }));

                        var pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY);

                        var coef = 2;
                        var force = pick.pickedPoint.subtract(this._camera.position);
                        force = force.multiply(new Vector3(coef, coef, coef));

                        b.applyImpulse(force, pick.pickedPoint);
                    })
                );
            });
        }

        // Setups collisions on objects and camera
        public setupCollisions(): void {
            // Setup camera collisions
            this.scene.gravity = new Vector3(0, -9.81, 0);
            this._camera.ellipsoid = new Vector3(2, 3, 2);

            // this._camera.checkCollisions = true;
            // this._camera.applyGravity = true;

            this._ground.checkCollisions = true;
            // this._ball.checkCollisions = true;
            this._blocks.forEach(b => b.checkCollisions = true);

            this._obstacles.forEach((o) => o.checkCollisions = true);
        }

        // Setups the meshes used to play football
        public createMeshes(): void {
            // Create camera
            this._camera = new FreeCamera("camera", new Vector3(15, 6, 0), this.scene);
            this._camera.attachControl(this.scene.getEngine().getRenderingCanvas());

            // Map ZQSD keys to move camera
            this._camera.keysUp = [90]; // Z
            this._camera.keysDown = [83]; // S
            this._camera.keysLeft = [81] // Q
            this._camera.keysRight = [68]; // D

            this._camera.setTarget(new Vector3(0, 0, 0));

            // Create light
            this._light = new PointLight("light", new Vector3(0, 100, 0), this.scene);

            // Create scene meshes
            this._ground = <GroundMesh>Mesh.CreateGround("ground", 100, 50, 2, this.scene);

            // Create standard material
            var groundMaterial = new StandardMaterial("ground", this.scene);
            this._ground.material = groundMaterial;

            var grassTexture = new Texture("assets/grass.jpg", this.scene, false, false, Texture.NEAREST_SAMPLINGMODE);
            grassTexture.uScale = grassTexture.vScale = 10.0;
            groundMaterial.diffuseTexture = grassTexture;

            groundMaterial.diffuseColor = Color3.Yellow();
            groundMaterial.specularColor = Color3.Black(); // new Color3(0, 0, 0);

            // Skybox
            this._skybox = Mesh.CreateBox("skybox", 1000, this.scene, false, Mesh.BACKSIDE);

            var skyboxMaterial = new StandardMaterial("skyboxMaterial", this.scene);
            skyboxMaterial.reflectionTexture = new CubeTexture("assets/TropicalSunnyDay", this.scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
            skyboxMaterial.disableLighting = true;

            this._skybox.material = skyboxMaterial;

            // Create obstacles
            var m = new StandardMaterial("m", this.scene);
            m.diffuseColor = Color3.Red();

            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    for (let k = 0; k < 1; k++) { // set k max to 10 to have a box
                        let c = Mesh.CreateBox("c" + i + j, 0.5, this.scene);
                        c.position.x -= this._ground._width / 2 - 0.5 * k - 10;
                        c.position.y = 0.5 * j;
                        c.position.z -= this._ground._width / 4 - 0.5 * i - 10;
                        // c.scaling.z = 5;
                        // c.scaling.x = 0.1;
                        c.material = m;
                        // this._obstacles.push(c);
                        this._blocks.push(c);
                    }
                }
            }
        }
    }
}
