import { test, expect } from '@playwright/test';

test.describe('Foundation Phase Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Analogy Game Facilitator/);
  });

  test('Alpine.js initializes and renders loading screen', async ({ page }) => {
    // Check that the loading screen is visible initially
    await expect(page.locator('[x-show="loading"]')).toBeVisible();
    
    // Wait for Alpine.js to initialize (loading should become false)
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible', timeout: 10000 });
    
    // Check that main application is now visible
    await expect(page.locator('[x-show="!loading"]')).toBeVisible();
    await expect(page.locator('[x-show="loading"]')).not.toBeVisible();
  });

  test('header renders correctly with application title', async ({ page }) => {
    await page.waitForSelector('header', { state: 'visible' });
    
    await expect(page.locator('h1')).toContainText('Analogy Game Facilitator');
    await expect(page.locator('header p').first()).toContainText('Het Ren-Je-Rot-Analogie-Verkenner-spel');
  });

  test('phase navigation renders all 3 phases', async ({ page }) => {
    await page.waitForSelector('nav', { state: 'visible' });
    
    // Should have 3 phase buttons
    const phaseButtons = page.locator('nav button[x-text*="Phase"]');
    await expect(phaseButtons).toHaveCount(3);
    
    // Check each phase button text
    await expect(phaseButtons.nth(0)).toContainText('Phase 1');
    await expect(phaseButtons.nth(1)).toContainText('Phase 2');
    await expect(phaseButtons.nth(2)).toContainText('Phase 3');
  });

  test('phase navigation is functional', async ({ page }) => {
    await page.waitForSelector('nav', { state: 'visible' });
    
    // Phase 1 should be active by default
    const phase1Button = page.locator('nav button', { hasText: 'Phase 1' });
    await expect(phase1Button).toHaveClass(/bg-primary-600/);
    
    // Click Phase 2 and verify it becomes active
    const phase2Button = page.locator('nav button', { hasText: 'Phase 2' });
    await phase2Button.click();
    await expect(phase2Button).toHaveClass(/bg-primary-600/);
    await expect(phase1Button).not.toHaveClass(/bg-primary-600/);
    
    // Verify phase content changes
    await expect(page.locator('[x-show="currentPhase === 2"]').first()).toBeVisible();
    await expect(page.locator('[x-show="currentPhase === 1"]').first()).not.toBeVisible();
  });

  test('utility buttons render correctly', async ({ page }) => {
    await page.waitForSelector('header', { state: 'visible' });
    
    // Check for key utility buttons
    await expect(page.locator('button', { hasText: 'Present' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Settings' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Export' })).toBeVisible();
  });

  test('presentation mode toggle works', async ({ page }) => {
    await page.waitForSelector('header', { state: 'visible' });
    
    const presentButton = page.locator('button', { hasText: 'Present' });
    const controlPanel = page.locator('.control-panel');
    
    // Initially should show control panel
    await expect(controlPanel).toBeVisible();
    await expect(presentButton).toContainText('Present');
    
    // Toggle to presentation mode
    await presentButton.click();
    await expect(presentButton).toContainText('Control');
    
    // In presentation mode, control panel should be hidden (on large screens)
    // We test the class change since CSS media query handling depends on viewport
    await expect(page.locator('main')).toHaveClass(/presentation-mode/);
  });

  test('settings modal opens and closes', async ({ page }) => {
    await page.waitForSelector('header', { state: 'visible' });
    
    const settingsButton = page.locator('button', { hasText: 'Settings' });
    const modal = page.locator('[x-show="showSessionModal"]');
    
    // Modal should be hidden initially
    await expect(modal).not.toBeVisible();
    
    // Click settings button to open modal
    await settingsButton.click();
    await expect(modal).toBeVisible();
    await expect(modal.locator('h2')).toContainText('Session Settings');
    
    // Close modal with cancel button
    await modal.locator('button', { hasText: 'Cancel' }).click();
    await expect(modal).not.toBeVisible();
  });

  test('export modal opens and shows format options', async ({ page }) => {
    await page.waitForSelector('header', { state: 'visible' });
    
    const exportButton = page.locator('button', { hasText: 'Export' });
    await exportButton.click();
    
    // Wait for export modal to appear
    const exportModal = page.locator('[x-show="showExportModal"]');
    await expect(exportModal).toBeVisible();
    await expect(exportModal.locator('h2')).toContainText('Export Session');
    
    // Check export format options
    await expect(exportModal.locator('button', { hasText: 'JSON Data' })).toBeVisible();
    await expect(exportModal.locator('button', { hasText: 'Markdown Report' })).toBeVisible();
  });

  test('control panel renders phase-specific content', async ({ page }) => {
    await page.waitForSelector('.control-panel', { state: 'visible' });
    
    // Phase 1 controls should be visible by default
    const phase1Controls = page.locator('[x-show="currentPhase === 1"]').first();
    await expect(phase1Controls).toBeVisible();
    
    // Should show timer controls (only Start Round and Reset are visible in ready state)
    await expect(page.locator('button', { hasText: 'Start Round' })).toBeVisible();
    await expect(page.locator('button[title="Reset timer (emergency use)"]')).toBeVisible();
    // Note: Pause button only appears during countdown phase
    
    // Navigate to Phase 2 and check controls change
    await page.locator('nav button', { hasText: 'Phase 2' }).click();
    const phase2Controls = page.locator('[x-show="currentPhase === 2"]').first();
    await expect(phase2Controls).toBeVisible();
    await expect(phase1Controls).not.toBeVisible();
  });

  test('main content area displays phase-specific content', async ({ page }) => {
    await page.waitForSelector('main', { state: 'visible' });
    
    // Phase 1 content should be visible by default
    const phase1Content = page.locator('section [x-show="currentPhase === 1"]');
    await expect(phase1Content).toBeVisible();
    
    // Navigate to different phases and verify content changes
    for (let phase = 2; phase <= 3; phase++) {
      await page.locator('nav button', { hasText: `Phase ${phase}` }).click();
      
      const currentPhaseContent = page.locator(`section [x-show="currentPhase === ${phase}"]`);
      const previousPhaseContent = page.locator(`section [x-show="currentPhase === ${phase - 1}"]`);
      
      await expect(currentPhaseContent).toBeVisible();
      await expect(previousPhaseContent).not.toBeVisible();
    }
  });

  test('responsive design elements are present', async ({ page }) => {
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Test for responsive CSS classes
    await expect(page.locator('html')).toHaveClass(/h-full/);
    await expect(page.locator('body')).toHaveClass(/h-full/);
    
    // Check for responsive navigation
    await expect(page.locator('nav')).toHaveClass(/flex/);
    
    // Check for flex layout classes that are actually present
    await expect(page.locator('main')).toHaveClass(/flex/);
    await expect(page.locator('.control-panel')).toHaveClass(/w-80/);
  });

  test('auto-save status indicator is present', async ({ page }) => {
    await page.waitForSelector('.control-panel', { state: 'visible' });
    
    // Check for save status in control panel footer
    const saveStatus = page.locator('[x-text="saveStatus"]');
    await expect(saveStatus).toBeVisible();
    
    // Check for auto-save label
    await expect(page.locator('text=Auto-save')).toBeVisible();
  });

  test('custom CSS styles are loaded', async ({ page }) => {
    // Check that custom styles.css is loaded
    const styleSheet = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      return links.some(link => link.href.includes('styles.css'));
    });
    expect(styleSheet).toBe(true);
    
    // Check for custom Tailwind configuration
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--tw-color-primary-600') || 
             window.tailwind?.config?.theme?.extend?.colors?.primary?.['600'];
    });
    // Primary color should be defined (either as CSS var or in Tailwind config)
    expect(primaryColor).toBeTruthy();
  });
});