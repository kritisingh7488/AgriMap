import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="AgriMap - Professional GIS Portal" />
            
            <div className="min-h-screen bg-[#FCFAF8] dark:bg-[#2B2623] text-earth-dark dark:text-[#E8E4DF] font-sans selection:bg-earth-warm selection:text-white relative overflow-x-hidden transition-colors duration-300">
                
                {/* Decorative Background Elements */}
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-earth-cream/80 dark:bg-earth-warm/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] opacity-70 animate-pulse pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-earth-sage/60 dark:bg-earth-sage/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] opacity-40 pointer-events-none"></div>
                
                {/* Navigation */}
                <nav className="relative z-50 px-6 sm:px-8 py-6 flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-earth-dark flex items-center justify-center shadow-lg shadow-earth-dark/30 transform transition hover:scale-105">
                            <span className="text-2xl">🌾</span>
                        </div>
                        <span className="text-2xl font-black text-earth-dark dark:text-[#E4D6A9] tracking-tight">AgriMap</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 font-medium text-earth-dark/70 dark:text-[#B8B0A8]">
                        <Link href={route('about')} className="hover:text-earth-dark dark:hover:text-[#E4D6A9] transition-colors">About Us</Link>
                        <a href="/#features" className="hover:text-earth-dark dark:hover:text-[#E4D6A9] transition-colors">Platform Features</a>
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

                {/* Hero Section */}
                <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-16 sm:pt-20 pb-24 sm:pb-32 grid lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left Content */}
                    <div className="space-y-8 sm:space-y-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-earth-cream/50 dark:bg-[#38312D] border border-earth-sage/30 dark:border-[#4A423C] text-earth-dark dark:text-[#D1CBC5] font-semibold text-sm backdrop-blur-sm shadow-sm">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-earth-warm opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-earth-dark dark:bg-earth-warm"></span>
                            </span>
                            Next-Gen Spatial Intelligence
                        </div>
                        
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight dark:text-white">
                            Mapping the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-earth-dark via-earth-warm to-earth-sage dark:from-[#E4D6A9] dark:via-earth-warm dark:to-earth-sage">Future of Earth.</span>
                        </h1>
                        
                        <p className="text-lg sm:text-xl text-earth-dark/80 dark:text-[#B8B0A8] leading-relaxed max-w-xl font-medium">
                            Advanced geographical information systems seamlessly integrated for modern agriculture. Pinpoint precision, real-time analytics, and boundless scalability tailored for agronomists and land managers.
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 sm:gap-5 pt-4">
                            {auth.user ? (
                                <Link href={route('map')} className="px-8 py-4 rounded-2xl bg-earth-dark text-earth-cream font-bold text-lg hover:bg-earth-warm hover:text-white transition-all shadow-2xl shadow-earth-dark/30 hover:-translate-y-1 flex items-center gap-3">
                                    Launch Explorer 
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('register')} className="px-6 sm:px-8 py-4 rounded-2xl bg-earth-dark text-earth-cream font-bold text-base sm:text-lg hover:bg-earth-warm hover:text-white transition-all shadow-2xl shadow-earth-dark/30 hover:-translate-y-1 flex items-center gap-3">
                                        Start Mapping 
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </Link>
                                    <Link href={route('login')} className="px-6 sm:px-8 py-4 rounded-2xl bg-white dark:bg-[#38312D] text-earth-dark dark:text-[#E4D6A9] border-2 border-earth-cream dark:border-[#4A423C] font-bold text-base sm:text-lg hover:border-earth-sage dark:hover:border-earth-warm hover:bg-earth-cream/20 transition-all shadow-sm">
                                        View Demo
                                    </Link>
                                </>
                            )}
                        </div>
                        

                    </div>

                    {/* Right Visual / App Mockup */}
                    <div className="relative hidden lg:block">
                        <div className="absolute inset-0 bg-gradient-to-tr from-earth-warm to-earth-sage rounded-[3rem] blur-3xl opacity-20 transform rotate-6"></div>
                        
                        <div className="relative bg-white/60 dark:bg-[#38312D]/60 backdrop-blur-2xl border border-white dark:border-[#4A423C] rounded-[2.5rem] p-4 shadow-2xl shadow-earth-dark/10 dark:shadow-black/40 group hover:-translate-y-2 transition-transform duration-500">
                            
                            {/* Inner App Area */}
                            <div className="bg-earth-dark dark:bg-[#231F1C] rounded-[2rem] overflow-hidden relative shadow-inner border border-white/10 dark:border-[#38312D]">
                                {/* Top Bar */}
                                <div className="h-12 bg-earth-dark/95 dark:bg-[#1A1614] border-b border-white/10 dark:border-[#38312D] flex items-center px-6 gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="mx-auto px-4 py-1 rounded-full bg-white/5 dark:bg-white/10 text-[10px] text-white/50 dark:text-white/70 font-mono tracking-widest border border-white/5">
                                        agrimap.app/gis-portal
                                    </div>
                                </div>
                                
                                {/* App Content Mockup */}
                                <div className="p-6 grid grid-cols-12 gap-4 h-[400px]">
                                    {/* Sidebar */}
                                    <div className="col-span-4 space-y-3">
                                        <div className="h-8 bg-white/10 dark:bg-white/5 rounded-lg w-3/4 animate-pulse"></div>
                                        <div className="h-24 bg-gradient-to-br from-earth-warm/40 to-earth-dark/40 dark:from-[#38312D] dark:to-[#2B2623] rounded-xl border border-white/10 p-3 flex flex-col justify-between shadow-inner">
                                            <div className="h-4 bg-white/20 dark:bg-white/10 rounded w-1/2"></div>
                                            <div className="h-8 bg-white/20 dark:bg-white/10 rounded-lg w-full"></div>
                                        </div>
                                        <div className="h-16 bg-white/5 dark:bg-[#2B2623] rounded-xl border border-white/5 hover:bg-white/10 transition-colors"></div>
                                        <div className="h-16 bg-white/5 dark:bg-[#2B2623] rounded-xl border border-white/5 hover:bg-white/10 transition-colors"></div>
                                    </div>
                                    
                                    {/* Main Map Area */}
                                    <div className="col-span-8 bg-[#1A1A1A] dark:bg-[#141210] rounded-2xl relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 border border-white/5 shadow-2xl">
                                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#978F66 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                        
                                        <svg className="absolute inset-0 w-full h-full p-8" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <polygon points="20,80 40,20 80,30 90,70 50,90" className="fill-earth-sage/30 dark:fill-earth-sage/40 stroke-earth-sage stroke-[2] drop-shadow-xl" />
                                        </svg>
                                        
                                        <div className="absolute top-1/4 left-1/3 w-5 h-5 bg-earth-cream dark:bg-earth-warm rounded-full border-4 border-earth-dark shadow-[0_0_15px_rgba(228,214,169,0.8)] animate-bounce flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-earth-dark rounded-full"></div>
                                        </div>
                                        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-earth-warm rounded-full border-2 border-earth-dark"></div>
                                        
                                        <div className="absolute bottom-4 left-4 right-4 bg-earth-dark/80 dark:bg-[#2B2623]/90 backdrop-blur-md rounded-xl p-3 border border-white/10 flex justify-between items-center shadow-xl">
                                            <div>
                                                <div className="text-white text-xs font-bold tracking-wide">Field Alpha-7</div>
                                                <div className="text-earth-cream/70 dark:text-[#A89F98] text-[10px] font-mono mt-0.5">142.5 Hectares</div>
                                            </div>
                                            <div className="px-3 py-1 bg-earth-sage text-white text-[10px] font-bold rounded-lg shadow-inner">
                                                Optimal
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                
                {/* Feature Cards Section */}
                <section id="features" className="relative z-10 bg-white/60 dark:bg-[#38312D]/40 backdrop-blur-xl border-t border-earth-cream/50 dark:border-[#4A423C] py-24">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8">
                        <div className="text-center mb-16">
                            <span className="text-earth-warm dark:text-[#E4D6A9] font-bold tracking-widest uppercase text-xs mb-2 block">Why Choose Us</span>
                            <h2 className="text-4xl font-black text-earth-dark dark:text-white mb-4">Engineered for Precision</h2>
                            <p className="text-earth-dark/60 dark:text-[#B8B0A8] font-medium text-lg max-w-2xl mx-auto">Harness the power of layered spatial data wrapped in a beautiful, lightning-fast interface.</p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-[#2B2623] p-8 rounded-3xl shadow-xl shadow-earth-dark/5 dark:shadow-black/20 border border-earth-cream/50 dark:border-[#4A423C] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-2xl bg-earth-cream/50 dark:bg-[#38312D] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                                    <span className="text-2xl text-earth-dark dark:text-[#E4D6A9]">📍</span>
                                </div>
                                <h3 className="text-xl font-bold text-earth-dark dark:text-white mb-3">Live Geotracking</h3>
                                <p className="text-earth-dark/70 dark:text-[#A89F98] leading-relaxed text-sm">Monitor field locations in real-time with ultra-low latency updates and cluster management across any geographical region.</p>
                            </div>
                            
                            <div className="bg-gradient-to-br from-earth-dark to-earth-warm dark:from-[#38312D] dark:to-[#2B2623] p-8 rounded-3xl shadow-2xl shadow-earth-dark/20 dark:shadow-black/40 hover:-translate-y-2 transition-all duration-300 group md:-translate-y-4 border border-earth-warm/30 dark:border-[#4A423C]">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 dark:bg-[#4A423C] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 backdrop-blur-sm border border-white/10">
                                    <span className="text-2xl text-earth-cream dark:text-white">📊</span>
                                </div>
                                <h3 className="text-xl font-bold text-earth-cream dark:text-white mb-3">Advanced Analytics</h3>
                                <p className="text-earth-cream/80 dark:text-[#B8B0A8] leading-relaxed text-sm">Compute acreage, soil composition density, and moisture indices directly from the map interface without relying on external plugins.</p>
                            </div>
                            
                            <div className="bg-white dark:bg-[#2B2623] p-8 rounded-3xl shadow-xl shadow-earth-dark/5 dark:shadow-black/20 border border-earth-cream/50 dark:border-[#4A423C] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-2xl bg-earth-sage/20 dark:bg-[#38312D] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                                    <span className="text-2xl text-earth-sage dark:text-earth-sage">☁️</span>
                                </div>
                                <h3 className="text-xl font-bold text-earth-dark dark:text-white mb-3">Climate Sync</h3>
                                <p className="text-earth-dark/70 dark:text-[#A89F98] leading-relaxed text-sm">Overlays live weather patterns, forecasting data, and historical climate shifts on any geofenced area seamlessly.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Workflow/How it works Section */}
                <section id="workflow" className="relative z-10 py-24">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="order-2 lg:order-1 relative">
                                <div className="absolute inset-0 bg-earth-cream/40 dark:bg-[#38312D] rounded-[3rem] transform -rotate-3 scale-105"></div>
                                <img src="https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&w=800&q=80" alt="Agriculture Data" className="relative rounded-[2.5rem] shadow-2xl object-cover h-[500px] w-full border-4 border-white dark:border-[#2B2623]" />
                            </div>
                            <div className="order-1 lg:order-2 space-y-10">
                                <div>
                                    <span className="text-earth-sage font-bold tracking-widest uppercase text-xs mb-2 block">Simplified Workflow</span>
                                    <h2 className="text-4xl font-black text-earth-dark dark:text-white leading-tight">From Raw Land to <br/> Actionable Data</h2>
                                </div>
                                
                                <div className="space-y-8">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-earth-dark dark:bg-[#38312D] text-earth-cream dark:text-[#E4D6A9] flex items-center justify-center font-black text-xl border-4 border-earth-cream dark:border-[#2B2623]">1</div>
                                        <div>
                                            <h4 className="text-xl font-bold text-earth-dark dark:text-white mb-2">Import Geospatial Data</h4>
                                            <p className="text-earth-dark/70 dark:text-[#A89F98] text-sm leading-relaxed">Upload CSVs or GeoJSON files instantly. Our system parses the coordinates and automatically plots them on our high-resolution base maps.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-earth-warm dark:bg-[#38312D] text-white dark:text-[#E4D6A9] flex items-center justify-center font-black text-xl border-4 border-earth-cream dark:border-[#2B2623]">2</div>
                                        <div>
                                            <h4 className="text-xl font-bold text-earth-dark dark:text-white mb-2">Analyze & Annotate</h4>
                                            <p className="text-earth-dark/70 dark:text-[#A89F98] text-sm leading-relaxed">Use the drawing tools to outline fields, calculate acreages, and drop custom markers for soil sampling locations.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-earth-sage dark:bg-[#38312D] text-white dark:text-[#E4D6A9] flex items-center justify-center font-black text-xl border-4 border-earth-cream dark:border-[#2B2623]">3</div>
                                        <div>
                                            <h4 className="text-xl font-bold text-earth-dark dark:text-white mb-2">Export & Report</h4>
                                            <p className="text-earth-dark/70 dark:text-[#A89F98] text-sm leading-relaxed">Generate comprehensive reports and export updated layers to share with agronomists and stakeholders instantly.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-earth-dark dark:bg-[#1A1614] text-earth-cream pt-20 pb-10 border-t-4 border-earth-warm">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                            
                            {/* Brand Column */}
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
                                <div className="flex gap-4">
                                    <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-earth-warm transition-colors">𝕏</a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-earth-warm transition-colors">in</a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-earth-warm transition-colors">gh</a>
                                </div>
                            </div>

                            {/* Links Column */}
                            <div>
                                <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Platform</h4>
                                <ul className="space-y-4 text-sm text-earth-cream/70">
                                    <li><a href="#" className="hover:text-white transition-colors">GIS Explorer</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Spatial Analytics</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Data Import API</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Weather Sync</a></li>
                                </ul>
                            </div>

                            {/* Links Column */}
                            <div>
                                <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Resources</h4>
                                <ul className="space-y-4 text-sm text-earth-cream/70">
                                    <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Agronomy Guides</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Video Tutorials</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                                </ul>
                            </div>

                            {/* Newsletter Column */}
                            <div>
                                <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Stay Updated</h4>
                                <p className="text-earth-cream/70 text-sm mb-4">Get the latest updates on spatial tools and GIS features.</p>
                                <form className="flex gap-2">
                                    <input 
                                        type="email" 
                                        placeholder="Enter your email" 
                                        className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-earth-warm w-full"
                                    />
                                    <button type="submit" className="bg-earth-warm hover:bg-earth-sage text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
                                        Subscribe
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-earth-cream/50">
                            <p>© {new Date().getFullYear()} AgriMap Systems Inc. All rights reserved.</p>
                            <div className="flex gap-6">
                                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                                <a href="#" className="hover:text-white transition-colors">Security</a>
                            </div>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
