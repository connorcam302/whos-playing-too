# whos-playing-too

A Dota 2 game logger designed to scrape and show all of the matches played by tracked accounts. A remake of the original whos-playing.

## Feature documentation

Start with [docs/README.md](docs/README.md) for the feature catalogue, behavior guides, calculations, data flow, APIs and troubleshooting. Agents must keep the relevant guides updated as part of implementation changes; the maintenance rules are in [AGENTS.md](AGENTS.md).

## How does it work?

Matches are pulled from the Steam Web API, with OpenDota available as an alternative provider. The Bun scraper reads tracked accounts from the PostgreSQL database and is run on a schedule by Dokploy. Scraped matches are written back to the same database and displayed by the app.

## Tech Stack

- **Hosting**: Dokploy
- **Data Scraping**: Bun scraper scheduled by Dokploy
- **Frontend Framework**: [SvelteKit](https://kit.svelte.dev/)
- **CSS Framework**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: Self-hosted PostgreSQL

## Installation and Setup

To run this project locally, follow these steps:

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Install dependencies with `bun install --frozen-lockfile`.
4. Copy `.env.sample` to `.env` and fill variables (preserve an existing `.env`).
5. Run the development server using `bun run dev`.
6. Access the website locally at `http://localhost:5173`.

## Dota patch updates

Run `bun run build-items` and `bun run build-heroes` to refresh checked-in reference data and synchronize hero/item rows in the configured database. Follow the [patch refresh workflow](docs/dota-patch-updates.md) for source limitations, patch date ranges and verification.

## Links

- **Data Scraper**: [whos-playing-scraper](https://github.com/connorcam302/whos-playing-scraper/)
