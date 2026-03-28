import * as vscode from "vscode";
import { PRAnnotation } from "@change-lens/core";
import { applyDecorations, clearDecorations } from "./decorations/decorator";
import { prChangeDecorationType } from "./decorations/decoration-types";
import { getSettings } from "./config/settings";

/**
 * モックデータ: T-03（coreパッケージ）完了までスタブとして使用
 */
function getMockAnnotations(): PRAnnotation[] {
  return [
    {
      pr: {
        number: 42,
        title: "feat: add user authentication",
        author: "alice",
        url: "https://github.com/example/repo/pull/42",
        headSha: "abc1234",
      },
      ranges: [
        { start: 5, end: 10 },
        { start: 20, end: 25 },
      ],
    },
    {
      pr: {
        number: 57,
        title: "fix: handle edge case in parser",
        author: "bob",
        url: "https://github.com/example/repo/pull/57",
        headSha: "def5678",
      },
      ranges: [{ start: 15, end: 18 }],
    },
  ];
}

function updateDecorations(editor: vscode.TextEditor | undefined): void {
  if (!editor) {
    return;
  }

  const settings = getSettings();
  if (!settings.enabled) {
    clearDecorations(editor);
    return;
  }

  // TODO: T-03完了後にcore.getAnnotationsForFile()に置き換える
  const annotations = getMockAnnotations();
  applyDecorations(editor, annotations);
}

export function activate(context: vscode.ExtensionContext): void {
  // アクティブエディタの変更時に再描画
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      updateDecorations(editor);
    }),
  );

  // ドキュメント変更時に再描画
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        updateDecorations(editor);
      }
    }),
  );

  // 手動リフレッシュコマンド
  context.subscriptions.push(
    vscode.commands.registerCommand("changeLens.refresh", () => {
      updateDecorations(vscode.window.activeTextEditor);
    }),
  );

  // デコレーションタイプのクリーンアップ登録
  context.subscriptions.push(prChangeDecorationType);

  // 初回描画
  updateDecorations(vscode.window.activeTextEditor);
}

export function deactivate(): void {
  // cleanup handled by disposables
}
