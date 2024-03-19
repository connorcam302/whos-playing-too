# whos-playing-too

A Dota 2 game logger designed to scrape and show all of the matches played by set accounts. A remake of the original [whos-playing](https://who-was-playing.vercel.app/)

## How does it work?
Matches are pulled from the Steam Web API then combined with the OpenDota API for added detail. This scraper is written in NodeJS, once a minute the scraper is automatically ran by a AWS LightSail container cron. Once the matches have been scraped they are then written to a Supabase Postgres DB. These can then be read by the app which is hosted and autodeployed onto Vercel.

## Tech Stack

- **Hosting**: [Vercel](https://vercel.com/)
- **Data Scraping**: [AWS Lightsail](https://aws.amazon.com/lightsail/)
- **Frontend Framework**: [SvelteKit](https://kit.svelte.dev/)
- **CSS Framework**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.io/)

## Installation and Setup

To run this project locally, follow these steps:

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Install dependencies using your package manager of choice (npm or yarn).
4. Copy .env.sample to .env and fill variables.
5. Run the development server using `npm run dev` or `yarn dev`.
6. Access the website locally at `http://localhost:5173`.

## Links

- **Data Repository**: [whos-playing-constants](https://github.com/connorcam302/whos-playing-constants)
- **Current Site**: [https://whos-playing.vercel.app/](https://whos-playing.vercel.app/)
- **Old Site**: [https://who-was-playing.vercel.app/](https://who-was-playing.vercel.app/)
- **Data Scraper**: [whos-playing-scraper](https://github.com/connorcam302/whos-playing-scraper/)
