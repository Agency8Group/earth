# 지구본 (Earth Globe)

간단한 3D 지구본 애플리케이션입니다. Three.js를 사용하여 GLB 파일을 로드하고 자동으로 회전하는 지구본을 표시합니다.

## 기능

-   3D 지구본 자동 회전
-   GLB 파일 로드 지원
-   반응형 디자인
-   부드러운 애니메이션

## 파일 구조

```
earth-globe/
├── index.html          # 메인 HTML 파일
├── script.js           # Three.js 애플리케이션 코드
├── earth_globe.glb     # 3D 지구본 모델 파일
└── README.md           # 프로젝트 설명서
```

## 사용법

1. 모든 파일이 같은 디렉토리에 있는지 확인하세요
2. 웹 서버를 통해 `index.html` 파일을 열어주세요
    - 로컬 파일로 직접 열면 CORS 오류가 발생할 수 있습니다
3. 브라우저에서 지구본이 자동으로 회전하는 것을 확인할 수 있습니다

## 로컬 서버 실행 방법

### Python을 사용하는 경우:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

### Node.js를 사용하는 경우:

```bash
# http-server 설치
npm install -g http-server

# 서버 실행
http-server
```

### VS Code Live Server 확장을 사용하는 경우:

1. VS Code에서 Live Server 확장 설치
2. `index.html` 파일을 우클릭
3. "Open with Live Server" 선택

## 기술 스택

-   **Three.js**: 3D 그래픽 라이브러리
-   **GLTFLoader**: GLB/GLTF 파일 로더
-   **HTML5/CSS3**: 기본 웹 기술
-   **JavaScript**: 프로그래밍 언어

## 커스터마이징

-   `script.js` 파일에서 `rotationSpeed` 값을 조정하여 회전 속도를 변경할 수 있습니다
-   `earthGlobe.scale.set()` 값을 조정하여 지구본 크기를 변경할 수 있습니다
-   조명 설정을 수정하여 다른 조명 효과를 적용할 수 있습니다

## 브라우저 지원

-   Chrome (권장)
-   Firefox
-   Safari
-   Edge

WebGL을 지원하는 모든 최신 브라우저에서 작동합니다.
