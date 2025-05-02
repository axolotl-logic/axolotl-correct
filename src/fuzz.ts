import puppeteer, { type Page } from "puppeteer";
import sharp from "sharp";
import type {
  ConsoleEvent,
  ErrorEvent,
  PageErrorEvent,
  RequestEvent,
  RequestFailedEvent,
  ResponseEvent,
} from "./types.ts";
import { getAccessibility } from "./utils.ts";

function choose<T>(xs: T[]): T | undefined {
  return xs[Date.now() % xs.length];
}

const INPUTS = [
  "http://example.com/",
  "foo",
  "123",
  "foo@example.com",
] as const;

export async function formFiller(page: Page) {
  const els = await getAccessibility(page);

  const emptyInput = choose(
    els.filter(
      (node) =>
        ["input", "textbox"].includes(node.role) &&
        (node.value === undefined || node.value === ""),
    ),
  );

  let continuation = choose(els.filter((node) => node.role === "button"));
  continuation ??= choose(els.filter((node) => node.role === "link"));

  if (emptyInput !== undefined) {
    if (emptyInput.focused) {
      await page.keyboard.type(choose([...INPUTS]) ?? INPUTS[0]);
    } else {
      const el = await emptyInput.elementHandle();
      await el?.click();
    }

    return;
  }

  if (continuation !== undefined) {
    console.log("Continuation!", continuation.name);

    const el = await continuation.elementHandle();
    await el?.click();

    return;
  }
}

export async function clickStorm(page: Page) {
  const viewport = page.viewport();
  if (viewport === null) {
    throw new Error("Viewport was null");
  }

  await page.mouse.move(
    Math.floor(Math.random() * viewport.width),
    Math.floor(Math.random() * viewport.height),
  );

  await page.mouse.down();
  await new Promise((res) => {
    setTimeout(res, 10);
  });
  await page.mouse.up();
}

interface Storage {
  addRequestFailedEvent?(e: RequestFailedEvent): void;
  addRequestEvent?(e: RequestEvent): void;
  addResponseEvent?(e: ResponseEvent): void;
  addPageErrorEvent?(e: PageErrorEvent): void;
  addErrorEvent?(e: ErrorEvent): void;
  addConsoleEvent?(e: ConsoleEvent): void;
  addHistory?(url: string): void;
}

function addListeners(storage: Storage, page: Page) {
  page.on("requestfailed", (req) => {
    storage.addRequestFailedEvent?.({
      url: req.url(),
      frameUrl: req.frame()?.url(),
      method: req.method(),
      errorText: req.failure()?.errorText,
      createdAt: Date.now(),
    });
  });

  page.on("error", (err) => {
    storage.addErrorEvent?.({
      name: err.name,
      stack: err.stack,
      message: err.message,
    });
  });

  page.on("response", (resp) => {
    const time = resp.timing()?.requestTime;
    storage.addResponseEvent?.({
      requestTime: time,
      status: resp.status(),
      url: resp.url(),
      frameUrl: resp.frame()?.url(),
      method: resp.request().method(),
      createdAt: Date.now(),
    });
  });

  page.on("console", (msg) => {
    storage.addConsoleEvent?.({
      type: msg.type(),
      text: msg.text(),
    });
  });

  page.on("pageerror", (err) => {
    storage.addPageErrorEvent?.({
      name: err.name,
      stack: err.stack,
      message: err.message,
    });
  });

  page.on("framenavigated", (frame) => {
    const url = frame.url();
    if (url) {
      storage.addHistory?.(url);
    }
  });

  //await page.coverage.startJSCoverage();
}

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const targets = new Set<string>();

  targets.add("http://localhost:3000/");

  const consoleMessages: Record<string, number> = {};
  const storage: Storage = {
    addConsoleEvent(msg) {
      consoleMessages[msg.text] = (consoleMessages[msg.text] ?? 0) + 1;
    },
    addHistory(url) {
      if (url.startsWith("http://localhost:3000/")) {
        targets.add(url);
      }
    },
  };

  addListeners(storage, page);

  const campaigns = [
    { id: "click-storm", act: clickStorm, depth: 20 },
    { id: "form-filler", act: formFiller, depth: 5 },
  ];

  let screenshotId = 0;
  for (let i = 0; i < 5; i++) {
    for (const { id, act, depth } of campaigns) {
      for (const target of [...targets]) {
        console.log(`Switching to ${target}.`);
        await page.goto(target, { timeout: 5000 });

        for (let j = 0; j < depth; j++) {
          //console.log(`${id} - ${i.toString()} ${target}`);

          await page
            .waitForNetworkIdle({ idleTime: 200, timeout: 1000 })
            .catch(() => ({}));

          await act(page);

          const image = await page.screenshot();
          await sharp(image).toFile(
            `shots/out__${id}__${screenshotId.toString()}.png`,
          );

          screenshotId++;
        }
      }
    }
  }

  /*
  const coverage = await page.coverage.stopJSCoverage();
  for (const c of coverage) {
  }
  */

  await browser.close();
}

main().catch((err: unknown) => {
  console.error(err);
});
