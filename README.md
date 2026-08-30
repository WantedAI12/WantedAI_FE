# Perfumery AI Core Frontend

향 개발 프로젝트의 요청, 후보 조향식, 원료, 안전·규제 검토를 관리하는 React 기반 R&D 워크스페이스입니다.

## 시작하기

```bash
npm install
cp .env.example .env.local
npm run dev
```

기본 주소는 `http://localhost:3000`이며 백엔드 기본 주소는 `http://localhost:8080`입니다.

## 주요 구조

- `app`: 페이지와 라우트
- `components/layout`: 공통 CMS 셸
- `components/dashboard`: 대시보드 기능 영역
- `components/common`: 공통 화면 패턴
- `components/ui`: 재사용 UI 기본 요소
- `lib/api`: API 클라이언트와 엔드포인트
- `types`: 백엔드 도메인 기반 공통 타입

백엔드에 실제 컨트롤러와 OpenAPI 명세가 추가되면 `lib/api`와 `types`를 명세 기준으로 교체하면 됩니다.
