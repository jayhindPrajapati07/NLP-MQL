import Link from 'next/link';
import { Database, LogIn, Menu } from 'lucide-react';

export default function MarketingNav() {
    return (
        <nav className="fixed w-full z-50 top-0 border-b border-border/40 bg-[#020617]/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary/20 p-2 rounded-xl group-hover:bg-primary/30 transition-colors shadow-inner shadow-primary/20">
                        <Database className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white drop-shadow-md">
                        Data<span className="text-primary">Chat</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                    <Link href="/features" className="hover:text-white transition-colors relative group">
                        Features
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                    </Link>
                    <Link href="/about" className="hover:text-white transition-colors relative group">
                        About Us
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                    </Link>
                    <Link href="/contact" className="hover:text-white transition-colors relative group">
                        Contact
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <Link href="/login" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-medium px-4 py-2">
                        Sign In <LogIn className="w-4 h-4" />
                    </Link>
                    <Link href="/login" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0">
                        Get Started
                    </Link>
                </div>

                <button className="md:hidden text-gray-300 hover:text-white">
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </nav>
    );
}
