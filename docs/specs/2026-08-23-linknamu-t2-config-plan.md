# T2: 정적 설정 파일 `src/config/links.ts` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 프로필 정보(이름/소개/사진)와 링크 목록(id/label/url)을 코드에 하드코딩한 설정 파일과 타입을 만들고, id로 링크를 찾는 헬퍼를 제공한다. DB는 쓰지 않는다.

**Architecture:** `src/config/links.ts` 하나에 타입 정의 + `profile`/`links` 상수 + `findLinkById` 헬퍼를 모두 담는다. 파일이 작고(20~40줄) 책임이 단일하므로 분리하지 않는다. 프로필 이미지는 `public/avatar.svg`에 플레이스홀더로 둔다(실제 사진은 추후 사용자가 교체).

**Tech Stack:** TypeScript (strict), Next.js 16 App Router 프로젝트 내부 모듈. 별도 테스트 프레임워크는 아직 설치되어 있지 않으므로(T1에서 설치 안 함), 이 티켓은 Node 스크립트로 직접 실행 검증한다(단위 테스트 러너 도입은 스코프 밖).

## Global Constraints

- 소스 디렉터리는 `src/` (기존 `src/app/` 옆에 `src/config/` 신설).
- TypeScript strict 모드 유지 (T1에서 이미 켜짐).
- DB를 쓰지 않는다 — 프로필/링크는 전부 코드 상수.
- `links`의 `id`는 중복되면 안 된다.
- 링크 항목은 최소 3개 이상 샘플로 포함한다.
- `npm run build`가 매 태스크 종료 시 통과해야 한다.

---

### Task 1: 타입 정의 및 `profile`/`links` 상수 작성

**Files:**
- Create: `src/config/links.ts`
- Create: `public/avatar.svg` (플레이스홀더 원형 아바타 이미지)

**Interfaces:**
- Consumes: 없음
- Produces:
  - `interface Profile { name: string; bio: string; avatarPath: string }`
  - `interface LinkItem { id: string; label: string; url: string }`
  - `export const profile: Profile`
  - `export const links: LinkItem[]`
  - 이후 Task 2에서 `findLinkById(id: string): LinkItem | undefined` 추가 예정 (이 Task에서는 아직 만들지 않음)

- [ ] **Step 1: 플레이스홀더 아바타 이미지 생성**

`public/avatar.svg` 를 다음 내용으로 생성한다 (단순 회색 원):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="100" fill="#94a3b8" />
  <circle cx="100" cy="80" r="36" fill="#f1f5f9" />
  <path d="M40 176c8-40 40-60 60-60s52 20 60 60" fill="#f1f5f9" />
</svg>
```

- [ ] **Step 2: `src/config/links.ts` 작성**

```typescript
export interface Profile {
  name: string;
  bio: string;
  avatarPath: string;
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
}

export const profile: Profile = {
  name: "HSS",
  bio: "유능한 바이브코더 꿈나무",
  avatarPath: "/avatar.svg",
};

export const links: LinkItem[] = [
  { id: "blog", label: "블로그", url: "https://example.com/blog" },
  { id: "github", label: "GitHub", url: "https://github.com/example" },
  { id: "notion", label: "Notion 포트폴리오", url: "https://notion.so/example" },
  { id: "instagram", label: "Instagram", url: "https://instagram.com/example" },
];
```

- [ ] **Step 3: 타입 체크로 검증**

Run: `cd /Users/hss_mac/클로드_project/linknamu && npx tsc --noEmit`

Expected: 에러 없이 종료된다.

- [ ] **Step 4: 커밋**

```bash
cd /Users/hss_mac/클로드_project/linknamu
git add src/config/links.ts public/avatar.svg
git commit -m "$(cat <<'EOF'
Add profile and links config with types

Hardcodes profile info and the link list as the single source of
truth for the profile page, per the no-DB design for this data.
EOF
)"
```

---

### Task 2: `findLinkById` 헬퍼 추가 및 검증 스크립트로 AC 확인

**Files:**
- Modify: `src/config/links.ts`
- Create: `scripts/verify-links-config.mjs` (검증 후 삭제하는 일회성 스크립트 — 커밋에는 포함하지 않음)

**Interfaces:**
- Consumes: Task 1의 `LinkItem`, `links`
- Produces: `export function findLinkById(id: string): LinkItem | undefined` — T6(`/r/[linkId]` 라우트)에서 사용

- [ ] **Step 1: `findLinkById` 함수 추가**

`src/config/links.ts` 파일 끝에 다음을 추가한다:

```typescript
export function findLinkById(id: string): LinkItem | undefined {
  return links.find((link) => link.id === id);
}
```

- [ ] **Step 2: 검증 스크립트 작성 — 존재하는 id 조회**

`scripts/verify-links-config.mjs` 를 다음 내용으로 생성한다 (컴파일된 결과를 직접 import할 수 없으므로 `tsx`나 `ts-node` 없이 확인하기 위해, 이 스크립트는 타입스크립트 소스를 정규식 기반으로 파싱하지 않고 대신 Node로 임시 컴파일하는 방식 대신 **Step 3에서 `npx tsx`로 직접 실행**한다):

```javascript
import { links, findLinkById } from "../src/config/links.ts";

const ids = links.map((l) => l.id);
const uniqueIds = new Set(ids);

if (ids.length < 3) {
  throw new Error(`FAIL: links.length는 3 이상이어야 하는데 ${ids.length}`);
}
if (uniqueIds.size !== ids.length) {
  throw new Error(`FAIL: id 중복 발견 — ${ids.join(", ")}`);
}
if (findLinkById(ids[0])?.id !== ids[0]) {
  throw new Error("FAIL: findLinkById가 존재하는 id를 못 찾음");
}
if (findLinkById("존재하지-않는-id") !== undefined) {
  throw new Error("FAIL: findLinkById가 없는 id에 undefined를 반환하지 않음");
}

console.log("PASS: links 설정 검증 통과");
console.log(`  - 링크 개수: ${ids.length}`);
console.log(`  - id 목록: ${ids.join(", ")}`);
```

- [ ] **Step 3: 검증 스크립트 실행**

Run: `cd /Users/hss_mac/클로드_project/linknamu && npx --yes tsx scripts/verify-links-config.mjs`

Expected: `PASS: links 설정 검증 통과`와 함께 링크 개수(3 이상), id 목록이 출력된다. 에러 발생 시(중복 id, 3개 미만, `findLinkById` 오작동) 위 로직으로 즉시 `FAIL` 메시지와 함께 종료되므로 원인을 보고 `src/config/links.ts`를 수정한다.

- [ ] **Step 4: 검증 스크립트 삭제 (임시 파일이므로 커밋하지 않음)**

Run: `rm -f /Users/hss_mac/클로드_project/linknamu/scripts/verify-links-config.mjs && rmdir /Users/hss_mac/클로드_project/linknamu/scripts 2>/dev/null || true`

Expected: 스크립트 파일과 (비어있다면) `scripts/` 디렉터리가 제거된다.

- [ ] **Step 5: 전체 빌드로 최종 확인**

Run: `cd /Users/hss_mac/클로드_project/linknamu && npm run build`

Expected: `Compiled successfully`.

- [ ] **Step 6: git 상태 확인 — 임시 스크립트가 안 남았는지**

Run: `cd /Users/hss_mac/클로드_project/linknamu && git status`

Expected: `scripts/` 관련 항목이 전혀 보이지 않고, `src/config/links.ts`의 수정사항(findLinkById 추가)만 unstaged로 보인다.

- [ ] **Step 7: 커밋**

```bash
cd /Users/hss_mac/클로드_project/linknamu
git add src/config/links.ts
git commit -m "$(cat <<'EOF'
Add findLinkById helper to links config

Provides id-based lookup that the redirect route (T6) will use to
resolve a link's target URL from the static config.
EOF
)"
```

---

## Self-Review Notes

- **T2 AC 커버리지 확인**:
  1. `profile`, `links`가 타입과 함께 export → Task 1
  2. 링크 3개 이상 샘플 → Task 1 Step 2 (4개 포함), Task 2 Step 2에서 재확인
  3. `id` 중복 없음 → Task 2 Step 2 검증 로직
  4. `findLinkById`가 없는 id에 `undefined` 반환 → Task 2 Step 2 검증 로직
  5. `npm run build` 통과 → Task 2 Step 5
- 자동화 테스트 러너(jest/vitest 등)는 프로젝트 스펙상 MVP 범위 밖이라 도입하지 않고, `npx tsx`로 실행하는 일회성 검증 스크립트로 AC를 확인한 뒤 삭제하는 방식을 택했다.
- Task 1과 Task 2로 나눈 이유: Task 1(타입+데이터)과 Task 2(헬퍼+검증)는 각각 독립적으로 리뷰 가능한 단위이고, Task 2의 검증 로직이 Task 1의 산출물을 전제로 하므로 순서가 명확하다.
