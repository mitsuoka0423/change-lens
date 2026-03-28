import * as vscode from "vscode";

/**
 * PR変更行のハイライト用デコレーション（黄色背景 + 左ボーダー）
 */
export const prChangeDecorationType =
  vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgba(255, 235, 59, 0.15)",
    isWholeLine: true,
    borderWidth: "0 0 0 3px",
    borderStyle: "solid",
    borderColor: "rgba(255, 193, 7, 0.8)",
    overviewRulerColor: "rgba(255, 193, 7, 0.6)",
    overviewRulerLane: vscode.OverviewRulerLane.Left,
  });
