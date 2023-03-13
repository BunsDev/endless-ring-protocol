// import './style.css';
import * as THREE from "three";
import { OrbitControls } from '/src/node_modules/three/examples/jsm/controls/OrbitControls.js';
// import { Loader } from '/src/node_modules/three';
import { GLTFLoader } from '/src/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

// Setup

const scene = new THREE.Scene();

const near = 6; const far = 9;
scene.fog = new THREE.Fog(0xffd4d4, near, far); // fog settings

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'), alpha: true, antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setX(0);
camera.position.setY(0.5);
camera.position.setZ(5);

if (window.innerWidth < 768) {
  camera.position.setX(3);
  camera.position.setY(1.0);
  console.log('your screensize is smaller than 768px');
}

console.log('Rendering for screen size:', window.innerWidth, window.innerHeight, 'and camera position', camera.position);

renderer.render(scene, camera);

// file loader setup
const loader = new GLTFLoader();

// // textures, diffuse map, roughness map
const ringTexture = new THREE.TextureLoader().load('src/media/goldtexture.jpg');

const normalTexture = new THREE.TextureLoader().load('src/media/goldtexture.jpg');
const diffuseMap = new THREE.TextureLoader().load('src/media/weavedisp.png');


const ringmaterial = new THREE.MeshStandardMaterial(
  {
    color: 0xFFD700,
    // roughness: 0.1,
    // metalness: 0.7,
    // diffuse: 0,
    map: ringTexture,
    normalMap: normalTexture,
  });


// load gltf model with textures and add it to the scene
loader.load('src/media/wave_ring2.gltf', (gltf) => {
  const ring = gltf.scene.children[0];

  // set ring name
  ring.name = 'ring';
  ring.scale.set(1.5, 1.5, 1.5);
  if (window.innerWidth < 768) {
    ring.scale.set(1.2, 1.2, 1.2);
    console.log('screensize < 768px & the RING scale is', torus.scale);
  }
  ring.material = ringmaterial;

  ring.position.setX(2.5);
  ring.position.setY(0);
  ring.position.setZ(-8);

  // translation position debugging helper
  // translateOnAxis moves object by vector and distance. worldToLocal produses a vector from the object position (ring.position) to point (x,y,z) in the function.
  // console.log("before translation ring is at position: ", ring.position);
  // ring.translateOnAxis(ring.worldToLocal(new THREE.Vector3(0,0,10)),2);
  // console.log("after translation ring is at position: ", ring.position);

  // ring.material.texture = ringTexture;
  // ring.material.map = diffuseMap;
  // ring.material.normalMap = normalTexture;
  // ring.material.roughnessMap = roughnessTexture;

  // ring.material.color.set(0xffffff);
  // ring.material.metalness = 0.6;
  // ring.material.roughness = 0.1;

  scene.add(ring);
});



// Torus
// const torusgeometry = new THREE.TorusGeometry(4, 0.2, 32, 100);
const material = new THREE.MeshStandardMaterial(
  {
    color: 0xFFD700,
    map: ringTexture,
    normalMap: normalTexture,
  });

const torus = new THREE.Mesh(new THREE.TorusGeometry(4, 0.2, 32, 100), material);

if (window.innerWidth < 768) {
  torus.scale.set(0.7, 0.7, 0.7);
  console.log('screensize < 768px & the TORUS scale is', torus.scale);
}
torus.position.setX(2.5);
torus.position.setY(0);
torus.position.setZ(-8);

scene.add(torus);

// Mesh Ring

// const meshring = new THREE.Mesh(
//   new THREE.TorusGeometry(2, 0.5, 32, 100),
//   new THREE.MeshBasicMaterial({ wireframe: true }),
//   // map: ringTexture,

// );

// meshring.position.setX(5);
// meshring.position.setY(-2);
// meshring.position.setZ(15)

// scene.add(meshring);

// Lights

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Background

// const spaceTexture = new THREE.TextureLoader().load('src/media/space.jpg');
scene.background = null; // must be null for vantajs to work


// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  // meshring.rotation.x += 0.05;
  // meshring.rotation.y += 0.075;
  // meshring.rotation.z += 0.05;

  camera.position.z = t * 0.005;
  // camera.position.x = t * 0.005;
  // camera.rotation.y = t * -0.05;

  // camera position debugger helper
  // console.log("camera position after moveCamera(): ", camera.position);
  // console.log("t = top scroll distance: ",t);  
}

document.body.onscroll = moveCamera;
moveCamera();

// logs
// console.log("torus is at position: ", torus.position);
// console.log("camera is at position: ", camera.position);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // ring.rotation.x += 0.01;
  const ring = scene.getObjectByName('ring');
  // if ring is not undefined, rotate it
  if (ring) {
    ring.rotation.x += 0.001;
    ring.rotation.y += 0.005;
    ring.rotation.z += 0.001;
  }


  torus.rotation.x += 0.001;
  torus.rotation.y += 0.0005;
  torus.rotation.z += 0.001;

  // controls.update();

  renderer.render(scene, camera);
}



// ///////////// boxes
// const color = 0x000000;
// const z = -10;

// const geometry = new THREE.TorusGeometry(1,1,1);
// function makeInstance(geometry, color, x, z) {
//   const material = new THREE.MeshStandardMaterial({color});

//   const torus = new THREE.Mesh(geometry, material);
//   scene.add(torus);

//   torus.position.x = x;

//   return torus;
// }

// const toruses = [
//   makeInstance(geometry, 0x000000, -1, -1),
//   makeInstance(geometry, 0x000000, 1, -1),
//   makeInstance(geometry, 0x000000, -1, 1),
// ];

// makeInstance(geometry, 0x000000, 1, 1);

// scene.add(makeInstance(geometry, 0x000000, 0, 0));


animate();

// general helpers

// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(100, 0);
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(lightHelper, gridHelper, axesHelper)



// controls.addEventListener('change', renderer); // use if there is no animation loop

// add controls to the scene
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.25;
// controls.enableZoom = true;
// controls.update();

// const controls = new OrbitControls(camera, renderer.domElement);

// controls.minDistance = 2;
// controls.maxDistance = 10;
// controls.target.set(0, 0, - 0.2);
// controls.update();