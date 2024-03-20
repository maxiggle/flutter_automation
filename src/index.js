// import * as wdio from 'webdriverio';
// import * as assert from 'assert';
const wdio = require('webdriverio');
const assert = require('assert');
const find = require('appium-flutter-finder');

const osSpecificOps =
  process.env.APPIUM_OS === 'android'
    ? {
        'appium:platformName': 'Android',
        'appium:deviceName': 'SM_A225F',
        'appium:app': __dirname + '/apps/app-debug.apk' // download local to run faster and save bandwith
      }
    : process.env.APPIUM_OS === 'ios'
    ? {
        'appium:platformName': 'iOS',
        'appium:platformVersion': '15.5',
        'appium:deviceName': 'iPhone 13',
        'appium:connectionRetryTimeout': 60000,
        'appium:noReset': true,
        'appium:app': __dirname + '/../../apps/ios-sim-debug.zip'
      }
    : {};

const opts = {
  port: 4723,
  path: '/',
  capabilities: {
    ...osSpecificOps,
    'appium:automationName': 'Flutter'
  }
};

(async () => {
  const textFieldFinder1 = find.byValueKey('field1');
  const textFieldFinder2 = find.byValueKey('field2');
  const button = find.byValueKey('button');

  const driver = await wdio.remote(opts);

  assert.strictEqual(await driver.execute('flutter:checkHealth'), 'ok');
  await driver.execute('flutter:clearTimeline');
  await driver.execute('flutter:forceGC');
  // const treeString = await driver.execute('flutter: getRenderTree');

  //change context to switch to Native context 
  await driver.switchContext('NATIVE_APP');

   //change context to switch to flutter context
  await driver.switchContext('FLUTTER');
  
  ///click textfield with keyValue [field1]
  await driver.elementClick(textFieldFinder1);
  ///Enter texts into textfield with keyValue [field1]
  await driver.elementSendKeys(textFieldFinder1, 'geffy');

  ///Take a screenshot 
  await driver.saveScreenshot('./flutter-sendKeys.png');
  ///Assert that the value entered matches the value in the textfield
  assert.strictEqual( await driver.getElementText(find.byText('geffy')), 'geffy');

  ///click textfield with keyValue [field2]
  await driver.elementClick(textFieldFinder2);
  ///Enter texts into textfield with keyValue [field2]
  await driver.elementSendKeys(textFieldFinder2, 'password');
  ///save screenshot
  await driver.saveScreenshot('./flutter-sendKeys1.png');
  ///Assert that the value entered matches the value in the textfield
  assert.strictEqual(await driver.getElementText(find.byText('password')), 'password');

//   actions: [
//     {
//       id: 'action1',
//       type: 'pointer',
//       parameters: [Object],
//       actions: [Array]
//     }
//   ]
// }

// await driver.action('pointer', {
//   parameters: [
//     {
//       pointerType: 'touch'
//     }
//   ],
//   action: 'down',
//   button: 1,
//   id: button
// }).down();


  //Long Press using TouchAction with wait
  await driver.touchAction([
    {
     action: 'longPress',
     element: { elementId: button }
    },
    {
     action: 'wait',
     ms: 10000
    },
    {
     action: 'release'
    }
  ]);

  
  let firstWaitForAbsentError;
  try {
    await driver.execute('flutter:waitForAbsent', button );
  } catch(e) {
    firstWaitForAbsentError = e;
  } finally {
    // @todo
    assert.strictEqual( await driver.getElementText(find.byText('Code Smell')), 'Code Smell'); 
  }
  driver.deleteSession();
})();

