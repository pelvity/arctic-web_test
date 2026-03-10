import { test, expect } from '@playwright/test';

test.describe('Undo Functionality E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/en');
    });

    test('should undo snippet creation', async ({ page }) => {
        const title = `Undo Create ${Date.now()}`;

        // 1. Create Snippet
        await page.click('text=Add New');
        await page.fill('input[placeholder="e.g., Setup Docker Compose"]', title);
        await page.fill('textarea', 'Undo this creation');
        await page.click('button.bg-blue-600');
        await page.waitForURL(/\/snippets\/[a-f0-9]{24}/);

        // 2. Open History and Undo
        await page.click('button[title="Action History"]');
        await page.click('div:has-text("CREATE") + div + button:has-text("Undo")');

        // 3. Verify it's gone from Home
        await page.waitForURL(/\/en$/);
        await page.fill('input[placeholder="Search snippets..."]', title);
        await expect(page.locator(`h3:has-text("${title}")`)).toHaveCount(0);
    });

    test('should undo snippet deletion', async ({ page }) => {
        const title = `Undo Delete ${Date.now()}`;

        // 1. Create Snippet
        await page.click('text=Add New');
        await page.fill('input[placeholder="e.g., Setup Docker Compose"]', title);
        await page.fill('textarea', 'Undo this deletion');
        await page.click('button.bg-blue-600');
        await page.waitForURL(/\/snippets\/[a-f0-9]{24}/);

        // 2. Delete it
        // Narrow down to the button in the snippet detail card specifically, not history log
        const deleteButton = page.locator('main button:has(.lucide-trash2)');
        await deleteButton.scrollIntoViewIfNeeded();
        await deleteButton.click();
        await page.click('button:has-text("Confirm")');
        await page.waitForURL(/\/en$/);

        // 3. Open History and Undo
        await page.click('button[title="Action History"]');
        await page.click('div:has-text("DELETE") + div + button:has-text("Undo")');

        // 4. Verify it's back
        await page.waitForURL(/\/en$/);
        await page.fill('input[placeholder="Search snippets..."]', title);
        await expect(page.locator(`h3:has-text("${title}")`)).toBeVisible();
    });

    test('should undo snippet update', async ({ page }) => {
        const title = `Undo Update ${Date.now()}`;
        const updatedTitle = `${title} (Updated)`;

        // 1. Create Snippet
        await page.click('text=Add New');
        await page.fill('input[placeholder="e.g., Setup Docker Compose"]', title);
        await page.fill('textarea', 'Original Content');
        await page.click('button.bg-blue-600');
        await page.waitForURL(/\/snippets\/[a-f0-9]{24}/);

        // 2. Edit Snippet
        await page.click('text=Edit');
        await page.fill('input[placeholder="e.g., Setup Docker Compose"]', updatedTitle);
        await page.click('button.bg-blue-600');
        await page.waitForURL(/\/snippets\/[a-f0-9]{24}/);
        await expect(page.locator(`h3:has-text("${updatedTitle}")`)).toBeVisible();

        // 3. Open History and Undo
        await page.click('button[title="Action History"]');
        await page.click('div:has-text("UPDATE") + div + button:has-text("Undo")');

        // 4. Verify original title is back
        await page.waitForURL(/\/snippets\/[a-f0-9]{24}/);
        await expect(page.locator(`h3:has-text("${title}")`)).toBeVisible();
        await expect(page.locator(`h3:has-text("${updatedTitle}")`)).toHaveCount(0);
    });
});
