import Slide from './Slide.js';

import * as THREE from '../CMapJS/Libs/three.module.js';
import {OrbitControls} from '../CMapJS/Libs/OrbitsControls.js';
import Renderer from '../CMapJS/Rendering/Renderer.js';
import {Clock} from '../CMapJS/Libs/three.module.js';
import {glRenderer} from './parameters.js';

import GUI  from '../lil-gui.module.min.js';


let ambiant_light_int = 0.4;
let point_light_int = 0.6;

export const slide_quaternions = new Slide(
	function(DOM)
	{

		console.log(DOM)
		// const gui = new GUI({container: document.getElementById("quaternions_div")});


		this.camera = new THREE.PerspectiveCamera(45, DOM.width / DOM.height, 0.01, 10.0);
		this.camera.position.set(0, 0, 4);


		const context_input = DOM.getContext('2d');
		const orbit_controls_input = new OrbitControls(this.camera, DOM);


		this.scene = new THREE.Scene()
		this.scene.background = new THREE.Color(0xFFFFFF);
		const ambiantLight = new THREE.AmbientLight(0xFFFFFF, ambiant_light_int);
		const pointLight = new THREE.PointLight(0xFFFFFF, point_light_int);
		pointLight.position.set(10,8,15);

		this.scene.add(pointLight);
		this.scene.add(ambiantLight);

		const white = new THREE.MeshLambertMaterial({color: 0xBBBBBB, wireframe: false, transparent: true, opacity: 0.35});

		const geometryOrigin = new THREE.SphereGeometry(1, 32, 32);
		const origin = new THREE.Mesh(geometryOrigin, white)
		
		this.scene.add(origin)


		const geometryCone = new THREE.ConeGeometry(0.2, 1, 16, 1);
		const geometryBaseCone = new THREE.SphereGeometry(0.199, 32, 32);
		geometryCone.translate(0, 0.5, 0)

		const red = new THREE.MeshLambertMaterial({color: 0xff0000, wireframe: false});
		
		const coneDQ0 = new THREE.Mesh(geometryCone, red);
		const coneQ = new THREE.Mesh(geometryBaseCone, red);
		this.scene.add(coneDQ0)
		this.scene.add(coneQ)

		const quat0 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 1, 1), 0.02);
		const quat1 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, -1, 1), 0.05);

		// const quat = new THREE.Quaternion(0.18, 0.18, 0.18, 0.95);
		// quat.multiplyScalar(0.6)
		// console.log(quat.normalize())

		this.clock = new Clock(true);
		this.time = 0;

		this.loop = function(){
			if(this.running){
				this.time += this.clock.getDelta();

				coneDQ0.quaternion.premultiply(quat0).normalize();


				glRenderer.setSize(DOM.width, DOM.height);
				glRenderer.render(this.scene, this.camera);
				context_input.clearRect(0, 0, DOM.width, DOM.height);
				context_input.drawImage(glRenderer.domElement, 0, 0)

				requestAnimationFrame(this.loop.bind(this));
			}
		}
	});