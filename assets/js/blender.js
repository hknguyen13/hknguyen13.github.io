var scene, camera, renderer;
    init();
    animate();
    function init() {

      scene = new THREE.Scene();
      var WIDTH = window.innerWidth,
          HEIGHT = window.innerHeight;

      renderer = new THREE.WebGLRenderer({antialias:true});
      renderer.setSize(WIDTH, HEIGHT);
      document.body.appendChild(renderer.domElement);

      //setup camera
      camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
      camera.position.set(50,150,100);
      scene.add(camera);

      window.addEventListener('resize', function() {
        var WIDTH = window.innerWidth,
            HEIGHT = window.innerHeight;
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
      });

      //add orbit control functionality
      controls = new THREE.OrbitControls(camera, renderer.domElement);

      //add lights to the scene and spheres to help with positioning

      	//light 1
		var light = new THREE.PointLight(0xfffff3, 0.8);
		light.position.set(-100,200,100);
		scene.add(light);

		var sphereSize = 1; 
		var pointLightHelper = new THREE.PointLightHelper( light, sphereSize ); 
		scene.add( pointLightHelper );

		//light 2
		var light2 = new THREE.PointLight(0xd7f0ff, 0.2);
		light2.position.set(200,200,100);
		scene.add(light2);

		var pointLightHelper2 = new THREE.PointLightHelper( light2, sphereSize ); 
		scene.add( pointLightHelper2 );

		//light 3
		var light3 = new THREE.PointLight(0xFFFFFF, 0.5);
		light3.position.set(150,200,-100);
		scene.add(light3);

		var pointLightHelper3 = new THREE.PointLightHelper( light3, sphereSize ); 
		scene.add( pointLightHelper3 );


		//Collada loader script to bring in .dae model file
		var loader = new THREE.ColladaLoader();

		loader.options.convertUpAxis = true;

		loader.load( '/../models/dummy1.dae', function ( collada ) {

			var dae = collada.scene;

			var skin = collada.skins[ 0 ];

			dae.position.set(0,0,0); //x,z,y- if you think in blender dimensions ;)
			dae.scale.set(1.5,1.5,1.5);

			scene.add(dae);

		});


		//axes and grid code
		var axes = new THREE.AxisHelper(50);
		axes.position = dae.position;
		scene.add(axes);

		var gridXZ = new THREE.GridHelper(100, 10);
		gridXZ.setColors( new THREE.Color(0xFFC0CB), new THREE.Color(0x8f8f8f) );
		gridXZ.position.set(0,0,0 );
		scene.add(gridXZ);
  	}

  	//re-renders scene as camera rotates
  	function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      controls.update();
    }


/*var gl;
var delay = 100;

window.onload = function init() {

	var canvas = document.getElementById( "blender_object" );

	gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.051, 0.533, 0.125, 1.0 );

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "blend_vertex-shader", "blend_fragment-shader" );
    gl.useProgram( program );

    var vertices = [
        vec2(  0,  1 ),
        vec2(  1,  0 ),
        vec2( -1,  0 ),
        vec2(  0, -1 )
    ];

    // Load the data into the GPU    
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    // Initialize event handlers
    document.getElementById("Direction").onclick = function () {
        direction = !direction;
    };

    window.onkeydown = function(event) {
        var key = String.fromCharCode(event.keyCode);
        switch(key) {
          case '1':
            
            break;

          case '2':
            delay /= 2.0;
            break;

          case '3':
            delay *= 2.0;
            break;
        }
    };
    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    theta += (direction ? 0.1 : -0.1);
    gl.uniform1f(thetaLoc, theta);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}*/
