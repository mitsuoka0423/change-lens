import * as vscode from "vscode";
import {
  OctokitGitHubClient,
  ChangeLensCoreImpl,
  detectRepo,
  AuthError,
} from "@change-lens/core";
import type { PRAnnotation } from "@change-lens/core";
import { applyDecorations, clearDecorations } from "./decorations/decorator";
import { prChangeDecorationType } from "./decorations/decoration-types";
import { getSettings } from "./config/settings";
import { ChangeLensHoverProvider } from "./providers/hover-provider";
import { registerOpenPrCommand } from "./commands/open-pr";

let client: OctokitGitHubClient | undefined;
let core: ChangeLensCoreImpl | undefined;
const hoverProvider = new ChangeLensHoverProvider();

function getConfig() {
  const config = vscode.workspace.getConfiguration("changeLens");
  return {
    currentUser: config.get<string>("currentUser", ""),
  };
}

async function fetchAnnotations(
  filePath: string,
): Promise<PRAnnotation[]> {
  if (!core) {
    try {
      client = new OctokitGitHubClient();
      core = new ChangeLensCoreImpl(client);
    } catch (err) {
      if (err instanceof AuthError) {
        vscode.window.showWarningMessage(
          `Change Lens: ${err.message}`,
        );
      }
      return [];
    }
  }

  let owner: string;
  let repo: string;
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    const detected = detectRepo(workspaceFolder?.uri.fsPath);
    owner = detected.owner;
    repo = detected.repo;
  } catch {
    return [];
  }

  const { currentUser } = getConfig();
  return core.getAnnotationsForFile(
    owner,
    repo,
    filePath,
    currentUser || undefined,
  );
}

function getRelativePath(editor: vscode.TextEditor): string | undefined {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) return undefined;
  const rootPath = workspaceFolder.uri.fsPath;
  const filePath = editor.document.uri.fsPath;
  if (!filePath.startsWith(rootPath)) return undefined;
  return filePath.slice(rootPath.length + 1);
}

async function updateDecorations(
  editor: vscode.TextEditor | undefined,
): Promise<void> {
  if (!editor) return;

  const settings = getSettings();
  if (!settings.enabled) {
    clearDecorations(editor);
    return;
  }

  const relativePath = getRelativePath(editor);
  if (!relativePath) return;

  try {
    const annotations = await fetchAnnotations(relativePath);
    applyDecorations(editor, annotations);
    hoverProvider.setAnnotations(annotations);
    const { currentUser } = getConfig();
    hoverProvider.setCurrentUser(currentUser || undefined);
  } catch (err) {
    // API エラー時はサイレントにデコレーションをクリア
    clearDecorations(editor);
  }
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      updateDecorations(editor);
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        updateDecorations(editor);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("changeLens.refresh", () => {
      // リフレッシュ時はキャッシュクリアのためクライアントを再生成
      client = undefined;
      core = undefined;
      updateDecorations(vscode.window.activeTextEditor);
    }),
  );

  registerOpenPrCommand(context);

  context.subscriptions.push(
    vscode.languages.registerHoverProvider({ scheme: "file" }, hoverProvider),
  );

  context.subscriptions.push(prChangeDecorationType);

  updateDecorations(vscode.window.activeTextEditor);
}

export function deactivate(): void {
  // cleanup handled by disposables
}
