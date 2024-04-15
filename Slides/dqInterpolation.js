import Slide from './Slide.js';

import * as THREE from '../CMapJS/Libs/three.module.js';
import {OrbitControls} from '../CMapJS/Libs/OrbitsControls.js';
import Renderer from '../CMapJS/Rendering/Renderer.js';
import {Clock} from '../CMapJS/Libs/three.module.js';
import {glRenderer} from './parameters.js';

import GUI  from '../lil-gui.module.min.js';
import {DualQuaternion} from '../DualQuaternion.js'

let ambiant_light_int = 0.4;
let point_light_int = 0.6;

export const slide_dqInterpolation = new Slide(
	function(DOM)
	{
		console.log(DOM)

		this.camera = new THREE.PerspectiveCamera(45, DOM.width / DOM.height, 0.01, 100.0);
		this.camera.position.set(0, 3, 4.5);


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
		const black = new THREE.MeshLambertMaterial({color: 0x000000, wireframe: true, transparent: false, opacity: 1});



		const geometryCone = new THREE.ConeGeometry(0.2, 1, 16, 1);
		const geometryBaseCone = new THREE.SphereGeometry(0.199, 32, 32);
		geometryCone.translate(0, 0.5, 0)

		const red = new THREE.MeshLambertMaterial({color: 0xff0000, wireframe: false});
		const green = new THREE.MeshLambertMaterial({color: 0x00ff00, wireframe: false});
		const blue = new THREE.MeshLambertMaterial({color: 0x0000ff, wireframe: true});
		
		const coneQ0 = new THREE.Mesh(geometryCone, red);
		const coneQ1 = new THREE.Mesh(geometryCone, green);
		const coneQ2 = new THREE.Mesh(geometryCone, blue);
		const coneQ3 = new THREE.Mesh(geometryCone, blue);
		const coneQ = new THREE.Mesh(geometryBaseCone, red);
		// this.scene.add(coneDQ0)
		// this.scene.add(coneQ0)
		// this.scene.add(coneQ1)
		// this.scene.add(coneQ2)
		// this.scene.add(coneQ3)

		const quat0 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(-1, 1, 1).normalize(), 1.2);
		const quat1 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 1, -1).normalize(), 2.45).normalize();
		coneQ0.quaternion.copy(quat0);
		coneQ1.quaternion.copy(quat1);
		// const quat = new THREE.Quaternion(0.18, 0.18, 0.18, 0.95);
		// quat.multiplyScalar(0.6)
		// console.log(quat.normalize())

		const quat2 = new THREE.Quaternion();
		const quat3 = new THREE.Quaternion();


		const world0 = new THREE.Vector3(0, 0, 0);
		const worldX = new THREE.Vector3(1, 0, 0);
		const worldY = new THREE.Vector3(0, 1, 0);
		const worldZ = new THREE.Vector3(0, 0, 1);
		
		// red
		const translation0 = new THREE.Quaternion(1.5, 1., -0.5, 0);
		const rotation0 = new THREE.Quaternion().setFromAxisAngle(worldZ, Math.PI / 2);
		rotation0.multiply(new THREE.Quaternion().setFromAxisAngle(worldZ, Math.PI / 5))
		// rotation0.multiply(new THREE.Quaternion().setFromAxisAngle(worldX, Math.PI / 3))
		
		const dq0 = DualQuaternion.setFromRotationTranslation(rotation0, translation0);
		// green
		const translation1 = new THREE.Quaternion(-1., 1., .5, 0);
		// const rotation1 = new THREE.Quaternion().setFromAxisAngle(worldZ, Math.PI / 2);
		const rotation1 = new THREE.Quaternion().setFromAxisAngle(worldZ, Math.PI / 2);
		rotation1.multiply(new THREE.Quaternion().setFromAxisAngle(worldX, 5*Math.PI / 6))
		rotation1.multiply(new THREE.Quaternion().setFromAxisAngle(worldZ, -2*Math.PI / 6))
		const dq1 = DualQuaternion.setFromRotationTranslation(rotation1, translation1);

		const dq2 = new DualQuaternion;

		const grid = new THREE.GridHelper(10, 10)
		this.scene.add(grid)
		
		const coneDQ0 = new THREE.Mesh(geometryCone, red);
		const coneDQ1 = new THREE.Mesh(geometryCone, green);
		const coneDQ2 = new THREE.Mesh(geometryCone, blue);

		this.scene.add(coneDQ0)
		this.scene.add(coneDQ1)
		this.scene.add(coneDQ2)


		coneDQ0.position.copy(dq0.transform(world0.clone()))
		coneDQ0.quaternion.copy(dq0.real)
		
		coneDQ1.position.copy(dq1.transform(world0.clone()))
		coneDQ1.quaternion.copy(dq1.real)
		


		const geometrySampleCone = new THREE.ConeGeometry(0.025, 0.125, 16, 1);
		geometrySampleCone.translate(0, 1-0.06125, 0);
		
		const divs = 30;
		
		let step = 1 / divs;
		for(let i = 0; i <= divs; ++i) {
				let t = i * step;
	
				const r0 = dq0.clone().lerp(dq1, t).normalize();

				const cone = new THREE.Mesh(geometrySampleCone, black);
				cone.quaternion.copy(r0.getRotation())
				cone.position.copy(r0.getTranslation())
				this.scene.add(cone)
		}


		this.clock = new Clock(true);
		this.time = 0;

		this.loop = function(){
			if(this.running){
				this.time += this.clock.getDelta();
				this.scene.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 145 * this.time);

				// coneDQ0.quaternion.premultiply(quat0).normalize();
				const t = (Math.sin(this.time) + 1) * 0.5;
				dq2.copy(dq0).lerp(dq1, t).normalize();

				coneDQ2.position.copy(dq2.getTranslation())
				coneDQ2.quaternion.copy(dq2.getRotation()),

				// quat3.copy(quat0).slerp(quat1, 1-t);
				// coneQ3.quaternion.copy(quat3)


				glRenderer.setSize(DOM.width, DOM.height);
				glRenderer.render(this.scene, this.camera);
				context_input.clearRect(0, 0, DOM.width, DOM.height);
				context_input.drawImage(glRenderer.domElement, 0, 0)

				requestAnimationFrame(this.loop.bind(this));
			}
		}
	});