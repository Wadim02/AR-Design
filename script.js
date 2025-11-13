// script.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.181.0/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, xrRefSpace;
let chairModel = null;
let placed = false;
let planeMeshes = new Map();

// Initializare Three.js
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 20);
renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Lumini
scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.7));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(1,2,1);
scene.add(dirLight);

// Loader model GLTF
const loader = new GLTFLoader();
loader.load('models/chair.glb', gltf => {
    chairModel = gltf.scene;
    chairModel.scale.set(0.5,0.5,0.5);
    chairModel.visible = false;
    scene.add(chairModel);
});

// Text plan detectat
const planText = document.getElementById('plan-text');

// Start AR
document.getElementById('start-ar').addEventListener('click', async () => {
    if (!navigator.xr) { alert('WebXR nu este suportat pe acest dispozitiv.'); return; }

    const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'local-floor'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body }
    });

    renderer.xr.setSession(session);
    xrRefSpace = await session.requestReferenceSpace('local-floor');
    const viewerSpace = await session.requestReferenceSpace('viewer');
    const hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

    session.requestAnimationFrame(function onXRFrame(time, frame){
        session.requestAnimationFrame(onXRFrame);
        const pose = frame.getViewerPose(xrRefSpace);
        if (!pose) return;

        // Plasare model 3D
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
});

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
