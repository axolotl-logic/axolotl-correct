import { Page, type SerializedAXNode } from "puppeteer";

export function isWidgetRole(role: string) {
  return ["link", "button", "input", "radio", "checkbox"].includes(role);
}

export async function getAccessibility(page: Page) {
  const access = await page.accessibility.snapshot();
  if (access === null) {
    throw new Error("Unexpected null accessibility snapshot for " + page.url());
  }

  const todo = [access];
  const nodes: SerializedAXNode[] = [];
  while (todo.length >= 0) {
    const node = todo.pop();
    if (!node) {
      break;
    }

    nodes.push(node);
    const children = node.children ?? [];
    todo.push(...children);
  }

  return nodes;
}
