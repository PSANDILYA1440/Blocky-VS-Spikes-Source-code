const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);


const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

document.body.appendChild(renderer.domElement);


// Cube
const geometry = new THREE.BoxGeometry();

const material = new THREE.MeshStandardMaterial({
  color: 0x3498db
});

const cube = new THREE.Mesh(
  geometry,
  material
);

scene.add(cube);


// Lighting
const light = new THREE.DirectionalLight(
  0xffffff,
  3
);

light.position.set(5, 5, 5);
scene.add(light);


scene.add(
  new THREE.AmbientLight(
    0xffffff,
    0.5
  )
);


// Camera
camera.position.z = 3;


// Drag controls
const controls = new THREE.OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;


// Animation
function animate() {

  requestAnimationFrame(animate);

  controls.update();

  renderer.render(
    scene,
    camera
  );
}

animate();


// Resize
window.addEventListener("resize", () => {

  camera.aspect =
    window.innerWidth /
    window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

});
