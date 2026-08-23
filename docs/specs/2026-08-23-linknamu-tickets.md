# 링크나무 티켓 분해

출처 설계 문서: `docs/specs/2026-08-23-linknamu-design.md`
작성일: 2026-08-23
범위: MVP (본인 전용 Link-in-Bio, 회원가입 없음)

## 전제

- 현재 저장소에는 문서(`CLAUDE.md`, `PRD.md`, `wireframe.png`, 설계 스펙)만 있고 Next.js 프로젝트는 아직 스캐폴딩되지 않았다.
- git 저장소는 초기화되어 있으며 위 문서들은 커밋된 상태다.
- 자동화 테스트 스위트는 MVP 범위에서 제외한다. 각 티켓의 AC는 브라우저 수동 검증 + `build-test` / `code-reviewer` 실행으로 확인한다.
- 티켓 하나당 커밋 하나.

## 티켓 요약

| ID | 제목 | 우선순위 | 의존 |
|----|------|----------|------|
| T1 | Next.js 16 프로젝트 스캐폴딩 (TypeScript + Tailwind, App Router) | 높음 | 없음 |
| T2 | 정적 설정 파일 `src/config/links.ts` 및 타입 정의 | 높음 | T1 |
| T3 | 프로필 페이지 `/` 레이아웃 (사진·이름·소개) | 높음 | T1, T2 |
| T4 | LinkCard 컴포넌트 및 링크 목록 렌더링 | 높음 | T2, T3 |
| T5 | MongoDB 연결 유틸 (`src/lib/mongodb.ts`) | 높음 | T1 |
| T6 | 리다이렉트 라우트 핸들러 `/r/[linkId]` + 클릭 집계 | 높음 | T2, T4, T5 |
| T7 | `/stats` 비밀번호 인증 (서버 액션 + httpOnly 쿠키) | 중간 | T1 |
| T8 | `/stats` 클릭 수 목록 표시 | 중간 | T2, T5, T6, T7 |
| T9 | 모바일 우선 반응형 마감 및 메타데이터 | 중간 | T3, T4 |
| T10 | Vercel 배포 및 환경 변수 설정 | 낮음 | T1~T9 |

---

## T1. Next.js 16 프로젝트 스캐폴딩 (TypeScript + Tailwind, App Router)

- **우선순위**: 높음
- **의존**: 없음 (첫 티켓)
- **목표**: 이후 모든 작업의 기반이 되는 Next.js 16 App Router 프로젝트를 현재 디렉터리에 생성한다. 기존 문서 파일(`CLAUDE.md`, `PRD.md`, `wireframe.png`, `docs/`)과 git 히스토리는 보존한다.
- **작업 범위**
  - Next.js 16 App Router + TypeScript + Tailwind CSS 스캐폴딩
  - 소스 디렉터리는 `src/` 사용 (`src/app/`, `src/components/`, `src/config/`, `src/lib/`)
  - `.gitignore`에 `.env.local`, `node_modules`, `.next` 포함 확인
  - `.env.local.example` 생성: `MONGODB_URI`, `STATS_PASSWORD` 키만 (값 없음)
  - 기본 랜딩 마크업은 최소한으로 정리 (T3에서 교체됨)
- **완료 조건 (AC)**
  1. `npm run dev` 실행 시 에러 없이 개발 서버가 뜨고 `/`가 렌더링된다.
  2. `npm run build`가 성공한다.
  3. TypeScript strict 모드가 켜져 있고 타입 에러가 없다.
  4. Tailwind 유틸리티 클래스가 실제로 적용된다(임의 클래스로 육안 확인).
  5. `git status`에 `.env.local`, `node_modules`, `.next`가 나타나지 않는다.
  6. 기존 문서 파일과 git 히스토리가 그대로 남아 있다.
- **비고**: 프로젝트 생성 도구가 빈 디렉터리를 요구하면 임시 디렉터리에 생성 후 파일을 옮기는 방식으로 처리한다.

## T2. 정적 설정 파일 `src/config/links.ts` 및 타입 정의

- **우선순위**: 높음
- **의존**: T1
- **목표**: 프로필 정보와 링크 목록을 코드에 하드코딩하고, 앱 전역에서 쓸 타입을 정의한다. DB를 쓰지 않는다.
- **작업 범위**
  - `Profile` 타입: `{ name: string; bio: string; avatarPath: string }`
  - `LinkItem` 타입: `{ id: string; label: string; url: string }`
  - `profile`, `links` export
  - `id`로 항목을 찾는 헬퍼(예: `findLinkById`) 제공 — T6에서 사용
  - `public/`에 플레이스홀더 프로필 이미지 배치
- **완료 조건 (AC)**
  1. `src/config/links.ts`가 `profile`, `links`를 타입과 함께 export한다.
  2. 링크 항목이 최소 3개 이상 샘플로 들어 있다(SNS/블로그/Notion 등).
  3. `links`의 `id`가 중복되지 않는다.
  4. `findLinkById`가 없는 id에 대해 `undefined`를 반환한다.
  5. `npm run build` 통과.

## T3. 프로필 페이지 `/` 레이아웃 (사진·이름·소개)

- **우선순위**: 높음
- **의존**: T1, T2
- **목표**: `wireframe.png` 기준으로 프로필 영역(원형 사진, 이름, 한 줄 소개)을 렌더링한다.
- **작업 범위**
  - `src/app/page.tsx`에서 `profile` 사용
  - `ProfileHeader` 컴포넌트를 `src/components/`에 작성
  - 원형 프로필 이미지는 `next/image` 사용, 가운데 정렬
- **완료 조건 (AC)**
  1. `/`에 원형 프로필 사진, 이름, 한 줄 소개가 와이어프레임 배치대로 표시된다.
  2. 이미지가 원형으로 잘려 렌더링되고 비율이 깨지지 않는다.
  3. 375px 폭에서 요소가 잘리거나 넘치지 않는다.
  4. 콘솔에 이미지 관련 경고/에러가 없다.

## T4. LinkCard 컴포넌트 및 링크 목록 렌더링

- **우선순위**: 높음
- **의존**: T2, T3
- **목표**: 링크 카드 목록을 프로필 아래에 렌더링하고, 각 카드가 `/r/[linkId]`로 연결되게 한다.
- **작업 범위**
  - `src/components/LinkCard.tsx` 작성 (label 표시, `href={/r/${id}}`)
  - `src/app/page.tsx`에서 `links.map`으로 목록 렌더링
  - 호버/포커스 시각 피드백, 키보드 포커스 링 유지
- **완료 조건 (AC)**
  1. `links`의 모든 항목이 카드로 표시된다.
  2. 각 카드의 `href`가 `/r/{id}` 형식이다 (아직 라우트가 없어 404여도 이 티켓에서는 정상).
  3. 키보드 Tab으로 모든 카드에 접근 가능하고 포커스가 시각적으로 보인다.
  4. 375px / 1280px 양쪽에서 레이아웃이 깨지지 않는다.

## T5. MongoDB 연결 유틸 (`src/lib/mongodb.ts`)

- **우선순위**: 높음
- **의존**: T1
- **목표**: 서버리스 환경에서 커넥션을 재사용하는 MongoDB 클라이언트 유틸을 만든다. 이 티켓 자체는 UI 변경 없음.
- **작업 범위**
  - `MONGODB_URI` 기반 클라이언트, 개발 환경 HMR 대비 전역 캐싱
  - `clicks` 컬렉션 접근 헬퍼
  - 클릭 증가(`incrementClick`)와 전체 조회(`getAllClickCounts`) 함수 — 둘 다 실패 시 예외를 밖으로 던지지 않고 로그 후 안전한 기본값 반환
  - `MONGODB_URI` 미설정 시 명확한 처리(빌드 타임 크래시 금지)
- **완료 조건 (AC)**
  1. `incrementClick(linkId)`가 `{ linkId, count }` 문서를 upsert로 +1 한다.
  2. `getAllClickCounts()`가 `Record<string, number>` 형태로 반환한다.
  3. 잘못된 `MONGODB_URI`거나 연결 실패 시 두 함수 모두 예외를 던지지 않고 로그만 남긴다(`incrementClick`은 조용히 실패, `getAllClickCounts`는 빈 값 반환).
  4. `MONGODB_URI`가 없어도 `npm run build`가 성공한다.

## T6. 리다이렉트 라우트 핸들러 `/r/[linkId]` + 클릭 집계

- **우선순위**: 높음
- **의존**: T2, T4, T5
- **목표**: 클릭을 집계한 뒤 실제 URL로 302 리다이렉트한다. 집계 실패가 리다이렉트 실패로 이어지지 않게 한다.
- **작업 범위**
  - `src/app/r/[linkId]/route.ts` GET 핸들러
  - `findLinkById`로 대상 확인 → 없으면 `/`로 리다이렉트
  - `incrementClick` 호출 (실패해도 진행)
  - 대상 URL로 302 리다이렉트, 캐시 방지 헤더 설정
- **완료 조건 (AC)**
  1. 유효한 linkId 요청 시 302로 해당 `url`에 도달한다.
  2. 요청 후 MongoDB `clicks` 컬렉션의 해당 `count`가 1 증가한다(Atlas에서 육안 확인).
  3. 존재하지 않는 linkId는 `/`로 리다이렉트된다(500/404 아님).
  4. `MONGODB_URI`를 잘못된 값으로 바꿔도 리다이렉트는 정상 동작하고 서버 로그에만 에러가 남는다.
  5. 같은 카드를 여러 번 클릭하면 count가 클릭 횟수만큼 증가한다(브라우저 캐시로 인한 누락 없음).

## T7. `/stats` 비밀번호 인증 (서버 액션 + httpOnly 쿠키)

- **우선순위**: 중간
- **의존**: T1
- **목표**: `/stats`를 단순 비밀번호로 보호한다. 세션 저장소 없이 httpOnly 플래그 쿠키만 사용한다.
- **작업 범위**
  - `src/app/stats/page.tsx` — 쿠키 미인증 시 비밀번호 폼 표시
  - 서버 액션에서 `STATS_PASSWORD`와 비교, 일치 시 httpOnly 쿠키 설정 (`secure` in production, `sameSite: lax`, 만료 지정)
  - 불일치 시 에러 메시지와 함께 폼 재표시
  - 로그아웃(쿠키 삭제) 액션
- **완료 조건 (AC)**
  1. 쿠키 없이 `/stats` 접근 시 비밀번호 폼만 보이고 클릭 수 데이터는 응답 HTML에 포함되지 않는다.
  2. 올바른 비밀번호 입력 시 인증 상태로 전환된다.
  3. 틀린 비밀번호는 에러 메시지와 함께 폼이 다시 보이고, 쿠키가 발급되지 않는다.
  4. 발급된 쿠키가 httpOnly이다(브라우저 `document.cookie`에서 안 보임).
  5. 비밀번호 값이 클라이언트 번들이나 응답에 노출되지 않는다.
  6. `STATS_PASSWORD` 미설정 시 인증이 항상 실패한다(빈 문자열로 통과되지 않음).

## T8. `/stats` 클릭 수 목록 표시

- **우선순위**: 중간
- **의존**: T2, T5, T6, T7
- **목표**: 인증된 상태에서 링크별 클릭 수를 표로 보여준다.
- **작업 범위**
  - `getAllClickCounts()` 결과를 `links` 순서로 매핑
  - 기록 없는 링크는 0으로 표시
  - 총 클릭 수 합계 표시
  - 서버 렌더 시 캐시 비활성화(항상 최신값)
- **완료 조건 (AC)**
  1. 인증 후 `links`의 모든 항목이 label과 클릭 수와 함께 표시된다.
  2. 클릭 기록이 없는 링크는 0으로 나온다.
  3. `/r/[linkId]` 클릭 후 `/stats`를 새로고침하면 증가한 값이 반영된다.
  4. MongoDB 연결 실패 시 페이지가 크래시하지 않고 안내 메시지를 보여준다.
  5. 모바일 폭에서 표가 가로로 넘치지 않는다.

## T9. 모바일 우선 반응형 마감 및 메타데이터

- **우선순위**: 중간
- **의존**: T3, T4
- **목표**: 공유용 서비스인 만큼 모바일 표시와 링크 미리보기를 다듬는다.
- **작업 범위**
  - 375 / 768 / 1280px 폭 점검 및 최대 폭 컨테이너 정리
  - `metadata`: title, description, Open Graph(이미지 포함)
  - favicon 설정
- **완료 조건 (AC)**
  1. 세 가지 폭에서 가로 스크롤이 발생하지 않는다.
  2. `/`의 `<title>`과 description이 프로필 정보를 반영한다.
  3. OG 태그가 렌더된 HTML에 포함된다.
  4. `npm run build` 통과, 콘솔 경고 없음.

## T10. Vercel 배포 및 환경 변수 설정

- **우선순위**: 낮음
- **의존**: T1~T9
- **목표**: 실제 URL로 공유 가능한 상태로 배포한다.
- **작업 범위**
  - Vercel 프로젝트 연결
  - `MONGODB_URI`, `STATS_PASSWORD` 환경 변수 등록
  - MongoDB Atlas 네트워크 접근 허용 설정 확인
- **완료 조건 (AC)**
  1. 배포 URL에서 `/`가 정상 렌더링된다.
  2. 배포 환경에서 링크 클릭 시 리다이렉트가 동작하고 Atlas의 count가 증가한다.
  3. 배포 환경 `/stats`에서 비밀번호 인증과 클릭 수 표시가 동작한다.
  4. `.env.local`이 저장소에 커밋되어 있지 않다.

---

## 검증 및 리뷰 규칙

- 각 티켓 구현 완료 후 `build-test`(실행 검증)와 `code-reviewer`(정적 리뷰)를 병렬로 실행한다.
- T7은 인증 로직을 다루므로 완료 후 `/security-review`를 추가로 실행한다.
- T6은 외부 입력(`linkId`)을 처리하므로 리다이렉트 대상이 설정 파일에 있는 URL로만 한정되는지 리뷰에서 확인한다(오픈 리다이렉트 방지).
