import { describe, it, expect, vi } from "vitest";
import { ChangeLensCoreImpl } from "../core";
import type { GitHubClient, PullRequest } from "../types";

const mockPRs: PullRequest[] = [
  {
    number: 1,
    title: "feat: add feature",
    author: "alice",
    url: "https://github.com/owner/repo/pull/1",
    headSha: "aaa111",
  },
  {
    number: 2,
    title: "fix: bug fix",
    author: "bob",
    url: "https://github.com/owner/repo/pull/2",
    headSha: "bbb222",
  },
];

const mockDiffPR1 = `diff --git a/src/app.ts b/src/app.ts
--- a/src/app.ts
+++ b/src/app.ts
@@ -1,3 +1,4 @@
 import { foo } from './foo';
+import { bar } from './bar';

 function main() {}`;

const mockDiffPR2 = `diff --git a/src/app.ts b/src/app.ts
--- a/src/app.ts
+++ b/src/app.ts
@@ -5,3 +5,4 @@
 function helper() {
+  console.log('debug');
   return true;
 }
diff --git a/src/other.ts b/src/other.ts
--- a/src/other.ts
+++ b/src/other.ts
@@ -1,2 +1,3 @@
 const x = 1;
+const y = 2;
 export { x };`;

function createMockClient(): GitHubClient {
  return {
    listOpenPRs: vi.fn().mockResolvedValue(mockPRs),
    getDiff: vi.fn().mockImplementation((_o, _r, prNumber) => {
      if (prNumber === 1) return Promise.resolve(mockDiffPR1);
      if (prNumber === 2) return Promise.resolve(mockDiffPR2);
      return Promise.resolve("");
    }),
  };
}

describe("ChangeLensCoreImpl", () => {
  it("ファイルに対するPRAnnotationを取得できる", async () => {
    const client = createMockClient();
    const core = new ChangeLensCoreImpl(client);

    const annotations = await core.getAnnotationsForFile(
      "owner",
      "repo",
      "src/app.ts",
    );

    expect(annotations).toHaveLength(2);
    expect(annotations[0].pr.number).toBe(1);
    expect(annotations[0].ranges).toEqual([{ start: 2, end: 2 }]);
    expect(annotations[1].pr.number).toBe(2);
    expect(annotations[1].ranges).toEqual([{ start: 6, end: 6 }]);
  });

  it("該当ファイルがないPRは結果に含まれない", async () => {
    const client = createMockClient();
    const core = new ChangeLensCoreImpl(client);

    const annotations = await core.getAnnotationsForFile(
      "owner",
      "repo",
      "src/other.ts",
    );

    expect(annotations).toHaveLength(1);
    expect(annotations[0].pr.number).toBe(2);
    expect(annotations[0].ranges).toEqual([{ start: 2, end: 2 }]);
  });

  it("存在しないファイルは空配列を返す", async () => {
    const client = createMockClient();
    const core = new ChangeLensCoreImpl(client);

    const annotations = await core.getAnnotationsForFile(
      "owner",
      "repo",
      "src/nonexistent.ts",
    );

    expect(annotations).toEqual([]);
  });

  it("currentUser指定で自分のPRを除外できる", async () => {
    const client = createMockClient();
    const core = new ChangeLensCoreImpl(client);

    const annotations = await core.getAnnotationsForFile(
      "owner",
      "repo",
      "src/app.ts",
      "alice",
    );

    expect(annotations).toHaveLength(1);
    expect(annotations[0].pr.author).toBe("bob");
  });
});
