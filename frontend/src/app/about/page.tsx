import MarketingNav from "@/components/MarketingNav";
import { Users, Target, Building2, Globe } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white">
            <MarketingNav />

            <div className="absolute top-20 left-0 w-full h-[400px] overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] mix-blend-screen" />
            </div>

            <main className="relative pt-40 pb-24 px-6 max-w-7xl mx-auto">
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        Democratizing <span className="text-primary">Data Analytics</span>
                    </h1>
                    <p className="text-lg text-gray-400 leading-relaxed">
                        DataChat was built on a simple premise: Business intelligence shouldn't require an engineering degree or a crash course in MongoDB Aggregation Pipelines. We are bridging the gap between executives and databases using the power of Large Language Models.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mt-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold">Our Mission</h2>
                        <p className="text-gray-400 text-lg">
                            We believe that data holds the answers to the hardest organizational problems. However, access to that data is often bottlenecked by technical queries. By merging conversational interfaces with robust backend database connectors, we empower anyone to ask questions of their data and get visual answers in seconds.
                        </p>
                        <ul className="space-y-4 pt-4">
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="bg-primary/20 p-2 rounded-lg text-primary"><Users className="w-5 h-5" /></span>
                                Empowering non-technical teams
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="bg-primary/20 p-2 rounded-lg text-primary"><Target className="w-5 h-5" /></span>
                                Reducing engineering query overhead
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="bg-primary/20 p-2 rounded-lg text-primary"><Globe className="w-5 h-5" /></span>
                                Fostering transparent data cultures
                            </li>
                        </ul>
                    </div>
                    <div className="bg-card/50 border border-white/10 p-8 rounded-3xl backdrop-blur-xl relative shadow-2xl">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-purple-600 rounded-3xl blur opacity-20" />
                        <div className="relative bg-[#050B14] p-8 rounded-2xl border border-white/5 space-y-6">
                            <Building2 className="w-12 h-12 text-blue-400 mb-4" />
                            <h3 className="text-2xl font-bold">The Team</h3>
                            <p className="text-gray-400">
                                Founded by researchers and engineers passionate about Generative AI. We spent years writing complex code to query raw data systems, and realized there had to be a better conversational way.
                            </p>
                            <Link href="/contact" className="inline-block text-primary hover:text-primary/80 font-medium transition-colors">
                                Get in touch &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
