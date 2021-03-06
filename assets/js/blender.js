var scene, camera, renderer;
var axes, gridXZ;
var axes_grids = false;
var day = false;
var sky, light, light2, light3;
var s_color = "0x0F0F0F", s_color2 = "0x0F0F0F", s_color3 = "0x0F0F0F";
var tmp_light, tmp_light2, tmp_light3;

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
	    changeSky();


      //add lights to the scene and spheres to help with positioning

      	//light 1
		light = new THREE.PointLight(0xfffff3, 0.8);
		light.position.set(-100,200,100);
		scene.add(light);

		var sphereSize = 2; 
		var pointLightHelper = new THREE.PointLightHelper( light, sphereSize ); 
		scene.add( pointLightHelper );

		//light 2
		light2 = new THREE.PointLight(0xd7f0ff, 0.7);
		light2.position.set(-250,40,0);
		scene.add(light2);

		var pointLightHelper2 = new THREE.PointLightHelper( light2, sphereSize ); 
		scene.add( pointLightHelper2 );

		//light 3
		light3 = new THREE.PointLight(0xFFFFFF, 0.5);
		light3.position.set(150,200,-100);
		scene.add(light3);

		var pointLightHelper3 = new THREE.PointLightHelper( light3, sphereSize ); 
		scene.add( pointLightHelper3 );

		//light 4 (constant sunlight)
		var light4 = new THREE.PointLight(0xFFFFFF, 0.5);
		light4.position.set(-120,100,0);
		scene.add(light4);

		//initialize party lights
		tmp_light = new THREE.PointLight(0x000001, 0.8);
		tmp_light.position.set(-100,200,100);
		scene.add(tmp_light);

		tmp_light2 = new THREE.PointLight(0x000001, 0.8);
		tmp_light2.position.set(-100,200,100);
		scene.add(tmp_light2);

		tmp_light3 = new THREE.PointLight(0x000001, 0.8);
		tmp_light3.position.set(-100,200,100);
		scene.add(tmp_light3);


		//Collada loader script to bring in .dae model file
		var loader = new THREE.ColladaLoader();

		loader.options.convertUpAxis = true;

  		loader.load( '/assets/models/web_robot.dae', function ( collada ) {

			var dae = collada.scene;

			dae.position.set(0,0,0); //x,z,y- if you think in blender dimensions ;)
			dae.scale.set(10.5,10.5,10.5);

			scene.add(dae);

			//axes and grid code
			axes = new THREE.AxisHelper(50);
			axes.position = dae.position;

			gridXZ = new THREE.GridHelper(100, 10);
			gridXZ.setColors( new THREE.Color(0xFFC0CB), new THREE.Color(0x8f8f8f) );
			gridXZ.position.set(0,0,0 );
		});
  	}


  	//change color of light
  	function change_light(color, light_num) {
  		if (light_num == 1) {
  			scene.remove(light);

  			light = new THREE.PointLight(color, 0.7);
			light.position.set(-100,200,100);
			scene.add(light);
  		}
  		if (light_num == 2) {
  			scene.remove(light2);

  			light2 = new THREE.PointLight(color, 0.6);
			light2.position.set(-250,40,0);
			scene.add(light2);
  		}
  		if (light_num == 3) {
  			scene.remove(light3);

  			light3 = new THREE.PointLight(color, 0.5);
			light3.position.set(150,200,-100);
			scene.add(light3);
  		}
  	}

  	//Collada loader function to bring in .dae model parts
  	function load_model( model_file ) {

  		var loader = new THREE.ColladaLoader();

		loader.options.convertUpAxis = true;

  		loader.load( model_file, function ( collada ) {

			var dae = collada.scene;

			dae.position.set(0,0,0); //x,z,y- if you think in blender dimensions ;)
			dae.scale.set(10.5,10.5,10.5);

			scene.add(dae);
		});
  	}

  	function changeSky() {

  		scene.remove(sky);
  		var bColor, tColor, exp;

  		if (!day) {

  			tColor = 0xFFFFFD;
  			bColor = 0xA6CBE6;

  			exp = 0.75;

			day = true;
		} else {

			tColor = 0x000000;
			bColor = 0x00133E;

			exp = 1.0;

			day = false;
		}

		var vertexShader = document.getElementById( 'vertexShader' ).textContent;
		var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;

		var uniforms = {
			topColor:      { type: "c", value: new THREE.Color( tColor ) },
			bottomColor: { type: "c", value: new THREE.Color( bColor ) },
			offset:         { type: "f", value: 100 },
			exponent:     { type: "f", value: exp }
		}
 
		//skydome
		
		var skyGeo = new THREE.SphereGeometry( 1000, 32, 15 );
		var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );
		
		sky = new THREE.Mesh( skyGeo, skyMat );
		scene.add( sky );
  	}

  	function addHelpers() {
  		scene.add(axes);
  		scene.add(gridXZ);

  		axes_grids = true;
  	}

  	function removeHelpers() {
  		scene.remove(axes);
  		scene.remove(gridXZ);

  		axes_grids = false;
  	}

  	//re-renders scene as camera rotates
  	function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      controls.update();
    }

    //parse slider value
    function slider_to_hex(num) {

    	var hex = num;

    	if ( (num >= 0) && (num <= 9) ) {
    		hex = num.toString();
    	} else {
    		switch (num) {
    			case "10":
    				hex = "A";
    				break;
    			case "11":
    				hex = "B";
    				break;
    			case "12":
    				hex = "C";
    				break;
    			case "13":
    				hex = "D";
    				break;
    			case "14":
    				hex = "E";
    				break;
    			case "15":
    				hex = "F";
    				break;
    		}
    	}

    	return hex;
    }

    //function to replace target char in string
    function char_replace (s, index, character) {
        return (s.substr(0, index) + character + s.substr(index+character.length));
    }

    //create party lights
    function party_lights() {

    	var party_color

  		scene.remove(tmp_light);
  		scene.remove(tmp_light2);
  		scene.remove(tmp_light3);

    	party_color = random_num();

		tmp_light = new THREE.PointLight(parseInt(party_color), 1.0);
		tmp_light.position.set(-250,50,0);
		scene.add(tmp_light);

		party_color = random_num();

		tmp_light2 = new THREE.PointLight(parseInt(party_color), 1.0);
		tmp_light2.position.set(200,50,50);
		scene.add(tmp_light2);

		party_color = random_num();

		tmp_light3 = new THREE.PointLight(parseInt(party_color), 1.0);
		tmp_light3.position.set(0,70,-100);
		scene.add(tmp_light3);
    }

    //generate random num between 0 and 15
    function random_num() {
    	var tmp, party_color = "0x000000";

    	for (var i=0; i<6; i++) {
    		tmp = (Math.round( (Math.random()*15) )).toString();
    		tmp = slider_to_hex(tmp);

    		party_color = char_replace(party_color, (i+2), tmp);
    	}

    	return party_color;
    }
