import { device, element, by, expect } from 'detox';

describe('Login Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen on startup', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should show error on wrong credentials', async () => {
    await element(by.id('email-input')).typeText('wrong@test.com');
    await element(by.id('password-input')).typeText('wrongpass');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('login-error'))).toBeVisible();
  });
});
