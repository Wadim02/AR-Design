let scene, camera, renderer;
let xrRefSpace, chairModel, placed = false;

const planText = document.getElementById('plan-text');
const startBtn = document.getElementById('start-ar');

// Inițializare Three.js
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Lumini
scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.7));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(1,2,1);
scene.add(dirLight);

// Încarcă model GLTF
const loader = new THREE.GLTFLoader();
loader.load('models/chair.glb', gltf => {
  chairModel = gltf.scene;
  chairModel.scale.set(0.5,0.5,0.5);
  chairModel.visible = false;
  scene.add(chairModel);
});

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// START AR
startBtn.addEventListener('click', async () => {
  if (!navigator.xr) { alert("Browserul nu suportă WebXR"); return; }

  const supported = await navigator.xr.isSessionSupported('immersive-ar');
  if (!supported) { alert("Dispozitivul nu suportă AR WebXR!"); return; }

  const session = await navigator.xr.requestSession('immersive-ar', {
    requiredFeatures: ['hit-test'],
    optionalFeatures: ['dom-overlay'],
    domOverlay: { root: document.body }
  });

  renderer.xr.setSession(session);
  xrRefSpace = await session.requestReferenceSpace('local-floor');
  const viewerSpace = await session.requestReferenceSpace('viewer');
  const hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

  // Tick loop
  session.requestAnimationFrame(function onXRFrame(time, frame) {
    session.requestAnimationFrame(onXRFrame);

    const pose = frame.getViewerPose(xrRefSpace);
    if (!pose) return;

    if (!placed && chairModel) {
      const hitResults = frame.getHitTestResults(hitTestSource);
      if (hitResults.length > 0) {
        const hitPose = hitResults[0].getPose(xrRefSpace);
        chairModel.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z);
        chairModel.visible = true;
        planText.style.display = 'block';
        placed = true;
      }
    }

    renderer.render(scene, camera);
  });

  startBtn.style.display = 'none';
});
