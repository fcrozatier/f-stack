import { expect, test } from "playwright/test";

test("map", async ({ page }) => {
  await page.goto("http://localhost:8000/map/index.html");

  const button = page.getByRole("button");
  const ul = page.getByRole("list");
  const lis = ul.locator("li");

  await expect(lis).toHaveCount(3);
  await expect(lis.nth(0)).toHaveText("0:0");
  await expect(lis.nth(1)).toHaveText("1:1");
  await expect(lis.nth(2)).toHaveText("2:2");

  await button.click();
  await expect(lis).toHaveCount(4);
  await expect(lis.nth(3)).toHaveText("3:3");

  await button.click();
  await expect(lis).toHaveCount(5);
  await expect(lis.nth(4)).toHaveText("4:4");
});
