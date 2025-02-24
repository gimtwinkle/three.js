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
	model.rotation.y += deltaX * 0.005;
	model.rotation.x += deltaY * 0.005;

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

	model.rotation.y += deltaX * 0.005;
	model.rotation.x += deltaY * 0.005;

	previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}

function onTouchEnd() {
	isDragging = false;
}

let clock = new THREE.Clock();

let loader = new GLTFLoader();
loader.load('/rabbit_squat/scene.gltf', function (gltf) {
    model = gltf.scene;

    // 모델의 위치를 (0, 0, 0)으로 설정
    model.position.set(0, 0, 0);

    // 모델의 크기를 적절히 조정 (필요 시)
    model.scale.set(1, 1, 1); // 모델 크기 조정

    scene.add(model);

    // 애니메이션이 있는지 확인하고 애니메이션 믹서 생성
    if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);

        // 내장된 애니메이션을 모두 재생하도록 설정 (기본적으로 첫 번째 애니메이션부터 실행)
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play().setLoop(THREE.LoopRepeat, Infinity);
        });
    }
});

// 자동 회전과 애니메이션 업데이트
function animate() {
    requestAnimationFrame(animate);
    let delta = clock.getDelta(1); // 프레임 간 시간 계산

    // 모델의 자동 회전 (y축 회전)
    if (model) {
        model.rotation.y += autoRotateSpeed;
    }

    if (mixer) mixer.update(delta); // 애니메이션 업데이트
    renderer.render(scene, camera);
}

animate();
