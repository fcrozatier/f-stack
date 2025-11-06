import { expect, test } from "playwright/test";

test("attr", async ({ page }) => {
  await page.goto("http://localhost:8000/derived/index.html");

  const increment = page.getByRole("button");
  const count = page.getByTestId("count");
  const even = page.getByTestId("even");

  await expect(count).toHaveText("0");
  await expect(even).toHaveText("true");

  await increment.click();
  await expect(count).toHaveText("1");
  await expect(even).toHaveText("false");

  await increment.click();
  await expect(count).toHaveText("2");
  await expect(even).toHaveText("true");
});
