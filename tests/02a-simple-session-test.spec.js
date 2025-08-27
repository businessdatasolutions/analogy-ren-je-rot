import { test, expect } from '@playwright/test';

test.describe('Simple Session Tests', () => {
  test('application loads and LocalForage is available', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page).toHaveTitle(/Analogy Game Facilitator/);
    
    // Check that LocalForage is loaded
    const localForageExists = await page.evaluate(() => {
      return typeof window.localforage !== 'undefined';
    });
    
    expect(localForageExists).toBe(true);
    
    // Check that Alpine is loaded
    const alpineExists = await page.evaluate(() => {
      return typeof window.Alpine !== 'undefined';
    });
    
    expect(alpineExists).toBe(true);
  });

  test('session object is created with proper structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for Alpine to initialize
    await page.waitForTimeout(2000);
    
    // Check session structure
    const sessionData = await page.evaluate(() => {
      const appElement = document.querySelector('[x-data="gameApp"]');
      if (appElement && appElement._x_dataStack && appElement._x_dataStack[0]) {
        const app = appElement._x_dataStack[0];
        return {
          hasSession: !!app.session,
          hasId: !!app.session?.id,
          hasPhase1: !!app.phase1,
          hasPhase2: !!app.phase2,
          hasPhase3: !!app.phase3,
          hasPhase4: !!app.phase4,
          currentPhase: app.currentPhase
        };
      }
      return { error: 'Could not access app data' };
    });
    
    expect(sessionData.hasSession).toBe(true);
    expect(sessionData.hasId).toBe(true);
    expect(sessionData.hasPhase1).toBe(true);
    expect(sessionData.hasPhase2).toBe(true);
    expect(sessionData.hasPhase3).toBe(true);
    expect(sessionData.hasPhase4).toBe(true);
    expect(sessionData.currentPhase).toBe(1);
  });

  test('basic save functionality works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Try to save data to LocalForage manually
    const saveResult = await page.evaluate(async () => {
      try {
        await window.localforage.setItem('test-key', { test: 'data' });
        const retrieved = await window.localforage.getItem('test-key');
        return { success: true, data: retrieved };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(saveResult.success).toBe(true);
    expect(saveResult.data.test).toBe('data');
  });

  test('phase navigation works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check initial phase
    const initialPhase = await page.evaluate(() => {
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      return app.currentPhase;
    });
    
    expect(initialPhase).toBe(1);
    
    // Navigate to Phase 2
    await page.click('nav button:has-text("Phase 2")');
    await page.waitForTimeout(500);
    
    const newPhase = await page.evaluate(() => {
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      return app.currentPhase;
    });
    
    expect(newPhase).toBe(2);
  });

  test('data persistence basic test', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Set some test data and verify it's saved
    const saveResult = await page.evaluate(async () => {
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      
      // Set test data
      app.phase2.patterns = 'test patterns';
      app.phase2.archetype = 'test archetype';
      
      // Update session and save
      app.updateSessionFromPhaseData();
      await app.saveSession();
      
      // Verify it was saved to LocalForage
      const savedSession = await window.localforage.getItem('current-session');
      
      return {
        phase2Patterns: app.phase2.patterns,
        sessionPatterns: app.session.phase2.patterns,
        savedPatterns: savedSession?.phase2?.patterns,
        savedArchetype: savedSession?.phase2?.archetype
      };
    });
    
    // Verify data was set and saved correctly
    expect(saveResult.phase2Patterns).toBe('test patterns');
    expect(saveResult.sessionPatterns).toBe('test patterns');
    expect(saveResult.savedPatterns).toBe('test patterns');
    expect(saveResult.savedArchetype).toBe('test archetype');
    
    // Reload and check if data persists
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give more time for initialization
    
    const persistedData = await page.evaluate(() => {
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      return {
        patterns: app.phase2.patterns,
        archetype: app.phase2.archetype,
        sessionPatterns: app.session.phase2.patterns,
        sessionArchetype: app.session.phase2.archetype
      };
    });
    
    expect(persistedData.patterns).toBe('test patterns');
    expect(persistedData.archetype).toBe('test archetype');
    expect(persistedData.sessionPatterns).toBe('test patterns');
    expect(persistedData.sessionArchetype).toBe('test archetype');
  });
});