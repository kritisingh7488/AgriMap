import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ layers }) {
    const [deletingId, setDeletingId] = useState(null);

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this layer? All associated data points will remain but the layer categorization will be lost.')) {
            setDeletingId(id);
            router.delete(route('admin.layers.destroy', id), {
                preserveScroll: true,
                onFinish: () => setDeletingId(null),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold leading-tight text-stone-800 dark:text-[#E8E4DF]">
                        🗺️ Map Layer Management
                    </h2>
                    <Link
                        href={route('admin.layers.create')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-earth-dark hover:bg-earth-dark text-white rounded-xl text-sm font-semibold transition shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
                    >
                        + Create Layer
                    </Link>
                </div>
            }
        >
            <Head title="Layer Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-[#2B2623] border border-stone-200 dark:border-[#4A423C] shadow-xl rounded-2xl">
                        <div className="p-6 text-stone-800 dark:text-gray-100">
                            <p className="text-sm text-stone-500 dark:text-[#A89F98] mb-6">
                                Configure, categorize, and style GIS overlays to organize geographical markers on the platform.
                            </p>

                            {layers.data.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="text-5xl mb-4">🗺️</div>
                                    <h3 className="text-lg font-semibold text-stone-800 dark:text-[#D1CBC5]">No layers configured yet</h3>
                                    <p className="text-stone-500 dark:text-[#A89F98] text-sm mt-1 max-w-md mx-auto">
                                        Layers define categories (like Soil Health, Water Bodies, Crop Yields) and assign default colors/styling to points.
                                    </p>
                                    <Link
                                        href={route('admin.layers.create')}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 mt-6 bg-earth-dark hover:bg-earth-dark text-white rounded-xl text-sm font-semibold transition"
                                    >
                                        Create First Layer
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-[#4A423C]">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-left">
                                        <thead className="bg-[#FCFAF8] dark:bg-[#2B2623]/50">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-stone-500 dark:text-[#A89F98] uppercase tracking-wider">Layer Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-stone-500 dark:text-[#A89F98] uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-4 text-xs font-bold text-stone-500 dark:text-[#A89F98] uppercase tracking-wider">Visual Style</th>
                                                <th className="px-6 py-4 text-xs font-bold text-stone-500 dark:text-[#A89F98] uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-stone-500 dark:text-[#A89F98] uppercase tracking-wider">Privacy</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-stone-500 dark:text-[#A89F98] uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-[#2B2623] divide-y divide-gray-200 dark:divide-gray-700">
                                            {layers.data.map((layer) => {
                                                const styleColor = layer.style?.color || '#3b82f6';
                                                const styleOpacity = layer.style?.opacity !== undefined ? layer.style.opacity : 0.8;
                                                return (
                                                    <tr key={layer._id || layer.id} className="hover:bg-[#FCFAF8] dark:hover:bg-stone-800/50 transition">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-stone-800 dark:text-white">
                                                            {layer.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-[#D1CBC5]">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FCFAF8] dark:bg-[#38312D] text-stone-800 dark:text-[#E8E4DF]">
                                                                {layer.type === 'vector' ? '📐 Vector (Points/Lines)' : '🖼️ Raster (Image Overlay)'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-[#D1CBC5]">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="w-5 h-5 rounded border border-white shadow-sm inline-block"
                                                                    style={{ backgroundColor: styleColor }}
                                                                ></span>
                                                                <span className="font-mono text-xs text-stone-500 dark:text-[#A89F98]">
                                                                    {styleColor} ({Math.round(styleOpacity * 100)}% opac)
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                                layer.status === 'active'
                                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                                            }`}>
                                                                ● {layer.status === 'active' ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-[#D1CBC5]">
                                                            {layer.is_public ? (
                                                                <span className="text-green-600 dark:text-green-400 text-xs font-semibold flex items-center gap-1">
                                                                    🌐 Publicly Viewable
                                                                </span>
                                                            ) : (
                                                                <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1">
                                                                    🔒 Private/Internal
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex justify-end gap-2">
                                                                <Link
                                                                    href={route('admin.layers.edit', layer._id || layer.id)}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-[#4A423C] hover:bg-[#FCFAF8] dark:hover:bg-stone-800 text-stone-800 dark:text-[#D1CBC5] transition text-xs font-semibold"
                                                                >
                                                                    ✎ Edit
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDelete(layer._id || layer.id)}
                                                                    disabled={deletingId === (layer._id || layer.id)}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white dark:text-red-400 dark:hover:text-white transition text-xs font-semibold"
                                                                >
                                                                    {deletingId === (layer._id || layer.id) ? '⏳ Deleting' : '✕ Delete'}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {layers.data.length > 0 && (
                                <div className="mt-6 flex justify-between items-center">
                                    <span className="text-xs text-stone-500 dark:text-[#A89F98]">
                                        Showing page {layers.current_page} of {layers.last_page}
                                    </span>
                                    <div className="flex gap-2">
                                        {layers.prev_page_url && (
                                            <Link
                                                href={layers.prev_page_url}
                                                className="px-4 py-2 border border-stone-200 dark:border-gray-600 rounded-lg text-sm text-stone-800 dark:text-[#D1CBC5] hover:bg-[#FCFAF8] dark:hover:bg-stone-800 transition"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {layers.next_page_url && (
                                            <Link
                                                href={layers.next_page_url}
                                                className="px-4 py-2 border border-stone-200 dark:border-gray-600 rounded-lg text-sm text-stone-800 dark:text-[#D1CBC5] hover:bg-[#FCFAF8] dark:hover:bg-stone-800 transition"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
