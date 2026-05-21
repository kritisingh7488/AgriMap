import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function Dashboard({ savedLocations = [] }) {
    const { data: feedbackData, setData: setFeedbackData, post: postFeedback, processing: feedbackProcessing, reset: resetFeedback } = useForm({
        subject: '',
        message: '',
    });

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        postFeedback(route('feedback.store'), {
            preserveScroll: true,
            onSuccess: () => {
                alert('Thank you! Your feedback ticket has been logged successfully.');
                resetFeedback();
            }
        });
    };
    
    const removeBookmark = (id) => {
        if (confirm('Are you sure you want to remove this location from your bookmarks?')) {
            router.post(route('bookmarks.toggle', id), {}, {
                preserveScroll: true,
                onSuccess: () => alert('Location removed from bookmarks.')
            });
        }
    };

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        if (mapInstanceRef.current || !mapRef.current) return;

        import('leaflet').then((L) => {
            const leaflet = L.default || L;
            
            const map = leaflet.map(mapRef.current, { zoomControl: true }).setView([20.5937, 78.9629], 5);
            mapInstanceRef.current = map;

            // Use the dark basemap theme to match the UI
            leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '© CARTO',
                maxZoom: 19,
            }).addTo(map);

            const bounds = leaflet.latLngBounds();
            let hasValidCoords = false;

            // Plot saved locations
            savedLocations.forEach((loc) => {
                const coords = loc.location?.coordinates;
                if (coords && coords.length === 2) {
                    const [lng, lat] = coords;
                    hasValidCoords = true;
                    
                    const markerHtml = `
                        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
                            <span style="position: absolute; width: 10px; height: 10px; border-radius: 50%; background-color: #f59e0b; box-shadow: 0 0 10px #f59e0b; animation: pulse 2s infinite;"></span>
                            <div style="width: 20px; height: 20px; border-radius: 50%; background-color: rgba(245,158,11,0.2); border: 2px solid #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 10px;">⭐</div>
                        </div>
                    `;

                    const customIcon = leaflet.divIcon({
                        html: markerHtml,
                        className: 'custom-dashboard-marker',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });

                    const marker = leaflet.marker([lat, lng], { icon: customIcon }).addTo(map);
                    marker.bindPopup(`
                        <div class="font-sans text-stone-800 dark:text-gray-100 p-1">
                            <strong class="text-sm block mb-1">${loc.name}</strong>
                            <a href="${route('map')}?point=${loc._id || loc.id}" class="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">View in Explorer →</a>
                        </div>
                    `);
                    
                    bounds.extend([lat, lng]);
                }
            });

            if (hasValidCoords) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
            }

            setTimeout(() => { map.invalidateSize(); }, 300);
            setMapReady(true);
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [savedLocations]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-stone-800 dark:text-slate-100 flex items-center justify-between">
                    <span>🏠 Member Dashboard</span>
                    <Link
                        href={route('map')}
                        className="bg-earth-dark hover:bg-earth-dark text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-indigo-600/10"
                    >
                        🗺️ Launch GIS Explorer
                    </Link>
                </h2>
            }
        >
            <Head title="Client Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Greeting Banner */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-earth-dark to-earth-warm text-white rounded-3xl p-8 shadow-xl">
                        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none text-9xl font-mono flex items-center font-bold pr-10">
                            GIS
                        </div>
                        <div className="max-w-xl relative z-10 space-y-2">
                            <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Welcome back
                            </span>
                            <h3 className="text-2xl font-black">Interactive Spatial Planning Portal</h3>
                            <p className="text-xs text-indigo-100 leading-relaxed">
                                Access real-time public layer datasets, calibrate parameters, and coordinate spatial landmarks. Start by launching the map explorer to save landmarks to your personal registry feed below.
                            </p>
                        </div>
                    </div>

                    {/* Stats cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-[#2B2623] border border-gray-150 dark:border-[#4A423C] p-6 rounded-2xl shadow-md flex items-center justify-between">
                            <div>
                                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">My Bookmarked Points</span>
                                <span className="text-2xl font-black text-stone-800 dark:text-white mt-1 block">
                                    {savedLocations.length} locations
                                </span>
                            </div>
                            <span className="text-3xl bg-amber-500/10 p-3 rounded-2xl">⭐</span>
                        </div>

                        <div className="bg-white dark:bg-[#2B2623] border border-gray-150 dark:border-[#4A423C] p-6 rounded-2xl shadow-md flex items-center justify-between">
                            <div>
                                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Default GIS Region</span>
                                <span className="text-sm font-bold text-stone-800 dark:text-white mt-2 block">
                                    Ludhiana District, Punjab, IN
                                </span>
                            </div>
                            <span className="text-3xl bg-earth-dark/10 p-3 rounded-2xl">📍</span>
                        </div>
                    </div>

                    {/* Interactive Embedded Map */}
                    <div className="bg-white dark:bg-[#2B2623] border border-gray-150 dark:border-[#4A423C] rounded-2xl overflow-hidden shadow-xl">
                        <div className="px-6 py-4 border-b border-gray-150 dark:border-[#4A423C] flex items-center justify-between bg-[#FCFAF8] dark:bg-[#231F1C]">
                            <h3 className="text-xs font-bold text-stone-800 dark:text-[#D1CBC5] uppercase tracking-widest flex items-center gap-2">
                                🗺️ Geo Navigation Map
                            </h3>
                            {!mapReady && <span className="text-[10px] text-stone-500 animate-pulse">Initializing map engine...</span>}
                        </div>
                        <div className="relative w-full h-[400px] z-0">
                            <div ref={mapRef} className="absolute inset-0 z-0"></div>
                        </div>
                    </div>

                    {/* Bookmarks Grid section */}
                    <div className="bg-white dark:bg-[#2B2623] border border-gray-150 dark:border-[#4A423C] rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xs font-bold text-stone-800 dark:text-[#D1CBC5] uppercase tracking-widest mb-5 flex items-center gap-2">
                            📋 Saved Landmarks Registry
                        </h3>

                        {savedLocations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {savedLocations.map((location) => {
                                    const coords = location.location?.coordinates || [];
                                    return (
                                        <div key={location._id || location.id} className="group relative bg-[#FCFAF8]/50 dark:bg-[#231F1C]/30 border border-gray-100 dark:border-[#4A423C] rounded-2xl p-5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <h4 className="font-extrabold text-sm text-stone-800 dark:text-white group-hover:text-earth-dark transition">
                                                        {location.name}
                                                    </h4>
                                                    <button 
                                                        onClick={() => removeBookmark(location._id || location.id)}
                                                        className="text-gray-350 hover:text-red-500 transition text-sm"
                                                        title="Remove Bookmark"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-stone-500 dark:text-[#A89F98] leading-relaxed line-clamp-3">
                                                    {location.description || <span className="italic text-stone-500">No description provided.</span>}
                                                </p>
                                            </div>

                                            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-[#4A423C]/80 flex items-center justify-between">
                                                <span className="text-[10px] font-mono text-stone-500">
                                                    📍 {coords.length === 2 ? `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}` : 'N/A'}
                                                </span>
                                                <Link 
                                                    href={route('map')} 
                                                    className="text-xs font-bold text-earth-dark hover:text-earth-dark dark:text-earth-warm hover:underline flex items-center gap-0.5"
                                                >
                                                    View on Map →
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-stone-500">
                                <span className="text-4xl block mb-2">⭐</span>
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No saved locations yet</h4>
                                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                                    Explore the interactive Web GIS Map, click on any marker node, and bookmark it to register them here.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Feedback Form Card */}
                    <div className="bg-white dark:bg-[#2B2623] border border-gray-150 dark:border-[#4A423C] rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xs font-bold text-stone-800 dark:text-[#D1CBC5] uppercase tracking-widest mb-3 flex items-center gap-2">
                            📬 Submit Feedback or Report Bug
                        </h3>
                        
                        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500">Subject / Category</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Request new soil parameter layer, Bug report..."
                                    className="w-full border-stone-200 dark:border-[#4A423C] dark:bg-[#231F1C] dark:text-white rounded-xl text-xs px-4 py-3 focus:ring-1 focus:ring-earth-dark focus:outline-none"
                                    value={feedbackData.subject}
                                    onChange={e => setFeedbackData('subject', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500">Message Details</label>
                                <textarea
                                    required
                                    rows="3"
                                    placeholder="Provide detailed description of your observation or feedback..."
                                    className="w-full border-stone-200 dark:border-[#4A423C] dark:bg-[#231F1C] dark:text-white rounded-xl text-xs px-4 py-3 focus:ring-1 focus:ring-earth-dark focus:outline-none"
                                    value={feedbackData.message}
                                    onChange={e => setFeedbackData('message', e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={feedbackProcessing}
                                    className="bg-indigo-650 hover:bg-earth-dark text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/10"
                                >
                                    {feedbackProcessing ? 'Submitting...' : 'Send Feedback'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
