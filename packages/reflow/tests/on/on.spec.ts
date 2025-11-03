import { expect, test } from "playwright/test";

test("on sink", async ({ page }) => {
  await page.goto("http://localhost:8000/on.html");

  const increment = page.getByTestId("increment");
  const decrement = page.getByTestId("decrement");
  const boost = page.getByTestId("boost");
  const output = page.getByTestId("output");

  await expect(output).toHaveText("0");

  await increment.click();
  await expect(output).toHaveText("1");

  await increment.click();
  await expect(output).toHaveText("2");

  await decrement.click();
  await expect(output).toHaveText("1");

  await boost.click();
  await expect(output).toHaveText("10");

  // once
  await boost.click();
  await expect(output).toHaveText("10");
});
