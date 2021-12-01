import path from 'path';
import { promisify } from 'util';
import Mocha from 'mocha';
import globCb from 'glob';

const glob = promisify(globCb);

export async function run(): Promise<void> {
    // Create the mocha test
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    });

    const testsRoot = path.resolve(__dirname, '..');
    const files = await glob('**/**.test.js', { cwd: testsRoot });

    // Add files to the test suite
    console.log(`Running ${files.length} test files`);
    files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

    return new Promise(async (resolve, reject) => {
        // Run the mocha test
        mocha.run(failures => {
            if (failures > 0) {
                return reject(new Error(`${failures} tests failed.`));
            }

            resolve();
        });
    });
}
