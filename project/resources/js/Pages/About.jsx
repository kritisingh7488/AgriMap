import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function About() {
    return (
        <PublicLayout>
            <Head title="About Us - AgriMap" />
            <div className="max-w-4xl mx-auto w-full px-6 sm:px-8 text-center space-y-8 relative z-10">
                <span className="text-earth-warm dark:text-[#E4D6A9] font-bold tracking-widest uppercase text-sm mb-2 block">Our Mission</span>
                <h1 className="text-5xl font-black text-earth-dark dark:text-white mb-6">Pioneering the Future of Agronomy</h1>
                <p className="text-lg text-earth-dark/80 dark:text-[#B8B0A8] leading-relaxed mb-8">
                    AgriMap was founded on a simple principle: farmers and agronomists deserve access to world-class geospatial technology without the complexity. Our platform bridges the gap between raw data and actionable field intelligence.
                </p>
                <div className="grid md:grid-cols-2 gap-8 mt-12 text-left">
                    <div className="bg-white/60 dark:bg-[#38312D]/60 backdrop-blur-md p-8 rounded-3xl border border-earth-cream/50 dark:border-[#4A423C] shadow-xl">
                        <h3 className="text-2xl font-bold text-earth-dark dark:text-white mb-4">Our Vision</h3>
                        <p className="text-earth-dark/70 dark:text-[#A89F98]">To map every acre of arable land with precision, ensuring sustainable growth and optimal yields for the generations to come.</p>
                    </div>
                    <div className="bg-white/60 dark:bg-[#38312D]/60 backdrop-blur-md p-8 rounded-3xl border border-earth-cream/50 dark:border-[#4A423C] shadow-xl">
                        <h3 className="text-2xl font-bold text-earth-dark dark:text-white mb-4">Our Team</h3>
                        <p className="text-earth-dark/70 dark:text-[#A89F98]">We are a diverse group of software engineers, data scientists, and agricultural specialists dedicated to building the ultimate GIS ecosystem.</p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
