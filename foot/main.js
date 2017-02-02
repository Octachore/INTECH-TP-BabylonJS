var BABYLON;
(function (BABYLON) {
    var Main = (function () {
        function Main(scene) {
            // Private members
            this._ground = null;
            this._ball = null;
            this._skybox = null;
            this._obstacles = [];
            this._blocks = [];
            this._light = null;
            this._camera = null;
            this.scene = scene;
        }
        // Setup a basic shader
        Main.prototype.setupBasicShader = function () {
            // Why not :)
            var material = new BABYLON.ShaderMaterial("shaderMaterial", this.scene, {
                vertex: "IT",
                fragment: "IT"
            }, {
                // Options
                attributes: ["position", "uv"],
                uniforms: ["worldViewProjection", "time"],
                samplers: ["makiTexture"]
            });
            var time = 0;
            material.onBind = function (mesh) {
                time += 16;
                material.setFloat("time", time);
            };
            material.setTexture("makiTexture", new BABYLON.Texture("assets/ball.png", this.scene));
            // this._ball.material = material;
        };
        // Setups the physics bodies of each meshes
        Main.prototype.setupPhysics = function () {
            var _this = this;
            // Setup physics in scene
            this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
            // Set physics bodies
            this._ground.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 0 });
            // Set physics bodies of obstacles
            this._obstacles.forEach(function (o) { return o.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 0 }); });
            this._blocks.forEach(function (b) {
                b.actionManager = new BABYLON.ActionManager(_this.scene);
                b.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnLeftPickTrigger, function (evt) {
                    if (!b.getPhysicsImpostor())
                        _this._blocks.forEach(function (block) { return block.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 1 }); });
                    var pick = _this.scene.pick(_this.scene.pointerX, _this.scene.pointerY);
                    var coef = 2;
                    var force = pick.pickedPoint.subtract(_this._camera.position);
                    force = force.multiply(new BABYLON.Vector3(coef, coef, coef));
                    b.applyImpulse(force, pick.pickedPoint);
                }));
            });
        };
        // Setups collisions on objects and camera
        Main.prototype.setupCollisions = function () {
            // Setup camera collisions
            this.scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
            this._camera.ellipsoid = new BABYLON.Vector3(2, 3, 2);
            // this._camera.checkCollisions = true;
            // this._camera.applyGravity = true;
            this._ground.checkCollisions = true;
            // this._ball.checkCollisions = true;
            this._blocks.forEach(function (b) { return b.checkCollisions = true; });
            this._obstacles.forEach(function (o) { return o.checkCollisions = true; });
        };
        // Setups the meshes used to play football
        Main.prototype.createMeshes = function () {
            // Create camera
            this._camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(15, 6, 0), this.scene);
            this._camera.attachControl(this.scene.getEngine().getRenderingCanvas());
            // Map ZQSD keys to move camera
            this._camera.keysUp = [90]; // Z
            this._camera.keysDown = [83]; // S
            this._camera.keysLeft = [81]; // Q
            this._camera.keysRight = [68]; // D
            this._camera.setTarget(new BABYLON.Vector3(0, 0, 0));
            // Create light
            this._light = new BABYLON.PointLight("light", new BABYLON.Vector3(0, 100, 0), this.scene);
            // Create scene meshes
            this._ground = BABYLON.Mesh.CreateGround("ground", 100, 50, 2, this.scene);
            // Create standard material
            var groundMaterial = new BABYLON.StandardMaterial("ground", this.scene);
            this._ground.material = groundMaterial;
            var grassTexture = new BABYLON.Texture("assets/grass.jpg", this.scene, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);
            grassTexture.uScale = grassTexture.vScale = 10.0;
            groundMaterial.diffuseTexture = grassTexture;
            groundMaterial.diffuseColor = BABYLON.Color3.Yellow();
            groundMaterial.specularColor = BABYLON.Color3.Black(); // new Color3(0, 0, 0);
            // Skybox
            this._skybox = BABYLON.Mesh.CreateBox("skybox", 1000, this.scene, false, BABYLON.Mesh.BACKSIDE);
            var skyboxMaterial = new BABYLON.StandardMaterial("skyboxMaterial", this.scene);
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/TropicalSunnyDay", this.scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.disableLighting = true;
            this._skybox.material = skyboxMaterial;
            // Create obstacles
            var m = new BABYLON.StandardMaterial("m", this.scene);
            m.diffuseColor = BABYLON.Color3.Red();
            for (var i = 0; i < 10; i++) {
                for (var j = 0; j < 10; j++) {
                    for (var k = 0; k < 1; k++) {
                        var c = BABYLON.Mesh.CreateBox("c" + i + j, 0.5, this.scene);
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
        };
        return Main;
    }());
    BABYLON.Main = Main;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=main.js.map