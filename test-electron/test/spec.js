const Application = require('spectron').Application;
const assert = require('assert');
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const path = require('path');

// Test utilities (replacing async-test-util)
function wait(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
}
function waitUntil(condition, timeout = 10000, interval = 50) {
    return new Promise(async function(resolve, reject) {
        const startTime = Date.now();
        while (true) {
            const result = await condition();
            if (result) { resolve(); return; }
            if (Date.now() - startTime > timeout) {
                reject(new Error('waitUntil timed out after ' + timeout + 'ms'));
                return;
            }
            await wait(interval);
        }
    });
}

describe('Application launch', function() {
    this.timeout(20000);
    let app;
    before(function() {
        this.app = new Application({
            // Your electron path can be any binary
            // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
            // But for the sake of the example we fetch it from our node_modules.
            path: electronPath,

            // Assuming you have the following directory structure

            //  |__ my project
            //     |__ ...
            //     |__ main.js
            //     |__ package.json
            //     |__ index.html
            //     |__ ...
            //     |__ test
            //        |__ spec.js  <- You are here! ~ Well you should be.

            // The following line tells spectron to look and use the main.js file
            // and the package.json located 1 level above.
            args: [path.join(__dirname, '..')]
        });
        app = this.app;
        return this.app.start();
    });

    after(function() {
        if (this.app && this.app.isRunning())
            return this.app.stop();
    });

    it('shows an initial window', async () => {
        await app.client.waitUntilWindowLoaded();
        const count = await app.client.getWindowCount();
        assert.equal(count, 2);
        // Please note that getWindowCount() will return 2 if `dev tools` are opened.
        // assert.equal(count, 2)
        await wait(500);
    });

    /*
    it('insert one hero', async () => {
        console.log('test: insert one hero');
        console.dir(await app.client.getRenderProcessLogs());
        await app.client.waitUntilWindowLoaded();
        await app.client.element('#input-name').setValue('Bob Kelso');
        await app.client.element('#input-color').setValue('blue');
        await app.client.element('#input-submit').click();

        await waitUntil(async () => {
            const foundElement = await app.client.element('.name[name="Bob Kelso"]');
            return foundElement.value;
        });
        await wait(100);
    });
    it('check if replicated to both windows', async () => {
        const window1 = app.client.windowByIndex(0);
        await waitUntil(async () => {
            const foundElement = await window1.element('.name[name="Bob Kelso"]');
            return foundElement.value;
        });

        const window2 = app.client.windowByIndex(1);
        await waitUntil(async () => {
            const foundElement = await window2.element('.name[name="Bob Kelso"]');
            return foundElement.value;
        });
        await wait(100);
    });*/
});
