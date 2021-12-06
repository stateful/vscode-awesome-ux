import expect from 'expect';
import { getController, deactivate } from '../../extension';

suite('Extension Test Suite', function () {
    test('Sample test', async () => {
        const controller = await getController();
        expect(controller!['_examplePanel1']['_webview'].closed).toBe(false)
        expect(controller!['_examplePanel2']['_webview'].closed).toBe(false)
        expect(controller!['_webviewPanel'].active).toBe(true)
    });

    test('should shut down extension', async () => {
        let disposeCnt = 0;
        const controller = await getController();
        const cntListener = () => ++disposeCnt;
        controller!['_webviewPanel'].onDidDispose(cntListener);
        await deactivate();
        expect(disposeCnt).toBe(1);
    })
});
