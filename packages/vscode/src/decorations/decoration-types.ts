import * as vscode from "vscode";

// #13: ガター（行番号）部分に表示する黄色の縦バーアイコン（SVG data URI）
const gutterIconSvg = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect x="5" y="1" width="4" height="14" rx="2" fill="rgba(255,193,7,0.9)"/></svg>',
)}`;

/**
 * PR変更行のハイライト用デコレーション（黄色背景 + 左ボーダー + インラインPR情報 + ガターアイコン）
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
    // #13: ガター（行番号）部分にアイコンを表示
    gutterIconPath: vscode.Uri.parse(gutterIconSvg),
    gutterIconSize: "auto",
    // #12: インラインPR情報のスタイル（contentText は decorator.ts で行ごとに設定）
    after: {
      color: "rgba(150, 150, 150, 0.6)",
      margin: "0 0 0 1em",
    },
  });
