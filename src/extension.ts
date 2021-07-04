import {LanguageClient, LanguageClientOptions} from "vscode-languageclient/node"
import {commands, Disposable, DocumentFilter, DocumentSelector, ExtensionContext, languages} from 'vscode';
import {InfoProvider} from './infoProvider'

let client: LanguageClient;

export function activate(context: ExtensionContext) 
{
    const executable = {
        command: 'tnt-language-server',
        args: [],
    }
    
    const serverOptions = {
        run: executable,
        debug: executable,
    }

    const clientOptions : LanguageClientOptions = {
        documentSelector: [{
            scheme : 'file',
            language: 'TNT'
        }],
    }
    client = new LanguageClient(
        'tnt-language-server',
        'TntLanguageServer',
        serverOptions,
        clientOptions
    )
    
    client.start()
      
    let infoProvider : InfoProvider = new InfoProvider(client, context);
    let restartServerCommand : Disposable = commands.registerCommand("tnt.restartLSP", async () => {
          await client.stop();
          client.start();
    });
    context.subscriptions.push(infoProvider);
    context.subscriptions.push(restartServerCommand);
}

export function deactivate(context : ExtensionContext) : Thenable<void> | undefined {
	
    for (const s of context.subscriptions) { s.dispose(); }
	return client.stop();
}