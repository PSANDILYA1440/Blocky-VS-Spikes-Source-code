const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera();

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshBasicMaterial()
);

scene.add(cube);
