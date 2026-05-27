import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Feedbacks({ feedbacks = [] }) {
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    const submitReply = (id) => {
        if (!replyText.trim()) return;
        router.post(route('admin.feedbacks.reply', id), { reply: replyText, status: 'resolved' }, {
            preserveScroll: true,
            onSuccess: () => {
                alert('Reply sent successfully!');
                setReplyingTo(null);
                setReplyText('');
            }
        });
    };
    
    const updateStatus = (id, newStatus) => {
        router.put(route('admin.feedbacks.update', id), { status: newStatus }, {
            preserveScroll: true,
            onSuccess: () => alert('Feedback ticket status synchronized successfully!')
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-stone-800 dark:text-slate-100">
                    📬 User Feedback Tickets Registry
                </h2>
            }
        >
            <Head title="User Feedbacks" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-[#2B2623] border border-gray-150 dark:border-[#4A423C] rounded-2xl p-6 shadow-xl">
                        
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xs font-bold text-stone-800 dark:text-[#D1CBC5] uppercase tracking-widest">
                                    Ticket Stream
                                </h3>
                                <p className="text-[11px] text-stone-500">Manage user feature requests, bug reports, and layer reviews.</p>
                            </div>
                            <span className="text-[10px] text-stone-500 font-bold font-mono">
                                Total Tickets: {feedbacks.length}
                            </span>
                        </div>

                        {feedbacks.length > 0 ? (
                            <div className="space-y-4">
                                {feedbacks.map((ticket) => (
                                    <div 
                                        key={ticket.id}
                                        className={`p-5 rounded-2xl border transition-all duration-150 ${
                                            ticket.status === 'resolved'
                                                ? 'bg-[#FCFAF8]/50 dark:bg-[#231F1C]/20 border-stone-200 dark:border-[#4A423C]/80 opacity-75'
                                                : ticket.status === 'read'
                                                    ? 'bg-white dark:bg-[#2B2623] border-indigo-100 dark:border-[#4A423C]'
                                                    : 'bg-earth-dark/5 border-indigo-250 dark:border-indigo-900/40 shadow-sm shadow-indigo-600/5'
                                        }`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-extrabold text-sm text-stone-800 dark:text-white">
                                                        {ticket.subject}
                                                    </span>
                                                    {ticket.status === 'unread' && (
                                                        <span className="inline-flex px-1.5 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full font-bold text-[9px] uppercase tracking-wider">
                                                            New
                                                        </span>
                                                    )}
                                                    {ticket.status === 'resolved' && (
                                                        <span className="inline-flex px-1.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full font-bold text-[9px] uppercase tracking-wider">
                                                            Resolved
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-stone-500 font-medium">
                                                    Submitted by <strong className="text-stone-500 dark:text-[#D1CBC5]">{ticket.name}</strong> ({ticket.email}) • <span className="font-mono">{ticket.created_at}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {ticket.status !== 'read' && ticket.status !== 'resolved' && (
                                                    <button
                                                        onClick={() => updateStatus(ticket.id, 'read')}
                                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#2B2623] dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-[10px] font-bold rounded-xl transition"
                                                    >
                                                        Mark as Read
                                                    </button>
                                                )}
                                                {ticket.status !== 'resolved' && (
                                                    <button
                                                        onClick={() => updateStatus(ticket.id, 'resolved')}
                                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded-xl transition shadow-md shadow-green-600/10"
                                                    >
                                                        ✅ Resolve Ticket
                                                    </button>
                                                )}
                                                {ticket.status === 'resolved' && (
                                                    <button
                                                        onClick={() => updateStatus(ticket.id, 'unread')}
                                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#2B2623] dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-[10px] font-bold rounded-xl transition"
                                                    >
                                                        Re-open
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <p className="mt-3 text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans bg-[#FCFAF8]/80 dark:bg-[#231F1C]/40 p-3 rounded-xl border border-slate-100/50 dark:border-[#4A423C]">
                                            {ticket.message}
                                        </p>

                                        {ticket.admin_reply ? (
                                            <div className="mt-4 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                                                        <span>↩️</span> Admin Reply
                                                    </span>
                                                    <span className="text-[9px] text-stone-400">{ticket.admin_reply_at}</span>
                                                </div>
                                                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">{ticket.admin_reply}</p>
                                            </div>
                                        ) : (
                                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#4A423C]/50">
                                                {replyingTo === ticket.id ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            className="w-full text-xs rounded-xl border-stone-200 dark:border-[#4A423C] dark:bg-[#231F1C] dark:text-white focus:ring-1 focus:ring-indigo-500"
                                                            rows="3"
                                                            placeholder="Write a reply to the user..."
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                        ></textarea>
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setReplyingTo(null)} className="px-3 py-1.5 text-[10px] font-bold text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition">Cancel</button>
                                                            <button onClick={() => submitReply(ticket.id)} className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition">Send Reply & Resolve</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => { setReplyingTo(ticket.id); setReplyText(''); }} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1">
                                                        <span>↩️</span> Write Reply
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-stone-500">
                                <span className="text-4xl block mb-2">📬</span>
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">No tickets found</h4>
                                <p className="text-xs text-stone-500 mt-1">There are currently no feedback tickets registered in the database.</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
