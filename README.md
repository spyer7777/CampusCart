# CampusCart

**A simple marketplace for giving useful things a second life.**

CampusCart lets people browse pre-loved items, save listings, and post products for sale. Anyone can create an account with an email address; an AITH Kanpur email is optional.

## What you can do

- Browse public listings without signing in
- Search listings and filter by category or price
- Create an account and post an item with a photo, price, category, and optional location
- Mark a listing as “Leaving soon” and choose an expiry date
- Save items and see recently viewed listings
- View your profile and your own listings

> **Project status:** Core authentication and listing flows use Supabase. The messages and offer screens are still under development and are not connected as complete chat or transaction flows.

## Built with

- [Next.js](https://nextjs.org/) App Router
- React and TypeScript
- Tailwind CSS
- [Supabase](https://supabase.com/) Auth, PostgreSQL, and Storage

## Run locally

### Requirements

- Node.js and npm
- A Supabase project

Check that Node.js and npm are available in your terminal:

```bash
node --version
npm --version
```

If either command is not recognized, install Node.js from [nodejs.org](https://nodejs.org/) and reopen your terminal.

### 1. Install dependencies

From the project folder:

```bash
npm install
```

### 2. Configure Supabase

1. Create a Supabase project.
2. In **Project Settings → API**, copy the Project URL and the **publishable** key.
3. Copy `.env.example` to `.env.local` in the project root and fill in the values:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
   ```

4. In Supabase **SQL Editor**, run `supabase/schema.sql` once to create the tables, auth profile trigger, policies, and image bucket.
5. Run the SQL files in `supabase/migrations/` to apply the open-marketplace policies, allow non-university email addresses, and grant the API roles access to the tables. The filenames indicate their intended order.
6. In **Authentication → URL Configuration**, set the local Site URL to `http://localhost:3000` and add that URL to the allowed redirect URLs.

If the database schema already exists, **do not run `schema.sql` again**. Run the migration files instead. They are also available in the Supabase SQL Editor if you are setting up the database manually.

Use only the Supabase **publishable** key in this app. Never put a secret or `service_role` key in a `NEXT_PUBLIC_` variable or commit it to GitHub. `.env.local` is ignored by Git.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful commands

```bash
npm run lint       # Check the source with ESLint
npm run build      # Create a production build
npm run start      # Serve a production build
```

## Deploy

Deploy to a host that supports Next.js. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the host’s environment variables. Then add the deployed site URL to Supabase **Authentication → URL Configuration** as the Site URL and an allowed redirect URL.

## Publish this project to GitHub

If you downloaded CampusCart as a ZIP, the folder may not include Git history. Create a **new, empty repository** on GitHub first (skip adding a README, `.gitignore`, or license there). Then open PowerShell in the project folder and run:

```powershell
git init
git add .
git status
git commit -m "Add CampusCart marketplace"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Replace the GitHub URL with the repository URL shown on GitHub. Before committing, check `git status`: `.env.local` should not appear because environment files are ignored. If Git asks who you are, configure the name and email you use on GitHub with `git config --global user.name "Your Name"` and `git config --global user.email "you@example.com"`.

## Repository layout

```text
src/app/                 Pages and route layouts
src/components/          Shared UI and listing components
src/lib/                 Supabase clients, listing helpers, and local saved-item state
src/types/               TypeScript data types
supabase/schema.sql      Initial database schema
supabase/migrations/     Marketplace and access updates
```

## Contributing

1. Create a branch for your change.
2. Make the change and run `npm run lint`.
3. Open a pull request describing what changed and how you checked it.

## License

No license has been added yet. Ask the project owner before reusing or distributing this code.
