import MarketingNav from "@/components/MarketingNav";
import { MessageSquare, LayoutDashboard, Database, Shield, Zap, Search } from "lucide-react";

export default function FeaturesPage() {
    const features = [
        {
            icon: <MessageSquare className="w-8 h-8 text-blue-400" />,
            title: "Conversational MQL Generation",
            desc: "Type what you want in English. The Gemini AI understands your specific schema and outputs strict, read-only MongoDB aggregation arrays.",
            color: "bg-blue-500/10 border-blue-500/20"
        },
        {
            icon: <LayoutDashboard className="w-8 h-8 text-purple-400" />,
            title: "Instant Charts & Graphs",
            desc: "Your data results are immediately pushed through heuristics to generate tables, bar charts, line graphs, and pie charts with zero setup.",
            color: "bg-purple-500/10 border-purple-500/20"
        },
        {
            icon: <Database className="w-8 h-8 text-emerald-400" />,
            title: "Multiple Data Sources",
            desc: "Register infinite database connections. Instantly swap between your production catalog, analytical clusters, or test databases.",
            color: "bg-emerald-500/10 border-emerald-500/20"
        },
        {
            icon: <Shield className="w-8 h-8 text-amber-400" />,
            title: "Secure & Encrypted",
            desc: "Your connection URIs are encrypted at rest using AES-level Fernet symmetric keys. Passwords are never stored in plain text.",
            color: "bg-amber-500/10 border-amber-500/20"
        },
        {
            icon: <Zap className="w-8 h-8 text-rose-400" />,
            title: "Strictly Read-Only",
            desc: "Our query middleware physically intercepts queries containing destructive stages ($merge, $out), keeping your data perfectly safe.",
            color: "bg-rose-500/10 border-rose-500/20"
        },
        {
            icon: <Search className="w-8 h-8 text-cyan-400" />,
            title: "Schema Auto-Discovery",
            desc: "We intelligently sample your collections to build an ontological view of your schema to feed into the LLM context automatically.",
            color: "bg-cyan-500/10 border-cyan-500/20"
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            <MarketingNav />

            <main className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        Platform <span className="text-primary">Features</span>
                    </h1>
                    <p className="text-lg text-gray-400">
                        Everything you need to turn raw BSON documents into actionable business intelligence using natural language.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className={`p-8 rounded-3xl border ${f.color} bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all hover:-translate-y-1`}>
                            <div className="mb-6">{f.icon}</div>
                            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                            <p className="text-gray-400 leading-relaxed text-sm">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
