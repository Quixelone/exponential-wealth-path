# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/904eb150-9172-47dc-8cce-551d0dfae332

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/904eb150-9172-47dc-8cce-551d0dfae332) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend & Authentication)
- Motion (Framer Motion) - Animations
- React GA4 - Google Analytics tracking

## Project Structure

### Landing Pages
- **`/`** - Main platform landing page (WebLanding.tsx)
- **`/educational`** - Course marketing landing page (EducationalLanding.tsx) - **NEW!**
  - Optimized for educational marketing campaigns
  - UTM parameter tracking for campaign attribution
  - Google Analytics integration
  - AI mascot "Prof Satoshi"

### Application Pages
- **`/app`** - Main dashboard (authenticated users)
- **`/education`** - Education hub with course list
- **`/education/dashboard`** - Student progress dashboard
- **`/education/leaderboard`** - Global leaderboard
- **`/education/simulation`** - Paper trading simulator
- **`/education/course/:id`** - Course viewer
- **`/strategies`** - Investment strategies management
- **`/settings`** - User settings & broker connections
- **`/ai-signals`** - AI trading signals
- **`/wheel-strategy`** - Wheel strategy dashboard

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required - Supabase
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
VITE_SUPABASE_URL=your_url

# Optional - Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Marketing Campaigns

Use UTM parameters to track campaign performance:

```
https://finanzacreativa.live/educational?utm_source=facebook&utm_campaign=corso_btc&utm_medium=ads
```

UTM data is automatically captured and saved for post-signup attribution.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/904eb150-9172-47dc-8cce-551d0dfae332) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
