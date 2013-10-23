
/**
 * Maze class
 * @param $element
 */
function threemaze($element)
{
    // Object attributes
    this.$element =         $element;
    this.camera =           {};
    this.cameraHelper =     {};
    this.scene =            {};
    this.renderer =         {};
    this.side =             21;
    this.thickness =        20;

    // Events
    this.$element.on('mousemove', $.proxy(this,'onMouseMove'));
    this.$element.on('mousedown', $.proxy(this, 'onMouseDown'));
    this.$element.on('mouseup', $.proxy(this, 'onMouseUp'));
    $(window).on('resize', $.proxy(this, 'onWindowResize'));

    // Inits
    this.initScene();
    this.initObjects();
    this.onWindowResize();
    this.render();

    // @todo à refactorer
    threeaxis(this.scene, 400);
};

/**
 * Inits objects
 */
threemaze.prototype.initObjects = function()
{
    var map = this.generateMaze(this.side);
    for (var x = 1; x < this.side + 1; x += 1)
    {
        for (var y = 1;y < this.side + 1; y += 1)
        {
            if (map[x][y] == 0)
            {
                var wall_geometry =     new THREE.CubeGeometry(this.thickness, this.thickness, this.thickness, 1, 1, 1);
                var wall_mesh =         new THREE.Mesh(wall_geometry, new THREE.MeshLambertMaterial({color: 0xffffff, wireframe: false}));
                wall_mesh.position.set(x * this.thickness - ((this.side * this.thickness) / 2), this.thickness / 2, y * 20 - ((this.side * this.thickness) / 2));
                this.scene.add(wall_mesh);
            }
        }
    }
};

/**
 * Inits the scene
 */
threemaze.prototype.initScene = function()
{
    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera =            new THREE.PerspectiveCamera(45, 1, 1, 2000);
    this.camera.angles =     {horizontal: 0, vertical: 0};
    this.camera.clicked =    false;

    // Lights
    this.scene.add(new THREE.AmbientLight(0x999999));
    var directional = new THREE.DirectionalLight(0xffffff, 0.5);
    directional.position.set(0, 0.5, 1);
    this.scene.add(directional);

    // Camera helper
    var geometry =  new THREE.Geometry();
    var material =  new THREE.LineBasicMaterial({color: 0x333333, lineWidth: 1});
    geometry.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.sqrt(3) * (this.side * this.thickness)), 0, 0);
    this.cameraHelper = new THREE.Line(geometry, material);
    this.scene.add(this.cameraHelper);
    this.cameraHelper.visible =         false;
    this.cameraHelper.targetRotation =  false;
    this.cameraHelper.rotation.x =      0;
    this.cameraHelper.rotation.y =      0.38639;
    this.cameraHelper.rotation.z =      0.648339;

    // Renderer
    this.renderer = typeof WebGLRenderingContext != 'undefined' && window.WebGLRenderingContext ? new THREE.WebGLRenderer({antialias: true}) : new THREE.CanvasRenderer({});
    this.$element.append(this.renderer.domElement);
};

/**
 * Moving the mouse over the container: sets a target rotation for the camera helper
 * @param evt
 */
threemaze.prototype.onMouseMove = function(evt)
{
    if (this.camera.clicked !== false)
    {
        var target_rotation = {};
        target_rotation.z = this.cameraHelper.rotation.z + ((evt.pageY - this.camera.clicked.y) / 800);
        if (target_rotation.z < 0)
        {
            target_rotation.z = 0;
        }
        if (target_rotation.z > (Math.PI / 2) - 0.1)
        {
            target_rotation.z = Math.PI / 2 - 0.1;
        }
        target_rotation.y = this.cameraHelper.rotation.y + ((this.camera.clicked.x - evt.pageX) / 800);
        this.cameraHelper.targetRotation = target_rotation;
    }
};

/**
 * Mouse down: starts dragging the maze
 * @param evt
 */
threemaze.prototype.onMouseDown = function(evt)
{
    evt.preventDefault();
    this.camera.clicked = {x: evt.pageX, y: evt.pageY};
};

/**
 * Mouse up: stops dragging the maze
 * @param evt
 */
threemaze.prototype.onMouseUp = function(evt)
{
    evt.preventDefault();
    this.camera.clicked = false;
};

/**
 * Render loop
 * Sets the camera position and renders the scene
 */
threemaze.prototype.render = function()
{
    requestAnimationFrame($.proxy(this, 'render'));
    if (this.cameraHelper.targetRotation !== false)
    {
        this.cameraHelper.rotation.z += (this.cameraHelper.targetRotation.z - this.cameraHelper.rotation.z) / 10;
        this.cameraHelper.rotation.y += (this.cameraHelper.targetRotation.y - this.cameraHelper.rotation.y) / 10;
    }
    var camera_position = this.cameraHelper.geometry.vertices[1].clone().applyProjection(this.cameraHelper.matrixWorld);
    this.camera.position = camera_position;
    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);
};

/**
 * Sets the scene dimensions on window resize
 */
threemaze.prototype.onWindowResize = function()
{
    var $window = $(window);
    this.renderer.setSize($window.width(), $window.height());
    this.camera.aspect = $window.width() / $window.height();
    this.camera.updateProjectionMatrix();
};
