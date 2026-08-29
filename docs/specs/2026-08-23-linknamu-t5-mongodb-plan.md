# T5: MongoDB 연결 유틸 (`src/lib/mongodb.ts`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 서버리스 환경(Next.js Route Handler)에서 커넥션을 재사용하는 MongoDB 클라이언트 유틸을 만들고, 클릭 수 증가(`incrementClick`)와 전체 조회(`getAllClickCounts`) 함수를 제공한다. 이 티켓 자체는 UI 변경이 없다.

**Architecture:** `src/lib/mongodb.ts` 하나에 클라이언트 캐싱(HMR 대비 전역 캐시) + `clicks` 컬렉션 헬퍼 2개 함수를 담는다. 두 함수 모두 실패 시 예외를 밖으로 던지지 않고 콘솔에 로그만 남긴 뒤 안전한 기본값을 반환한다(설계 스펙의 "MongoDB 실패해도 사용자 경험은 실패하지 않는다" 원칙).

**Tech Stack:** `mongodb` 공식 Node.js 드라이버, TypeScript strict, Next.js Route Handler(서버 전용 모듈이므로 클라이언트 번들에 포함되지 않음).

## Global Constraints

- 소스 디렉터리는 `src/` (`src/lib/` 신설).
- TypeScript strict 모드 유지.
- 환경 변수는 `.env.local`의 `MONGODB_URI` 사용 (이미 값이 채워져 있음).
- `MONGODB_URI`가 없어도 `npm run build`가 성공해야 한다 (빌드 타임에 연결을 시도하지 않는다 — lazy connection).
- `incrementClick`, `getAllClickCounts` 모두 MongoDB 연결/쓰기 실패 시 예외를 던지지 않는다.
- 컬렉션: `clicks`, 문서 형태: `{ linkId: string, count: number }`.
- 자동화 테스트 러너는 도입하지 않는다 — 실제 `.env.local`의 `MONGODB_URI`(Atlas)로 직접 실행 검증한다.

---

### Task 1: `mongodb` 드라이버 설치 및 클라이언트 캐싱 유틸 작성

**Files:**
- Modify: `package.json`, `package-lock.json` (의존성 추가)
- Create: `src/lib/mongodb.ts`

**Interfaces:**
- Consumes: `process.env.MONGODB_URI`
- Produces: `getClicksCollection(): Promise<Collection<ClickDoc>>` (모듈 내부에서만 쓰이는 헬퍼, export하지 않음), `interface ClickDoc { linkId: string; count: number }` — Task 2에서 같은 파일 안에서 사용

- [ ] **Step 1: `mongodb` 패키지 설치**

Run: `cd /Users/hss_mac/클로드_project/linknamu && npm install mongodb`

Expected: `package.json`의 `dependencies`에 `mongodb`가 추가되고 에러 없이 완료된다.

- [ ] **Step 2: `src/lib/mongodb.ts` 작성 — 클라이언트 캐싱**

```typescript
import { MongoClient, type Collection } from "mongodb";

export interface ClickDoc {
  linkId: string;
  count: number;
}

const DB_NAME = "linknamu";
const COLLECTION_NAME = "clicks";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> | null {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }

  return global._mongoClientPromise;
}

async function getClicksCollection(): Promise<Collection<ClickDoc> | null> {
  const clientPromise = getClientPromise();
  if (!clientPromise) {
    console.error("MONGODB_URI가 설정되지 않아 클릭 집계를 건너뜁니다.");
    return null;
  }

  try {
    const client = await clientPromise;
    return client.db(DB_NAME).collection<ClickDoc>(COLLECTION_NAME);
  } catch (error) {
    console.error("MongoDB 연결 실패:", error);
    return null;
  }
}
```

이 Step에서는 `getClicksCollection`을 아직 export하지 않는다 (모듈 내부 헬퍼).

- [ ] **Step 3: 타입 체크**

Run: `cd /Users/hss_mac/클로드_project/linknamu && npx tsc --noEmit`

Expected: 에러 없이 종료된다. (`global._mongoClientPromise`의 `declare global` 블록이 타입 에러를 일으키지 않는지 확인)

- [ ] **Step 4: `MONGODB_URI` 없이도 빌드되는지 확인**

Run:
```bash
cd /Users/hss_mac/클로드_project/linknamu
MONGODB_URI= npm run build
```

Expected: 에러 없이 `Compiled successfully`. (이 시점엔 아직 `incrementClick`/`getAllClickCounts`가 없어 아무 데서도 호출되지 않으므로 당연히 통과 — Task 2 완료 후 다시 확인한다)

---

### Task 2: `incrementClick` / `getAllClickCounts` 함수 추가 및 실제 Atlas로 검증

**Files:**
- Modify: `src/lib/mongodb.ts`
- Create: `scripts/verify-mongodb.mjs` (검증 후 삭제하는 일회성 스크립트 — 커밋하지 않음)

**Interfaces:**
- Consumes: Task 1의 `getClicksCollection`, `ClickDoc`
- Produces:
  - `export async function incrementClick(linkId: string): Promise<void>` — T6에서 사용
  - `export async function getAllClickCounts(): Promise<Record<string, number>>` — T8에서 사용

- [ ] **Step 1: `incrementClick`, `getAllClickCounts` 추가**

`src/lib/mongodb.ts` 파일 끝에 추가:

```typescript
export async function incrementClick(linkId: string): Promise<void> {
  const collection = await getClicksCollection();
  if (!collection) {
    return;
  }

  try {
    await collection.updateOne(
      { linkId },
      { $inc: { count: 1 } },
      { upsert: true },
    );
  } catch (error) {
    console.error(`클릭 집계 실패 (linkId=${linkId}):`, error);
  }
}

export async function getAllClickCounts(): Promise<Record<string, number>> {
  const collection = await getClicksCollection();
  if (!collection) {
    return {};
  }

  try {
    const docs = await collection.find().toArray();
    return Object.fromEntries(docs.map((doc) => [doc.linkId, doc.count]));
  } catch (error) {
    console.error("클릭 수 조회 실패:", error);
    return {};
  }
}
```

- [ ] **Step 2: 타입 체크**

Run: `cd /Users/hss_mac/클로드_project/linknamu && npx tsc --noEmit`

Expected: 에러 없이 종료된다.

- [ ] **Step 3: `MONGODB_URI` 없을 때 안전하게 실패하는지 검증**

```bash
cd /Users/hss_mac/클로드_project/linknamu
cat > scripts/verify-mongodb.mjs << 'SCRIPT'
process.env.MONGODB_URI = "";
const { incrementClick, getAllClickCounts } = await import("../src/lib/mongodb.ts");

await incrementClick("test-no-uri");
const counts = await getAllClickCounts();

if (Object.keys(counts).length !== 0) {
  throw new Error("FAIL: MONGODB_URI 없을 때 getAllClickCounts가 빈 객체를 반환하지 않음");
}

console.log("PASS: MONGODB_URI 없이도 예외 없이 안전하게 처리됨");
SCRIPT
npx --yes tsx scripts/verify-mongodb.mjs
```

Expected: `PASS: MONGODB_URI 없이도 예외 없이 안전하게 처리됨` 출력, 예외로 종료되지 않음.

- [ ] **Step 4: 실제 `.env.local`의 `MONGODB_URI`로 Atlas 연결 검증**

```bash
cd /Users/hss_mac/클로드_project/linknamu
cat > scripts/verify-mongodb.mjs << 'SCRIPT'
import "dotenv/config";
import { incrementClick, getAllClickCounts } from "../src/lib/mongodb.ts";

const testId = "t5-verify-" + Date.now();

const before = await getAllClickCounts();
if (before[testId] !== undefined) {
  throw new Error("FAIL: 테스트 linkId가 이미 존재함 (예상치 못한 상태)");
}

await incrementClick(testId);
await incrementClick(testId);

const after = await getAllClickCounts();
if (after[testId] !== 2) {
  throw new Error(`FAIL: incrementClick 2회 후 count가 2가 아님 (실제: ${after[testId]})`);
}

console.log("PASS: Atlas에 upsert/increment 정상 동작, count =", after[testId]);
process.exit(0);
SCRIPT
npm install --no-save dotenv
node --env-file=.env.local -e "process.env.MONGODB_URI && console.log('env ok')" || true
npx --yes tsx --env-file=.env.local scripts/verify-mongodb.mjs
```

Expected: `PASS: Atlas에 upsert/increment 정상 동작, count = 2` 출력. 실패 시(네트워크, 인증정보, IP 화이트리스트 등) 에러 메시지를 그대로 사용자에게 보고하고 원인을 함께 설명한다 — 이 단계에서 실패해도 코드 자체(Task 1, 2)는 계획대로 완성된 것이므로 되돌리지 않는다.

- [ ] **Step 5: MongoDB Atlas 콘솔/CLI로 실제 데이터 확인 (선택, 가능하면 수행)**

Atlas 웹 콘솔의 `linknamu` 데이터베이스 `clicks` 컬렉션에서 `linkId`가 `t5-verify-`로 시작하는 문서가 `count: 2`로 존재하는지 확인한다. 확인 후 이 테스트 문서는 남겨두어도 무방하다(실제 서비스 링크 id와 겹치지 않으므로 T8 화면에는 영향 없음 — T8은 `links` 설정에 있는 id만 조회해서 표시함).

- [ ] **Step 6: 검증 스크립트 및 임시 의존성 정리**

```bash
cd /Users/hss_mac/클로드_project/linknamu
rm -f scripts/verify-mongodb.mjs
rmdir scripts 2>/dev/null || true
npm uninstall dotenv
```

Expected: `scripts/`가 사라지고, `package.json`에 `dotenv`가 남아있지 않다 (`npm install --no-save`로 설치했으므로 원래 `package.json`에는 기록되지 않았을 것 — `npm uninstall`은 안전을 위해 한 번 더 확인 차원에서 실행).

- [ ] **Step 7: `MONGODB_URI` 없이도 빌드되는지 재확인**

Run:
```bash
cd /Users/hss_mac/클로드_project/linknamu
MONGODB_URI= npm run build
```

Expected: 에러 없이 `Compiled successfully`.

- [ ] **Step 8: 커밋**

```bash
cd /Users/hss_mac/클로드_project/linknamu
git add package.json package-lock.json src/lib/mongodb.ts
git commit -m "$(cat <<'EOF'
Add MongoDB click-tracking utility

Provides incrementClick/getAllClickCounts with a cached client for
serverless reuse. Both functions fail safe (log-and-continue) so a
MongoDB outage never breaks the redirect route or stats page.
EOF
)"
```

---

## Self-Review Notes

- **T5 AC 커버리지 확인**:
  1. `incrementClick(linkId)`가 upsert로 +1 → Task 2 Step 1 (`updateOne` + `$inc` + `upsert: true`), Step 4에서 실제 검증
  2. `getAllClickCounts()`가 `Record<string, number>` 반환 → Task 2 Step 1, Step 4에서 검증
  3. 잘못된 URI/연결 실패 시 예외 안 던짐 → Task 1 Step 2의 `getClicksCollection` try/catch, Task 2 Step 3에서 빈 URI로 검증
  4. `MONGODB_URI` 없어도 빌드 성공 → Task 1 Step 4, Task 2 Step 7
- 타입 일관성: `incrementClick(linkId: string): Promise<void>`와 `getAllClickCounts(): Promise<Record<string, number>>` — T6, T8 티켓 문서에 적힌 함수 시그니처와 동일하게 맞췄다.
- Task 2 Step 4(실제 Atlas 검증)는 사용자의 실제 자격증명에 의존하므로, 네트워크/IP 화이트리스트 문제로 실패할 수 있다. 실패해도 구현 자체는 완료된 것으로 간주하고, 실패 원인(대개 Atlas의 Network Access에 현재 IP가 허용되어 있지 않은 경우)을 사용자에게 안내하도록 Step에 명시했다.
