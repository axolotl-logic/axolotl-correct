export function isWidgetRole(role) {
    return ["link", "button", "input", "radio", "checkbox"].includes(role);
}
export async function getAccessibility(page) {
    const access = await page.accessibility.snapshot();
    if (access === null) {
        throw new Error("Unexpected null accessibility snapshot for " + page.url());
    }
    const todo = [access];
    const nodes = [];
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
