# AI Agent Guidelines

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
