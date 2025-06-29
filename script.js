// Three.js 지구본 애플리케이션
let scene, camera, renderer, earthGlobe, earthClouds;
let rotationSpeed = 0.002;

// 텍스트 스프라이트 관련 변수
let letterSprites = [];
let teamSprites = [];
let textAngle = 0;
const orbitRadius = 1.8;

// 마우스 인터랙션 관련 변수
let raycaster, mouse;
let isHovering = false;
let hoveredSprite = null;

// 팀 카드 관련 변수
let currentTeamIndex = 0;

// 로딩 관리 변수
let loadingManager;
let totalAssets = 5; // 텍스처 개수
let loadedAssets = 0;

// Glow Sphere 전역 변수 추가
let earthGlow = null;

// 성능 최적화 변수
let frameCount = 0;
let lastTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

// 디바이스 성능 감지
const isLowEndDevice = navigator.hardwareConcurrency <= 4 || 
                      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

console.log('디바이스 성능:', isLowEndDevice ? '낮음' : '높음');
console.log('디바이스 타입:', isMobileDevice ? '모바일' : '데스크톱');

// 팀 정보 설정
const teams = [
    "경영관리실", "전략기획실", "압타밀 팀", "드리미 팀",
    "컨텐츠 팀", "고객지원부", "물류센터", "마케팅팀"
];

const teamColors = [
    "#2B3A67", // 경영관리실
    "#5A6D8F", // 전략기획실 (블루퍼플 틸)
    "#B3D5F2", // 압타밀 팀
    "#FFA450", // 드리미 팀
    "#7FC7FF", // 컨텐츠 팀
    "#50E3C2", // 고객지원부
    "#6E7A87", // 물류센터
    "#C96BE2"  // 마케팅팀
];

const teamDescriptions = [
    "회사의 전반적인 경영과 관리를 담당하는 핵심 부서입니다. 재무·인사·법무·리스크 관리 등 운영 안정화를 위한 주요 업무를 총괄하며, 벤더사로서 플랫폼 제휴와 이해관계자 조율을 맡고 있습니다.",
    "회사의 미래 비전과 전략을 수립하고 실행하는 조직입니다. 시장 분석, 유통 채널 확대, 신규 브랜드 발굴 , 직원 인프라 등을 조성해 회사의 지속 가능한 성장을 추진합니다.",
    "독일 명품 분유 '압타밀'의 공식 대행 유통과 마케팅을 담당합니다. 제품 수입사와의 협업, 플랫폼별 입점 관리, 신뢰 기반 리뷰 확보 등을 통해 프리미엄 유아식품 시장에서의 입지를 확대합니다.",
    "프리미엄 가전 브랜드 '드리미(Dreame)'의 로봇청소기 라인을 공식 대행 유통합니다. 제품 정보 구성, 리뷰 마케팅, 채널 전략을 통해 가전 분야에서의 브랜드 신뢰도를 강화합니다.",
    "브랜드 정체성과 메시지를 시각적으로 구현하는 콘텐츠 전담 조직입니다. 상세페이지, 영상, 디자인 등 다양한 미디어를 통해 소비자와의 정서적 연결을 구축합니다.",
    "고객 만족을 최우선으로 하는 지원 부서입니다. 문의 응대, 사용법 안내, A/S 연계 등 전방위 고객 지원을 담당하며, VOC를 기반으로 한 개선 루프를 운영합니다.",
    "제품 보관 및 배송을 총괄하는 물류 센터입니다. 외부 물류 파트너사와 협업하여 재고 관리, 빠른 출고, 정확한 배송을 통해 고객 신뢰를 구축합니다.",
    "브랜드 인지도 향상과 매출 성장을 위한 통합 마케팅을 기획합니다. 리뷰 기반 디지털 마케팅, 타겟 광고, 프로모션 전략을 통해 플랫폼 내 경쟁력을 확보합니다."
];

// 초기화 함수
function init() {
    // Three.js 라이브러리 로딩 확인
    if (typeof THREE === 'undefined') {
        console.error('Three.js 라이브러리가 로딩되지 않았습니다.');
        setTimeout(init, 100); // 100ms 후 다시 시도
        return;
    }
    
    console.log('Three.js 라이브러리 로딩 완료, 초기화 시작');
    
    // 로딩 매니저 설정
    loadingManager = new THREE.LoadingManager();
    
    loadingManager.onLoad = function() {
        console.log('모든 에셋 로딩 완료!');
        // 애니메이션 루프 시작
        animate();
    };
    
    loadingManager.onError = function(url) {
        console.error('로딩 에러:', url);
    };

    // 씬 생성
    scene = new THREE.Scene();
    
    // 카메라 생성
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5); // 카메라를 정중앙에서 뒤로 이동
    camera.lookAt(0, 0, 0); // 카메라가 정중앙을 바라보도록 설정
    
    // 렌더러 생성
    renderer = new THREE.WebGLRenderer({ 
        antialias: !isLowEndDevice, // 성능에 따라 안티앨리어싱 조정
        powerPreference: "high-performance",
        stencil: false,
        depth: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000011); // 우주 배경색으로 변경
    renderer.shadowMap.enabled = !isLowEndDevice; // 성능에 따라 그림자 조정
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowEndDevice ? 1 : 2)); // 성능에 따라 픽셀 비율 조정
    document.getElementById('container').appendChild(renderer.domElement);
    
    // 우주 환경 생성
    createSpaceEnvironment();
    
    // 조명 추가 - 우측 위에서 부드러운 햇빛
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6); // 환경광 더 증가
    scene.add(ambientLight);
    
    // 메인 햇빛 (우측 위에서) - 더 강하게
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.1); // 흰색 햇빛으로 변경, 강도 조정
    sunLight.position.set(15, 20, 10); // 우측 위에서 비추도록
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    scene.add(sunLight);
    
    // 부드러운 보조 조명
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.8); // 보조광 강도 조정
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);
    
    // 추가 조명 - 지구본을 더 밝게
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8); // 림라이트 강도 조정
    rimLight.position.set(0, 0, 15);
    scene.add(rimLight);
    
    // 태양빛 추가 조명 - 지구본을 더 밝게 비추기
    const extraSunLight = new THREE.DirectionalLight(0xffffff, 0.2); // 흰색으로 변경, 강도 조정
    extraSunLight.position.set(20, 15, 5);
    scene.add(extraSunLight);
    
    // GLB 파일 로드
    loadEarthGlobe();
    
    // 텍스트 스프라이트 생성
    createTextSprites();
    createTeamSprites();
    
    // 마우스 인터랙션 설정
    setupMouseInteraction();
    
    // 윈도우 리사이즈 이벤트
    window.addEventListener('resize', onWindowResize);
}

// 우주 환경 생성 함수
function createSpaceEnvironment() {
    // 원형 별 텍스처 생성 함수
    function createStarTexture() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 32;
        canvas.height = 32;
        
        // 원형 그라데이션 생성
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(16, 16, 16, 0, Math.PI * 2);
        context.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        
        return texture;
    }
    
    // 밝은 별들 생성
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = isLowEndDevice ? 2000 : 4000; // 성능에 따라 별 개수 조정
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);
    
    for (let i = 0; i < starsCount * 3; i += 3) {
        // 랜덤한 위치에 별 배치
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = (Math.random() - 0.5) * 100;
        positions[i + 2] = (Math.random() - 0.5) * 100;
        
        // 별들의 색상 다양화 (더 밝게)
        const starType = Math.random();
        if (starType < 0.7) {
            // 밝은 흰색 별들 (70%)
            colors[i] = 1.0;
            colors[i + 1] = 1.0;
            colors[i + 2] = 1.0;
        } else if (starType < 0.85) {
            // 밝은 파란색 별들 (15%)
            colors[i] = 0.8;
            colors[i + 1] = 0.9;
            colors[i + 2] = 1.0;
        } else if (starType < 0.95) {
            // 밝은 노란색 별들 (10%)
            colors[i] = 1.0;
            colors[i + 1] = 0.9;
            colors[i + 2] = 0.7;
        } else {
            // 밝은 주황색 별들 (5%)
            colors[i] = 1.0;
            colors[i + 1] = 0.8;
            colors[i + 2] = 0.6;
        }
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
        size: isLowEndDevice ? 0.12 : 0.08, // 성능에 따라 별 크기 조정
        vertexColors: true,
        transparent: true,
        opacity: 0, // 초기 투명도 0으로 설정
        map: createStarTexture(), // 원형 별 텍스처 적용
        blending: THREE.AdditiveBlending // 우주 느낌의 블렌딩
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // 별들 페이드인 애니메이션
    setTimeout(() => {
        gsap.to(starsMaterial, {
            opacity: 0.9,
            duration: 6,
            ease: "power2.out"
        });
    }, 1000); // 1초 후 시작
    
    // 큰 밝은 별들 제거 - 더 자연스러운 우주 환경
    
    // 은하수 효과 (먼지 구름) - 더 은은하게
    const nebulaGeometry = new THREE.SphereGeometry(50, isLowEndDevice ? 16 : 32, isLowEndDevice ? 16 : 32); // 성능에 따라 해상도 조정
    const nebulaMaterial = new THREE.MeshBasicMaterial({
        color: 0x1a1a3a,
        transparent: true,
        opacity: 0, // 초기 투명도 0으로 설정
        side: THREE.BackSide
    });
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);
    
    // 은하수 페이드인 애니메이션
    setTimeout(() => {
        gsap.to(nebulaMaterial, {
            opacity: 0.05,
            duration: 7,
            ease: "power2.out"
        });
    }, 1500); // 1.5초 후 시작
    
    // 먼지 입자들 - 더 은은하게
    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = isLowEndDevice ? 150 : 300; // 성능에 따라 먼지 개수 조정
    const dustPositions = new Float32Array(dustCount * 3);
    
    for (let i = 0; i < dustCount * 3; i += 3) {
        dustPositions[i] = (Math.random() - 0.5) * 80;
        dustPositions[i + 1] = (Math.random() - 0.5) * 80;
        dustPositions[i + 2] = (Math.random() - 0.5) * 80;
    }
    
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    
    const dustMaterial = new THREE.PointsMaterial({
        size: isLowEndDevice ? 0.05 : 0.03, // 성능에 따라 먼지 크기 조정
        color: 0x333355, // 색상 더 어둡게
        transparent: true,
        opacity: 0, // 초기 투명도 0으로 설정
        map: createStarTexture(), // 먼지도 원형으로
        blending: THREE.AdditiveBlending
    });
    
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);
    
    // 먼지 페이드인 애니메이션
    setTimeout(() => {
        gsap.to(dustMaterial, {
            opacity: 0.2,
            duration: 6.5,
            ease: "power2.out"
        });
    }, 2000); // 2초 후 시작
}

// 지구본 생성 함수 (텍스처 사용)
function loadEarthGlobe() {
    // 환경 감지: GitHub Pages인지 로컬인지 확인
    const isGitHubPages = window.location.hostname.includes('github.io') || 
                         window.location.hostname.includes('github.com');
    
    // 환경에 따라 다른 경로 사용
    const texturePath = isGitHubPages ? '' : 'public/textures/';
    
    // 디바이스 성능 감지
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEndDevice = navigator.hardwareConcurrency <= 4;
    
    console.log('현재 환경:', isGitHubPages ? 'GitHub Pages' : '로컬');
    console.log('디바이스 타입:', isMobile ? '모바일' : '데스크톱');
    console.log('성능 레벨:', isLowEndDevice ? '낮음' : '높음');
    console.log('텍스처 경로:', texturePath);
    
    // 로딩 매니저를 사용한 텍스처 로더
    const textureLoader = new THREE.TextureLoader(loadingManager);
    
    // 텍스처 캐싱 설정
    textureLoader.crossOrigin = 'anonymous';
    
    // 텍스처 로딩 우선순위 설정
    const textures = {
        day: null,
        night: null,
        clouds: null,
        normal: null,
        specular: null
    };
    
    // 텍스처 로딩 함수 (에러 핸들링 포함)
    function loadTexture(url, fallbackColor = 0x444444) {
        return new Promise((resolve) => {
            textureLoader.load(
                url,
                (texture) => {
                    console.log(`텍스처 로딩 성공: ${url}`);
                    
                    // 텍스처 최적화 설정
                    texture.generateMipmaps = !isLowEndDevice; // 성능에 따라 mipmap 조정
                    texture.minFilter = isLowEndDevice ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    texture.anisotropy = isLowEndDevice ? 1 : renderer.capabilities.getMaxAnisotropy();
                    texture.flipY = false; // WebGL 최적화
                    texture.premultiplyAlpha = false;
                    
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.warn(`텍스처 로딩 실패: ${url}`, error);
                    // 대체 텍스처 생성
                    const canvas = document.createElement('canvas');
                    canvas.width = isLowEndDevice ? 256 : 512; // 성능에 따라 해상도 조정
                    canvas.height = isLowEndDevice ? 128 : 256;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = `#${fallbackColor.toString(16).padStart(6, '0')}`;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    const fallbackTexture = new THREE.CanvasTexture(canvas);
                    
                    // 대체 텍스처도 최적화 설정
                    fallbackTexture.generateMipmaps = false;
                    fallbackTexture.minFilter = THREE.LinearFilter;
                    fallbackTexture.magFilter = THREE.LinearFilter;
                    fallbackTexture.flipY = false;
                    
                    resolve(fallbackTexture);
                }
            );
        });
    }
    
    // 텍스처들을 순차적으로 로드
    async function loadAllTextures() {
        try {
            // 가장 중요한 텍스처부터 로드
            textures.day = await loadTexture(texturePath + '8k_earth_daymap.jpg', 0x4a90e2);
            textures.normal = await loadTexture(texturePath + '8k_earth_normal_map.jpg', 0x888888);
            textures.specular = await loadTexture(texturePath + '8k_earth_specular_map.jpg', 0x222222);
            textures.clouds = await loadTexture(texturePath + '8k_earth_clouds.jpg', 0xffffff);
            textures.night = await loadTexture(texturePath + '8k_earth_nightmap.jpg', 0x1a1a2e);
            
            createEarthGlobe();
            
        } catch (error) {
            console.error('텍스처 로딩 중 오류 발생:', error);
            // 기본 지구본 생성
            createBasicEarthGlobe();
        }
    }
    
    // 지구본 생성 함수
    function createEarthGlobe() {
        // 지구본 지오메트리 생성 - 성능에 따라 해상도 조정
        const earthGeometry = new THREE.SphereGeometry(1.5, isLowEndDevice ? 32 : 64, isLowEndDevice ? 32 : 64);
        
        // 지구본 머티리얼 생성 (낮/밤 텍스처 블렌딩)
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: textures.day,
            normalMap: textures.normal,
            specularMap: textures.specular,
            shininess: 25,
            transparent: true,
            opacity: 0 // 초기 투명도 0으로 설정
        });
        
        // 지구본 메시 생성
        earthGlobe = new THREE.Mesh(earthGeometry, earthMaterial);
        
        // 지구본 크기와 위치 설정
        earthGlobe.scale.set(0.8, 0.8, 0.8);
        earthGlobe.position.set(0, 0, 0);
        
        // 그림자 설정
        earthGlobe.castShadow = true;
        earthGlobe.receiveShadow = true;
        
        // 씬에 추가
        scene.add(earthGlobe);
        
        // 지구본 페이드인 애니메이션
        setTimeout(() => {
            gsap.to(earthMaterial, {
                opacity: 0.9,
                duration: 8,
                ease: "power2.out"
            });
        }, 2500); // 2.5초 후 시작
        
        // 구름 레이어 생성
        if (textures.clouds) {
            const cloudsGeometry = new THREE.SphereGeometry(1.52, isLowEndDevice ? 32 : 64, isLowEndDevice ? 32 : 64);
            const cloudsMaterial = new THREE.MeshPhongMaterial({
                map: textures.clouds,
                transparent: true,
                opacity: 0, // 초기 투명도 0으로 설정
                blending: THREE.AdditiveBlending
            });
            
            const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
            clouds.scale.set(0.8, 0.8, 0.8);
            clouds.position.set(0, 0, 0);
            scene.add(clouds);
            
            // 구름도 회전하도록 저장
            earthClouds = clouds;
            
            // 구름 페이드인 애니메이션
            setTimeout(() => {
                gsap.to(cloudsMaterial, {
                    opacity: 0.3,
                    duration: 9,
                    ease: "power2.out"
                });
            }, 3500); // 3.5초 후 시작
        }
        
        console.log('텍스처 지구본 생성 완료!');
        
        // Glow Sphere 생성
        createEarthGlow();
    }
    
    // 기본 지구본 생성 함수 (텍스처 로딩 실패 시)
    function createBasicEarthGlobe() {
        const earthGeometry = new THREE.SphereGeometry(1.5, isLowEndDevice ? 32 : 64, isLowEndDevice ? 32 : 64);
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a90e2,
            shininess: 25,
            transparent: true,
            opacity: 0 // 초기 투명도 0으로 설정
        });
        
        earthGlobe = new THREE.Mesh(earthGeometry, earthMaterial);
        earthGlobe.scale.set(0.8, 0.8, 0.8);
        earthGlobe.position.set(0, 0, 0);
        earthGlobe.castShadow = true;
        earthGlobe.receiveShadow = true;
        scene.add(earthGlobe);
        
        // 기본 지구본 페이드인 애니메이션
        setTimeout(() => {
            gsap.to(earthMaterial, {
                opacity: 0.9,
                duration: 8,
                ease: "power2.out"
            });
        }, 2500); // 2.5초 후 시작
        
        console.log('기본 지구본 생성 완료!');
        
        // Glow Sphere 생성
        createEarthGlow();
    }
    
    // 텍스처 로딩 시작
    loadAllTextures();
}

// Glow Sphere 생성 함수
function createEarthGlow() {
    // earthGlobe의 실제 반지름과 scale을 반영
    const globeRadius = 1.5 * 0.8; // 지구본 geometry 반지름 * scale
    const glowRadius = globeRadius * 1.08; // 지구본보다 약간 크게
    const glowGeometry = new THREE.SphereGeometry(glowRadius, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    earthGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    earthGlow.position.set(0, 0, 0);
    scene.add(earthGlow);
}

// 애니메이션 루프
function animate() {
    const currentTime = performance.now();
    
    // 프레임 레이트 제한 (성능 최적화)
    if (currentTime - lastTime < frameInterval) {
        requestAnimationFrame(animate);
        return;
    }
    
    lastTime = currentTime;
    requestAnimationFrame(animate);
    
    // 로딩이 완료되지 않았으면 정적 렌더링만 수행
    if (!earthGlobe) {
        renderer.render(scene, camera);
        return;
    }
    
    // 지구본 회전 (Y축만 회전, 위치는 고정)
    if (earthGlobe) {
        earthGlobe.rotation.y += rotationSpeed;
        // 지구본을 정중앙에 고정 유지
        earthGlobe.position.set(0, 0, 0);
    }
    
    // 구름 레이어도 회전 (지구본보다 조금 빠르게)
    if (earthClouds) {
        earthClouds.rotation.y += rotationSpeed * 1.1; // 구름 속도도 감소 (1.2 → 1.1)
        earthClouds.position.set(0, 0, 0);
    }
    
    // 텍스트와 팀 스프라이트 공전 애니메이션 (속도 대폭 감소)
    textAngle += 0.002; // 텍스트 공전 속도 대폭 감소 (0.006 → 0.002)
    
    // 글자 공전
    const letters = "In-House Magazine".split("");
    letterSprites.forEach((sprite, index) => {
        const letterAngle = textAngle + 
            (letters.length - 1 - index) * ((Math.PI * 2) / letters.length) * 0.3;

        const radius = orbitRadius;
        const x = Math.cos(letterAngle) * radius;
        const y = Math.sin(letterAngle * 0.5) * radius * 0.3;
        const z = Math.sin(letterAngle) * radius;

        sprite.position.set(x, y, z);
        sprite.lookAt(camera.position);
        sprite.rotation.z = Math.sin(letterAngle) * 0.1;
        
        // 페이드인 애니메이션이 완료된 후에만 반짝임 효과 적용
        const fadeInCompleteTime = 4000 + sprite.userData.fadeInDelay * 1000 + 5000; // 페이드인 완료 시간
        if (Date.now() > fadeInCompleteTime) {
            const time = Date.now() * 0.0005; // 반짝임 속도 감소 (0.001 → 0.0005)
            const baseOpacity = 1; // 기본 투명도를 1로 설정
            sprite.material.opacity = baseOpacity + Math.sin(time * 2 + index * 0.5) * 0.3;
        }
    });

    // 팀 공전 (더 큰 궤도, 속도 대폭 감소)
    teamSprites.forEach((sprite, index) => {
        const teamAngle = textAngle * 0.5 + index * ((Math.PI * 2) / teams.length); // 팀 공전 속도 감소 (0.7 → 0.5)

        const teamRadius = orbitRadius * 1.2; // 팀 궤도 반지름 감소 (1.5 → 1.2)
        const x = Math.cos(teamAngle) * teamRadius + 0.3; // 텍스트 오른쪽으로 더 이동 (0.0 → +0.3)
        const y = Math.sin(teamAngle * 0.3) * teamRadius * 0.2 - 0.5; // 아래로 30px 이동
        const z = Math.sin(teamAngle) * teamRadius;

        sprite.position.set(x, y, z);
        sprite.lookAt(camera.position);
        sprite.rotation.z = Math.sin(teamAngle) * 0.05;
        
        // 페이드인 애니메이션이 완료된 후에만 반짝임 효과 적용
        const fadeInCompleteTime = 6000 + sprite.userData.fadeInDelay * 1000 + 4000; // 페이드인 완료 시간
        if (Date.now() > fadeInCompleteTime) {
            const time = Date.now() * 0.001; // 반짝임 속도 증가 (0.0003 → 0.001)
            const baseOpacity = 0.8; // 기본 투명도를 0.8로 설정
            sprite.material.opacity = baseOpacity + Math.sin(time * 3 + index * 0.3) * 0.4; // 주파수 증가 (1.5 → 3)
        }
    });
    
    // 별들 반짝임 효과 (속도 감소) - 성능에 따라 조정
    const time = Date.now() * 0.0003; // 별 반짝임 속도 감소 (0.001 → 0.0003)
    const starsFadeInCompleteTime = 1000 + 6000; // 별들 페이드인 완료 시간 (1초 + 6초)
    
    // 성능에 따라 별 반짝임 빈도 조정
    if (!isLowEndDevice || frameCount % 2 === 0) {
        scene.children.forEach(child => {
            if (child.type === 'Points' && child.material.color.getHex() === 0x333355) {
                // 먼지 입자들은 천천히 회전
                child.rotation.y += 0.0002; // 먼지 회전 속도 감소 (0.0005 → 0.0002)
            } else if (child.type === 'Points' && child.material.vertexColors) {
                // 일반 별들 반짝임 - 페이드인 완료 후에만
                if (Date.now() > starsFadeInCompleteTime) {
                    child.material.opacity = 0.7 + Math.sin(time * 1.5) * 0.2;
                }
            }
        });
    }
    
    if (earthGlow) {
        earthGlow.rotation.y = earthGlobe ? earthGlobe.rotation.y : 0;
    }
    
    frameCount++;
    renderer.render(scene, camera);
}

// 윈도우 리사이즈 처리
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 텍스트 스프라이트 생성 함수
function createTextSprites() {
    const letters = "In-House Magazine".split("");
    
    letters.forEach((letter, index) => {
        const createLetterSprite = (text) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = 256;
            canvas.height = 256;

            // 우주 느낌의 그라데이션 생성
            const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
            gradient.addColorStop(0, "rgba(255, 215, 0, 0.9)"); // 밝은 골드 (중앙)
            gradient.addColorStop(0.3, "rgba(255, 165, 0, 0.7)"); // 오렌지 골드
            gradient.addColorStop(0.6, "rgba(218, 165, 32, 0.5)"); // 골든로드
            gradient.addColorStop(0.8, "rgba(184, 134, 11, 0.3)"); // 다크 골든로드
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)"); // 투명

            context.fillStyle = gradient;
            context.font = "900 60px 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"; // Sans-serif 폰트로 변경
            context.textAlign = "center";
            context.fillText(text, 128, 160);

            // 글로우 효과 추가
            context.shadowColor = "rgba(255, 215, 0, 0.8)";
            context.shadowBlur = 15;
            context.fillStyle = "rgba(255, 215, 0, 0.6)";
            context.fillText(text, 128, 160);
            
            // 우주 먼지 효과 추가
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                const size = Math.random() * 3 + 1;
                const opacity = Math.random() * 0.3 + 0.1;
                
                context.fillStyle = `rgba(255, 215, 0, ${opacity})`;
                context.beginPath();
                context.arc(x, y, size, 0, Math.PI * 2);
                context.fill();
            }

            const texture = new THREE.CanvasTexture(canvas);
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.format = THREE.RGBAFormat;
            texture.premultiplyAlpha = false;

            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                alphaTest: 0.1,
                blending: THREE.AdditiveBlending, // 우주 느낌의 블렌딩
                opacity: 0 // 초기 투명도 0으로 설정
            });

            return new THREE.Sprite(spriteMaterial);
        };

        const letterSprite = createLetterSprite(letter);
        letterSprite.scale.set(0.6, 0.6, 0.6);
        letterSprite.userData = {
            originalOpacity: 1,
            fadeInDelay: index * 0.1 // 각 글자마다 0.1초씩 지연
        };
        letterSprites.push(letterSprite);
        scene.add(letterSprite);
        
        // 페이드인 애니메이션 시작
        setTimeout(() => {
            gsap.to(letterSprite.material, {
                opacity: 1,
                duration: 5,
                ease: "power2.out"
            });
        }, 4000 + letterSprite.userData.fadeInDelay * 1000); // 4초 후부터 시작
    });
}

// 팀 스프라이트 생성 함수
function createTeamSprites() {
    teams.forEach((team, index) => {
        const createTeamSprite = (text) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = 400; // 아이콘 공간을 위해 캔버스 크기 증가
            canvas.height = 80; // 캔버스 높이 유지

            // 팀별 색상 적용
            const teamColor = teamColors[index];
            const rgb = hexToRgb(teamColor);
            
            // 텍스트 그리기 - 팀별 색상으로 변경
            context.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
            context.shadowBlur = 12; // 글로우 효과 증가
            
            // 메인 텍스트 - 팀별 색상으로 변경
            context.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.95)`;
            context.font = "400 30px 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"; // Sans-serif 폰트로 변경
            context.textAlign = "left"; // 왼쪽 정렬로 변경
            context.fillText(text, 70, 50); // 아이콘 오른쪽으로 위치 조정
            
            // 추가 글로우 레이어 - 팀별 색상으로
            context.shadowBlur = 6;
            context.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`;
            context.fillText(text, 70, 50);

            const texture = new THREE.CanvasTexture(canvas);
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.format = THREE.RGBAFormat;
            texture.premultiplyAlpha = false;

            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                alphaTest: 0.1, // 호버 영역 안정성을 위해 값 증가
                blending: THREE.AdditiveBlending, // 우주 느낌의 블렌딩
                opacity: 0 // 초기 투명도 0으로 설정
            });

            return new THREE.Sprite(spriteMaterial);
        };

        const teamSprite = createTeamSprite(team);
        teamSprite.scale.set(2.0, 0.8, 2.0); // 모바일 터치를 위해 크기 증가 (1.5 → 2.0)
        teamSprite.userData = {
            teamIndex: index,
            teamName: team,
            description: teamDescriptions[index],
            originalColor: teamColors[index], // 원본 색상 저장
            isHovered: false, // 호버 상태 추적
            fadeInDelay: index * 0.15 // 각 팀마다 0.15초씩 지연
        };
        teamSprites.push(teamSprite);
        scene.add(teamSprite);
        
        // 페이드인 애니메이션 시작
        setTimeout(() => {
            gsap.to(teamSprite.material, {
                opacity: 0.8,
                duration: 6,
                ease: "power2.out"
            });
        }, 6000 + teamSprite.userData.fadeInDelay * 1000); // 6초 후부터 시작
        
        // 디버깅: 팀 스프라이트 생성 확인
        console.log(`팀 스프라이트 생성: ${team} (인덱스: ${index})`);
    });
}

// HEX 색상을 RGB로 변환하는 헬퍼 함수
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// 호버 시 색상을 밝게 만드는 함수
function brightenColor(hex, factor = 1.5) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const brightened = {
        r: Math.min(255, Math.round(rgb.r * factor)),
        g: Math.min(255, Math.round(rgb.g * factor)),
        b: Math.min(255, Math.round(rgb.b * factor))
    };
    
    return `#${brightened.r.toString(16).padStart(2, '0')}${brightened.g.toString(16).padStart(2, '0')}${brightened.b.toString(16).padStart(2, '0')}`;
}

// 스프라이트 색상 변경 함수
function updateSpriteColor(sprite, color) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 80;

    const rgb = hexToRgb(color);
    
    // 텍스트 그리기 - 새로운 색상으로
    context.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
    context.shadowBlur = 12;
    
    // 메인 텍스트
    context.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.95)`;
    context.font = "400 30px 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";
    context.textAlign = "left";
    context.fillText(sprite.userData.teamName, 70, 50);
    
    // 추가 글로우 레이어
    context.shadowBlur = 6;
    context.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`;
    context.fillText(sprite.userData.teamName, 70, 50);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    texture.premultiplyAlpha = false;

    sprite.material.map = texture;
    sprite.material.needsUpdate = true;
}

// 마우스 인터랙션 설정
function setupMouseInteraction() {
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // 데스크톱 이벤트
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onMouseClick);
    
    // 모바일 터치 이벤트
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
}

// 마우스 이동 이벤트
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(teamSprites);
    // 지구본 앞쪽(카메라에서 보이는 쪽)만 필터링
    intersects = intersects.filter(intersect => {
        const spritePos = intersect.object.position.clone().normalize();
        const cameraDir = camera.position.clone().normalize();
        return spritePos.dot(cameraDir) > 0;
    });

    // 호버 효과 없이 커서만 변경
    if (intersects.length > 0) {
            document.body.style.cursor = "pointer";
    } else {
            document.body.style.cursor = "default";
    }
}

// 마우스 클릭 이벤트
function onMouseClick(event) {
    console.log("마우스 클릭 감지");
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(teamSprites);
    // 지구본 앞쪽(카메라에서 보이는 쪽)만 필터링
    intersects = intersects.filter(intersect => {
        const spritePos = intersect.object.position.clone().normalize();
        const cameraDir = camera.position.clone().normalize();
        return spritePos.dot(cameraDir) > 0;
    });
    
    if (intersects.length > 0) {
        const clickedSprite = intersects[0].object;
        console.log("팀 클릭됨:", clickedSprite.userData.teamName);
        const teamData = clickedSprite.userData;
        showTeamCard(teamData.teamName, teamData.description);
    } else if (isHovering && hoveredSprite) {
        // 호버 중인 스프라이트가 있으면 그것을 클릭한 것으로 처리
        console.log("호버 중인 팀 클릭됨:", hoveredSprite.userData.teamName);
        const teamData = hoveredSprite.userData;
        showTeamCard(teamData.teamName, teamData.description);
    } else {
        console.log("클릭 가능한 팀이 없음");
        console.log("isHovering:", isHovering);
        console.log("hoveredSprite:", hoveredSprite);
    }
}

// 터치 시작 이벤트
function onTouchStart(event) {
    event.preventDefault();
    
    if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        let intersects = raycaster.intersectObjects(teamSprites);
        // 지구본 앞쪽(카메라에서 보이는 쪽)만 필터링
        intersects = intersects.filter(intersect => {
            const spritePos = intersect.object.position.clone().normalize();
            const cameraDir = camera.position.clone().normalize();
            return spritePos.dot(cameraDir) > 0;
        });
        
        if (intersects.length > 0) {
            isHovering = true;
            hoveredSprite = intersects[0].object;
            console.log("터치 호버 시작:", hoveredSprite.userData.teamName);
            
            // 호버 시 더 크게 확대
            gsap.to(hoveredSprite.scale, {
                x: 2.2, y: 0.8, z: 2.2,
                duration: 0.4,
                ease: "power2.out",
            });
            
            // 호버 시 밝기 증가
            gsap.to(hoveredSprite.material, {
                opacity: 1.0,
                duration: 0.4,
                ease: "power2.out",
            });
            
            // 호버 시 색상을 밝게 변경
            if (!hoveredSprite.userData.isHovered) {
                const brightColor = brightenColor(hoveredSprite.userData.originalColor, 1.8);
                updateSpriteColor(hoveredSprite, brightColor);
                hoveredSprite.userData.isHovered = true;
            }
        }
    }
}

// 터치 이동 이벤트
function onTouchMove(event) {
    event.preventDefault();
    
    if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        let intersects = raycaster.intersectObjects(teamSprites);
        // 지구본 앞쪽(카메라에서 보이는 쪽)만 필터링
        intersects = intersects.filter(intersect => {
            const spritePos = intersect.object.position.clone().normalize();
            const cameraDir = camera.position.clone().normalize();
            return spritePos.dot(cameraDir) > 0;
        });
        
        if (intersects.length > 0) {
            if (!isHovering) {
                isHovering = true;
                hoveredSprite = intersects[0].object;
                console.log("터치 호버 시작:", hoveredSprite.userData.teamName);
                
                gsap.to(hoveredSprite.scale, {
                    x: 2.2, y: 0.8, z: 2.2,
                    duration: 0.4,
                    ease: "power2.out",
                });
                
                gsap.to(hoveredSprite.material, {
                    opacity: 1.0,
                    duration: 0.4,
                    ease: "power2.out",
                });
                
                // 호버 시 색상을 밝게 변경
                if (!hoveredSprite.userData.isHovered) {
                    const brightColor = brightenColor(hoveredSprite.userData.originalColor, 1.8);
                    updateSpriteColor(hoveredSprite, brightColor);
                    hoveredSprite.userData.isHovered = true;
                }
            }
        } else {
            if (isHovering) {
                isHovering = false;
                console.log("터치 호버 종료:", hoveredSprite.userData.teamName);
                
                if (hoveredSprite) {
                    gsap.to(hoveredSprite.scale, {
                        x: 2.0, y: 0.8, z: 2.0, // 새로운 기본 크기로 수정
                        duration: 0.4,
                        ease: "power2.out",
                    });
                    
                    gsap.to(hoveredSprite.material, {
                        opacity: 0.8,
                        duration: 0.4,
                        ease: "power2.out",
                    });
                    
                    // 원래 색상으로 복원
                    if (hoveredSprite.userData.isHovered) {
                        updateSpriteColor(hoveredSprite, hoveredSprite.userData.originalColor);
                        hoveredSprite.userData.isHovered = false;
                    }
                    
                    hoveredSprite = null;
                }
            }
        }
    }
}

// 터치 종료 이벤트
function onTouchEnd(event) {
    event.preventDefault();
    
    if (isHovering && hoveredSprite) {
        console.log("터치 클릭됨:", hoveredSprite.userData.teamName);
        const teamData = hoveredSprite.userData;
        showTeamCard(teamData.teamName, teamData.description);
        
        // 터치 후 호버 상태 초기화
        isHovering = false;
        hoveredSprite = null;
    }
}

// 팀 카드 표시 함수
function showTeamCard(teamName, description) {
    const teamTitle = document.getElementById("teamTitle");
    const teamDescription = document.getElementById("teamDescription");
    const clickGuide = document.getElementById("clickGuide");

    // 현재 팀 인덱스 설정
    currentTeamIndex = teams.findIndex((team) => team === teamName);
    
    teamTitle.className = "";
    if (currentTeamIndex !== -1) {
        teamTitle.classList.add(`team-${currentTeamIndex}`);
        // 팀별 색상 적용
        teamTitle.style.color = teamColors[currentTeamIndex];
    }

    teamTitle.textContent = teamName;
    teamDescription.textContent = description;
    document.getElementById("teamCard").classList.add("show");
    
    // 안내 메시지 숨김
    if (clickGuide) {
        clickGuide.style.opacity = "0";
        clickGuide.style.transform = "translate(-50%, -50%) scale(0.8)";
    }
    // 오버레이 표시 및 pointerEvents 활성화
    const blocker = document.getElementById("blocker");
    if (blocker) {
        blocker.style.display = "block";
        blocker.style.pointerEvents = "auto";
    }

    // Glow 애니메이션
    if (earthGlow && currentTeamIndex !== -1) {
        const color = new THREE.Color(teamColors[currentTeamIndex]);
        earthGlow.material.color.copy(color);
        gsap.to(earthGlow.material, {
            opacity: 0.45,
            duration: 0.7,
            ease: "power2.out"
        });
    }
}

// 팀 변경 함수
function changeTeam(direction) {
    if (currentTeamIndex === -1) return;
    
    // 새로운 팀 인덱스 계산
    let newIndex = currentTeamIndex + direction;
    
    // 순환 처리
    if (newIndex < 0) {
        newIndex = teams.length - 1;
    } else if (newIndex >= teams.length) {
        newIndex = 0;
    }
    
    currentTeamIndex = newIndex;
    
    // 팀 정보 업데이트
    const teamTitle = document.getElementById("teamTitle");
    const teamDescription = document.getElementById("teamDescription");
    
    teamTitle.className = "";
    teamTitle.classList.add(`team-${currentTeamIndex}`);
    teamTitle.style.color = teamColors[currentTeamIndex];
    teamTitle.textContent = teams[currentTeamIndex];
    teamDescription.textContent = teamDescriptions[currentTeamIndex];
    
    // 부드러운 전환 효과
    const teamCard = document.getElementById("teamCard");
    teamCard.style.transform = "translate(-50%, -50%) scale(0.95)";
    setTimeout(() => {
        teamCard.style.transform = "translate(-50%, -50%) scale(1)";
    }, 150);

    // Glow 애니메이션 (팀 변경 시)
    if (earthGlow && currentTeamIndex !== -1) {
        const color = new THREE.Color(teamColors[currentTeamIndex]);
        earthGlow.material.color.copy(color);
        gsap.to(earthGlow.material, {
            opacity: 0.45,
            duration: 0.7,
            ease: "power2.out"
        });
    }
}

// 팀 카드 닫기 함수
function closeTeamCard() {
    document.getElementById("teamCard").classList.remove("show");
    const clickGuide = document.getElementById("clickGuide");
    
    // 안내 메시지 다시 표시
    if (clickGuide) {
        clickGuide.style.opacity = "0.7";
        clickGuide.style.transform = "translate(-50%, -50%) scale(1)";
    }
    // 오버레이 숨김 및 pointerEvents 비활성화
    const blocker = document.getElementById("blocker");
    if (blocker) {
        blocker.style.display = "none";
        blocker.style.pointerEvents = "none";
    }

    // Glow 사라지게
    if (earthGlow) {
        gsap.to(earthGlow.material, {
            opacity: 0.0,
            duration: 0.7,
            ease: "power2.in"
        });
    }
}

// 전역 함수로 등록
window.closeTeamCard = closeTeamCard;
window.changeTeam = changeTeam;

// 페이지 로드 완료 후 초기화 시작
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로딩 완료, Three.js 라이브러리 로딩 대기 중...');
    
    // Three.js 라이브러리 로딩 확인 후 초기화
    function checkAndInit() {
        if (typeof THREE !== 'undefined' && THREE.LoadingManager) {
            console.log('Three.js 라이브러리 로딩 완료, 애플리케이션 초기화 시작');
            init();
        } else {
            console.log('Three.js 라이브러리 로딩 대기 중...');
            setTimeout(checkAndInit, 100);
        }
    }
    
    // 초기 확인 시작
    checkAndInit();
});