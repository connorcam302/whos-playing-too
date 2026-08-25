# whos-playing-too

A Dota 2 game logger designed to scrape and show all of the matches played by tracked accounts. A remake of the original whos-playing.

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
3. Install dependencies using your package manager of choice (npm or yarn).
4. Copy .env.sample to .env and fill variables.
5. Run the development server using `npm run dev` or `yarn dev`.
6. Access the website locally at `http://localhost:5173`.

## Links

- **Data Scraper**: [whos-playing-scraper](https://github.com/connorcam302/whos-playing-scraper/)
