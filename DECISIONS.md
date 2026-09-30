# TaskBang — Technical & Business Decisions

- **Brand Name**: Rebranded from TaskBang AI to **TaskBang**.
- **Tech Stack**: React.js (Vite), Tailwind CSS, Supabase (PostgreSQL Auth & Database).
- **Hosting Strategy**: Free-tier Deployment (Netlify/Vercel & Supabase Free Tier).
- **Security**: Local Device Flagging + Supabase RLS (Row Level Security).
- **Payout Model**: Worker Rewards and Platform Margin controlled via Admin System.
- **Custom ID Format**:
  - Worker: `TB-W-XXXXXX`
  - Client: `TB-C-XXXXXX`
  - Task: `TB-T-XXXXXX`
  - Submission: `TB-S-XXXXXX`
  - Payment: `TB-P-XXXXXX`
  - Withdrawal: `TB-WD-XXXXXX`
