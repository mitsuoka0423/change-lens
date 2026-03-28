import type { DiffParser, FileDiff, LineRange } from "../types";

export class UnifiedDiffParser implements DiffParser {
  parse(rawDiff: string): FileDiff[] {
    const files: FileDiff[] = [];
    const lines = rawDiff.split("\n");
    let currentFile: string | null = null;
    let currentRanges: LineRange[] = [];
    let newLineNum = 0;

    for (const line of lines) {
      // diff --git a/path b/path
      const diffMatch = line.match(/^diff --git a\/.+ b\/(.+)$/);
      if (diffMatch) {
        if (currentFile !== null) {
          files.push({
            filename: currentFile,
            changedLines: mergeRanges(currentRanges),
          });
        }
        currentFile = diffMatch[1];
        currentRanges = [];
        newLineNum = 0;
        continue;
      }

      // @@ -a,b +c,d @@
      const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (hunkMatch) {
        newLineNum = parseInt(hunkMatch[1], 10);
        continue;
      }

      if (newLineNum === 0) continue;

      if (line.startsWith("+")) {
        currentRanges.push({ start: newLineNum, end: newLineNum });
        newLineNum++;
      } else if (line.startsWith("-")) {
        // 削除行: newLineNum は進めない
      } else {
        // コンテキスト行
        newLineNum++;
      }
    }

    // 最後のファイルを追加
    if (currentFile !== null) {
      files.push({
        filename: currentFile,
        changedLines: mergeRanges(currentRanges),
      });
    }

    return files;
  }
}

function mergeRanges(ranges: LineRange[]): LineRange[] {
  if (ranges.length === 0) return [];

  const merged: LineRange[] = [{ ...ranges[0] }];
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1];
    if (ranges[i].start === last.end + 1) {
      last.end = ranges[i].end;
    } else {
      merged.push({ ...ranges[i] });
    }
  }
  return merged;
}
