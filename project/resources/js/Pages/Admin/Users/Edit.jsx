import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Edit({ user }) {
    const { data, setData, put, errors, processing } = useForm({
        name: user.name || '',
        email: user.email || '',
        roles: user.roles || [],
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user._id || user.id));
    };

    const handleRoleChange = (e) => {
        const role = e.target.value;
        if (e.target.checked) {
            setData('roles', [...data.roles, role]);
        } else {
            setData('roles', data.roles.filter((r) => r !== role));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-stone-800">
                    Edit User
                </h2>
            }
        >
            <Head title="Edit User" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-stone-800 max-w-xl">
                            <form onSubmit={submit}>
                                <div className="mb-4">
                                    <label className="block font-medium text-sm text-stone-800">Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border-stone-200 rounded-md shadow-sm"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <div className="text-red-600 mt-1 text-sm">{errors.name}</div>}
                                </div>

                                <div className="mb-4">
                                    <label className="block font-medium text-sm text-stone-800">Email</label>
                                    <input
                                        type="email"
                                        className="mt-1 block w-full border-stone-200 rounded-md shadow-sm"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        required
                                    />
                                    {errors.email && <div className="text-red-600 mt-1 text-sm">{errors.email}</div>}
                                </div>

                                <div className="mb-4">
                                    <label className="block font-medium text-sm text-stone-800 mb-2">Roles</label>
                                    <div className="flex flex-col space-y-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                value="admin"
                                                checked={data.roles.includes('admin')}
                                                onChange={handleRoleChange}
                                                className="rounded border-stone-200 text-earth-dark shadow-sm"
                                            />
                                            <span className="ml-2">Admin</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                value="data_manager"
                                                checked={data.roles.includes('data_manager')}
                                                onChange={handleRoleChange}
                                                className="rounded border-stone-200 text-earth-dark shadow-sm"
                                            />
                                            <span className="ml-2">Data Manager</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                value="user"
                                                checked={data.roles.includes('user')}
                                                onChange={handleRoleChange}
                                                className="rounded border-stone-200 text-earth-dark shadow-sm"
                                            />
                                            <span className="ml-2">User</span>
                                        </label>
                                    </div>
                                    {errors.roles && <div className="text-red-600 mt-1 text-sm">{errors.roles}</div>}
                                </div>

                                <div className="flex items-center mt-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-earth-dark text-white px-4 py-2 rounded shadow hover:bg-earth-dark"
                                    >
                                        Save Changes
                                    </button>
                                    <Link href={route('admin.users.index')} className="ml-4 text-stone-500 hover:text-stone-800">
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
