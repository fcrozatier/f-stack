import { expect, test } from "playwright/test";

test("prop", async ({ page }) => {
  await page.goto("http://localhost:8000/prop/index.html");

  const button = page.getByRole("button");
  const checkbox = page.getByRole("checkbox");

  await expect(checkbox).toHaveJSProperty("indeterminate", true);

  await button.click();
  await expect(checkbox).toHaveJSProperty("indeterminate", false);

  await button.click();
  await expect(checkbox).toHaveJSProperty("indeterminate", true);
});
