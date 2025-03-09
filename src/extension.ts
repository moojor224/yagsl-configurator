import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {

    let command = vscode.commands.registerCommand("yagsl-configurator.open", () => {
        // do things here
    });

    context.subscriptions.push(command);
}

export function deactivate() { }
