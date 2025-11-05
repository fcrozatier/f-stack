import { expect, test } from "playwright/test";

test("classlist sink", async ({ page }) => {
  await page.goto("http://localhost:8000/classlist/index.html");

  const button = page.getByRole("button");
  const output = page.getByTestId("output");

  await expect(output).toHaveClass("selected");

  await button.click();
  await expect(output).not.toHaveClass("selected");
  await expect(output).toHaveClass("rounded opacity-0");

  await button.click();
  await expect(output).toHaveClass("selected");
  await expect(output).not.toHaveClass("rounded opacity-0");
});
