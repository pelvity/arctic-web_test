import { test, expect } from '@playwright/test';

test.describe('Tag Filtering E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/en');
    });

    test('should fetch and filter by newly created tags', async ({ page }) => {
        const uniqueTag = `e2e-tag-${Date.now()}`;
        const uniqueTitle = `E2E Tag Snippet ${Date.now()}`;

        // 1. Create a snippet with a unique tag
        await page.click('text=Add New');
        await expect(page).toHaveURL(/.*\/snippets\/new/);

        await page.fill('input[placeholder="e.g., Setup Docker Compose"]', uniqueTitle);
        await page.fill('textarea', 'This is a test snippet for tag filtering.');
        await page.fill('input[placeholder="e.g., devops, database (press Enter)"]', uniqueTag);
        await page.keyboard.press('Enter');

        // Save and wait for redirect to snippet detail page
        await page.click('button.bg-blue-600');
        await page.waitForURL(/\/snippets\/[a-f0-9]{24}/);

        // Navigate back to Home
        await page.click('text=Back to Vault');
        await page.waitForURL(/\/(en|uk|ua)?$/);

        // 2. Verify the tag appears on the home page filter list
        // Note: We use exact text match or locator filters since tags can be many
        const tagFilterBtn = page.locator('button', { hasText: `#${uniqueTag}` });
        await expect(tagFilterBtn).toBeVisible({ timeout: 5000 });

        // 3. Click the tag to filter and verify the snippet is shown
        await tagFilterBtn.click();

        // Wait for the list to update with SWR by checking the title is still there
        // Actually, searching for the snippet card
        const snippetCardTitle = page.locator(`text="${uniqueTitle}"`);
        await expect(snippetCardTitle).toBeVisible();

        // 4. Click 'All Tags' to clear the filter
        const allTagsBtn = page.locator('button', { hasText: 'All Tags' });
        await allTagsBtn.click();

        // 5. Clean up: Delete the snippet
        await page.click(`text="${uniqueTitle}"`);
        const deleteBtnDetail = page.locator('main button').filter({ has: page.locator('.lucide-trash2') });
        await deleteBtnDetail.click();

        // Confirm delete modal button
        const confirmBtn = page.locator('button:has-text("Confirm")');
        await confirmBtn.click();
        await page.waitForURL(/\/en/);
    });
});
