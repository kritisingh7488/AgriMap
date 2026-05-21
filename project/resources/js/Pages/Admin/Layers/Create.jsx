import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: 'vector',
        style_color: '#3b82f6',
        style_opacity: 0.8,
        is_public: true,
        status: 'active',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.layers.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-stone-800 dark:text-[#E8E4DF]">
                    ➕ Create New GIS Layer
                </h2>
            }
        >
            <Head title="Create Layer" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white dark:bg-[#2B2623] border border-stone-200 dark:border-[#4A423C] shadow-xl rounded-2xl">
                        <div className="p-6 text-stone-800 dark:text-gray-100">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Layer Name */}
                                <div>
                                    <InputLabel htmlFor="name" value="Layer Name" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        placeholder="e.g. Soil Health Parameters, Irrigation Channels"
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                {/* Layer Type */}
                                <div>
                                    <InputLabel htmlFor="type" value="Layer Data Type" />
                                    <select
                                        id="type"
                                        name="type"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-stone-200 shadow-sm focus:border-earth-dark focus:ring-earth-dark dark:border-[#4A423C] dark:bg-[#2B2623] dark:text-[#D1CBC5] text-sm"
                                    >
                                        <option value="vector">📐 Vector Layer (Markers, Polygons, Lines)</option>
                                        <option value="raster">🖼️ Raster Layer (Satellite Overlays, Image Grid)</option>
                                    </select>
                                    <InputError message={errors.type} className="mt-2" />
                                </div>

                                {/* Styling Section */}
                                <div className="p-4 bg-[#FCFAF8] dark:bg-[#2B2623]/50 rounded-xl border border-gray-100 dark:border-[#4A423C] space-y-4">
                                    <h3 className="text-sm font-bold text-stone-800 dark:text-[#D1CBC5]">🎨 Visual Representation</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Color Picker */}
                                        <div>
                                            <InputLabel htmlFor="style_color" value="Default Theme Color" />
                                            <div className="flex gap-2 mt-1">
                                                <input
                                                    type="color"
                                                    id="style_color_picker"
                                                    value={data.style_color}
                                                    onChange={(e) => setData('style_color', e.target.value)}
                                                    className="w-10 h-10 border border-stone-200 dark:border-[#4A423C] rounded cursor-pointer p-0 bg-transparent"
                                                />
                                                <TextInput
                                                    id="style_color"
                                                    type="text"
                                                    value={data.style_color}
                                                    onChange={(e) => setData('style_color', e.target.value)}
                                                    className="block w-full text-xs font-mono"
                                                    placeholder="#3b82f6"
                                                    required
                                                />
                                            </div>
                                            <InputError message={errors.style_color} className="mt-2" />
                                        </div>

                                        {/* Opacity Slider */}
                                        <div>
                                            <InputLabel htmlFor="style_opacity" value={`Opacity (${Math.round(data.style_opacity * 100)}%)`} />
                                            <input
                                                type="range"
                                                id="style_opacity"
                                                min="0.1"
                                                max="1.0"
                                                step="0.05"
                                                value={data.style_opacity}
                                                onChange={(e) => setData('style_opacity', parseFloat(e.target.value))}
                                                className="mt-3 w-full h-2 bg-[#FCFAF8] rounded-lg appearance-none cursor-pointer dark:bg-[#38312D] accent-indigo-600"
                                            />
                                            <InputError message={errors.style_opacity} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                {/* Privacy & Access */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="is_public" value="Public Access" />
                                        <select
                                            id="is_public"
                                            name="is_public"
                                            value={data.is_public ? '1' : '0'}
                                            onChange={(e) => setData('is_public', e.target.value === '1')}
                                            className="mt-1 block w-full rounded-md border-stone-200 shadow-sm focus:border-earth-dark focus:ring-earth-dark dark:border-[#4A423C] dark:bg-[#2B2623] dark:text-[#D1CBC5] text-sm"
                                        >
                                            <option value="1">🌐 Public (All users can view)</option>
                                            <option value="0">🔒 Private (Only Admins/Managers can view)</option>
                                        </select>
                                        <InputError message={errors.is_public} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="status" value="Layer Status" />
                                        <select
                                            id="status"
                                            name="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-stone-200 shadow-sm focus:border-earth-dark focus:ring-earth-dark dark:border-[#4A423C] dark:bg-[#2B2623] dark:text-[#D1CBC5] text-sm"
                                        >
                                            <option value="active">Active (Visible on map toggle)</option>
                                            <option value="inactive">Inactive (Hidden/Draft)</option>
                                        </select>
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4 border-t border-gray-100 dark:border-[#4A423C] pt-6">
                                    <Link
                                        href={route('admin.layers.index')}
                                        className="px-4 py-2 bg-[#FCFAF8] dark:bg-[#38312D] hover:bg-[#FCFAF8] dark:hover:bg-stone-800 text-stone-800 dark:text-[#D1CBC5] rounded-xl text-sm font-semibold transition"
                                    >
                                        Cancel
                                    </Link>
                                    <PrimaryButton className="px-5 py-2.5" disabled={processing}>
                                        Create Layer
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
