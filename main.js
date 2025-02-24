import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let model;
let mixer;
let autoRotateSpeed = 0.005;  // 자동 회전 속도

// 장면(Scene) 생성
let scene = new THREE.Scene();

// 카메라(Camera) 생성
let camera = new THREE.PerspectiveCamera( 
	75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 10, 20);

// 렌더링
let renderer = new THREE.WebGLRenderer({ 
	canvas: document.querySelector('#canvas'),
	antialias : true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const skyboxTextures = [
    '/skybox/skybox_bg.jpg',   // +X
    '/skybox/skybox_bg.jpg',    // -X
    '/skybox/skybox_bg.jpg',     // +Y
    '/skybox/skybox_bg.jpg',  // -Y
    '/skybox/skybox_bg.jpg',   // +Z
    '/skybox/skybox_bg.jpg'     // -Z
];

// CubeTextureLoader로 스카이박스 이미지 로드
const bgLoader = new THREE.CubeTextureLoader();
bgLoader.load(skyboxTextures, function (texture) {
    scene.background = texture;
});

const texture = bgLoader.load(skyboxTextures);

// 스카이박스를 장면에 적용
scene.background = texture;



// 조명
let sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
sunLight.position.set(5, 10, -5);
sunLight.castShadow = true;
let ambientLight = new THREE.AmbientLight(0xBFD1E5, 0.5);
let hemiLight = new THREE.HemisphereLight(0xB1E1FF, 0x6B8E23, 0.7);  
scene.add(sunLight, ambientLight, hemiLight);

renderer.shadowMap.enabled = true;
renderer.castShadow = true;
renderer.receiveShadow = true;

let loader = new GLTFLoader();
loader.load('/rabbit_squat/scene.gltf', function (gltf) {
    model = gltf.scene;
    scene.add(model);

    if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);

        // 첫 번째 애니메이션: 회전
        let rotateAction = mixer.clipAction(gltf.animations[0]);
        rotateAction.setLoop(THREE.LoopRepeat, Infinity);
        rotateAction.play();
    }
});

// 마우스 이벤트 처리
document.addEventListener("mousedown", onMouseDown);
document.addEventListener("mousemove", onMouseMove);
document.addEventListener("mouseup", onMouseUp);

document.addEventListener("touchstart", onTouchStart, { passive: false });
document.addEventListener("touchmove", onTouchMove, { passive: false });
document.addEventListener("touchend", onTouchEnd);

function onMouseDown(event) {
	isDragging = true;
	previousMousePosition = { x: event.clientX, y: event.clientY };
}

function onMouseMove(event) {
	if (!isDragging || !model) return;

	let deltaX = event.clientX - previousMousePosition.x;
	let deltaY = event.clientY - previousMousePosition.y;

	// 모델 회전
	model.rotation.y += deltaX * 0.001;
	model.rotation.x += deltaY * 0.001;

	previousMousePosition = { x: event.clientX, y: event.clientY };
}

function onMouseUp() {
	isDragging = false;
}

// 터치 이벤트 핸들러
function onTouchStart(event) {
	isDragging = true;
	previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}

function onTouchMove(event) {
	if (!isDragging) return;

	let deltaX = event.touches[0].clientX - previousMousePosition.x;
	let deltaY = event.touches[0].clientY - previousMousePosition.y;

	model.rotation.y += deltaX * 0.001;
	model.rotation.x += deltaY * 0.001;

	previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}

function onTouchEnd() {
	isDragging = false;
}

let clock = new THREE.Clock();

// 애니메이션 루프에서 업데이트
function animate() {
    requestAnimationFrame(animate);
    let delta = clock.getDelta(1); // 프레임 간 시간 계산
    if (mixer) mixer.update(delta); // 애니메이션 업데이트

    // 마우스 이벤트가 작동 중이지 않다면 자동 회전
    if (!isDragging && model) {
        model.rotation.y += autoRotateSpeed;  // Y축 회전
    }

    renderer.render(scene, camera);
}

animate();
