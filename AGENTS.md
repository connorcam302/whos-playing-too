# AI Agent Guidelines

## Feature Documentation — Required Maintenance

- Start with [docs/README.md](docs/README.md) and read the relevant feature guide before broad code exploration. Inspect the implementation being changed to verify details; documentation is a starting point, not a substitute for code review.
- Treat relevant documentation updates as part of completing every feature, behavior, calculation, API, data-model, configuration or workflow change. Make those updates in the same task/change, without asking the user to request or approve routine documentation maintenance separately.
- Keep existing guides aligned with actual behavior, including defaults, filter semantics, account/visibility rules, formulas, loading/error states, caching, important limitations and source entry points. Update affected guides for fixes and removals as well as additions.
- For a new feature or route, add or extend a focused guide and update the documentation index/route inventory. Keep one canonical explanation per topic and link to it from other guides. Preserve useful existing specialist docs such as the impact-beta specification.
- Update README setup instructions and relevant product/design docs when their documented behavior changes. Do not duplicate feature internals in this file; keep AGENTS.md focused on working rules.
- Before finishing, check that documentation links resolve, examples/defaults match the implementation and relevant checks are reported. For purely internal refactors or cosmetic edits with no documented behavior change, a documentation edit is unnecessary; state briefly in the final summary that no documentation change was needed.
- Do not record secrets, environment values or private database contents. Mark proposals and unverified external behavior explicitly instead of presenting them as implemented facts.

## Code Conventions

### Arrow Functions

**Always use arrow functions** for all function declarations. This provides consistency and helps with `this` binding.

**Examples:**

```typescript
// ✅ DO - Use arrow functions
const fetchItems = async () => {
	const response = await fetch(ITEMS_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch items: ${response.statusText}`);
	}
	return await response.json();
};

const parseCurrentItems = () => {
	const content = fs.readFileSync(ITEM_MAP_PATH, 'utf-8');
	const currentIds = new Set();
	const matches = content.matchAll(/id:\s*(\d+)/g);
	for (const match of matches) {
		currentIds.add(parseInt(match[1], 10));
	}
	return currentIds;
};

const getNewItems = (dotaItems, currentIds) => {
	const newItems = [];
	for (const [key, value] of Object.entries(dotaItems)) {
		if (value.id && !currentIds.has(value.id)) {
			newItems.push({
				id: value.id,
				name: value.dname || key,
				img: `https://cdn.cloudflare.steamstatic.com${value.img}`
			});
		}
	}
	return newItems.sort((a, b) => b.id - a.id);
};

const updateItemMap = async (newItems) => {
	if (newItems.length === 0) {
		console.log('No new items to add to itemMap.ts');
		return;
	}
	// ... implementation
};

const addItemsToDatabase = async (newItems) => {
	// ... implementation
};

const main = async () => {
	console.log('Fetching items from odota/dotaconstants...');
	const dotaItems = await fetchItems();
	// ... rest of implementation
};
```

```typescript
// ❌ DON'T - Use function declarations
function fetchItems() {
	// ...
}

async function parseCurrentItems() {
	// ...
}

function getNewItems(dotaItems, currentIds) {
	// ...
}
```

### Why Arrow Functions?

1. **Consistency**: Uniform syntax across the codebase
2. **Lexical `this`**: Arrow functions lexically bind `this`, avoiding common bugs
3. **Concise syntax**: More compact for simple functions
4. **Anonymous functions**: Great for callbacks and array methods
