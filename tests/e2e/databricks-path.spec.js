// @ts-check
const { test, expect } = require('@playwright/test');

// Lakehouse scenario — every answer points at the data platform:
// q1e (data platform team), q8c (broad internal), q2e (data/analytics environment),
// q4f (reason over enterprise data), q3g (lakehouse / Unity Catalog)
const LAKEHOUSE_PARAMS =
  'q1=q1e&q8=q8c&q2=q2e&q4=q4f&q3=q3g&r=databricks&d=20260728&mode=card';

// Same lakehouse builder, but the knowledge lives in Microsoft 365 — Agent Bricks
// has no grounding path there, so its hard rule must fire.
const M365_CONTENT_PARAMS =
  'q1=q1e&q8=q8c&q2=q2e&q4=q4f&q3=q3a&r=copilot_studio&d=20260728&mode=card';

// Lakehouse data, but the agent must live inside Microsoft 365 Copilot chat —
// Agent Bricks cannot publish there.
const M365_SURFACE_PARAMS =
  'q1=q1e&q8=q8c&q2=q2a&q4=q4f&q3=q3g&r=foundry&d=20260728&mode=card';

// Locates the score-breakdown row for a platform by its visible name.
const scoreRow = (page, name) =>
  page.locator('.sc-row').filter({ has: page.locator('.sc-name', { hasText: name }) });

test.describe('Databricks Agent Bricks', () => {
  test('appears on the welcome screen under Build agents', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#welcome-section')).toBeVisible();
    await expect(
      page.locator('.platform-preview-title', { hasText: 'Databricks Agent Bricks' })
    ).toBeVisible();
  });

  test('appears in the Build agents exploration group', async ({ page }) => {
    await page.goto('/');
    await page.locator('#start-btn').click();
    await page.locator('#prescreen-explore').click();
    await expect(page.locator('#exploration-section')).toBeVisible();

    const buildGroup = page.locator('.exploration-section-group').filter({
      has: page.locator('.exploration-group-title', { hasText: 'Build agents' }),
    });
    await expect(
      buildGroup.locator('.exploration-card-title', { hasText: 'Databricks Agent Bricks' })
    ).toBeVisible();
    await expect(buildGroup.locator('.exploration-card')).toHaveCount(4);
  });

  test('wins the lakehouse scenario with a strong fit', async ({ page }) => {
    await page.goto(`/?${LAKEHOUSE_PARAMS}`);
    await expect(page.locator('#recommendation-section')).toBeVisible();

    const primary = page.locator('#rec-primary-card .rec-card');
    await expect(primary.locator('.rec-platform-name')).toContainText('Databricks Agent Bricks');
    await expect(primary.locator('.rec-badge')).toContainText('Strong fit');
  });

  test('is disqualified when the knowledge lives in Microsoft 365', async ({ page }) => {
    await page.goto(`/?${M365_CONTENT_PARAMS}`);
    await expect(page.locator('#recommendation-section')).toBeVisible();

    const primary = page.locator('#rec-primary-card .rec-card');
    await expect(primary.locator('.rec-platform-name')).not.toContainText('Databricks');

    const row = scoreRow(page, 'Databricks Agent Bricks');
    await expect(row.locator('.sc-score')).toHaveText('0/15');
    await expect(row.locator('.sc-reason')).toContainText('Microsoft 365 content');
  });

  test('is disqualified when the agent must run inside Microsoft 365 Copilot chat', async ({ page }) => {
    await page.goto(`/?${M365_SURFACE_PARAMS}`);
    await expect(page.locator('#recommendation-section')).toBeVisible();

    const row = scoreRow(page, 'Databricks Agent Bricks');
    await expect(row.locator('.sc-score')).toHaveText('0/15');
    await expect(row.locator('.sc-reason')).toContainText('Microsoft 365 Copilot');

    // The contradiction between lakehouse data and Copilot-chat deployment is explained.
    await expect(page.locator('#rec-cross-notes')).toContainText('no native Microsoft 365 Copilot publishing path');
  });

  test('the new data-platform answers are selectable in the wizard', async ({ page }) => {
    await page.goto('/');
    await page.locator('#start-btn').click();
    await page.locator('#prescreen-no').click();
    await expect(page.locator('#assessment-section')).toBeVisible();

    // q1 — data platform team is the last option
    const options = page.locator('#options-list .option-card');
    await expect(options).toHaveCount(5);
    await options.last().click();
    await expect(options.last()).toHaveClass(/selected/);
    await page.locator('#next-btn').click();

    // q8 — audience (unchanged, 4 options)
    await expect(options).toHaveCount(4);
    await options.nth(1).click();
    await page.locator('#next-btn').click();

    // q2 — data and analytics environment is the new last option
    await expect(options).toHaveCount(5);
    await options.last().click();
    await page.locator('#next-btn').click();

    // q4 — reasoning over enterprise data is the new last option
    await expect(options).toHaveCount(6);
    await options.last().click();
    await page.locator('#next-btn').click();

    // q3 — lakehouse is the new last option
    await expect(options).toHaveCount(7);
    await options.last().click();
    await page.locator('#next-btn').click();

    await expect(page.locator('#recommendation-section')).toBeVisible();
    await expect(page.locator('#rec-primary-card .rec-platform-name'))
      .toContainText('Databricks Agent Bricks');
  });
});
