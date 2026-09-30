export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-6 text-center">
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-indigo-400 mb-4">
        TaskBang
      </h1>
      <p className="text-lg text-slate-300 max-w-xl mb-8">
        Smart Micro-Task Marketplace connecting Clients & Workers seamlessly.
      </p>
      <div className="flex gap-4">
        <a href="/login" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition">
          Get Started
        </a>
      </div>
    </div>
  );
}