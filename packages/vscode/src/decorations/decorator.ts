import * as vscode from "vscode";
import { PRAnnotation } from "@change-lens/core";
import { prChangeDecorationType } from "./decoration-types";

/**
 * PRAnnotation[] をもとにエディタにデコレーションを適用する
 */
export function applyDecorations(
  editor: vscode.TextEditor,
  annotations: PRAnnotation[],
): void {
  const decorations: vscode.DecorationOptions[] = [];

  for (const annotation of annotations) {
    for (const range of annotation.ranges) {
      // PRAnnotation の LineRange は 1-based、VSCode の Range は 0-based
      const startLine = Math.max(0, range.start - 1);
      const endLine = Math.max(0, range.end - 1);
      const vscodeRange = new vscode.Range(
        new vscode.Position(startLine, 0),
        new vscode.Position(endLine, Number.MAX_SAFE_INTEGER),
      );
      decorations.push({
        range: vscodeRange,
        hoverMessage: new vscode.MarkdownString(
          `**PR #${annotation.pr.number}**: ${annotation.pr.title}\n\nby ${annotation.pr.author} — [View PR](${annotation.pr.url})`,
        ),
      });
    }
  }

  editor.setDecorations(prChangeDecorationType, decorations);
}

/**
 * エディタからデコレーションをクリアする
 */
export function clearDecorations(editor: vscode.TextEditor): void {
  editor.setDecorations(prChangeDecorationType, []);
}
