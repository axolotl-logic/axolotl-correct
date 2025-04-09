import { test, expect } from "@playwright/test";
import type { Locator, Page } from "playwright";

const MAX_CAMPAIGNS = 50;
const MAX_DEPTH = 20;

interface Transition {
  id: string;
  locate: (page: Page) => Locator;
  act: (locator: Locator, page: Page) => Promise<void>;
  verify?: (page: Page) => Promise<void>;
}

async function click(details: string, page: Page, locator: Locator) {
  await logClick(details, locator);
  await locator.click({ force: true });
  await waitForAll(page);
}

async function logClick(details: string, locator: Locator) {
  console.log(details, await locator.ariaSnapshot({ timeout: 300 }));
}

const transitions: Transition[] = [
  {
    id: "click-path-link",
    locate: (page) => page.getByRole("link").and(page.locator('[href^="/"]')),
    act: async (locator: Locator, page) => {
      await click("click-link", page, locator);
    },
  },
  {
    id: "click-breadcrumb-link",
    locate: (page) => page.locator('[href^="#"]'),
    act: async (locator: Locator, page) => {
      await click("click-link", page, locator);
    },
  },
  {
    id: "click-and-type-email",
    locate: (page) => page.locator("input").and(page.getByLabel(/.+/)),
    act: async (locator: Locator, page: Page) => {
      await click("type-email @CLICK", page, locator);
      await keyboardType("type-email @TYPE", page, "foo@example.com");
    },
  },
  {
    id: "type-password",
    locate: (page) => page.getByLabel(/password/i),
    act: async (locator: Locator, page: Page) => {
      await click("type-password @CLICK", page, locator);
      await keyboardType("type-password @TYPE", page, "password123");
    },
  },
  {
    id: "click-button",
    locate: (page) => page.getByRole("button"),
    act: (locator: Locator, page: Page) => click("click-button", page, locator),
  },
];

for (let campaignIdx = 0; campaignIdx < MAX_CAMPAIGNS; campaignIdx++) {
  const seed = campaignIdx;
  const campaignId = campaignIdx;

  test(`clickCampaign id=${campaignId}`, async ({ page }) => {
    const nextOffset = useNextOffset(seed);
    const takeSnapshot = useTakeSnapshot(campaignId);

    await page.goto("http://localhost:3000/");

    const seen: Record<string, number> = {};
    for (let depth = 0; depth < MAX_DEPTH; depth++) {
      await waitForAll(page);
      await takeSnapshot(page);

      const candidates: [Transition, Locator[]][] = [];
      for (const trans of transitions) {
        const locators = await trans.locate(page).all();
        if (locators.length <= 0) {
          continue;
        }

        candidates.push([trans, locators]);
      }

      expect(candidates.length, "Hit a dead end!").toBeGreaterThan(0);

      const [trans, targets] = candidates[nextOffset() % candidates.length];
      const target = targets[nextOffset() % targets.length];

      const elSnap = await target.ariaSnapshot();
      seen[elSnap] = (seen[elSnap] ?? 0) + 1;

      await trans.act(target, page);

      await takeSnapshot(page);

      await trans.verify?.(page);
    }
  });
}

function getHash(i: number): number {
  return (i * 2654435761) % 2 ** 32;
}

function useNextOffset(seed: number): () => number {
  let mem = seed;
  return () => getHash(mem++);
}

async function waitForAll(page: Page) {
  const canaries = [
    ...(await page.getByRole("link").elementHandles()),
    ...(await page.getByRole("heading").elementHandles()),
    ...(await page.getByRole("main").elementHandles()),
  ];

  for (const handle of canaries) {
    await handle.waitForElementState("stable", { timeout: 300 });
  }
}

async function keyboardType(details: string, page: Page, content: string) {
  console.log(details, content);
  await page.keyboard.type(content);
  await waitForAll(page);
}

function useTakeSnapshot(campaignId: number) {
  let idx = 0;

  return async (page: Page) => {
    await page.screenshot({
      scale: "css",
      animations: "disabled",
      path: `./lab/${campaignId} - ${idx.toString().padStart(5, "0")}.png`,
    });

    idx += 1;
  };
}
