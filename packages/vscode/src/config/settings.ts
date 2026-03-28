import * as vscode from "vscode";

export interface ChangeLensSettings {
  enabled: boolean;
}

export function getSettings(): ChangeLensSettings {
  const config = vscode.workspace.getConfiguration("changeLens");
  return {
    enabled: config.get<boolean>("enabled", true),
  };
}
