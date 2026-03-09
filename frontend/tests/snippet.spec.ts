import { test, expect } from '@playwright/test';

test.describe('Mini Snippet Vault E2E', () => {
    // Use a unique title to avoid collisions if db isn't cleared between runs
    const uniqueTitle = `Test Snippet ${Date.now()}`;

    test('should create, search, edit, and delete a snippet', async ({ page }) => {
        // 1. Visit Home
        await page.goto('/');
        await expect(page.locator('text=Snippet Vault')).toBeVisible();

        // 2. Navigate to Create Page
        await page.click('text=New Snippet');
        await expect(page).toHaveURL(/.*\/snippets\/new/);

        // 3. Fill and Submit Form
        await page.fill('input[placeholder="e.g. Docker Compose Postgres Setup"]', uniqueTitle);
        await page.fill('textarea', 'console.log("Playwright Test");');
        await page.click('text=Command');

        // Add a Tag
        await page.fill('input[placeholder="Type tag and press Enter or comma..."]', 'e2e');
        await page.keyboard.press('Enter');

        await page.click('button:has-text("Save")');

        // 4. Verify Detail Page Redirect
        await page.waitForURL(/\/snippets\/[a-f0-9]{24}/);
        await expect(page.locator(`h3:has-text("${uniqueTitle}")`)).toBeVisible();

        // 5. Navigate back to Home and Search
        await page.click('text=Back to Vault');
        await page.fill('input[placeholder="Search snippets..."]', uniqueTitle);

        // Wait for the snippet to appear in the search results
        const snippetCard = page.locator(`h3:has-text("${uniqueTitle}")`);
        await expect(snippetCard).toBeVisible();

        // 6. Navigate to Edit Page
        await snippetCard.click();
        await page.click('text=Edit');
        await expect(page).toHaveURL(/.*\/edit/);

        // 7. Edit the snippet
        const updatedTitle = `${uniqueTitle} (Updated)`;
        await page.fill('input[placeholder="e.g. Docker Compose Postgres Setup"]', updatedTitle);
        await page.click('button:has-text("Save")');

        // 8. Verify Edit
        await page.waitForURL(/\/snippets\/[a-f0-9]{24}/);
        await expect(page.locator(`h3:has-text("${updatedTitle}")`)).toBeVisible();

        // 9. Delete the snippet
        page.on('dialog', dialog => dialog.accept());
        // Find the button with the trash icon (or destructive variant)
        await page.click('button.bg-red-600');

        // 10. Verify deletion (redirects to Home)
        await page.waitForURL(/\/$/);
        await page.fill('input[placeholder="Search snippets..."]', updatedTitle);
        await expect(page.locator(`h3:has-text("${updatedTitle}")`)).toHaveCount(0);
    });
});
