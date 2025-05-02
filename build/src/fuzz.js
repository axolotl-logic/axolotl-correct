import puppeteer from "puppeteer";
import sharp from "sharp";
import { getAccessibility, isWidgetRole } from "./utils";
import { toObservation } from "./observations";
async function observe(page) {
    const access = await getAccessibility(page);
    return access.map(toObservation);
}
function orient(observations, lastModel) {
    const newModel = {
        lastModel,
        observations,
        adds: [],
        removes: [],
        persists: [],
    };
    const eq = (a, b) => a.name === b.name &&
        a.multiselectable === b.multiselectable &&
        a.autocomplete === b.autocomplete &&
        a.valuetext === b.valuetext &&
        a.name === b.name &&
        a.role === b.role &&
        a.value === b.value &&
        a.modal === b.modal &&
        a.level === b.level &&
        a.checked === b.checked &&
        a.focused === b.focused &&
        a.disabled === b.disabled &&
        a.invalid === b.invalid &&
        a.haspopup === b.haspopup &&
        a.readonly === b.readonly &&
        a.description === b.description &&
        a.roledescription === b.roledescription &&
        a.pressed === b.pressed &&
        a.expanded === b.expanded &&
        a.required === b.required;
    for (const observation of observations) {
        if (!lastModel?.observations.find((other) => eq(observation, other))) {
            newModel.adds.push(observation);
        }
        else {
            newModel.persists.push(observation);
        }
    }
    for (const observation of lastModel?.observations ?? []) {
        if (!observations.find((other) => eq(observation, other))) {
            newModel.removes.push(observation);
        }
    }
    return newModel;
}
function decide(model) {
    const keep = (o) => o.role !== undefined && isWidgetRole(o.role) && o.name !== undefined;
    const links = model.adds.filter(keep);
    if (links.length === 0) {
        links.push(...model.observations.filter(keep));
    }
    if (links.length === 0) {
        return null;
    }
    const link = links[Date.now() % links.length];
    const name = link?.name;
    if (name === undefined) {
        throw new Error("Internal error finding link");
    }
    return {
        kind: "click",
        args: { ariaName: name },
    };
}
async function act(page, action) {
    switch (action.kind) {
        case "click": {
            const nodes = await getAccessibility(page);
            for (const node of nodes) {
                if (node.name !== action.args.ariaName) {
                    continue;
                }
                const el = await node.elementHandle();
                if (el === null) {
                    console.error("Element dissapeared or bug");
                }
                else {
                    await el.click();
                    return;
                }
            }
            break;
        }
        default:
            break;
    }
}
async function main() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const log = [];
    page.on("requestfailed", (req) => {
        log.push({
            kind: "requestfailed",
            url: req.url(),
            frameUrl: req.frame()?.url(),
            method: req.method(),
            errorText: req.failure()?.errorText,
            createdAt: Date.now(),
        });
    });
    page.on("error", (err) => {
        log.push({
            kind: "error",
            name: err.name,
            stack: err.stack,
            message: err.message,
        });
    });
    page.on("response", (resp) => {
        const time = resp.timing()?.requestTime;
        log.push({
            kind: "response",
            requestTime: time,
            status: resp.status(),
            url: resp.url(),
            frameUrl: resp.frame()?.url(),
            method: resp.request().method(),
            createdAt: Date.now(),
        });
    });
    page.on("console", (msg) => {
        log.push({
            kind: "console",
            type: msg.type(),
            text: msg.text(),
        });
    });
    page.on("pageerror", (err) => {
        log.push({
            kind: "pageerror",
            name: err.name,
            stack: err.stack,
            message: err.message,
        });
    });
    await page.coverage.startJSCoverage();
    await page.goto("https://chessdojo.club/");
    await page.waitForNetworkIdle();
    let lastModel = null;
    for (let i = 0; i < 5; i++) {
        // Wait a bit to simulate a user
        // and let page stabalize, given unknown page behavior
        await new Promise((r) => setTimeout(r, 1000));
        const observations = await observe(page);
        const model = orient(observations, lastModel);
        const action = decide(model);
        if (action === null) {
            break;
        }
        await act(page, action);
        const image = await page.screenshot();
        await sharp(image).toFile(`out-${i.toString()}.png`);
        lastModel = model;
    }
    console.log("Shutting down...");
    await browser.close();
}
await main();
