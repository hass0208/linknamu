# T6: 리다이렉트 라우트 핸들러 `/r/[linkId]` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/r/{linkId}`로 들어오는 요청을 받아 클릭 수를 집계한 뒤, `src/config/links.ts`에 정의된 해당 링크의 실제 URL로 302 리다이렉트한다. 존재하지 않는 id는 `/`로 보내고, MongoDB 집계 실패는 리다이렉트 자체를 막지 않는다.

**Architecture:** `src/app/r/[linkId]/route.ts` 단일 GET 핸들러. 리다이렉트 대상은 반드시 `findLinkById`가 반환한 `LinkItem.url`만 사용한다 — 요청에 담긴 값(쿼리스트링 등 외부 입력)을 리다이렉트 대상으로 절대 쓰지 않는다(오픈 리다이렉트 방지, 링크 id로 화이트리스트된 URL만 목적지가 될 수 있음).

**Tech Stack:** Next.js 16 App Router Route Handler, TypeScript strict.

## Global Constraints

- 소스 디렉터리는 `src/` (`src/app/r/[linkId]/`).
- 리다이렉트 대상 URL은 오직 `findLinkById(linkId)?.url`에서만 가져온다 — 다른 어떤 입력값도 리다이렉트 목적지로 쓰지 않는다.
- 존재하지 않는 `linkId`는 `/`로 리다이렉트한다(404/500이 아니다).
- `incrementClick` 실패(MongoDB 장애 포함)가 리다이렉트를 막아서는 안 된다.
- 캐시 방지 헤더를 설정해 클릭마다 항상 서버를 거치게 한다.
- 자동화 테스트 러너는 도입하지 않는다 — 개발 서버 + curl/브라우저로 직접 검증한다.

---

### Task 1: `/r/[linkId]` GET 핸들러 작성

**Files:**
- Create: `src/app/r/[linkId]/route.ts`

**Interfaces:**
- Consumes: `findLinkById` (`src/config/links.ts`), `incrementClick` (`src/lib/mongodb.ts`)
- Produces: `GET` 라우트 핸들러 — 이 티켓 안에서 완결되며 다른 티켓이 이 파일을 import하지 않는다(T8은 `getAllClickCounts`만 사용).

- [ ] **Step 1: `route.ts` 작성**

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { findLinkById } from "@/config/links";
import { incrementClick } from "@/lib/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> },
) {
  const { linkId } = await params;
  const link = findLinkById(linkId);

  if (!link) {
    return NextResponse.redirect(new URL("/", request.url), {
      status: 302,
      headers: { "Cache-Control": "no-store" },
    });
  }

  await incrementClick(linkId);

  return NextResponse.redirect(link.url, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
```

주의: `NextResponse.redirect(link.url, ...)`에서 `link.url`은 **오직** `findLinkById`가 정적 설정에서 찾아 반환한 값이다. 요청 URL의 쿼리스트링이나 헤더값을 리다이렉트 대상으로 절대 사용하지 않는다.

- [ ] **Step 2: 타입 체크**

Run: `cd /Users/hss_mac/클로드_project/linknamu && npx tsc --noEmit`

Expected: 에러 없이 종료된다.

---

### Task 2: 개발 서버로 동작 검증 (유효/무효 id, 클릭 집계, MongoDB 장애 시나리오)

**Files:**
- 변경 없음 (검증 전용)

**Interfaces:**
- Consumes: Task 1의 라우트
- Produces: 없음

- [ ] **Step 1: 개발 서버 기동**

Run:
```bash
cd /Users/hss_mac/클로드_project/linknamu
npm run dev &
sleep 5
```

- [ ] **Step 2: 유효한 linkId로 302 리다이렉트 확인**

Run: `curl -sS -D - -o /dev/null "http://localhost:3000/r/github"`

Expected: 응답 헤더에 `HTTP/1.1 302` 와 `location: https://github.com/example`(`src/config/links.ts`의 `github` 항목 `url` 값)가 포함된다.

- [ ] **Step 3: 존재하지 않는 linkId는 `/`로 리다이렉트**

Run: `curl -sS -D - -o /dev/null "http://localhost:3000/r/does-not-exist"`

Expected: `HTTP/1.1 302`, `location: /` (또는 `http://localhost:3000/`).

- [ ] **Step 4: 같은 링크를 3번 클릭해 count가 3만큼 증가하는지 확인**

`getAllClickCounts`를 임시로 호출할 별도 스크립트 없이, `/stats` 페이지가 아직 없으므로(T8 스코프) MongoDB Atlas 콘솔이나 다음 임시 확인 스크립트로 검증한다:

```bash
cd /Users/hss_mac/클로드_project/linknamu
for i in 1 2 3; do curl -sS -o /dev/null "http://localhost:3000/r/blog"; done

cat > /tmp/verify-t6-count.mjs << 'SCRIPT'
import "dotenv/config";
import { getAllClickCounts } from "/Users/hss_mac/클로드_project/linknamu/src/lib/mongodb.ts";

const counts = await getAllClickCounts();
console.log("blog count =", counts["blog"]);
SCRIPT
npm install --no-save dotenv
npx --yes tsx --env-file=.env.local /tmp/verify-t6-count.mjs
npm uninstall dotenv
rm -f /tmp/verify-t6-count.mjs
```

Expected: `blog count = 3` 이상의 값이 출력된다(이전 티켓에서 이미 클릭한 적이 없다면 정확히 3). 이전에 다른 이유로 `blog`를 클릭한 적이 있다면 실행 전후 값을 비교해 정확히 3 증가했는지로 판단한다.

- [ ] **Step 5: MongoDB 장애 시에도 리다이렉트가 정상 동작하는지 확인**

`.env.local`을 건드리지 않고, 런타임에만 잘못된 URI를 주입해 확인한다:

```bash
kill %1 2>/dev/null || true
cd /Users/hss_mac/클로드_project/linknamu
MONGODB_URI="mongodb+srv://invalid:invalid@invalid.example.mongodb.net/linknamu" npm run dev &
sleep 5
curl -sS -D - -o /dev/null "http://localhost:3000/r/notion"
kill %1 2>/dev/null || true
```

Expected: `MONGODB_URI`가 잘못되어도 `HTTP/1.1 302`와 함께 `location`에 Notion URL이 정상적으로 나타난다(집계 실패는 서버 콘솔 로그에만 남고 리다이렉트는 성공). 이후 정상적인 `.env.local`의 `MONGODB_URI`로 다시 `npm run dev`를 띄워 원상복구한다.

- [ ] **Step 6: 정상 `.env.local`로 서버 재기동 및 브라우저 육안 확인**

```bash
cd /Users/hss_mac/클로드_project/linknamu
npm run dev &
sleep 5
```

Claude Browser 도구로 `http://localhost:3000`을 열어 "Notion 포트폴리오" 카드를 클릭하고, 실제로 `https://app.notion.com/p/About-Me-3c54c3bffc2a81b5af85c690f09249b5?source=copy_link`로 이동하는지 확인한다.

- [ ] **Step 7: `git diff CLAUDE.md`로 오염 여부 확인**

Run: `cd /Users/hss_mac/클로드_project/linknamu && git diff CLAUDE.md`

Expected: 변경 없음(빈 출력). 변경이 있다면 `git checkout -- CLAUDE.md`로 되돌린다.

- [ ] **Step 8: 커밋**

```bash
cd /Users/hss_mac/클로드_project/linknamu
git add src/app/r
git commit -m "$(cat <<'EOF'
Add /r/[linkId] redirect route with click tracking

Resolves the target URL only from the static links config (never
from request input) to avoid an open redirect, and keeps the
redirect working even if the click-count write fails.
EOF
)"
```

---

## Self-Review Notes

- **T6 AC 커버리지 확인**:
  1. 유효한 linkId → 302로 실제 url 도달 → Task 2 Step 2
  2. count가 1 증가 → Task 1 Step 1의 `incrementClick` 호출, Task 2 Step 4에서 3회 클릭으로 검증
  3. 존재하지 않는 linkId → `/`로 리다이렉트 → Task 2 Step 3
  4. `MONGODB_URI` 오류 시에도 리다이렉트 정상 → Task 2 Step 5
  5. 여러 번 클릭 시 캐시로 인한 누락 없음 → `Cache-Control: no-store` 헤더 (Task 1), Task 2 Step 4에서 3회 클릭 검증
- 오픈 리다이렉트 방지: `link.url`은 오직 `findLinkById`의 반환값에서만 오고, 요청의 쿼리/헤더 등 사용자 제어 입력은 리다이렉트 대상 계산에 전혀 관여하지 않는다 — Task 1 Step 1 코드와 주석으로 명시했다. 이 티켓은 설계 스펙의 "T6은 외부 입력을 처리하므로 리뷰에서 오픈 리다이렉트 방지를 확인" 요구사항을 충족한다.
- 타입 일관성: `findLinkById`(T2), `incrementClick`(T5)의 시그니처를 그대로 사용, 새로 정의하지 않았다.
