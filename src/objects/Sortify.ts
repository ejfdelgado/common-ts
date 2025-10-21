export function sortify(value: any): string {
    const seen = new WeakSet();
    return JSON.stringify(normalize(value, seen));
}

function normalize(value: any, seen: WeakSet<object>): any {
    // Primitives
    if (value === null || typeof value !== "object") return value;

    // Detect circular references
    if (seen.has(value)) {
        // When circular reference return undefined
        return undefined;
    }
    seen.add(value);

    if (Array.isArray(value)) {
        // Normalize and sort arrays by their stringified form
        const normalizedItems = value.map((v) => normalize(v, seen));
        return normalizedItems;
        /*
        return normalizedItems.sort((a, b) => {
            const sa = JSON.stringify(a);
            const sb = JSON.stringify(b);
            return sa.localeCompare(sb);
        });
        */
    } else {
        // Sort object keys
        const sorted: any = {};
        for (const key of Object.keys(value).sort()) {
            sorted[key] = normalize(value[key], seen);
        }
        return sorted;
    }
}
