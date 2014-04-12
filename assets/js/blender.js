var scene, camera, renderer;
    init();
    animate();
    function init() {

      scene = new THREE.Scene();
      var WIDTH = (window.innerWidth*0.7),
          HEIGHT = (window.innerHeight*0.7);

      renderer = new THREE.WebGLRenderer({antialias:true});
      renderer.setSize(WIDTH, HEIGHT);
      document.body.appendChild(renderer.domElement);


      //setup camera
      camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
      camera.position.set(50,150,100);
      scene.add(camera);

      window.addEventListener('resize', function() {
        var WIDTH = (window.innerWidth*0.7),
            HEIGHT = (window.innerHeight*0.7);
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
      });


      //add orbit control functionality
      controls = new THREE.OrbitControls(camera, renderer.domElement);


	    //add skydome to scene
	    var vertexShader = document.getElementById( 'vertexShader' ).textContent;
		var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
		var uniforms = {
			topColor:      { type: "c", value: new THREE.Color(0xFFFFFD) },
			bottomColor: { type: "c", value: new THREE.Color( 0xA6CBE6 ) },
			offset:         { type: "f", value: 100 },
			exponent:     { type: "f", value: 0.7 }
		}
 
		//skydome
		
		var skyGeo = new THREE.SphereGeometry( 2000, 32, 15 );
		var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );
		 
		var sky = new THREE.Mesh( skyGeo, skyMat );
		scene.add( sky );


      //add lights to the scene and spheres to help with positioning

      	//light 1
		var light = new THREE.PointLight(0xfffff3, 0.8);
		light.position.set(-100,200,100);
		scene.add(light);

		var sphereSize = 2; 
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

		loader.load( '/assets/models/dummy1.dae', function ( collada ) {

			var dae = collada.scene;

			var skin = collada.skins[ 0 ];

			dae.position.set(0,0,0); //x,z,y- if you think in blender dimensions ;)
			dae.scale.set(10.5,10.5,10.5);

			scene.add(dae);


			//axes and grid code
			var axes = new THREE.AxisHelper(50);
			axes.position = dae.position;
			scene.add(axes);

			var gridXZ = new THREE.GridHelper(100, 10);
			gridXZ.setColors( new THREE.Color(0xFFC0CB), new THREE.Color(0x8f8f8f) );
			gridXZ.position.set(0,0,0 );
			scene.add(gridXZ);
		});
  	}

  	//re-renders scene as camera rotates
  	function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      controls.update();
    }
