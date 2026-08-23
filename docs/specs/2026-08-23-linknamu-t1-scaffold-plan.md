# T1: Next.js 프로젝트 스캐폴딩 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 현재 디렉터리(`/Users/hss_mac/클로드_project/linknamu`)에 Next.js 16 App Router + TypeScript + Tailwind CSS 프로젝트를 생성하되, 기존 문서 파일(`CLAUDE.md`, `PRD.md`, `wireframe.png`, `docs/`)과 git 히스토리를 보존한다.

**Architecture:** `create-next-app`은 빈 디렉터리를 요구하므로, 임시 디렉터리에 프로젝트를 생성한 뒤 생성된 파일만 저장소 루트로 이동시킨다. `.git`, 기존 문서, `.gitignore`는 건드리지 않는다.

**Tech Stack:** Next.js 16 (App Router), TypeScript (strict), Tailwind CSS, ESLint, `src/` 디렉터리 구조.

## Global Constraints

- 소스 디렉터리는 `src/` 를 사용한다 (`src/app/`, 이후 티켓에서 `src/components/`, `src/config/`, `src/lib/` 추가).
- TypeScript strict 모드가 켜져 있어야 한다.
- 기존 문서 파일과 git 히스토리는 절대 삭제/덮어쓰지 않는다.
- `.env.local`, `node_modules`, `.next`는 `.gitignore`에 포함되어야 하며 git에 잡히면 안 된다.
- `.env.local.example`에는 `MONGODB_URI`, `STATS_PASSWORD` 키만 두고 값은 비워둔다.
- 이 티켓은 스캐폴딩만 다룬다 — 랜딩 페이지 마크업은 최소한으로 두고 (T3에서 교체됨) 자동화 테스트는 만들지 않는다(프로젝트 스펙상 MVP 범위 제외, 검증은 `npm run dev` / `npm run build` 및 육안 확인으로 한다).

---

### Task 1: create-next-app으로 임시 디렉터리에 프로젝트 생성

**Files:**
- Create (임시 위치): `/tmp/linknamu-scaffold-tmp/*` (레포 밖, 최종적으로 옮기고 삭제)

**Interfaces:**
- Consumes: 없음 (첫 작업)
- Produces: `package.json`, `tsconfig.json`, `next.config.ts`, `.eslintrc`/`eslint.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `postcss.config.mjs`, `public/` — 이후 Task 2에서 저장소 루트로 이동시켜 사용.

- [ ] **Step 1: 임시 디렉터리에 Next.js 프로젝트 생성**

레포 디렉터리 자체는 이미 파일이 있어 `create-next-app`이 거부하므로, 별도 임시 디렉터리에 생성한다.

Run:
```bash
npx --yes create-next-app@latest /tmp/linknamu-scaffold-tmp \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-npm --no-turbopack
```

- [ ] **Step 2: 생성 결과 확인**

Run: `ls -la /tmp/linknamu-scaffold-tmp`

Expected: `package.json`, `tsconfig.json`, `src/app/`, `public/`, `.gitignore`, `next.config.ts` 등이 보인다.

- [ ] **Step 3: 임시 디렉터리 안에 불필요한 `.git` 제거**

`create-next-app`은 임시 디렉터리 안에서 자체 git 저장소를 초기화한다. 레포의 기존 `.git`과 충돌하지 않도록 제거한다.

Run: `rm -rf /tmp/linknamu-scaffold-tmp/.git`

Expected: 명령이 에러 없이 완료된다.

---

### Task 2: 생성된 파일을 저장소 루트로 이동하고 기존 파일과 병합

**Files:**
- Modify: `/Users/hss_mac/클로드_project/linknamu/.gitignore` (create-next-app이 만든 `.gitignore`와 기존 `.gitignore`를 병합)
- Move: `/tmp/linknamu-scaffold-tmp/*` (숨김 파일 포함, `.git` 제외) → `/Users/hss_mac/클로드_project/linknamu/`

**Interfaces:**
- Consumes: Task 1에서 생성된 임시 디렉터리 내용
- Produces: 저장소 루트에 배치된 Next.js 프로젝트 파일 전체 — Task 3, 4에서 사용

- [ ] **Step 1: 기존 `.gitignore` 내용 백업 확인**

Run: `cat /Users/hss_mac/클로드_project/linknamu/.gitignore`

Expected: `.DS_Store` 한 줄이 보인다 (이전 커밋에서 추가한 내용).

- [ ] **Step 2: create-next-app이 생성한 `.gitignore` 내용 확인**

Run: `cat /tmp/linknamu-scaffold-tmp/.gitignore`

Expected: `node_modules`, `.next`, `.env*.local` 등이 포함된 표준 Next.js `.gitignore`가 보인다.

- [ ] **Step 3: 임시 디렉터리의 파일을 저장소 루트로 이동 (숨김 파일 포함, `.gitignore`는 제외하고 이동)**

`.gitignore`는 병합이 필요하므로 별도 처리한다. 나머지는 그대로 옮긴다.

Run:
```bash
cd /tmp/linknamu-scaffold-tmp
rm .gitignore
shopt -s dotglob
mv * /Users/hss_mac/클로드_project/linknamu/
shopt -u dotglob
cd /Users/hss_mac/클로드_project/linknamu
rmdir /tmp/linknamu-scaffold-tmp 2>/dev/null || true
```

Expected: 에러 없이 완료되고, `ls /Users/hss_mac/클로드_project/linknamu`에 `package.json`, `src/`, `public/`, 기존 `CLAUDE.md`/`PRD.md`/`wireframe.png`/`docs/`가 모두 보인다.

- [ ] **Step 4: `.gitignore`에 Next.js 표준 항목 추가 (기존 `.DS_Store` 유지)**

`/Users/hss_mac/클로드_project/linknamu/.gitignore` 파일을 열어 다음 내용으로 교체한다 (기존 `.DS_Store` 유지 + Next.js 표준 항목 추가):

```gitignore
# OS
.DS_Store

# dependencies
/node_modules

# next.js
/.next/
/out/

# production
/build

# misc
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 5: 저장소 루트 파일 목록 확인**

Run: `ls -la /Users/hss_mac/클로드_project/linknamu`

Expected: `.git`, `.gitignore`, `CLAUDE.md`, `PRD.md`, `wireframe.png`, `docs/`, `package.json`, `src/`, `public/`, `tsconfig.json`이 모두 존재한다.

---

### Task 3: `.env.local.example` 추가 및 TypeScript strict 모드 확인

**Files:**
- Create: `src/env.d.ts` (생성하지 않음 — 생략, `next-env.d.ts`는 자동 생성됨)
- Create: `.env.local.example`
- Modify: `tsconfig.json` (strict 확인, 필요 시 추가)

**Interfaces:**
- Consumes: Task 2에서 배치된 `tsconfig.json`
- Produces: `.env.local.example` (T5, T7에서 참조하는 환경 변수 키 목록), strict TypeScript 설정

- [ ] **Step 1: `tsconfig.json`에서 strict 모드 확인**

Run: `cat /Users/hss_mac/클로드_project/linknamu/tsconfig.json`

Expected: `"compilerOptions"` 안에 `"strict": true`가 이미 존재한다 (create-next-app 기본값). 없다면 다음 Step에서 추가한다.

- [ ] **Step 2 (조건부): `strict`가 없다면 추가**

`tsconfig.json`의 `compilerOptions`에 `"strict": true`를 추가한다. (Step 1에서 이미 확인됐다면 이 단계는 스킵)

- [ ] **Step 3: `.env.local.example` 생성**

`/Users/hss_mac/클로드_project/linknamu/.env.local.example` 파일을 다음 내용으로 생성한다:

```
MONGODB_URI=
STATS_PASSWORD=
```

- [ ] **Step 4: 의존성 설치 확인**

Run: `cd /Users/hss_mac/클로드_project/linknamu && npm install`

Expected: 에러 없이 완료된다 (이동 과정에서 `node_modules`는 옮기지 않았으므로 재설치 필요 — Step 3에서 `mv *`로 `node_modules`도 옮겨졌다면 이 스텝은 최신 상태 확인용으로 빠르게 끝난다).

---

### Task 4: 개발 서버 / 빌드 검증 및 커밋

**Files:**
- 변경 없음 (검증 전용 태스크)

**Interfaces:**
- Consumes: Task 1~3에서 완성된 프로젝트
- Produces: 없음 (최종 커밋)

- [ ] **Step 1: 개발 서버 기동 확인**

Run:
```bash
cd /Users/hss_mac/클로드_project/linknamu
timeout 15 npm run dev &
sleep 5
curl -sSf http://localhost:3000 > /dev/null && echo "OK" || echo "FAIL"
kill %1 2>/dev/null || true
```

Expected: `OK` 출력. (포트가 3000이 아니면 `npm run dev` 출력에서 실제 포트를 확인해 재시도)

- [ ] **Step 2: 프로덕션 빌드 확인**

Run: `cd /Users/hss_mac/클로드_project/linknamu && npm run build`

Expected: 에러 없이 `Compiled successfully` 로 종료된다.

- [ ] **Step 3: TypeScript 타입 체크**

Run: `cd /Users/hss_mac/클로드_project/linknamu && npx tsc --noEmit`

Expected: 에러 없이 종료된다 (`npm run build`가 이미 타입 체크를 포함하지만 명시적으로 재확인).

- [ ] **Step 4: git 상태 확인 — 민감 파일 미포함 확인**

Run: `cd /Users/hss_mac/클로드_project/linknamu && git status`

Expected: `node_modules`, `.next`, `.env.local`이 untracked/ignored 목록에 나타나지 않는다 (즉 `.gitignore`가 정상 작동). `package.json`, `src/`, `public/`, `.gitignore`, `.env.local.example`, `tsconfig.json` 등은 새 파일로 나타난다.

- [ ] **Step 5: 기존 문서/히스토리 보존 확인**

Run: `cd /Users/hss_mac/클로드_project/linknamu && git log --oneline && ls CLAUDE.md PRD.md wireframe.png docs/specs/`

Expected: 이전 커밋 2개(`Add PRD, wireframe, and design spec...`, `Add ticket breakdown...`)가 그대로 보이고, 문서 파일들이 모두 존재한다.

- [ ] **Step 6: 스캐폴딩 커밋**

Run:
```bash
cd /Users/hss_mac/클로드_project/linknamu
git add package.json package-lock.json tsconfig.json next.config.ts \
  eslint.config.mjs postcss.config.mjs .gitignore .env.local.example \
  src public
git status
```

Expected: 위 파일들이 staged로 표시되고 `node_modules`, `.next`, `.env.local`은 없다. (실제 파일명은 create-next-app 버전에 따라 `next.config.ts` 대신 `next.config.mjs`일 수 있으니 `git status` 결과를 보고 실제 파일명으로 조정)

- [ ] **Step 7: 커밋 실행**

Run:
```bash
cd /Users/hss_mac/클로드_project/linknamu
git commit -m "$(cat <<'EOF'
Scaffold Next.js 16 project (TypeScript + Tailwind, App Router)

Sets up the base project structure under src/ so subsequent tickets
can build the profile page, redirect route, and stats page on top of
it. Existing docs and git history are preserved.
EOF
)"
```

Expected: 커밋이 성공하고 `git log --oneline`에 새 커밋이 추가된다.

---

## Self-Review Notes

- **T1 AC 커버리지 확인**:
  1. `npm run dev` 동작 → Task 4 Step 1
  2. `npm run build` 성공 → Task 4 Step 2
  3. TypeScript strict → Task 3 Step 1-2, Task 4 Step 3
  4. Tailwind 적용 육안 확인 → create-next-app 기본 템플릿에 Tailwind 클래스가 포함되어 있음 (Task 4 Step 1에서 페이지 렌더링 확인으로 간접 검증, 필요 시 브라우저로 직접 확인)
  5. `.env.local`/`node_modules`/`.next`가 git status에 안 잡힘 → Task 4 Step 4
  6. 기존 문서/히스토리 보존 → Task 4 Step 5
- 자동화 테스트는 프로젝트 스펙(설계 문서 "테스트/검증 범위")에 따라 MVP 범위에서 제외했고, 대신 `npm run dev`/`npm run build`/`git status` 확인으로 대체했다.
