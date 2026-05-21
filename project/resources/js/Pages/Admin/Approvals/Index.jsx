import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ geoPoints, currentStatus }) {
    const [actionId, setActionId] = useState(null);

    const handleApproval = (id, status) => {
        setActionId(id);
        router.put(route('admin.approvals.update', id), 
            { status: status }, 
            {
                preserveScroll: true,
                onFinish: () => setActionId(null)
            }
        );
    };

    const handleDelete = (id) => {
        if(confirm('Are you sure you want to permanently delete this GeoPoint?')) {
            setActionId(id);
            router.delete(route('admin.approvals.destroy', id), {
                preserveScroll: true,
                onFinish: () => setActionId(null)
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-stone-800 dark:text-[#E8E4DF]">
                    ✅ Geopoint Management
                </h2>
            }
        >
            <Head title="Geopoint Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-[#2B2623] border border-stone-200 dark:border-[#4A423C] shadow-xl rounded-2xl">
                        <div className="p-6 text-stone-800 dark:text-gray-100">
                            <p className="text-sm text-stone-500 dark:text-[#A89F98] mb-6">
                                Review, approve, reject, or delete agricultural and spatial markers. Use filters to manage the entire dataset.
                            </p>

                            {/* Status Filters */}
                            <div className="flex gap-2 mb-6">
                                {['all', 'pending', 'approved', 'rejected'].map(status => (
                                    <Link
                                        key={status}
                                        href={route('admin.approvals.index', { status })}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                                            currentStatus === status 
                                            ? 'bg-earth-dark text-white shadow-md' 
                                            : 'bg-gray-100 text-stone-500 hover:bg-gray-200 dark:bg-[#3A322C] dark:text-[#A89F98] dark:hover:bg-[#4A423C]'
                                        }`}
                                    >
                                        {status}
                                    </Link>
                                ))}
                            </div>

                            {geoPoints.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-5xl mb-4">🎉</div>
                                    <h3 className="text-lg font-semibold text-stone-800 dark:text-[#D1CBC5]">No points found</h3>
                                    <p className="text-stone-500 dark:text-[#A89F98] text-sm mt-1">No geo-points match this filter criteria.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-[#4A423C]">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-left">
                                        <thead className="bg-[#FCFAF8] dark:bg-[#2B2623]/50">
                                            <tr>
                                                <th className="px-4 py-4 text-xs font-bold text-stone-500 dark:text-[#A89F98] uppercase tracking-wider">Name</th>
                                                <th className="px-4 py-4 text-xs font-bold text-stone-500 dark:text-[#A89F98] uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-4 text-xs font-bold text-stone-500 dark:text-[#A89F98] uppercase tracking-wider">Coordinates</th>
                                                <th className="px-4 py-4 text-xs font-bold text-stone-500 dark:text-[#A89F98] uppercase tracking-wider">Submitted By</th>
                                                <th className="px-4 py-4 text-right text-xs font-bold text-stone-500 dark:text-[#A89F98] uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-[#2B2623] divide-y divide-gray-200 dark:divide-gray-700">
                                            {geoPoints.data.map((point) => {
                                                const [lng, lat] = point.location?.coordinates || [0, 0];
                                                return (
                                                    <tr key={point._id || point.id} className="hover:bg-[#FCFAF8] dark:hover:bg-stone-800/50 transition">
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-stone-800 dark:text-white">
                                                            {point.name}
                                                            <div className="text-xs text-stone-500 font-normal truncate max-w-[150px]">{point.description || 'No description'}</div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                                point.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                point.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                            }`}>
                                                                {point.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-[#A89F98] font-mono text-xs">
                                                            {lat.toFixed(5)},<br/>{lng.toFixed(5)}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-[#A89F98]">
                                                            {point.submitted_by_user?.name || point.submitted_by || 'Data Manager'}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex justify-end gap-1.5">
                                                                {point.status !== 'approved' && (
                                                                    <button
                                                                        onClick={() => handleApproval(point._id || point.id, 'approved')}
                                                                        disabled={actionId === (point._id || point.id)}
                                                                        className="inline-flex items-center px-2.5 py-1.5 rounded bg-green-500/10 hover:bg-green-500 text-green-600 hover:text-white transition text-[10px] font-bold uppercase"
                                                                    >
                                                                        {actionId === (point._id || point.id) ? '⏳' : '✓'} Approve
                                                                    </button>
                                                                )}
                                                                {point.status !== 'rejected' && (
                                                                    <button
                                                                        onClick={() => handleApproval(point._id || point.id, 'rejected')}
                                                                        disabled={actionId === (point._id || point.id)}
                                                                        className="inline-flex items-center px-2.5 py-1.5 rounded bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white transition text-[10px] font-bold uppercase"
                                                                    >
                                                                        {actionId === (point._id || point.id) ? '⏳' : '✕'} Reject
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDelete(point._id || point.id)}
                                                                    disabled={actionId === (point._id || point.id)}
                                                                    className="inline-flex items-center px-2.5 py-1.5 rounded bg-gray-500/10 hover:bg-gray-800 text-gray-600 hover:text-white transition text-[10px] font-bold uppercase"
                                                                >
                                                                    🗑️ Del
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

                            {/* Simple Pagination */}
                            {geoPoints.data.length > 0 && (
                                <div className="mt-6 flex justify-between items-center">
                                    <span className="text-xs text-stone-500 dark:text-[#A89F98]">
                                        Showing page {geoPoints.current_page} of {geoPoints.last_page}
                                    </span>
                                    <div className="flex gap-2">
                                        {geoPoints.prev_page_url && (
                                            <Link
                                                href={geoPoints.prev_page_url + `&status=${currentStatus}`}
                                                className="px-4 py-2 border border-stone-200 dark:border-gray-600 rounded-lg text-sm text-stone-800 dark:text-[#D1CBC5] hover:bg-[#FCFAF8] dark:hover:bg-stone-800 transition"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {geoPoints.next_page_url && (
                                            <Link
                                                href={geoPoints.next_page_url + `&status=${currentStatus}`}
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
