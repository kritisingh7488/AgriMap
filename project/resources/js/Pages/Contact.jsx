import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useEffect, useRef, useState } from 'react';

export default function Contact() {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        if (mapInstanceRef.current || !mapRef.current) return;

        import('leaflet').then((L) => {
            const leaflet = L.default || L;
            
            // Set view to AgriMap HQ (dummy coords)
            const map = leaflet.map(mapRef.current, { zoomControl: true }).setView([20.5937, 78.9629], 5);
            mapInstanceRef.current = map;

            // Use the dark basemap theme
            leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '© CARTO',
                maxZoom: 19,
            }).addTo(map);

            const markerHtml = `
                <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                    <span style="position: absolute; width: 12px; height: 12px; border-radius: 50%; background-color: #6366f1; box-shadow: 0 0 15px #6366f1; animation: pulse 2s infinite;"></span>
                    <div style="width: 24px; height: 24px; border-radius: 50%; background-color: rgba(99,102,241,0.2); border: 2px solid #6366f1; display: flex; align-items: center; justify-content: center; font-size: 12px;">📍</div>
                </div>
            `;

            const customIcon = leaflet.divIcon({
                html: markerHtml,
                className: 'custom-hq-marker',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            leaflet.marker([20.5937, 78.9629], { icon: customIcon })
                .addTo(map)
                .bindPopup('<div class="font-sans text-stone-800 dark:text-gray-100 p-1"><strong class="block text-sm">AgriMap HQ</strong><span class="text-xs text-stone-500">Global Operations Center</span></div>')
                .openPopup();

            setTimeout(() => { map.invalidateSize(); }, 300);
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <PublicLayout>
            <Head title="Contact - AgriMap" />
            <div className="max-w-6xl mx-auto w-full px-6 sm:px-8 relative z-10">
                <div className="text-center mb-12">
                    <span className="text-earth-warm dark:text-[#E4D6A9] font-bold tracking-widest uppercase text-sm mb-2 block">Get in Touch</span>
                    <h1 className="text-5xl font-black text-earth-dark dark:text-white mb-4">Contact Our Team</h1>
                    <p className="text-lg text-earth-dark/80 dark:text-[#B8B0A8] leading-relaxed max-w-2xl mx-auto">Have a question about our GIS platform or need enterprise support? Drop us a line or visit our headquarters.</p>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                    <div className="bg-white/60 dark:bg-[#38312D]/60 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-earth-cream/50 dark:border-[#4A423C]">
                        <form className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-earth-dark dark:text-[#E8E4DF] mb-2">First Name</label>
                                <input type="text" className="w-full rounded-xl border-earth-cream dark:border-[#4A423C] bg-white dark:bg-[#2B2623] shadow-sm focus:border-earth-warm focus:ring focus:ring-earth-warm/20 dark:text-white px-4 py-3" placeholder="Jane" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-earth-dark dark:text-[#E8E4DF] mb-2">Last Name</label>
                                <input type="text" className="w-full rounded-xl border-earth-cream dark:border-[#4A423C] bg-white dark:bg-[#2B2623] shadow-sm focus:border-earth-warm focus:ring focus:ring-earth-warm/20 dark:text-white px-4 py-3" placeholder="Doe" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-earth-dark dark:text-[#E8E4DF] mb-2">Email Address</label>
                            <input type="email" className="w-full rounded-xl border-earth-cream dark:border-[#4A423C] bg-white dark:bg-[#2B2623] shadow-sm focus:border-earth-warm focus:ring focus:ring-earth-warm/20 dark:text-white px-4 py-3" placeholder="jane@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-earth-dark dark:text-[#E8E4DF] mb-2">Message</label>
                            <textarea rows="5" className="w-full rounded-xl border-earth-cream dark:border-[#4A423C] bg-white dark:bg-[#2B2623] shadow-sm focus:border-earth-warm focus:ring focus:ring-earth-warm/20 dark:text-white px-4 py-3" placeholder="How can we help you?"></textarea>
                        </div>
                        <button type="button" className="w-full px-8 py-4 rounded-xl bg-earth-dark text-earth-cream font-bold text-lg hover:bg-earth-warm hover:text-white transition-all shadow-xl shadow-earth-dark/20">
                            Send Message
                        </button>
                    </form>
                </div>

                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-earth-cream/50 dark:border-[#4A423C] min-h-[400px] lg:min-h-full">
                    <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]"></div>
                    <div className="absolute top-6 left-6 z-20 bg-stone-900/80 backdrop-blur border border-stone-700 p-4 rounded-2xl text-white shadow-xl max-w-[200px]">
                        <span className="text-earth-warm font-bold text-[10px] uppercase tracking-wider block mb-1">Global HQ</span>
                        <h4 className="font-bold text-sm mb-1">AgriMap Central</h4>
                        <p className="text-[11px] text-gray-300 leading-relaxed">
                            123 Spatial Avenue<br/>
                            Innovation District<br/>
                            GeoCity, 90210
                        </p>
                    </div>
                    <div ref={mapRef} className="absolute inset-0 z-0 bg-stone-900"></div>
                </div>
            </div>
        </div>
        </PublicLayout>
    );
}
