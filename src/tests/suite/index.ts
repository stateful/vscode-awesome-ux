import path from 'path';
import Mocha from 'mocha';
import glob from 'glob';

export function run (testsRoot: string, cb: Function) {
    // Create the mocha test
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
        timeout: 60 * 1000 // 10s
    });

    const files = glob.sync('**/**.test.js', { cwd: path.dirname(testsRoot) });

    // Add files to the test suite
    console.log(`Running ${files.length} test files`);
    files.forEach(f => mocha.addFile(path.resolve(path.dirname(testsRoot), f)));

    // Run the mocha test
    mocha.run(failures => cb(null, failures));
}
