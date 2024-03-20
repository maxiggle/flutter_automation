const wdio = require('webdriverio');
const assert = require('assert');
const find = require('appium-flutter-finder');

const platformCapability =
  process.env.APPIUM_OS === 'android'
    ? {
        'appium:platformName': 'Android',
        'appium:deviceName': 'SM_A225F',
        // @todo support non-unix style path
        'appium:app': __dirname + '/apps/android-real-debug.apk' // download local to run faster and save bandwith
        // app: 'https://github.com/truongsinh/appium-flutter-driver/releases/download/v0.0.4/android-real-debug.apk',
      }
    : process.env.APPIUM_OS === 'ios'
    ? {
        'appium:platformName': 'iOS',
        'appium:platformVersion': '15.5',
        'appium:deviceName': 'iPhone 13',
        'appium:connectionRetryTimeout': 60000,
        'appium:noReset': true,
        'appium:app': __dirname + '/../../apps/ios-sim-debug.zip' // download local to run faster and save bandwith
        // app: 'https://github.com/truongsinh/appium-flutter-driver/releases/download/v0.0.4/ios-sim-debug.zip',
      }
    : {};

const opts = {
  port: 4723,
  path: '/',
  capabilities: {
    ...platformCapability,
    'appium:automationName': 'Flutter'
  }
};

(async () => {
  const titleFinder = find.byValueKey('title');
  const textFieldFinder1 = find.byValueKey('textfield1');
  const textFieldFinder2 = find.byValueKey('textfield2');
  const buttonFinder = find.byValueKey('button');
//   await driver.action('pointer',{parameters:{pointerType: 'touch'},action: 'pointerDown', button: 1, id: buttonFinder}).perform();
  const driver = await wdio.remote(opts);
  assert.strictEqual(await driver.execute('flutter:checkHealth'), 'ok');
  await driver.execute('flutter:clearTimeline');
  await driver.execute('flutter:forceGC');

  const renderObjectDiagnostics = await driver.execute(
    'flutter:getRenderObjectDiagnostics',
    counterTextFinder,
    { includeProperties: true, subtreeDepth: 2 }
  );
  assert.strictEqual(renderObjectDiagnostics.type, 'DiagnosticableTreeNode');
  assert.strictEqual(renderObjectDiagnostics.children.length, 1);

  const semanticsId = await driver.execute(
    'flutter:getSemanticsId',
    counterTextFinder
  );
  assert.strictEqual(semanticsId, 4);

  const treeString = await driver.execute('flutter: getRenderTree');
  assert.strictEqual(treeString.substr(0, 11), 'RenderView#');

  await driver.switchContext('NATIVE_APP');
  await driver.saveScreenshot('./native-screenshot.png');
  await driver.switchContext('FLUTTER');
  await driver.saveScreenshot('./flutter-screenshot.png');

  assert.strictEqual(await driver.getElementText(textFieldFinder1), '');
  await driver.action('pointer').down({ button: textFieldFinder1}).perform();

  //click on textFieldFinder1 and type a value

  await driver.action('pointer').down({ button: buttonFinder}).perform();

  await driver.action('pointer').up({ button: buttonFinder}).perform(true);
  

//   await driver.action('pointer', {
//     parameters: {
//       pointerType: 'touch'
//     },
//     action: 'pointerUp',
//     button: 1,
//     id: buttonFinder
//   }).perform();

 

})