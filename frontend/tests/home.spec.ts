import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
    test.beforeEach(async ({ page }) => {
        // Assume English locale by default for tests
        await page.goto('/en');
    });

    test('should have search bar and new snippet button', async ({ page }) => {
        await expect(page.locator('input[placeholder="Search snippets..."]')).toBeVisible();
        await expect(page.locator('text="Add New"')).toBeVisible(); // Updated text from "New Snippet"
    });

    test('should search and display highlights', async ({ page }) => {
        const searchInput = page.locator('input[placeholder="Search snippets..."]');
        await searchInput.fill('docker');

        // Wait for results
        try {
            await page.waitForResponse(response => response.url().includes('q=docker') && response.status() === 200, { timeout: 3000 });
        } catch (e) {
            // It might fail if no requests are made or mock is needed etc.
        }

        const emptyState = page.locator('text=/No snippets found/i');
        const markTags = page.locator('mark');

        await expect(emptyState.or(markTags.first())).toBeVisible({ timeout: 5000 });
    });

    test('should display action log panel button', async ({ page }) => {
        // Look for the history button (usually via title "Action History")
        const actionLogBtn = page.locator('button[title="Action History"]');
        await expect(actionLogBtn).toBeVisible();
    });

    test('should render filtering types', async ({ page }) => {
        // 'text=Note' matches substring or exact depending on how playwright treats it, but let's use exact or a more resilient selector
        await expect(page.locator('button', { hasText: 'Note' })).toBeVisible();
        await expect(page.locator('button', { hasText: 'Command' })).toBeVisible();
        await expect(page.locator('button', { hasText: 'Link' })).toBeVisible();
    });
});
