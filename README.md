# Perfumery AI Core Frontend

향 개발 프로젝트의 요청, 후보 조향식, 원료, 안전·규제 검토를 관리하는 React 기반 R&D 워크스페이스입니다.

## 시작하기

```bash
npm install
cp .env.example .env.local
npm run dev
```

기본 주소는 `http://localhost:3000`이며 백엔드 API 기본 주소는 `http://localhost:8080/api/v1`입니다.

## 주요 구조

- `app`: 페이지와 라우트
- `components/layout`: 공통 CMS 셸
- `components/dashboard`: 대시보드 기능 영역
- `components/common`: 공통 화면 패턴
- `components/ui`: 재사용 UI 기본 요소
- `lib/api`: API 클라이언트와 엔드포인트
- `types`: 백엔드 도메인 기반 공통 타입

`lib/api/resources.ts`에 OpenAPI v1의 인증·프로젝트·요청·후보·안전·예측·실험·증거·원료 API가 타입과 함께 연결되어 있습니다. 현재 백엔드 저장소에는 컨트롤러가 없어 실제 응답 검증은 서버 구현 후 진행해야 합니다.
