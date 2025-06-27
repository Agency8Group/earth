// Three.js 지구본 애플리케이션
let scene, camera, renderer, earthGlobe;
let rotationSpeed = 0.005;

// 텍스트 스프라이트 관련 변수
let letterSprites = [];
let teamSprites = [];
let textAngle = 0;
const orbitRadius = 2.8;

// 마우스 인터랙션 관련 변수
let raycaster, mouse;
let isHovering = false;
let hoveredSprite = null;

// 팀 정보 설정
const teams = [
    "경영관리실", "전략기획실", "압타밀 팀", "드리미 팀",
    "컨텐츠 팀", "고객지원부", "물류센터", "마케팅팀"
];

const teamColors = [
    "#E34F26", "#1572B6", "#F7DF1E", "#06B6D4",
    "#3776AB", "#4285F4", "#00FF88", "#FF6B6B"
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
    // 씬 생성
    scene = new THREE.Scene();
    
    // 카메라 생성
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 8); // 카메라를 정중앙에서 뒤로 이동
    camera.lookAt(0, 0, 0); // 카메라가 정중앙을 바라보도록 설정
    
    // 렌더러 생성
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000011); // 우주 배경색으로 변경
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);
    
    // 우주 환경 생성
    createSpaceEnvironment();
    
    // 조명 추가 - 우측 위에서 부드러운 햇빛
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6); // 환경광 더 증가
    scene.add(ambientLight);
    
    // 메인 햇빛 (우측 위에서) - 더 강하게
    const sunLight = new THREE.DirectionalLight(0xffd700, 3.0); // 햇빛 강도 대폭 증가
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
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 1.0); // 보조광 강도 증가
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);
    
    // 추가 조명 - 지구본을 더 밝게
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.0); // 림라이트 강화
    rimLight.position.set(0, 0, 15);
    scene.add(rimLight);
    
    // 태양빛 추가 조명 - 지구본을 더 밝게 비추기
    const extraSunLight = new THREE.DirectionalLight(0xffffcc, 1.5); // 따뜻한 태양빛
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
    
    // 애니메이션 루프 시작
    animate();
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
    const starsCount = 4000; // 별 개수 증가
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
        size: 0.08, // 별 크기 증가
        vertexColors: true,
        transparent: true,
        opacity: 0.9, // 투명도 증가로 더 밝게
        map: createStarTexture(), // 원형 별 텍스처 적용
        blending: THREE.AdditiveBlending // 우주 느낌의 블렌딩
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // 큰 밝은 별들 제거 - 더 자연스러운 우주 환경
    
    // 은하수 효과 (먼지 구름) - 더 은은하게
    const nebulaGeometry = new THREE.SphereGeometry(50, 32, 32);
    const nebulaMaterial = new THREE.MeshBasicMaterial({
        color: 0x1a1a3a,
        transparent: true,
        opacity: 0.05, // 투명도 감소
        side: THREE.BackSide
    });
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);
    
    // 먼지 입자들 - 더 은은하게
    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 300; // 먼지 개수 감소
    const dustPositions = new Float32Array(dustCount * 3);
    
    for (let i = 0; i < dustCount * 3; i += 3) {
        dustPositions[i] = (Math.random() - 0.5) * 80;
        dustPositions[i + 1] = (Math.random() - 0.5) * 80;
        dustPositions[i + 2] = (Math.random() - 0.5) * 80;
    }
    
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    
    const dustMaterial = new THREE.PointsMaterial({
        size: 0.03, // 먼지 크기 감소
        color: 0x333355, // 색상 더 어둡게
        transparent: true,
        opacity: 0.2, // 투명도 감소
        map: createStarTexture(), // 먼지도 원형으로
        blending: THREE.AdditiveBlending
    });
    
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);
}

// GLB 파일 로드 함수
function loadEarthGlobe() {
    const loader = new THREE.GLTFLoader();
    
    loader.load(
        'models/earth_globe.glb',
        function (gltf) {
            earthGlobe = gltf.scene;
            
            // 지구본 크기를 더 작게 조정
            earthGlobe.scale.set(0.2, 0.2, 0.2);
            
            // 지구본을 정확히 중앙에 고정 (Y축만 약간 위로)
            earthGlobe.position.set(0, 2, 0); // X, Z축은 0으로 고정
            
            // 지구본에 그림자 설정
            earthGlobe.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            // 지구본을 씬에 추가
            scene.add(earthGlobe);
            
            console.log('지구본 로드 완료!');
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% 로드됨');
        },
        function (error) {
            console.error('지구본 로드 중 오류 발생:', error);
            // 로드 실패 시 기본 구체 생성
            createDefaultGlobe();
        }
    );
}

// 기본 구체 생성 (GLB 로드 실패 시)
function createDefaultGlobe() {
    const geometry = new THREE.SphereGeometry(1.5, 32, 32); // 크기를 더 작게
    const material = new THREE.MeshPhongMaterial({
        color: 0x0077be,
        transparent: true,
        opacity: 0.8
    });
    earthGlobe = new THREE.Mesh(geometry, material);
    earthGlobe.position.set(0, 0, 0); // 정중앙에 고정
    earthGlobe.castShadow = true;
    earthGlobe.receiveShadow = true;
    scene.add(earthGlobe);
    console.log('기본 지구본 생성됨');
}

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);
    
    // 지구본 회전 (Y축만 회전, 위치는 고정)
    if (earthGlobe) {
        earthGlobe.rotation.y += rotationSpeed;
        // 지구본을 정중앙에 고정 유지
        earthGlobe.position.set(0, 2, 0);
    }
    
    // 텍스트와 팀 스프라이트 공전 애니메이션
    textAngle += 0.006;
    
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
        
        // 텍스트 반짝임 효과
        const time = Date.now() * 0.001;
        sprite.material.opacity = 0.7 + Math.sin(time * 2 + index * 0.5) * 0.3;
    });

    // 팀 공전 (더 큰 궤도)
    teamSprites.forEach((sprite, index) => {
        const teamAngle = textAngle * 0.7 + index * ((Math.PI * 2) / teams.length);

        const teamRadius = orbitRadius * 1.2; // 팀 궤도 반지름 감소 (1.5 → 1.2)
        const x = Math.cos(teamAngle) * teamRadius;
        const y = Math.sin(teamAngle * 0.3) * teamRadius * 0.2;
        const z = Math.sin(teamAngle) * teamRadius;

        sprite.position.set(x, y, z);
        sprite.lookAt(camera.position);
        sprite.rotation.z = Math.sin(teamAngle) * 0.05;
        
        // 팀 스프라이트 반짝임 효과
        const time = Date.now() * 0.001;
        sprite.material.opacity = 0.6 + Math.sin(time * 1.5 + index * 0.3) * 0.4;
    });
    
    // 별들 반짝임 효과
    const time = Date.now() * 0.001;
    scene.children.forEach(child => {
        if (child.type === 'Points' && child.material.color.getHex() === 0x333355) {
            // 먼지 입자들은 천천히 회전
            child.rotation.y += 0.0005;
        } else if (child.type === 'Points' && child.material.vertexColors) {
            // 일반 별들 반짝임
            child.material.opacity = 0.7 + Math.sin(time * 1.5) * 0.2;
        }
    });
    
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
            context.font = "900 60px Orbitron"; // 볼드 퓨처리스틱 폰트
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
            });

            return new THREE.Sprite(spriteMaterial);
        };

        const letterSprite = createLetterSprite(letter);
        letterSprite.scale.set(0.6, 0.6, 0.6);
        letterSprites.push(letterSprite);
        scene.add(letterSprite);
    });
}

// 팀 스프라이트 생성 함수
function createTeamSprites() {
    teams.forEach((team, index) => {
        const createTeamSprite = (text) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = 300; // 캔버스 크기 증가
            canvas.height = 80; // 캔버스 높이 증가

            // 팀별 색상을 우주 느낌으로 변환
            const teamColor = teamColors[index];
            const rgb = hexToRgb(teamColor);
            
            // 글로우 효과 추가
            context.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
            context.shadowBlur = 12; // 글로우 효과 증가
            
            // 메인 텍스트
            context.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`;
            context.font = "400 60px Rajdhani"; // 폰트 크기 증가, 굵기 증가
            context.textAlign = "center";
            context.fillText(text, 150, 50); // 위치 조정
            
            // 추가 글로우 레이어
            context.shadowBlur = 6;
            context.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
            context.fillText(text, 150, 50);

            const texture = new THREE.CanvasTexture(canvas);
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.format = THREE.RGBAFormat;
            texture.premultiplyAlpha = false;

            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                alphaTest: 0.05, // 알파 테스트 값 낮춰서 클릭 감도 향상
                blending: THREE.AdditiveBlending, // 우주 느낌의 블렌딩
            });

            return new THREE.Sprite(spriteMaterial);
        };

        const teamSprite = createTeamSprite(team);
        teamSprite.scale.set(1.2, 0.4, 1.2); // 스케일 더 증가
        teamSprite.material.opacity = 0.8; // 기본 투명도 설정
        teamSprite.userData = {
            teamIndex: index,
            teamName: team,
            description: teamDescriptions[index],
        };
        teamSprites.push(teamSprite);
        scene.add(teamSprite);
        
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

// 마우스 인터랙션 설정
function setupMouseInteraction() {
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onMouseClick);
}

// 마우스 이동 이벤트
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(teamSprites);

    if (intersects.length > 0) {
        if (!isHovering) {
            isHovering = true;
            hoveredSprite = intersects[0].object;
            console.log("팀 호버 시작:", hoveredSprite.userData.teamName);
            document.body.style.cursor = "pointer";

            // 호버 시 더 크게 확대
            gsap.to(hoveredSprite.scale, {
                x: 1.8, y: 0.6, z: 1.8, // 호버 시 크기 대폭 증가
                duration: 0.4,
                ease: "power2.out",
            });
            
            // 호버 시 밝기 증가
            gsap.to(hoveredSprite.material, {
                opacity: 1.0,
                duration: 0.4,
                ease: "power2.out",
            });
        }
    } else {
        if (isHovering) {
            isHovering = false;
            console.log("팀 호버 종료:", hoveredSprite.userData.teamName);
            document.body.style.cursor = "default";

            if (hoveredSprite) {
                // 원래 크기로 복원
                gsap.to(hoveredSprite.scale, {
                    x: 1.2, y: 0.4, z: 1.2,
                    duration: 0.4,
                    ease: "power2.out",
                });
                
                // 원래 투명도로 복원
                gsap.to(hoveredSprite.material, {
                    opacity: 0.8,
                    duration: 0.4,
                    ease: "power2.out",
                });
                
                hoveredSprite = null;
            }
        }
    }
}

// 마우스 클릭 이벤트
function onMouseClick(event) {
    console.log("마우스 클릭 감지");
    
    // 클릭 시점에 다시 레이캐스트 수행
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(teamSprites);
    
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

// 팀 카드 표시 함수
function showTeamCard(teamName, description) {
    const teamTitle = document.getElementById("teamTitle");
    const teamDescription = document.getElementById("teamDescription");
    const clickGuide = document.getElementById("clickGuide");

    teamTitle.className = "";
    const teamIndex = teams.findIndex((team) => team === teamName);
    if (teamIndex !== -1) {
        teamTitle.classList.add(`team-${teamIndex}`);
    }

    teamTitle.textContent = teamName;
    teamDescription.textContent = description;
    document.getElementById("teamCard").classList.add("show");
    
    // 안내 메시지 숨김
    if (clickGuide) {
        clickGuide.style.opacity = "0";
        clickGuide.style.transform = "translate(-50%, -50%) scale(0.8)";
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
    
    // 카메라 이동 기능 제거 - 카메라가 고정된 상태로 유지
}

// 전역 함수로 등록
window.closeTeamCard = closeTeamCard;

// 애플리케이션 시작
init(); 