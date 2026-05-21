import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50/20 to-earth-cream/25 pt-6 sm:pt-0 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 transition-colors duration-300">
            <div className="hover:scale-105 transition duration-300">
                <Link href="/" className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 rounded-2xl bg-earth-dark flex items-center justify-center shadow-lg shadow-earth-dark/20">
                        <span className="text-2xl">🌾</span>
                    </div>
                    <span className="font-extrabold text-base tracking-widest bg-gradient-to-r from-earth-dark to-earth-warm bg-clip-text text-transparent dark:from-earth-cream dark:to-earth-warm uppercase">
                        AgriMap
                    </span>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white/70 dark:bg-[#2B2623]/80 backdrop-blur-xl px-6 py-5 shadow-xl border border-stone-200/50 dark:border-[#4A423C]/85 sm:max-w-md sm:rounded-3xl">
                {children}
            </div>
        </div>
    );
}
