import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function PublicLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-[#FCFAF8] dark:bg-[#2B2623] text-earth-dark dark:text-[#E8E4DF] font-sans transition-colors duration-300 flex flex-col">
            {/* Navigation */}
            <nav className="relative z-50 px-6 sm:px-8 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-earth-dark flex items-center justify-center shadow-lg shadow-earth-dark/30 transform transition hover:scale-105">
                        <span className="text-2xl">🌾</span>
                    </div>
                    <span className="text-2xl font-black text-earth-dark dark:text-[#E4D6A9] tracking-tight">AgriMap</span>
                </div>
                <div className="hidden md:flex items-center gap-8 font-medium text-earth-dark/70 dark:text-[#B8B0A8]">
                    <Link href={route('about')} className="hover:text-earth-dark dark:hover:text-[#E4D6A9] transition-colors">About Us</Link>
                    <Link href="/#features" className="hover:text-earth-dark dark:hover:text-[#E4D6A9] transition-colors">Platform Features</Link>
                    <Link href={route('contact')} className="hover:text-earth-dark dark:hover:text-[#E4D6A9] transition-colors">Contact</Link>
                </div>
                <div className="flex items-center gap-4">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="px-6 py-2.5 rounded-full bg-earth-dark text-earth-cream font-semibold hover:bg-earth-warm hover:text-white transition-all shadow-xl shadow-earth-dark/20 hover:shadow-earth-warm/30">
                            Dashboard Access
                        </Link>
                    ) : (
                        <>
                            <Link href={route('login')} className="px-5 py-2.5 font-semibold text-earth-dark dark:text-[#E4D6A9] hover:text-earth-warm transition-colors">
                                Sign In
                            </Link>
                            <Link href={route('register')} className="px-6 py-2.5 rounded-full bg-earth-dark text-earth-cream font-semibold hover:bg-earth-warm hover:text-white transition-all shadow-xl shadow-earth-dark/20 hover:shadow-earth-warm/30">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-grow flex items-center justify-center relative z-10 py-16">
                <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-earth-cream/80 dark:bg-earth-warm/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] opacity-70 pointer-events-none"></div>
                <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-earth-sage/60 dark:bg-earth-sage/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] opacity-40 pointer-events-none"></div>
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-earth-dark dark:bg-[#1A1614] text-earth-cream pt-16 pb-8 border-t-4 border-earth-warm mt-auto z-20 relative">
                <div className="max-w-7xl mx-auto px-6 sm:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#FCFAF8] flex items-center justify-center">
                                    <span className="text-xl">🌾</span>
                                </div>
                                <span className="text-2xl font-black text-white tracking-tight">AgriMap</span>
                            </div>
                            <p className="text-earth-cream/70 text-sm leading-relaxed">
                                Empowering modern agriculture with precise, scalable, and intelligent geospatial mapping solutions.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Platform</h4>
                            <ul className="space-y-4 text-sm text-earth-cream/70">
                                <li><a href="#" className="hover:text-white transition-colors">GIS Explorer</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Spatial Analytics</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Resources</h4>
                            <ul className="space-y-4 text-sm text-earth-cream/70">
                                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Stay Updated</h4>
                            <form className="flex gap-2">
                                <input type="email" placeholder="Email" className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-earth-warm w-full" />
                                <button type="submit" className="bg-earth-warm hover:bg-earth-sage text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">Go</button>
                            </form>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-earth-cream/50">
                        <p>© {new Date().getFullYear()} AgriMap Systems Inc. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
