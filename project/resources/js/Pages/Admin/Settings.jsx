import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Settings({ settings }) {
    const { data, setData, post, processing, errors } = useForm({
        map_center_lat: settings.map_center_lat || '30.9010',
        map_center_lng: settings.map_center_lng || '75.8573',
        map_default_zoom: settings.map_default_zoom || '11',
        default_basemap: settings.default_basemap || 'Street',
        projection_code: settings.projection_code || 'EPSG:4326',
        moisture_offset: settings.moisture_offset || '1.2',
        ph_threshold: settings.ph_threshold || '6.5',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            onSuccess: () => alert('System parameters synchronized and updated successfully!')
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-stone-800 dark:text-slate-100">
                    ⚙️ System Settings & GIS Calibration
                </h2>
            }
        >
            <Head title="System Settings" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#2B2623] border border-slate-150 dark:border-[#4A423C] rounded-2xl p-6 shadow-xl space-y-6">
                        
                        <div>
                            <h3 className="text-xs font-bold text-earth-dark dark:text-earth-warm uppercase tracking-widest mb-1">
                                🗺️ GIS Map Default Canvas Setting
                            </h3>
                            <p className="text-[11px] text-stone-500">Configure spatial values loaded initially by surveyors and clients.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500">Center Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    className="w-full border-stone-200 dark:border-[#4A423C] dark:bg-[#231F1C] dark:text-white rounded-xl text-xs font-mono px-4 py-3 focus:ring-1 focus:ring-earth-dark focus:outline-none"
                                    value={data.map_center_lat}
                                    onChange={e => setData('map_center_lat', e.target.value)}
                                />
                                {errors.map_center_lat && <div className="text-red-500 text-[10px] font-bold">{errors.map_center_lat}</div>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500">Center Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    className="w-full border-stone-200 dark:border-[#4A423C] dark:bg-[#231F1C] dark:text-white rounded-xl text-xs font-mono px-4 py-3 focus:ring-1 focus:ring-earth-dark focus:outline-none"
                                    value={data.map_center_lng}
                                    onChange={e => setData('map_center_lng', e.target.value)}
                                />
                                {errors.map_center_lng && <div className="text-red-500 text-[10px] font-bold">{errors.map_center_lng}</div>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500 font-sans">Default Zoom Level</label>
                                <select
                                    className="w-full border-stone-200 dark:border-[#4A423C] dark:bg-[#231F1C] dark:text-white rounded-xl text-xs px-4 py-3 focus:ring-1 focus:ring-earth-dark focus:outline-none"
                                    value={data.map_default_zoom}
                                    onChange={e => setData('map_default_zoom', e.target.value)}
                                >
                                    {[...Array(20).keys()].map(i => (
                                        <option key={i+1} value={i+1}>{i+1}</option>
                                    ))}
                                </select>
                                {errors.map_default_zoom && <div className="text-red-500 text-[10px] font-bold">{errors.map_default_zoom}</div>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500">Default Base Map Layer</label>
                                <select
                                    className="w-full border-stone-200 dark:border-[#4A423C] dark:bg-[#231F1C] dark:text-white rounded-xl text-xs px-4 py-3 focus:ring-1 focus:ring-earth-dark focus:outline-none"
                                    value={data.default_basemap}
                                    onChange={e => setData('default_basemap', e.target.value)}
                                >
                                    <option value="Street">Street (OpenStreetMap)</option>
                                    <option value="Satellite">Satellite (Esri Satellite)</option>
                                    <option value="Terrain">Terrain Layer</option>
                                    <option value="Dark">Dark Mode Basemap</option>
                                </select>
                                {errors.default_basemap && <div className="text-red-500 text-[10px] font-bold">{errors.default_basemap}</div>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500 font-sans">Spatial Projection Standard</label>
                                <select
                                    className="w-full border-stone-200 dark:border-[#4A423C] dark:bg-[#231F1C] dark:text-white rounded-xl text-xs px-4 py-3 focus:ring-1 focus:ring-earth-dark focus:outline-none"
                                    value={data.projection_code}
                                    onChange={e => setData('projection_code', e.target.value)}
                                >
                                    <option value="EPSG:4326">WGS 84 (EPSG:4326)</option>
                                    <option value="EPSG:3857">Web Mercator (EPSG:3857)</option>
                                </select>
                                {errors.projection_code && <div className="text-red-500 text-[10px] font-bold">{errors.projection_code}</div>}
                            </div>
                        </div>

                        <hr className="border-slate-100 dark:border-[#4A423C]" />

                        <div>
                            <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                                🔬 Soil & Crop Analysis Coefficients
                            </h3>
                            <p className="text-[11px] text-stone-500">Configure global parameters used to grade and display health reports.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500">Soil Moisture Calibration Offset (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    className="w-full border-stone-200 dark:border-[#4A423C] dark:bg-[#231F1C] dark:text-white rounded-xl text-xs font-mono px-4 py-3 focus:ring-1 focus:ring-earth-dark focus:outline-none"
                                    value={data.moisture_offset}
                                    onChange={e => setData('moisture_offset', e.target.value)}
                                />
                                {errors.moisture_offset && <div className="text-red-500 text-[10px] font-bold">{errors.moisture_offset}</div>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500">Neutral Soil Target pH Threshold</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    className="w-full border-stone-200 dark:border-[#4A423C] dark:bg-[#231F1C] dark:text-white rounded-xl text-xs font-mono px-4 py-3 focus:ring-1 focus:ring-earth-dark focus:outline-none"
                                    value={data.ph_threshold}
                                    onChange={e => setData('ph_threshold', e.target.value)}
                                />
                                {errors.ph_threshold && <div className="text-red-500 text-[10px] font-bold">{errors.ph_threshold}</div>}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-650 hover:bg-earth-dark text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md shadow-indigo-600/10"
                            >
                                {processing ? 'Synchronizing...' : 'Save Settings'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
