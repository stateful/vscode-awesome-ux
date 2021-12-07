import fs from 'fs/promises';
import path from 'path';
import expect from 'expect';
import vscode from 'vscode';

import { getController, deactivate } from '../../extension';

async function getExtensionId() {
    const pkgJsonContent = await fs.readFile(path.resolve(__dirname, '..', '..', '..', 'package.json'));
    const pkgj = JSON.parse(pkgJsonContent.toString());
    return `${pkgj.publisher}.${pkgj.name}`;
}

suite('Extension Test Suite', function () {
    test('extension got activated', async () => {
        const ext = vscode.extensions.getExtension(await getExtensionId());
        expect(ext).toBeTruthy();
    });

    test('Sample test', async () => {
        const controller = await getController();
        expect(controller!['_examplePanel1']['_webview'].closed).toBe(false);
        expect(controller!['_examplePanel2']['_webview'].closed).toBe(false);
        expect(controller!['_webviewPanel'].active).toBe(true);
    });

    test('should shut down extension', async () => {
        let disposeCnt = 0;
        const controller = await getController();
        const cntListener = () => ++disposeCnt;
        controller!['_webviewPanel'].onDidDispose(cntListener);
        await deactivate();
        expect(disposeCnt).toBe(1);
    });
});
