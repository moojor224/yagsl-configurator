import * as fs from "fs";
import * as vscode from "vscode";
import path = require("path");
import { DOMParser } from "linkedom";

let curView: vscode.WebviewPanel | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
    const webview_root = context.asAbsolutePath("./src/docs");
    const index = path.join(webview_root, "index.html");
    console.log("index", index);

    const command = vscode.commands.registerCommand("yagsl-configurator.open", (...args) => {
        try {
            if (curView === undefined) {
                newVebview(index);
            } else {
                curView.reveal();
            }
        } catch (e: any) {
            vscode.window.showErrorMessage("Error opening YAGSL Configurator: " + e.message);
        }
    });

    function newVebview(index: string) {
        const view = vscode.window.createWebviewPanel(
            "yagsl-configurator",
            "YAGSL Configurator",
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );
        const document = (new DOMParser).parseFromString(fs.readFileSync(index, "utf-8"), "text/html");
        function replacer(tag: string, property: string) {
            document.querySelectorAll(`${tag}[${property}]`).forEach(script => {
                const src = script.getAttribute(property);
                if (src === null) return;
                script.setAttribute(property, view.webview.asWebviewUri(vscode.Uri.file(path.join(webview_root, src))).toString());
            });
        }
        replacer("script", "src");
        replacer("link", "href");
        const script = document.createElement("script");
        script.innerHTML = `const int = setInterval(()=>{const el = document.getElementById("_defaultStyles");if(el){clearInterval(int);el.remove()}},1000)`;
        document.body.appendChild(script);
        view.onDidDispose(() => {
            curView = undefined;
        });
        view.webview.html = document.documentElement.outerHTML;
        curView = view;
    }


    context.subscriptions.push(command);
}

export function deactivate() { }
