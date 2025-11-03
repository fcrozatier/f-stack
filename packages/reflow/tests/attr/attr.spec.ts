import { expect, test } from "playwright/test";

test("attr", async ({ page }) => {
  await page.goto("http://localhost:8000/attr.html");

  const green = page.getByTestId("green");
  const red = page.getByTestId("red");
  const output = page.getByTestId("span");

  await expect(output).toHaveAttribute("id", "green");

  await red.click();
  await expect(output).toHaveAttribute("id", "red");

  await green.click();
  await expect(output).toHaveAttribute("id", "green");
});
