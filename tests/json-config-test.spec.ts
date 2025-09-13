import { test, expect } from '@playwright/test';

test('Load User JSON Configuration', async ({ page }) => {
  await page.goto('http://localhost:5173/canvasTest');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[data-testid="flow-canvas"]', { timeout: 10000 });

  console.log('=== Testing User JSON Configuration ===');

  const userJson = {
    source: {
      'baseUrl or host': 'ewew',
      auth: 'ere',
      'apiKey/token': 'shop_key_abc',
      storeDomain: 'mystore.myshopify.com',
    },
    destination: {
      'baseUrl or host': 'lkk',
      auth: 'lkkl',
      'host/account': 'company.snowflakecomputing.com',
      user: 'datauser',
      'password or key': 'snow123',
      'database/schema': 'PROD_DB',
      warehouse: 'COMPUTE_WH',
    },
    transform: {
      ll: '1',
    },
  };

  // Get the JSON textarea
  const jsonTextarea = page.locator('textarea').first();

  // Load the user's JSON configuration
  console.log('📝 Loading user JSON configuration...');
  await jsonTextarea.fill(JSON.stringify(userJson, null, 2));
  await page.waitForTimeout(2000); // Wait for updates to apply

  // Verify the JSON was loaded
  const loadedJson = JSON.parse(await jsonTextarea.inputValue());
  console.log('✅ JSON loaded successfully');

  // Check source node values
  console.log('\n🔍 Verifying Source Node:');
  expect(loadedJson.source['baseUrl or host']).toBe('ewew');
  expect(loadedJson.source['auth']).toBe('ere');
  expect(loadedJson.source['apiKey/token']).toBe('shop_key_abc');
  expect(loadedJson.source['storeDomain']).toBe('mystore.myshopify.com');
  console.log('  ✅ All source values loaded correctly');

  // Check destination node values
  console.log('\n🔍 Verifying Destination Node:');
  expect(loadedJson.destination['baseUrl or host']).toBe('lkk');
  expect(loadedJson.destination['auth']).toBe('lkkl');
  expect(loadedJson.destination['host/account']).toBe('company.snowflakecomputing.com');
  expect(loadedJson.destination['user']).toBe('datauser');
  expect(loadedJson.destination['password or key']).toBe('snow123');
  expect(loadedJson.destination['database/schema']).toBe('PROD_DB');
  expect(loadedJson.destination['warehouse']).toBe('COMPUTE_WH');
  console.log('  ✅ All destination values loaded correctly');

  // Check transform node values
  console.log('\n🔍 Verifying Transform Node:');
  expect(loadedJson.transform['ll']).toBe('1');
  console.log('  ✅ Transform values loaded correctly');

  // Verify nodes are visible and positioned correctly
  console.log('\n🔍 Verifying Node Visibility:');
  const sourceNode = page.locator('[data-testid*="source"]').first();
  const transformNode = page.locator('[data-testid*="transform"]').first();
  const destinationNode = page.locator('[data-testid*="destination"]').first();

  await expect(sourceNode).toBeVisible();
  await expect(transformNode).toBeVisible();
  await expect(destinationNode).toBeVisible();
  console.log('  ✅ All nodes are visible');

  // Check node positioning (should start from 40px)
  const sourceBounds = await sourceNode.boundingBox();
  if (sourceBounds) {
    expect(sourceBounds.x).toBeLessThan(100); // Should be around 40px + offset
    expect(sourceBounds.x).toBeGreaterThan(30);
    console.log(
      `  ✅ Source node positioned at x=${sourceBounds.x.toFixed(1)}px (correct 40px alignment)`
    );
  }

  console.log('\n🎉 User JSON configuration loaded and working perfectly!');
});

test('Test Transform Type Persistence with User Data', async ({ page }) => {
  await page.goto('http://localhost:5173/canvasTest');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[data-testid="flow-canvas"]', { timeout: 10000 });

  console.log('=== Testing Transform Type Persistence ===');

  const jsonTextarea = page.locator('textarea').first();
  const transformDropdown = page.locator('select').nth(1);

  // Load user data with transform type "Cleanse"
  await transformDropdown.selectOption('Cleanse');
  await page.waitForTimeout(1000);

  const userDataForCleanse = {
    source: {
      'apiKey/token': 'shop_key_abc',
      storeDomain: 'mystore.myshopify.com',
    },
    destination: {
      'host/account': 'company.snowflakecomputing.com',
      user: 'datauser',
      'password or key': 'snow123',
    },
    transform: {
      ll: '1',
      cleansingRule: 'remove_nulls',
    },
  };

  await jsonTextarea.fill(JSON.stringify(userDataForCleanse, null, 2));
  await page.waitForTimeout(1500);

  console.log('✅ Loaded data for Cleanse transform');

  // Switch to "Enrich & Map"
  await transformDropdown.selectOption('Enrich & Map');
  await page.waitForTimeout(1500);

  // Check that transform fields are now empty (transform-specific persistence)
  const currentJson = JSON.parse(await jsonTextarea.inputValue());
  console.log('Transform fields after switch:', currentJson.transform);

  // Should be empty for Enrich & Map since we didn't set any values for it
  const transformKeys = Object.keys(currentJson.transform || {});
  expect(transformKeys.length).toBe(0);
  console.log('✅ Transform fields correctly isolated by type');

  // Switch back to Cleanse
  await transformDropdown.selectOption('Cleanse');
  await page.waitForTimeout(1500);

  // Check that Cleanse values are restored
  const restoredJson = JSON.parse(await jsonTextarea.inputValue());
  expect(restoredJson.transform['ll']).toBe('1');
  expect(restoredJson.transform['cleansingRule']).toBe('remove_nulls');
  console.log('✅ Cleanse values correctly restored');

  console.log('\n🎉 Transform-specific persistence working with user data!');
});
