# T4: LinkCard 컴포넌트 및 링크 목록 렌더링 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 프로필 아래에 링크 카드 목록을 렌더링한다. 각 카드는 `/r/[linkId]`로 연결되고(라우트 자체는 T6에서 구현), 키보드 접근성과 반응형 레이아웃을 갖춘다.

**Architecture:** `src/components/LinkCard.tsx`(단일 링크 카드)와 `src/app/page.tsx`에서의 `links.map()` 렌더링으로 나눈다. 카드는 Next.js `Link` 컴포넌트를 사용해 `/r/${id}`로 이동하며, 라우트가 아직 없으므로 클릭 시 404가 나는 것은 이 티켓에서 정상이다.

**Tech Stack:** Next.js 16 App Router (`next/link`), TypeScript, Tailwind CSS.

## Global Constraints

- 소스 디렉터리는 `src/` (`src/components/`에 이미 `ProfileHeader.tsx` 존재).
- TypeScript strict 모드 유지.
- 모바일 우선 반응형 (375px 및 1280px 양쪽 확인).
- 키보드 Tab으로 모든 카드에 접근 가능하고 포커스가 시각적으로 보여야 한다.
- 자동화 테스트 러너는 도입하지 않는다 — 브라우저 육안 확인(Claude Browser 도구 사용 가능) + `npm run build`로 검증한다.
- 링크 href는 반드시 `/r/{id}` 형식이어야 한다 (T6에서 실제 라우트가 이 경로를 처리).

---

### Task 1: `LinkCard` 컴포넌트 작성

**Files:**
- Create: `src/components/LinkCard.tsx`

**Interfaces:**
- Consumes: `src/config/links.ts`의 `LinkItem` 타입 (`{ id, label, url }`)
- Produces: `export default function LinkCard({ link }: { link: LinkItem })` — Task 2에서 `src/app/page.tsx`가 목록 렌더링에 사용. `url`은 카드 내부에서 직접 쓰지 않고 `href={/r/${link.id}}`만 사용한다(실제 목적지 URL은 서버 라우트가 안다).

- [ ] **Step 1: `LinkCard.tsx` 작성**

```tsx
import Link from "next/link";
import type { LinkItem } from "@/config/links";

export default function LinkCard({ link }: { link: LinkItem }) {
  return (
    <Link
      href={`/r/${link.id}`}
      className="block w-full rounded-xl border border-zinc-200 bg-white px-5 py-4 text-center font-medium text-zinc-900 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
    >
      {link.label}
    </Link>
  );
}
```

- [ ] **Step 2: 타입 체크**

Run: `cd /Users/hss_mac/클로드_project/linknamu && npx tsc --noEmit`

Expected: 에러 없이 종료된다.

---

### Task 2: `src/app/page.tsx`에 링크 목록 렌더링 추가

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: Task 1의 `LinkCard`, `src/config/links.ts`의 `links` 배열
- Produces: `/`가 `ProfileHeader` 아래에 링크 카드 목록을 렌더링 — 이후 티켓에서 이 페이지를 더 수정하지 않음(T9의 반응형 마감 제외)

- [ ] **Step 1: `page.tsx`에 링크 목록 섹션 추가**

기존 `src/app/page.tsx`(T3에서 작성된 상태)를 다음으로 교체한다:

```tsx
import ProfileHeader from "@/components/ProfileHeader";
import LinkCard from "@/components/LinkCard";
import { profile, links } from "@/config/links";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center bg-white pb-16">
      <ProfileHeader profile={profile} />
      <section className="mt-8 flex w-full flex-col gap-3 px-6">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </section>
    </main>
  );
}
```

- [ ] **Step 2: 타입 체크 및 빌드**

Run: `cd /Users/hss_mac/클로드_project/linknamu && npx tsc --noEmit && npm run build`

Expected: 둘 다 에러 없이 통과.

- [ ] **Step 3: 개발 서버로 href 형식 확인**

Run:
```bash
cd /Users/hss_mac/클로드_project/linknamu
timeout 15 npm run dev &
sleep 5
curl -sS http://localhost:3000 | grep -o 'href="/r/[a-z]*"'
kill %1 2>/dev/null || true
```

Expected: `src/config/links.ts`의 모든 링크 id(`blog`, `github`, `notion`, `instagram`)에 대해 `href="/r/blog"` 형식의 결과가 4줄 출력된다.

- [ ] **Step 4: 브라우저로 시각/접근성 확인**

Claude Browser 도구로 `http://localhost:3000`을 열어 확인한다:
- `links`의 모든 항목(4개)이 카드로 표시된다.
- 카드를 클릭하면 `/r/{id}` 경로로 이동을 시도하고 404가 뜬다 (라우트가 아직 없으므로 이 티켓에서는 정상 — Next.js 기본 404 페이지가 보이면 통과).
- 브라우저 뷰포트를 375px로 좁힌 화면과 1280px 데스크톱 화면 스크린샷을 각각 찍어 카드 레이아웃이 깨지지 않는지(가로 스크롤 없음, 카드가 컨테이너 폭에 맞게 정렬) 확인한다.
- 키보드로 Tab을 눌러 각 카드로 포커스가 이동하는지, 포커스 시 시각적 아웃라인이 보이는지 스크린샷으로 확인한다 (`Tab` 키 입력 후 스크린샷).

- [ ] **Step 5: 커밋**

```bash
cd /Users/hss_mac/클로드_project/linknamu
git add src/components/LinkCard.tsx src/app/page.tsx
git commit -m "$(cat <<'EOF'
Render link card list below the profile header

Each card links to /r/{id}; the redirect route itself lands in a
later ticket, so a 404 on click is expected for now.
EOF
)"
```

---

## Self-Review Notes

- **T4 AC 커버리지 확인**:
  1. `links`의 모든 항목이 카드로 표시 → Task 2 Step 1, 4
  2. 각 카드의 `href`가 `/r/{id}` 형식(라우트 없어 404여도 정상) → Task 1 Step 1, Task 2 Step 3
  3. 키보드 Tab으로 모든 카드 접근 가능, 포커스 시각적으로 보임 → `LinkCard`의 `focus-visible:outline` 클래스 (Task 1), Task 2 Step 4에서 확인
  4. 375px / 1280px 양쪽에서 레이아웃 안 깨짐 → Task 2 Step 4
- 타입 일관성: `LinkItem`은 T2에서 정의된 타입을 그대로 import해서 사용, 새로 정의하지 않음. `LinkCard`의 props 이름(`link`)과 `page.tsx`에서 넘기는 변수명(`link`)이 일치함을 명시했다.
- 이 티켓은 실제 `/r/[linkId]` 라우트(T6)나 MongoDB(T5)에 의존하지 않는다 — 클릭 시 404는 명시적으로 예상된 동작으로 AC에 반영했다.
