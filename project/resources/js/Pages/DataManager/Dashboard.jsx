import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

export default function Dashboard({ stats, layers = [], submissions = [] }) {
    const [activeAction, setActiveAction] = useState(null); // 'file', 'manual'
    const [parsedPoints, setParsedPoints] = useState([]);
    const [globalLayerId, setGlobalLayerId] = useState('');
    const [bulkUploading, setBulkUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // Offline storage and sync handlers
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [offlineSubmissions, setOfflineSubmissions] = useState(() => {
        try {
            const cached = localStorage.getItem('offline_submissions');
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            return [];
        }
    });

    const triggerOfflineSync = async () => {
        const cached = localStorage.getItem('offline_submissions');
        const points = cached ? JSON.parse(cached) : [];
        if (points.length === 0) return;

        try {
            const response = await fetch('/api/points/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ points })
            });

            if (response.ok) {
                localStorage.removeItem('offline_submissions');
                setOfflineSubmissions([]);
                alert(`✅ Successfully synchronized ${points.length} offline waypoints to the database!`);
                window.location.reload();
            } else {
                const errResult = await response.json();
                alert(`Sync failed: ${errResult.message}`);
            }
        } catch (e) {
            console.error("Offline synchronization error", e);
        }
    };

    useEffect(() => {
        const goOnline = () => {
            setIsOffline(false);
            triggerOfflineSync();
        };
        const goOffline = () => {
            setIsOffline(true);
        };

        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);

        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    // Single Marker Form
    const { data: markerData, setData: setMarkerData, post: postMarker, processing: markerProcessing, errors: markerErrors, reset: resetMarker } = useForm({
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        layer_id: layers[0]?._id || layers[0]?.id || '',
        media: [], // array to hold photos
    });

    const handleMarkerSubmit = (e) => {
        e.preventDefault();

        if (!navigator.onLine) {
            const newOffline = {
                name: markerData.name,
                description: markerData.description,
                latitude: parseFloat(markerData.latitude),
                longitude: parseFloat(markerData.longitude),
                layer_id: markerData.layer_id,
                media: markerData.media || [],
                submitted_at: new Date().toISOString()
            };

            const updated = [...offlineSubmissions, newOffline];
            setOfflineSubmissions(updated);
            localStorage.setItem('offline_submissions', JSON.stringify(updated));

            alert('⚠️ Network Offline! Waypoint cached locally in secure browser storage. It will synchronize automatically when connection is restored.');
            setActiveAction(null);
            resetMarker();
            return;
        }

        postMarker(route('manager.geopoints.store'), {
            onSuccess: () => {
                setActiveAction(null);
                resetMarker();
                alert('Single waypoint submitted for admin approval!');
            }
        });
    };

    // Client-Side CSV & GeoJSON Parser
    const handleFileParsing = (file) => {
        if (!file) return;

        const reader = new FileReader();
        const extension = file.name.split('.').pop().toLowerCase();

        reader.onload = (e) => {
            const text = e.target.result;
            let points = [];

            try {
                if (extension === 'json' || extension === 'geojson') {
                    // PARSE GEOJSON
                    const geojson = JSON.parse(text);
                    const features = geojson.features || (geojson.type === 'Feature' ? [geojson] : []);
                    
                    points = features.map((f, idx) => {
                        const coords = f.geometry?.coordinates || [];
                        return {
                            id: `geojson-${idx}`,
                            name: f.properties?.name || `Point ${idx + 1}`,
                            description: f.properties?.description || f.properties?.desc || '',
                            latitude: coords[1] !== undefined ? String(coords[1]) : '',
                            longitude: coords[0] !== undefined ? String(coords[0]) : '',
                            isValid: coords[1] !== undefined && coords[0] !== undefined && !isNaN(coords[1]) && !isNaN(coords[0])
                        };
                    });
                } else if (extension === 'csv') {
                    // PARSE CSV
                    const lines = text.split(/\r?\n/);
                    if (lines.length < 2) throw new Error("CSV has no data rows");

                    // Read headers
                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                    const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('title'));
                    const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('info'));
                    const latIdx = headers.findIndex(h => h.includes('lat'));
                    const lngIdx = headers.findIndex(h => h.includes('lng') || h.includes('lon') || h.includes('long'));

                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;

                        // Split supporting simple commas
                        const cols = line.split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
                        const name = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : `Row ${i}`;
                        const description = descIdx !== -1 && cols[descIdx] ? cols[descIdx] : '';
                        const latitude = latIdx !== -1 && cols[latIdx] ? cols[latIdx] : '';
                        const longitude = lngIdx !== -1 && cols[lngIdx] ? cols[lngIdx] : '';
                        
                        const latVal = parseFloat(latitude);
                        const lngVal = parseFloat(longitude);

                        points.push({
                            id: `csv-${i}`,
                            name,
                            description,
                            latitude,
                            longitude,
                            isValid: !isNaN(latVal) && !isNaN(lngVal) && latVal >= -90 && latVal <= 90 && lngVal >= -180 && lngVal <= 180
                        });
                    }
                } else {
                    alert('Unsupported file format. Please upload .csv, .json, or .geojson files.');
                    return;
                }

                setParsedPoints(points);
                if (layers.length > 0 && !globalLayerId) {
                    setGlobalLayerId(layers[0]._id || layers[0].id);
                }
            } catch (err) {
                alert(`Error parsing file: ${err.message}`);
            }
        };

        reader.readAsText(file);
    };

    // Drag and Drop helpers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileParsing(e.dataTransfer.files[0]);
        }
    };

    // Live edit handlers for preview table
    const handleRowEdit = (id, field, value) => {
        setParsedPoints(prev => prev.map(p => {
            if (p.id === id) {
                const updated = { ...p, [field]: value };
                // Re-evaluate validation
                const latVal = parseFloat(updated.latitude);
                const lngVal = parseFloat(updated.longitude);
                updated.isValid = updated.name.trim() !== '' && !isNaN(latVal) && !isNaN(lngVal) && latVal >= -90 && latVal <= 90 && lngVal >= -180 && lngVal <= 180;
                return updated;
            }
            return p;
        }));
    };

    const deleteRow = (id) => {
        setParsedPoints(prev => prev.filter(p => p.id !== id));
    };

    // Submit Bulk Points
    const submitBulkBatch = async () => {
        const validPoints = parsedPoints.filter(p => p.isValid);
        if (validPoints.length === 0) {
            alert('No valid waypoints to upload!');
            return;
        }
        if (!globalLayerId) {
            alert('Please select a target GIS Layer for this batch submission.');
            return;
        }

        setBulkUploading(true);
        try {
            const response = await fetch('/api/points/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    points: validPoints.map(p => ({
                        name: p.name,
                        description: p.description,
                        latitude: parseFloat(p.latitude),
                        longitude: parseFloat(p.longitude),
                        layer_id: globalLayerId
                    }))
                })
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message || 'Bulk waypoints submitted successfully!');
                setParsedPoints([]);
                setActiveAction(null);
                // Trigger hard page reload to refresh stat numbers
                window.location.reload();
            } else {
                alert(`Upload failed: ${result.message || 'Internal server error'}`);
            }
        } catch (err) {
            alert(`Error uploading batch: ${err.message}`);
        }
        setBulkUploading(false);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold leading-tight text-stone-800 dark:text-[#E8E4DF]">
                        Data Manager Panel
                    </h2>
                    <span className="text-xs bg-earth-warm/20 dark:bg-earth-dark/40 text-earth-dark dark:text-earth-warm font-bold px-3 py-1 rounded-full border border-indigo-200/50">
                        Role: GIS Surveyor
                    </span>
                </div>
            }
        >
            <Head title="Data Manager Dashboard" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* Offline Synchronization Banner */}
                {isOffline && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-xl animate-pulse">⚠️</span>
                            <div>
                                <h4 className="font-extrabold text-xs">Offline Mode Enabled</h4>
                                <p className="text-[10px] text-stone-500">Your network connection is offline. New coordinate survey entries will be saved locally inside your web browser cache.</p>
                            </div>
                        </div>
                        <span className="inline-flex px-2 py-0.5 bg-amber-500/20 text-amber-600 rounded-full font-mono text-[9px] font-bold">CACHE QUEUE: {offlineSubmissions.length}</span>
                    </div>
                )}

                {!isOffline && offlineSubmissions.length > 0 && (
                    <div className="bg-indigo-550/15 border border-earth-dark/20 text-earth-dark dark:text-earth-warm p-4 rounded-2xl flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-2.5">
                            <span className="text-xl">📡</span>
                            <div>
                                <h4 className="font-extrabold text-xs">Unsynchronized Offline Observations</h4>
                                <p className="text-[10px] text-stone-500">You have offline waypoints saved in your browser cache awaiting database sync.</p>
                            </div>
                        </div>
                        <button
                            onClick={triggerOfflineSync}
                            className="bg-indigo-650 hover:bg-earth-dark text-white font-bold text-[10px] px-4 py-2 rounded-xl transition shadow"
                        >
                            Sync {offlineSubmissions.length} Waypoints Now
                        </button>
                    </div>
                )}

                {/* Visual Glassmorphic Metrics Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-gradient-to-br from-earth-dark/10 to-purple-500/10 border border-indigo-100 dark:border-[#4A423C] dark:bg-[#2B2623] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-300">
                            <span className="text-6xl">📡</span>
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-earth-dark dark:text-earth-warm">Total Submissions</h3>
                        <p className="text-4xl font-extrabold mt-3 text-stone-800 dark:text-white">{stats.mySubmissions}</p>
                        <p className="text-[10px] text-stone-500 mt-2 font-medium">Accumulated waypoints logged on platform.</p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-100 dark:border-[#4A423C] dark:bg-[#2B2623] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-300">
                            <span className="text-6xl">⏳</span>
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Pending Approvals</h3>
                        <p className="text-4xl font-extrabold mt-3 text-stone-800 dark:text-white">{stats.pendingTasks}</p>
                        <p className="text-[10px] text-stone-500 mt-2 font-medium">Awaiting administrator verification check.</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-100 dark:border-[#4A423C] dark:bg-[#2B2623] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-300">
                            <span className="text-6xl">✅</span>
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Approved Markers</h3>
                        <p className="text-4xl font-extrabold mt-3 text-stone-800 dark:text-white">{stats.mySubmissions - stats.pendingTasks}</p>
                        <p className="text-[10px] text-stone-500 mt-2 font-medium">Live and active on the primary GIS Canvas.</p>
                    </div>
                </div>

                {/* Main Operations Area */}
                <div className="bg-white dark:bg-[#2B2623] border border-gray-150 dark:border-[#4A423C] rounded-2xl p-6 shadow-xl">
                    <h3 className="text-sm font-bold text-stone-800 dark:text-[#D1CBC5] uppercase tracking-widest mb-4">Operations Center</h3>
                    
                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => { setActiveAction(activeAction === 'file' ? null : 'file'); setParsedPoints([]); }}
                            className={`px-5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeAction === 'file'
                                ? 'bg-earth-dark text-white shadow-md'
                                : 'bg-[#FCFAF8] dark:bg-[#2B2623] text-stone-800 dark:text-[#D1CBC5] hover:bg-[#FCFAF8] dark:hover:bg-slate-750'
                            }`}
                        >
                            📥 Bulk CSV / GeoJSON Parser
                        </button>
                        <button
                            onClick={() => setActiveAction(activeAction === 'manual' ? null : 'manual')}
                            className={`px-5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeAction === 'manual'
                                ? 'bg-earth-dark text-white shadow-md'
                                : 'bg-[#FCFAF8] dark:bg-[#2B2623] text-stone-800 dark:text-[#D1CBC5] hover:bg-[#FCFAF8] dark:hover:bg-slate-750'
                            }`}
                        >
                            📍 Submit Single GeoPoint
                        </button>
                    </div>

                    {/* ACTION 1: BULK FILE UPLOAD & PARSER PANEL */}
                    {activeAction === 'file' && (
                        <div className="mt-6 border-t border-gray-100 dark:border-[#4A423C] pt-5 space-y-6">
                            
                            {/* Drag and Drop Zone */}
                            {parsedPoints.length === 0 && (
                                <div
                                    onDragEnter={handleDrag}
                                    onDragOver={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition ${dragActive
                                        ? 'border-earth-dark bg-indigo-50/20 dark:bg-indigo-950/20'
                                        : 'border-stone-200 dark:border-[#4A423C] hover:border-earth-dark'
                                    }`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={(e) => handleFileParsing(e.target.files[0])}
                                        accept=".csv,.json,.geojson"
                                        className="hidden"
                                    />
                                    <span className="text-4xl block mb-3">📁</span>
                                    <h4 className="font-bold text-sm text-stone-800 dark:text-[#D1CBC5] mb-1">Drag & Drop GeoJSON or CSV file here</h4>
                                    <p className="text-xs text-stone-500">or click to browse local files (Accepts .csv, .json, .geojson)</p>
                                    <div className="mt-4 flex gap-4 justify-center text-[10px] text-stone-500 font-mono">
                                        <span>• Expected CSV columns: name, desc, lat, lng</span>
                                        <span>• Expected GeoJSON: FeatureCollection of Points</span>
                                    </div>
                                </div>
                            )}

                            {/* Live Verification Table Grid */}
                            {parsedPoints.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-4 items-center justify-between bg-[#FCFAF8] dark:bg-[#231F1C] p-4 rounded-xl border border-gray-100 dark:border-[#4A423C]">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">📊</span>
                                            <div>
                                                <h4 className="text-xs font-bold text-stone-800 dark:text-[#D1CBC5]">Parsed GIS Batch Grid</h4>
                                                <p className="text-[10px] text-stone-500 mt-0.5">
                                                    {parsedPoints.filter(p => p.isValid).length} valid / {parsedPoints.length} total points parsed
                                                </p>
                                            </div>
                                        </div>

                                        {/* Global Layer Selection Dropdown */}
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-bold text-stone-500">Target GIS Layer:</label>
                                            <select
                                                value={globalLayerId}
                                                onChange={(e) => setGlobalLayerId(e.target.value)}
                                                className="text-xs font-semibold bg-white dark:bg-[#2B2623] border border-stone-200 dark:border-[#4A423C] rounded-lg px-3 py-1.5 focus:ring-0 focus:outline-none"
                                            >
                                                {layers.map(l => (
                                                    <option key={l._id || l.id} value={l._id || l.id}>{l.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Preview Table */}
                                    <div className="overflow-x-auto border border-gray-100 dark:border-[#4A423C] rounded-xl">
                                        <table className="w-full text-left border-collapse text-xs font-medium">
                                            <thead>
                                                <tr className="bg-[#FCFAF8] dark:bg-[#231F1C] text-stone-500 border-b border-gray-100 dark:border-[#4A423C]">
                                                    <th className="p-3">STATUS</th>
                                                    <th className="p-3">LOCATION NAME</th>
                                                    <th className="p-3">DESCRIPTION</th>
                                                    <th className="p-3">LATITUDE</th>
                                                    <th className="p-3">LONGITUDE</th>
                                                    <th className="p-3 text-center">ACTION</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-slate-850 dark:text-[#D1CBC5]">
                                                {parsedPoints.map((point) => (
                                                    <tr key={point.id} className="hover:bg-[#FCFAF8]/50 dark:hover:bg-slate-850/50">
                                                        <td className="p-3">
                                                            {point.isValid ? (
                                                                <span className="inline-flex px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full font-bold text-[9px]">
                                                                    ✅ Valid
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full font-bold text-[9px]">
                                                                    ❌ Invalid
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            <input
                                                                type="text"
                                                                value={point.name}
                                                                onChange={(e) => handleRowEdit(point.id, 'name', e.target.value)}
                                                                className="bg-transparent border-0 focus:ring-1 focus:ring-earth-dark focus:outline-none rounded px-1.5 py-1 w-full font-semibold"
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <input
                                                                type="text"
                                                                value={point.description}
                                                                placeholder="Optional notes"
                                                                onChange={(e) => handleRowEdit(point.id, 'description', e.target.value)}
                                                                className="bg-transparent border-0 focus:ring-1 focus:ring-earth-dark focus:outline-none rounded px-1.5 py-1 w-full"
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <input
                                                                type="text"
                                                                value={point.latitude}
                                                                onChange={(e) => handleRowEdit(point.id, 'latitude', e.target.value)}
                                                                className="bg-transparent border-0 focus:ring-1 focus:ring-earth-dark focus:outline-none rounded px-1.5 py-1 w-24 font-mono font-semibold"
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <input
                                                                type="text"
                                                                value={point.longitude}
                                                                onChange={(e) => handleRowEdit(point.id, 'longitude', e.target.value)}
                                                                className="bg-transparent border-0 focus:ring-1 focus:ring-earth-dark focus:outline-none rounded px-1.5 py-1 w-24 font-mono font-semibold"
                                                            />
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <button
                                                                onClick={() => deleteRow(point.id)}
                                                                className="text-red-500 hover:text-red-600 font-bold px-2 py-1 rounded"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 justify-end pt-3">
                                        <button
                                            onClick={() => setParsedPoints([])}
                                            className="bg-[#FCFAF8] dark:bg-[#2B2623] hover:bg-[#FCFAF8] dark:hover:bg-slate-700 text-stone-800 dark:text-[#D1CBC5] px-5 py-2.5 rounded-xl text-xs font-bold transition"
                                        >
                                            Reset Grid
                                        </button>
                                        <button
                                            onClick={submitBulkBatch}
                                            disabled={bulkUploading}
                                            className="bg-earth-dark hover:bg-earth-dark text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
                                        >
                                            {bulkUploading ? 'Uploading Batch...' : 'Submit Batch to Admin'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ACTION 2: SINGLE MARKER SUBMISSION FORM */}
                    {activeAction === 'manual' && (
                        <form onSubmit={handleMarkerSubmit} className="mt-6 border-t border-gray-100 dark:border-[#4A423C] pt-5 space-y-4 max-w-2xl">
                            <h4 className="font-bold text-xs text-earth-dark dark:text-earth-warm uppercase tracking-wider mb-2">Submit New GeoPoint Submission</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-stone-500">Location / Field Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Ludhiana Research Farm A"
                                        required
                                        className="w-full border-stone-200 dark:border-[#4A423C] dark:bg-[#2B2623] dark:text-white rounded-xl text-xs font-semibold px-4 py-3 focus:ring-1 focus:ring-earth-dark focus:outline-none"
                                        value={markerData.name}
                                        onChange={e => setMarkerData('name', e.target.value)}
                                    />
                                    {markerErrors.name && <div className="text-red-500 text-[10px] mt-0.5 font-bold">{markerErrors.name}</div>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-stone-500">Target GIS Layer Category</label>
                                    <select
                                        value={markerData.layer_id}
                                        onChange={e => setMarkerData('layer_id', e.target.value)}
                                        className="w-full border-stone-200 dark:border-[#4A423C] dark:bg-[#2B2623] dark:text-white rounded-xl text-xs font-semibold px-4 py-3 focus:ring-1 focus:ring-earth-dark focus:outline-none"
                                    >
                                        {layers.map(l => (
                                            <option key={l._id || l.id} value={l._id || l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                    {markerErrors.layer_id && <div className="text-red-500 text-[10px] mt-0.5 font-bold">{markerErrors.layer_id}</div>}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500">Geoposition Description / Attributes</label>
                                <textarea
                                    placeholder="Enter physical observations, soil health traits, or agricultural metadata here."
                                    rows="3"
                                    className="w-full border-stone-200 dark:border-[#4A423C] dark:bg-[#2B2623] dark:text-white rounded-xl text-xs font-semibold px-4 py-3 focus:ring-1 focus:ring-earth-dark focus:outline-none"
                                    value={markerData.description}
                                    onChange={e => setMarkerData('description', e.target.value)}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-stone-500">Decimal Latitude (N/S)</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (navigator.geolocation) {
                                                    navigator.geolocation.getCurrentPosition(
                                                        (position) => {
                                                            setMarkerData(prev => ({
                                                                ...prev,
                                                                latitude: position.coords.latitude.toFixed(6),
                                                                longitude: position.coords.longitude.toFixed(6)
                                                            }));
                                                            alert('Live Coordinates detected successfully!');
                                                        },
                                                        (error) => alert('Geolocation error: ' + error.message)
                                                    );
                                                } else {
                                                    alert('Geolocation is not supported by your browser.');
                                                }
                                            }}
                                            className="text-[10px] text-earth-dark dark:text-earth-warm font-bold hover:underline transition"
                                        >
                                            📍 GPS Auto-Detect
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="e.g. 30.9010"
                                        required
                                        className="w-full border-stone-200 dark:border-[#4A423C] dark:bg-[#2B2623] dark:text-white rounded-xl text-xs font-mono font-semibold px-4 py-3 focus:ring-1 focus:ring-earth-dark focus:outline-none"
                                        value={markerData.latitude}
                                        onChange={e => setMarkerData('latitude', e.target.value)}
                                    />
                                    {markerErrors.latitude && <div className="text-red-500 text-[10px] mt-0.5 font-bold">{markerErrors.latitude}</div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-stone-500">Decimal Longitude (E/W)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="e.g. 75.8573"
                                        required
                                        className="w-full border-stone-200 dark:border-[#4A423C] dark:bg-[#2B2623] dark:text-white rounded-xl text-xs font-mono font-semibold px-4 py-3 focus:ring-1 focus:ring-earth-dark focus:outline-none"
                                        value={markerData.longitude}
                                        onChange={e => setMarkerData('longitude', e.target.value)}
                                    />
                                    {markerErrors.longitude && <div className="text-red-500 text-[10px] mt-0.5 font-bold">{markerErrors.longitude}</div>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-500">Attach Field Photos (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files);
                                        const base64Promises = files.map(file => {
                                            return new Promise((resolve) => {
                                                const reader = new FileReader();
                                                reader.onload = (event) => resolve(event.target.result);
                                                reader.readAsDataURL(file);
                                            });
                                        });
                                        Promise.all(base64Promises).then(base64Images => {
                                            setMarkerData('media', base64Images);
                                        });
                                    }}
                                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-earth-dark dark:file:bg-indigo-950/40 dark:file:text-earth-warm file:cursor-pointer"
                                />
                                {markerData.media && markerData.media.length > 0 && (
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {markerData.media.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <img src={img} className="w-12 h-12 object-cover rounded-lg border border-stone-200 dark:border-[#4A423C]" />
                                                <button
                                                    type="button"
                                                    onClick={() => setMarkerData('media', markerData.media.filter((_, i) => i !== idx))}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-bold"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={markerProcessing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20"
                                >
                                    {markerProcessing ? 'Submitting...' : 'Submit for Admin Verification'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Submitted Waypoints Queue Feed */}
                <div className="bg-white dark:bg-[#2B2623] border border-gray-150 dark:border-[#4A423C] rounded-2xl p-6 shadow-xl mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-stone-800 dark:text-[#D1CBC5] uppercase tracking-widest">
                            📋 My Submitted GeoPoints Queue
                        </h3>
                        <span className="text-[10px] text-stone-500 font-bold font-mono">
                            Showing {submissions.length} records
                        </span>
                    </div>

                    {submissions.length > 0 ? (
                        <div className="overflow-x-auto border border-gray-100 dark:border-[#4A423C] rounded-xl">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-[#FCFAF8] dark:bg-[#231F1C] text-stone-500 border-b border-gray-100 dark:border-[#4A423C] font-bold">
                                        <th className="p-3">LOCATION NAME</th>
                                        <th className="p-3">GIS LAYER</th>
                                        <th className="p-3">DESCRIPTION</th>
                                        <th className="p-3">COORDINATES (LAT / LNG)</th>
                                        <th className="p-3">STATUS</th>
                                        <th className="p-3 text-right">SUBMITTED</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-850 dark:text-[#D1CBC5] font-medium">
                                    {submissions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-[#FCFAF8]/50 dark:hover:bg-slate-850/30">
                                            <td className="p-3 font-bold text-stone-800 dark:text-white">{sub.name}</td>
                                            <td className="p-3">
                                                <span className="inline-flex px-2 py-0.5 bg-earth-dark/10 text-earth-dark dark:text-earth-warm rounded-full font-bold text-[10px]">
                                                    {sub.layer_name}
                                                </span>
                                            </td>
                                            <td className="p-3 text-stone-500 dark:text-[#A89F98] max-w-xs truncate" title={sub.description}>
                                                {sub.description || <span className="italic text-stone-500">No notes</span>}
                                            </td>
                                            <td className="p-3 font-mono text-stone-500 dark:text-[#D1CBC5]">
                                                {sub.latitude !== null && sub.longitude !== null ? `${sub.latitude}, ${sub.longitude}` : 'No Coordinates'}
                                            </td>
                                            <td className="p-3">
                                                {sub.status === 'approved' ? (
                                                    <span className="inline-flex px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full font-bold text-[10px]">
                                                        ✅ Approved
                                                    </span>
                                                ) : sub.status === 'rejected' ? (
                                                    <span className="inline-flex px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full font-bold text-[10px]">
                                                        ❌ Rejected
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full font-bold text-[10px]">
                                                        ⏳ Pending
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
                        <div className="text-center py-8 text-stone-500">
                            <span className="text-3xl block mb-2">📡</span>
                            <p className="text-xs font-semibold">You have not submitted any GeoPoints yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
