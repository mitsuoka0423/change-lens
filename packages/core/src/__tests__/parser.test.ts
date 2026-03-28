import { describe, it, expect } from "vitest";
import { UnifiedDiffParser } from "../diff/parser";

const parser = new UnifiedDiffParser();

describe("UnifiedDiffParser", () => {
  it("追加行のみのdiffを解析できる", () => {
    const diff = `diff --git a/src/hello.ts b/src/hello.ts
--- a/src/hello.ts
+++ b/src/hello.ts
@@ -1,3 +1,5 @@
 const a = 1;
+const b = 2;
+const c = 3;
 const d = 4;`;

    const result = parser.parse(diff);
    expect(result).toHaveLength(1);
    expect(result[0].filename).toBe("src/hello.ts");
    expect(result[0].changedLines).toEqual([{ start: 2, end: 3 }]);
  });

  it("削除行のみのdiffを解析できる", () => {
    const diff = `diff --git a/src/hello.ts b/src/hello.ts
--- a/src/hello.ts
+++ b/src/hello.ts
@@ -1,4 +1,2 @@
 const a = 1;
-const b = 2;
-const c = 3;
 const d = 4;`;

    const result = parser.parse(diff);
    expect(result).toHaveLength(1);
    expect(result[0].filename).toBe("src/hello.ts");
    expect(result[0].changedLines).toEqual([]);
  });

  it("追加・削除・変更が混在するdiffを解析できる", () => {
    const diff = `diff --git a/src/app.ts b/src/app.ts
--- a/src/app.ts
+++ b/src/app.ts
@@ -1,6 +1,7 @@
 import { foo } from './foo';
-import { bar } from './bar';
+import { baz } from './baz';
+import { qux } from './qux';

 function main() {
-  bar();
+  baz();
 }`;

    const result = parser.parse(diff);
    expect(result).toHaveLength(1);
    expect(result[0].filename).toBe("src/app.ts");
    // 行2: baz import, 行3: qux import, 行6: baz()
    expect(result[0].changedLines).toEqual([
      { start: 2, end: 3 },
      { start: 6, end: 6 },
    ]);
  });

  it("複数ファイルのdiffを解析できる", () => {
    const diff = `diff --git a/file1.ts b/file1.ts
--- a/file1.ts
+++ b/file1.ts
@@ -1,2 +1,3 @@
 line1
+added
 line2
diff --git a/file2.ts b/file2.ts
--- a/file2.ts
+++ b/file2.ts
@@ -1,2 +1,3 @@
 a
 b
+c`;

    const result = parser.parse(diff);
    expect(result).toHaveLength(2);
    expect(result[0].filename).toBe("file1.ts");
    expect(result[0].changedLines).toEqual([{ start: 2, end: 2 }]);
    expect(result[1].filename).toBe("file2.ts");
    expect(result[1].changedLines).toEqual([{ start: 3, end: 3 }]);
  });

  it("複数のハンクを持つdiffを解析できる", () => {
    const diff = `diff --git a/src/big.ts b/src/big.ts
--- a/src/big.ts
+++ b/src/big.ts
@@ -1,3 +1,4 @@
 line1
+added_top
 line2
 line3
@@ -10,3 +11,4 @@
 line10
+added_bottom
 line11
 line12`;

    const result = parser.parse(diff);
    expect(result).toHaveLength(1);
    expect(result[0].changedLines).toEqual([
      { start: 2, end: 2 },
      { start: 12, end: 12 },
    ]);
  });

  it("新規ファイルのdiffを解析できる", () => {
    const diff = `diff --git a/new-file.ts b/new-file.ts
new file mode 100644
--- /dev/null
+++ b/new-file.ts
@@ -0,0 +1,3 @@
+line1
+line2
+line3`;

    const result = parser.parse(diff);
    expect(result).toHaveLength(1);
    expect(result[0].filename).toBe("new-file.ts");
    expect(result[0].changedLines).toEqual([{ start: 1, end: 3 }]);
  });

  it("空のdiffを解析できる", () => {
    const result = parser.parse("");
    expect(result).toEqual([]);
  });
});
