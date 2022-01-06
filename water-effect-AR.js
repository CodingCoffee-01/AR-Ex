
var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var markerRoot1;

var material1, mesh1;

initialize();
animate();

function initialize()
{
	scene = new THREE.Scene();

	camera = new THREE.Camera();
	scene.add( camera );

	let ambientLight = new THREE.AmbientLight( 0xcccccc, 1.00 );
	scene.add( ambientLight );

	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	renderer.setSize( 640, 480 );
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top  = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement );

	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;

	////////////////////////////////////////////////////////////
	// setup arToolkitSource
	////////////////////////////////////////////////////////////

	arToolkitSource = new THREEx.ArToolkitSource({
		sourceType : 'webcam',
	});

	function onResize()
	{
		arToolkitSource.onResize()
		arToolkitSource.copySizeTo(renderer.domElement)
		if ( arToolkitContext.arController !== null )
		{
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
		}
	}

	arToolkitSource.init(function onReady(){
		onResize()
	});

	// handle resize event
	window.addEventListener('resize', function(){
		onResize()
	});

	////////////////////////////////////////////////////////////
	// setup arToolkitContext
	////////////////////////////////////////////////////////////

	// create atToolkitContext
	arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: 'data/camera_para.dat',
		detectionMode: 'mono'
	});

	// copy projection matrix to camera when initialization complete
	arToolkitContext.init( function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	});

	////////////////////////////////////////////////////////////
	// setup markerRoots
	////////////////////////////////////////////////////////////

	// build markerControls
	markerRoot1 = new THREE.Group();
	markerRoot1.name = 'marker1';
	scene.add(markerRoot1);
	let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
		type : 'pattern',
		patternUrl : "data/hiro.patt",
	})

	let loader = new THREE.TextureLoader();

	// water

	let geometry1 = new THREE.TorusGeometry(1,1, 64, 256); // radius, tube radius
	let texture1 = loader.load( 'images/water-2.jpg' );
	// let texture = loader.load( 'images/color-grid.png' );
	texture1.wrapS = THREE.RepeatWrapping;
	texture1.wrapT = THREE.RepeatWrapping;
	texture1.repeat.set(8,2);

	// shader-based material
	material1 = new THREE.ShaderMaterial({
		uniforms: {
			time: { value: 1.0 },
			baseTexture: { value: texture1 },
		},
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
		transparent: true,
	});

	mesh1 = new THREE.Mesh( geometry1, material1 );
	mesh1.rotation.x = -Math.PI/2;
	mesh1.scale.z = 0.10;

	markerRoot1.add( mesh1 );

	// the inside of the hole
	let geometry2	= new THREE.CylinderGeometry(1,1, 4, 32,1);
	let texture2 = loader.load( 'images/tiles.jpg', render );
	texture2.wrapS = THREE.RepeatWrapping;
	texture2.wrapT = THREE.RepeatWrapping;
	texture2.repeat.set(4,2);
	let material2	= new THREE.MeshBasicMaterial({
		transparent : true,
		map: texture2,
		side: THREE.BackSide
	});
	mesh2 = new THREE.Mesh( geometry2, material2 );
	mesh2.position.y = -2;
	markerRoot1.add( mesh2 );

	// the invisibility cloak (ring; has circular hole)
	let geometry0 = new THREE.RingGeometry(1,9, 32);
	let material0 = new THREE.MeshBasicMaterial({
		// map: loader.load( 'images/color-grid.png' ), // for testing placement
		colorWrite: false
	});
	let mesh0 = new THREE.Mesh( geometry0, material0 );
	mesh0.rotation.x = -Math.PI/2;
	markerRoot1.add(mesh0);


}

function update()
{
	material1.uniforms.time.value += deltaTime;
	// update artoolkit on every frame
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );
}

function render()
{
	renderer.render( scene, camera );
}

function animate()
{
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	render();
}
