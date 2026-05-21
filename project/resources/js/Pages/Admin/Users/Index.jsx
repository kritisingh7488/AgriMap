import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function Index({ users }) {
    const { delete: destroy } = useForm();
    const [dragActive, setDragActive] = useState(false);
    const [parsedUsers, setParsedUsers] = useState([]);
    const [bulkUploading, setBulkUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            destroy(route('admin.users.destroy', id));
        }
    };

    // Client-side CSV parser
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
            parseCSVFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            parseCSVFile(e.target.files[0]);
        }
    };

    const parseCSVFile = (file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split(/\r?\n/);
            if (lines.length < 2) {
                alert("CSV file seems empty or invalid.");
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const nameIdx = headers.indexOf('name');
            const emailIdx = headers.indexOf('email');
            const rolesIdx = headers.indexOf('roles') !== -1 ? headers.indexOf('roles') : headers.indexOf('role');

            if (nameIdx === -1 || emailIdx === -1) {
                alert("CSV headers must include at least 'name' and 'email'.");
                return;
            }

            const items = [];
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                // simple CSV comma split (handles basic format)
                const cells = lines[i].split(',').map(c => c.trim());
                if (cells.length < 2) continue;

                const name = cells[nameIdx] || '';
                const email = cells[emailIdx] || '';
                let rawRoles = rolesIdx !== -1 ? cells[rolesIdx] : 'user';
                // clean roles string into array
                const rolesArray = rawRoles.split(';').map(r => r.trim()).filter(Boolean);

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isValidEmail = emailRegex.test(email);
                const isValid = name.length > 0 && isValidEmail;

                items.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name,
                    email,
                    roles: rolesArray.length > 0 ? rolesArray : ['user'],
                    isValid
                });
            }
            setParsedUsers(items);
        };
        reader.readAsText(file);
    };

    const handleRowEdit = (id, field, value) => {
        setParsedUsers(prev => prev.map(u => {
            if (u.id === id) {
                const updated = { ...u, [field]: value };
                // Revalidate
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isValidEmail = emailRegex.test(updated.email);
                updated.isValid = updated.name.length > 0 && isValidEmail;
                return updated;
            }
            return u;
        }));
    };

    const deleteRow = (id) => {
        setParsedUsers(prev => prev.filter(u => u.id !== id));
    };

    const submitBulkUsers = async () => {
        const invalidCount = parsedUsers.filter(u => !u.isValid).length;
        if (invalidCount > 0) {
            alert(`Please fix the ${invalidCount} invalid rows first.`);
            return;
        }

        setBulkUploading(true);
        try {
            const response = await fetch(route('admin.users.bulk'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ users: parsedUsers })
            });

            if (response.ok) {
                alert("Bulk users imported successfully!");
                setParsedUsers([]);
                router.reload();
            } else {
                const errData = await response.json();
                alert(`Upload failed: ${errData.message || 'Error occurred'}`);
            }
        } catch (error) {
            alert(`Network error during bulk import: ${error.message}`);
        } finally {
            setBulkUploading(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-stone-800 dark:text-slate-100 flex items-center justify-between">
                    <span>👥 User & Account Management</span>
                    <a
                        href={route('admin.users.export')}
                        className="bg-earth-dark hover:bg-earth-dark text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
                    >
                        📥 Export All (CSV)
                    </a>
                </h2>
            }
        >
            <Head title="User Management" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Drag and Drop CSV Importer Section */}
                    <div className="bg-white dark:bg-[#2B2623] border border-gray-150 dark:border-[#4A423C] rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xs font-bold text-stone-800 dark:text-[#D1CBC5] uppercase tracking-widest mb-4 flex items-center gap-2">
                            📥 Bulk User CSV Importer
                        </h3>
                        
                        {!parsedUsers.length ? (
                            <div 
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[160px] ${
                                    dragActive 
                                        ? 'border-earth-dark bg-earth-dark/5' 
                                        : 'border-stone-200 dark:border-[#4A423C] hover:border-earth-dark/50 hover:bg-[#FCFAF8]/50 dark:hover:bg-slate-850/20'
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                                <span className="text-4xl mb-2">📁</span>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-350">
                                    Drag & drop your User CSV file here, or click to browse
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                                    Required Columns: name, email | Optional: roles (use semicolon delimiter for multiple)
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#4A423C] pb-3">
                                    <div className="text-xs font-bold text-earth-dark dark:text-earth-warm">
                                        Parsed {parsedUsers.length} user record(s) ready for review
                                    </div>
                                    <button 
                                        onClick={() => setParsedUsers([])}
                                        className="text-xs text-red-500 hover:underline font-bold"
                                    >
                                        Cancel Import
                                    </button>
                                </div>

                                <div className="overflow-x-auto border border-gray-100 dark:border-[#4A423C] rounded-xl">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-[#FCFAF8] dark:bg-[#231F1C] text-stone-500 border-b border-gray-100 dark:border-[#4A423C]">
                                                <th className="p-3">STATUS</th>
                                                <th className="p-3">FULL NAME</th>
                                                <th className="p-3">EMAIL ADDRESS</th>
                                                <th className="p-3">ROLES (Semicolon Split)</th>
                                                <th className="p-3 text-center">ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-slate-850 dark:text-[#D1CBC5]">
                                            {parsedUsers.map((u) => (
                                                <tr key={u.id} className="hover:bg-[#FCFAF8]/50 dark:hover:bg-slate-850/50">
                                                    <td className="p-3">
                                                        {u.isValid ? (
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
                                                            value={u.name}
                                                            onChange={(e) => handleRowEdit(u.id, 'name', e.target.value)}
                                                            className="bg-transparent border-0 focus:ring-1 focus:ring-earth-dark focus:outline-none rounded px-1.5 py-1 w-full font-semibold text-xs"
                                                        />
                                                    </td>
                                                    <td className="p-3">
                                                        <input
                                                            type="email"
                                                            value={u.email}
                                                            onChange={(e) => handleRowEdit(u.id, 'email', e.target.value)}
                                                            className="bg-transparent border-0 focus:ring-1 focus:ring-earth-dark focus:outline-none rounded px-1.5 py-1 w-full text-xs font-mono"
                                                        />
                                                    </td>
                                                    <td className="p-3">
                                                        <input
                                                            type="text"
                                                            value={u.roles.join(';')}
                                                            onChange={(e) => handleRowEdit(u.id, 'roles', e.target.value.split(';'))}
                                                            className="bg-transparent border-0 focus:ring-1 focus:ring-earth-dark focus:outline-none rounded px-1.5 py-1 w-full text-xs font-mono"
                                                            placeholder="user;data_manager"
                                                        />
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <button
                                                            onClick={() => deleteRow(u.id)}
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

                                <div className="flex gap-3 justify-end pt-3">
                                    <button
                                        onClick={submitBulkUsers}
                                        disabled={bulkUploading}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/10"
                                    >
                                        {bulkUploading ? 'Importing Users...' : '🚀 Submit Batch Import'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Active Registry Users List */}
                    <div className="bg-white dark:bg-[#2B2623] border border-gray-150 dark:border-[#4A423C] rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xs font-bold text-stone-800 dark:text-[#D1CBC5] uppercase tracking-widest mb-4">
                            👥 Active Account Registry
                        </h3>

                        <div className="overflow-x-auto border border-gray-100 dark:border-[#4A423C] rounded-xl">
                            <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-850 text-xs">
                                <thead>
                                    <tr className="bg-[#FCFAF8] dark:bg-[#231F1C] text-stone-500 border-b border-gray-100 dark:border-[#4A423C] font-bold">
                                        <th className="px-6 py-3.5 text-left uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3.5 text-left uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3.5 text-left uppercase tracking-wider">Assigned Roles</th>
                                        <th className="relative px-6 py-3.5"><span className="sr-only">Edit</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-[#2B2623] divide-y divide-gray-100 dark:divide-slate-850 text-stone-800 dark:text-[#D1CBC5]">
                                    {users.data.map((user) => (
                                        <tr key={user._id || user.id} className="hover:bg-[#FCFAF8]/50 dark:hover:bg-slate-850/30">
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-stone-800 dark:text-white">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-mono">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {(user.roles || ['user']).map((role) => (
                                                        <span 
                                                            key={role} 
                                                            className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                                                                role === 'admin' 
                                                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-450' 
                                                                    : role === 'data_manager'
                                                                        ? 'bg-earth-dark/10 text-earth-dark dark:text-indigo-405'
                                                                        : 'bg-[#FCFAF8]0/10 text-slate-600 dark:text-slate-400'
                                                            }`}
                                                        >
                                                            {role.replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold">
                                                <Link href={route('admin.users.edit', user._id || user.id)} className="text-earth-dark hover:text-earth-dark dark:text-earth-warm mr-4">Edit</Link>
                                                <button onClick={() => handleDelete(user._id || user.id)} className="text-red-500 hover:text-red-650">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination links */}
                        <div className="mt-4 flex justify-between items-center text-xs font-bold">
                            <span className="text-stone-500">Page {users.current_page} of {users.last_page}</span>
                            <div className="flex gap-2">
                                {users.prev_page_url && (
                                    <Link href={users.prev_page_url} className="bg-slate-100 dark:bg-[#2B2623] hover:bg-slate-200 text-slate-700 dark:text-slate-350 px-3.5 py-2 rounded-xl transition">
                                        Previous
                                    </Link>
                                )}
                                {users.next_page_url && (
                                    <Link href={users.next_page_url} className="bg-slate-100 dark:bg-[#2B2623] hover:bg-slate-200 text-slate-700 dark:text-slate-350 px-3.5 py-2 rounded-xl transition">
                                        Next
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
