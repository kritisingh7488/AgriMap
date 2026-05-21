import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({ stats }) {
    const [hoveredLayer, setHoveredLayer] = useState(null);

    // Calculate maximum point count for scaling the SVG bar chart
    const maxBarValue = Math.max(
        stats.approvedPoints || 1,
        stats.pendingApprovals || 1,
        stats.rejectedPoints || 0
    );

    // Donut chart geometry helpers
    const layerCounts = stats.layerCounts || [];
    const totalPointsForLayers = layerCounts.reduce((sum, item) => sum + item.count, 0) || 1;
    
    // Accumulate slices
    let accumulatedAngle = 0;
    const donutSlices = layerCounts.map((item) => {
        const percentage = item.count / totalPointsForLayers;
        const degrees = percentage * 360;
        const startAngle = accumulatedAngle;
        accumulatedAngle += degrees;
        return {
            ...item,
            startAngle,
            degrees,
            percentage
        };
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold leading-tight text-stone-800 dark:text-[#E8E4DF]">
                        Admin Executive Command
                    </h2>
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-200/50">
                        GIS Dashboard Active
                    </span>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* 1. Command Stats Metric Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="bg-gradient-to-br from-earth-dark/10 to-blue-500/10 border border-indigo-100 dark:border-[#4A423C] dark:bg-[#2B2623] rounded-2xl p-5 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-300">
                            <span className="text-5xl">👥</span>
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-earth-dark dark:text-earth-warm">Total Users</h3>
                        <p className="text-3xl font-extrabold mt-2 text-stone-800 dark:text-white">{stats.totalUsers}</p>
                        <p className="text-[10px] text-stone-500 mt-1.5 font-medium">Platform registered user accounts.</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-100 dark:border-[#4A423C] dark:bg-[#2B2623] rounded-2xl p-5 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-300">
                            <span className="text-5xl">⏳</span>
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">Pending Approvals</h3>
                        <p className="text-3xl font-extrabold mt-2 text-stone-800 dark:text-white">{stats.pendingApprovals}</p>
                        <p className="text-[10px] text-stone-500 mt-1.5 font-medium">Waypoints requiring verification check.</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-100 dark:border-[#4A423C] dark:bg-[#2B2623] rounded-2xl p-5 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-300">
                            <span className="text-5xl">📁</span>
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Active Layers</h3>
                        <p className="text-3xl font-extrabold mt-2 text-stone-800 dark:text-white">{stats.totalLayers}</p>
                        <p className="text-[10px] text-stone-500 mt-1.5 font-medium">Configured thematic spatial maps.</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-100 dark:border-[#4A423C] dark:bg-[#2B2623] rounded-2xl p-5 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-300">
                            <span className="text-5xl">📍</span>
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">Total GeoPoints</h3>
                        <p className="text-3xl font-extrabold mt-2 text-stone-800 dark:text-white">{stats.totalPoints}</p>
                        <p className="text-[10px] text-stone-500 mt-1.5 font-medium">Total registered spatial marker nodes.</p>
                    </div>
                </div>

                {/* 2. Interactive SVG Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Donut Chart: Layer Distribution */}
                    <div className="lg:col-span-6 bg-white dark:bg-[#2B2623] border border-gray-150 dark:border-[#4A423C] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-stone-800 dark:text-[#D1CBC5] uppercase tracking-widest mb-4">
                                📊 GIS Layer Density (Geopoints Share)
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                                {/* SVG Donut Canvas */}
                                <div className="sm:col-span-6 flex justify-center relative">
                                    <svg viewBox="0 0 200 200" className="w-40 h-40 transform -rotate-90">
                                        <circle cx="100" cy="100" r="70" fill="transparent" stroke="#e2e8f0" strokeWidth="20" className="dark:stroke-slate-800" />
                                        {donutSlices.map((slice, idx) => {
                                            // Compute stroke dasharray based on circumference (2 * pi * r = 2 * 3.14159 * 70 = 439.8)
                                            const circumference = 439.8;
                                            const strokeDasharray = `${(slice.percentage * circumference).toFixed(1)} ${circumference}`;
                                            const strokeDashoffset = `${-(slice.startAngle / 360 * circumference).toFixed(1)}`;
                                            return (
                                                <circle
                                                    key={idx}
                                                    cx="100"
                                                    cy="100"
                                                    r="70"
                                                    fill="transparent"
                                                    stroke={slice.color}
                                                    strokeWidth="22"
                                                    strokeDasharray={strokeDasharray}
                                                    strokeDashoffset={strokeDashoffset}
                                                    strokeLinecap={slice.percentage > 0.02 ? 'round' : 'butt'}
                                                    onMouseEnter={() => setHoveredLayer(slice)}
                                                    onMouseLeave={() => setHoveredLayer(null)}
                                                    className="transition-all duration-300 cursor-pointer hover:stroke-[25px]"
                                                    style={{ transformOrigin: 'center' }}
                                                />
                                            );
                                        })}
                                        {/* Center circle hole */}
                                        <circle cx="100" cy="100" r="50" fill="white" className="dark:fill-slate-900" />
                                    </svg>
                                    
                                    {/* Donut Center Hover Text */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                                            {hoveredLayer ? hoveredLayer.name.substring(0, 10) + '..' : 'Total Nodes'}
                                        </span>
                                        <span className="text-xl font-black text-stone-800 dark:text-white">
                                            {hoveredLayer ? hoveredLayer.count : totalPointsForLayers}
                                        </span>
                                    </div>
                                </div>

                                {/* Custom Legend List */}
                                <div className="sm:col-span-6 space-y-2">
                                    {donutSlices.map((slice, idx) => (
                                        <div
                                            key={idx}
                                            onMouseEnter={() => setHoveredLayer(slice)}
                                            onMouseLeave={() => setHoveredLayer(null)}
                                            className={`p-2 rounded-xl border transition flex items-center justify-between cursor-pointer ${hoveredLayer?.name === slice.name
                                                ? 'bg-[#FCFAF8] dark:bg-[#2B2623]/50 border-stone-200 dark:border-[#4A423C]'
                                                : 'bg-transparent border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: slice.color }}></span>
                                                <span className="text-[11px] font-bold text-stone-500 dark:text-[#D1CBC5] truncate max-w-32">{slice.name}</span>
                                            </div>
                                            <span className="text-[10px] font-mono font-bold text-stone-500 bg-[#FCFAF8] dark:bg-[#2B2623] px-2 py-0.5 rounded">
                                                {slice.count} ({Math.round(slice.percentage * 100)}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-4 leading-relaxed border-t border-gray-100 dark:border-[#4A423C] pt-3">
                            💡 Hover over donut sectors or legend tags to inspect real-time densities.
                        </p>
                    </div>

                    {/* Bar Chart: Submissions Status Proportion */}
                    <div className="lg:col-span-6 bg-white dark:bg-[#2B2623] border border-gray-150 dark:border-[#4A423C] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-stone-800 dark:text-[#D1CBC5] uppercase tracking-widest mb-4">
                                📈 Spatial Submissions Status Distribution
                            </h3>

                            {/* SVG Bar Chart */}
                            <div className="h-44 w-full flex items-end justify-around border-b border-stone-200 dark:border-[#4A423C] pb-3 pt-6 relative">
                                
                                {/* Background grid lines */}
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30 select-none font-mono text-[9px] text-stone-500">
                                    <div className="border-b border-dashed border-stone-200 dark:border-[#4A423C] w-full h-0 pt-2 flex justify-between"><span>100%</span></div>
                                    <div className="border-b border-dashed border-stone-200 dark:border-[#4A423C] w-full h-0 pt-2 flex justify-between"><span>50%</span></div>
                                    <div className="border-b border-dashed border-stone-200 dark:border-[#4A423C] w-full h-0 pt-2"></div>
                                </div>

                                {/* Bar 1: Approved */}
                                <div className="flex flex-col items-center w-16 group z-10">
                                    <span className="text-[10px] font-mono font-bold text-emerald-600 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        {stats.approvedPoints}
                                    </span>
                                    <div
                                        className="w-8 bg-emerald-500 rounded-t-lg transition-all duration-500 shadow-lg shadow-emerald-500/20 group-hover:brightness-110"
                                        style={{ height: `${(stats.approvedPoints / maxBarValue) * 100}px`, minHeight: stats.approvedPoints > 0 ? '4px' : '0' }}
                                    ></div>
                                </div>

                                {/* Bar 2: Pending */}
                                <div className="flex flex-col items-center w-16 group z-10">
                                    <span className="text-[10px] font-mono font-bold text-amber-600 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        {stats.pendingApprovals}
                                    </span>
                                    <div
                                        className="w-8 bg-amber-500 rounded-t-lg transition-all duration-500 shadow-lg shadow-amber-500/20 group-hover:brightness-110"
                                        style={{ height: `${(stats.pendingApprovals / maxBarValue) * 100}px`, minHeight: stats.pendingApprovals > 0 ? '4px' : '0' }}
                                    ></div>
                                </div>

                                {/* Bar 3: Rejected */}
                                <div className="flex flex-col items-center w-16 group z-10">
                                    <span className="text-[10px] font-mono font-bold text-rose-600 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        {stats.rejectedPoints}
                                    </span>
                                    <div
                                        className="w-8 bg-rose-500 rounded-t-lg transition-all duration-500 shadow-lg shadow-rose-500/20 group-hover:brightness-110"
                                        style={{ height: `${(stats.rejectedPoints / maxBarValue) * 100}px`, minHeight: stats.rejectedPoints > 0 ? '4px' : '0' }}
                                    ></div>
                                </div>
                            </div>

                            {/* Bar Chart labels */}
                            <div className="flex justify-around text-[10px] font-bold text-stone-500 mt-2">
                                <span className="w-16 text-center text-emerald-600">Approved</span>
                                <span className="w-16 text-center text-amber-600">Pending</span>
                                <span className="w-16 text-center text-rose-600">Rejected</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-4 leading-relaxed border-t border-gray-100 dark:border-[#4A423C] pt-3">
                            📈 Visual mapping comparing verified system marker states against the surveyor queue.
                        </p>
                    </div>
                </div>

                {/* 3. Recent Submissions & Terminal Audit Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left: Recent Submissions Grid Table */}
                    <div className="lg:col-span-8 bg-white dark:bg-[#2B2623] border border-gray-150 dark:border-[#4A423C] rounded-2xl p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-stone-800 dark:text-[#D1CBC5] uppercase tracking-widest">
                                📋 Live GeoPoints Registry Queue
                            </h3>
                            <a
                                href={route('admin.approvals.index')}
                                className="text-[10px] text-earth-dark hover:text-earth-dark font-bold uppercase tracking-wider"
                            >
                                Open Approvals Desk →
                            </a>
                        </div>

                        {stats.recentSubmissions && stats.recentSubmissions.length > 0 ? (
                            <div className="overflow-x-auto border border-gray-100 dark:border-[#4A423C] rounded-xl">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-[#FCFAF8] dark:bg-[#231F1C] text-stone-500 border-b border-gray-100 dark:border-[#4A423C] font-bold">
                                            <th className="p-3">LOCATION</th>
                                            <th className="p-3">LAYER THEMATIC</th>
                                            <th className="p-3">SURVEYOR</th>
                                            <th className="p-3">STATUS</th>
                                            <th className="p-3 text-right">AGE</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-850 dark:text-[#D1CBC5] font-medium">
                                        {stats.recentSubmissions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-[#FCFAF8]/50 dark:hover:bg-slate-850/30">
                                                <td className="p-3 font-bold text-stone-800 dark:text-white">{sub.name}</td>
                                                <td className="p-3">{sub.layer_name}</td>
                                                <td className="p-3">{sub.submitted_by}</td>
                                                <td className="p-3">
                                                    {sub.status === 'approved' ? (
                                                        <span className="inline-flex px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full font-bold text-[9px]">
                                                            Approved
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full font-bold text-[9px]">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right text-stone-500 font-mono text-[10px]">{sub.created_at}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-xs text-stone-500 text-center py-6">No waypoints submitted to registry.</p>
                        )}
                    </div>

                    {/* Right: Real-Time Audit Logs Terminal */}
                    <div className="lg:col-span-4 bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between h-[360px] text-gray-100">
                        <div>
                            <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
                                <h3 className="text-xs font-bold text-earth-warm uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-earth-dark animate-ping"></span>
                                    📡 Active Audit Terminal
                                </h3>
                                <span className="text-[9px] font-mono text-stone-500 uppercase">SYS STACK LOGS</span>
                            </div>

                            <div className="space-y-3.5 overflow-y-auto max-h-[220px] pr-1.5 font-sans">
                                {stats.auditLogs && stats.auditLogs.length > 0 ? (
                                    stats.auditLogs.map((log, idx) => (
                                        <div key={idx} className="text-[11px] leading-relaxed group">
                                            <div className="flex items-center justify-between font-bold text-gray-300 mb-0.5">
                                                <span className="group-hover:text-earth-warm transition">{log.action}</span>
                                                <span className="text-[9px] font-mono text-slate-500">{log.time}</span>
                                            </div>
                                            <p className="text-slate-400 leading-snug bg-stone-950/40 p-2 rounded border border-stone-800 font-mono text-[10px]">
                                                {log.details}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-500 text-center py-8">Awaiting audit signals...</p>
                                )}
                            </div>
                        </div>

                        <div className="text-[9px] font-mono text-slate-500 text-center pt-2 border-t border-stone-800">
                            📡 Automated GIS Registry System Ledger
                        </div>
                    </div>
                </div>

                {/* 4. Quick Actions Hub */}
                <div className="bg-white dark:bg-[#2B2623] border border-gray-150 dark:border-[#4A423C] rounded-2xl p-6 shadow-xl space-y-4">
                    <h3 className="text-xs font-bold text-stone-800 dark:text-[#D1CBC5] uppercase tracking-widest">
                        🚀 Administrator Shortcut Actions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <a
                            href={route('admin.users.index')}
                            className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 dark:border-[#4A423C] dark:bg-[#2B2623]/60 hover:bg-indigo-50/20 dark:hover:bg-slate-850 hover:border-earth-dark dark:hover:border-earth-dark/50 transition group"
                        >
                            <span className="text-2xl">👥</span>
                            <div>
                                <h4 className="text-xs font-bold text-stone-800 dark:text-white group-hover:text-earth-dark transition">User Accounts</h4>
                                <p className="text-[10px] text-stone-500 mt-0.5">Manage credentials & roles.</p>
                            </div>
                        </a>
                        <a
                            href={route('admin.approvals.index')}
                            className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 dark:border-[#4A423C] dark:bg-[#2B2623]/60 hover:bg-orange-50/20 dark:hover:bg-slate-850 hover:border-orange-400 dark:hover:border-orange-400/50 transition group"
                        >
                            <span className="text-2xl">⚖️</span>
                            <div>
                                <h4 className="text-xs font-bold text-stone-800 dark:text-white group-hover:text-orange-600 transition">Approvals Queue</h4>
                                <p className="text-[10px] text-stone-500 mt-0.5">Verify pending waypoints.</p>
                            </div>
                        </a>
                        <a
                            href={route('admin.layers.index')}
                            className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 dark:border-[#4A423C] dark:bg-[#2B2623]/60 hover:bg-emerald-50/20 dark:hover:bg-slate-850 hover:border-emerald-400 dark:hover:border-emerald-400/50 transition group"
                        >
                            <span className="text-2xl">📁</span>
                            <div>
                                <h4 className="text-xs font-bold text-stone-800 dark:text-white group-hover:text-emerald-600 transition">Thematic Layers</h4>
                                <p className="text-[10px] text-stone-500 mt-0.5">Configure thematic styles.</p>
                            </div>
                        </a>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
