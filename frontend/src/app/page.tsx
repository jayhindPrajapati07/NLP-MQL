import MarketingNav from "@/components/MarketingNav";
import { ArrowRight, Sparkles, DatabaseZap, ChartLine, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/30 overflow-hidden">
      <MarketingNav />

      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] opacity-30 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/40 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-white/10 text-sm font-medium text-blue-300 backdrop-blur-md mb-4 shadow-xl">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Gemini 2.5 AI</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight drop-shadow-sm">
            Talk to your MongoDB <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary">in plain English.</span>
          </h1>

          <p className="text-lg lg:text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
            Say goodbye to writing complex aggregation pipelines. Connect your external databases safely, ask questions naturally, and instantly generate beautiful charts and data tables.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 px-8 py-4 rounded-full text-lg font-semibold shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95">
              Start Exploring Data <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/features" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-lg font-medium backdrop-blur-sm">
              View Features
            </Link>
          </div>
        </div>

        {/* Feature Highlight Section */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="bg-card/40 border border-white/5 p-8 rounded-3xl backdrop-blur-md hover:bg-card/60 transition-colors group">
            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <DatabaseZap className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Any External Database</h3>
            <p className="text-gray-400 leading-relaxed">Connect your standalone MongoDB or Atlas clusters instantly without moving any data. Everything executes safely in real-time.</p>
          </div>
          <div className="bg-card/40 border border-white/5 p-8 rounded-3xl backdrop-blur-md hover:bg-card/60 transition-colors group">
            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI MQL Generation</h3>
            <p className="text-gray-400 leading-relaxed">Driven by Google's Gemini LLM. It natively understands your schema and converts natural language logically into precise aggregation arrays.</p>
          </div>
          <div className="bg-card/40 border border-white/5 p-8 rounded-3xl backdrop-blur-md hover:bg-card/60 transition-colors group">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ChartLine className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Instant Visualizations</h3>
            <p className="text-gray-400 leading-relaxed">No BI tools required. Toggle seamlessly between raw JSON, interactive tables, Bar charts, Line graphs, and Pie diagrams.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
