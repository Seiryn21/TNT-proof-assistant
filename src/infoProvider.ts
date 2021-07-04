import {join} from 'path';
import { Disposable, ExtensionContext, Uri, ViewColumn, window, workspace, WebviewPanel, TextEditor} from 'vscode';
import {LanguageClient} from "vscode-languageclient/node"


export class InfoProvider implements Disposable {

    private client : LanguageClient; 
    private context : ExtensionContext;
    private webviewPanel : WebviewPanel | null = null;
    private subscriptions : Disposable[] = [];

    constructor(client : LanguageClient, context : ExtensionContext)
    {
        this.client = client;
        this.context = context;
        this.subscriptions.push(
            window.onDidChangeActiveTextEditor(async editor => {
                if(editor)
                {
                    if(editor.document.languageId == "TNT")
                    {
                        this.revealInfoview(editor)
                        const theorems = await this.client.sendRequest("getTheorems", editor.document.uri.toString());
                        if(this.webviewPanel)
                            this.webviewPanel.webview.postMessage({command : "update", data : theorems})
                    }
                }
            }),
            workspace.onDidChangeTextDocument(async event => {
                let theorems = await this.client.sendRequest("getTheorems", event.document.uri.toString());
                if(this.webviewPanel)
                    this.webviewPanel.webview.postMessage({command : "update", data : theorems})
                
            }),
            window.onDidChangeTextEditorSelection(event => {
                if(this.webviewPanel)
                    this.webviewPanel.webview.postMessage({command : "position", data : {
                        line      : event.selections[0].active.line,
                        character : event.selections[0].active.character
                    }})
            })
        )
    }

    dispose(): any {
        for (const s of this.subscriptions) { s.dispose(); }
    }

    revealInfoview(editor : TextEditor | undefined)
    {
        let column = editor && editor.viewColumn ? editor.viewColumn + 1 : ViewColumn.Two;
        if(this.webviewPanel)
           this.webviewPanel.reveal(column, true)
        else
        {
            this.webviewPanel = window.createWebviewPanel('TNT', 'TNT Assistant',
                { viewColumn: column, preserveFocus: true },
                {
                    enableFindWidget: true,
                    retainContextWhenHidden: true,
                    enableScripts: true,
                    enableCommandUris: true,
                });
            this.webviewPanel.webview.html = this.initialHtml();
            this.webviewPanel.onDidDispose(() => this.webviewPanel = null);
        }
    }

    getMediaPath(mediaFile : string)
    {
        if(this.webviewPanel)
            return this.webviewPanel.webview.asWebviewUri(
                Uri.file(join(this.context.extensionPath, 'infoview', mediaFile))).toString();
    }

    initialHtml() {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TNT</title>
          </head>
          <body>
            <div id="root"></div>
            <script src="${this.getMediaPath("infoview.js")}"></script>
          </body>
        </html>`;
      }
}