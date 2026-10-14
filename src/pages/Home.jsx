import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Globe2,
  MousePointerClick,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI Microtasks',
    description: 'Complete structured digital tasks designed for modern online work.',
  },
  {
    icon: Database,
    title: 'Data & Research',
    description: 'Handle data entry, research, form filling and other digital workflows.',
  },
  {
    icon: MousePointerClick,
    title: 'Testing Tasks',
    description: 'Test websites and digital products and submit clear proof of your work.',
  },
  {
    icon: Globe2,
    title: 'Digital Work',
    description: 'Discover compliant digital marketing and other online task opportunities.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Choose a Task',
    description: 'Find a task that matches your skills and available time.',
  },
  {
    number: '02',
    title: 'Complete the Work',
    description: 'Follow the requirements and complete the assigned work carefully.',
  },
  {
    number: '03',
    title: 'Submit Proof',
    description: 'Send the required proof so the work can be reviewed.',
  },
  {
    number: '04',
    title: 'Earn',
    description: 'Approved work becomes part of your earnings and wallet balance.',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* Hero */}
      <section className="relative">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute right-0 top-40 h-[300px] w-[300px] rounded-full bg-cyan-500/5 blur-[100px]" />

        <div className="relative mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-24">

          {/* Left */}
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
              <Sparkles className="h-4 w-4" />
              Digital Work Platform
            </div>

            <h1 className="text-5xl font-black leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Work smarter.
              <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Grow with TaskBang.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              TaskBang connects people who need digital work with people ready
              to complete it. Discover tasks, build experience, complete work,
              and grow your digital earning journey.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-violet-600/30"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-bold text-slate-200 transition-all hover:border-white/20 hover:bg-white/[0.06]"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Structured tasks
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Proof-based work
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Growing ecosystem
              </span>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-r from-violet-600/10 to-cyan-500/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    TaskBang Workspace
                  </div>
                  <div className="mt-1 text-lg font-bold text-white">
                    Your digital work journey
                  </div>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <WalletCards className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <div className="text-xs font-medium text-slate-500">
                    Available Tasks
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-white">
                    Explore
                  </div>
                  <div className="mt-1 text-xs text-emerald-400">
                    New opportunities
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <div className="text-xs font-medium text-slate-500">
                    Work Status
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-white">
                    Active
                  </div>
                  <div className="mt-1 text-xs text-cyan-400">
                    Keep growing
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Ecosystem
                    </div>
                    <div className="mt-2 text-sm font-bold text-slate-200">
                      Workers • Clients • Digital Opportunities
                    </div>
                  </div>

                  <Users className="h-6 w-6 text-violet-400" />
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
                </div>

                <div className="mt-3 flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>Work</span>
                  <span>Earn</span>
                  <span>Grow</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/[0.06] bg-slate-950/70">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-violet-400">
              Built for digital work
            </div>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              One platform. Multiple ways to work.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
              TaskBang brings different types of structured digital tasks into
              one simple ecosystem.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/20 hover:bg-white/[0.045]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 transition-colors group-hover:bg-violet-500/15">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 text-base font-bold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <div className="text-center">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
              Simple workflow
            </div>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              How TaskBang works
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-2xl border border-white/10 bg-white/[0.025] p-6"
              >
                <div className="text-sm font-black text-violet-400">
                  {step.number}
                </div>

                <h3 className="mt-5 text-base font-bold text-white">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8">
          <div className="rounded-[28px] border border-violet-400/10 bg-gradient-to-br from-violet-500/10 via-white/[0.025] to-cyan-500/5 px-6 py-14 sm:px-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
              <Sparkles className="h-6 w-6" />
            </div>

            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Start your TaskBang journey.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Create your account and become part of a growing digital work
              ecosystem.
            </p>

            <Link
              to="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-6 text-xs font-semibold tracking-wide text-slate-600">
              WORK • EARN • GROW
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}