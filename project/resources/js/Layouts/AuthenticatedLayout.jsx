import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const { flash } = usePage().props;
    const { theme, toggleTheme } = useTheme();
    const { addToast } = useToast();
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    // Show flash messages as toasts
    useEffect(() => {
        if (flash?.success) addToast(flash.success, 'success');
        if (flash?.error)   addToast(flash.error,   'error');
        if (flash?.warning) addToast(flash.warning,  'warning');
        if (flash?.info)    addToast(flash.info,     'info');
    }, [flash]);

    const isAdmin       = user?.roles?.includes('admin');
    const isDataManager = user?.roles?.includes('data_manager');

    return (
        <div className="min-h-screen bg-[#FCFAF8] dark:bg-[#2B2623] transition-colors duration-200">
            <nav className="border-b border-gray-100 dark:border-[#4A423C] bg-white dark:bg-[#2B2623] shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo + Nav Links */}
                        <div className="flex items-center">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-2.5 group">
                                    <div className="w-9 h-9 rounded-xl bg-earth-dark flex items-center justify-center shadow-md shadow-earth-dark/15">
                                        <span className="text-lg">🌾</span>
                                    </div>
                                    <span className="hidden sm:block font-extrabold text-sm tracking-wider bg-gradient-to-r from-earth-dark to-earth-warm bg-clip-text text-transparent dark:from-earth-cream dark:to-earth-warm uppercase">
                                        AgriMap
                                    </span>
                                </Link>
                            </div>

                            <div className="hidden space-x-1 sm:ms-8 sm:flex">
                                {isAdmin && (
                                    <>
                                        <NavLink href={route('admin.dashboard')} active={route().current('admin.dashboard')}>
                                            📊 Dashboard
                                        </NavLink>
                                        <NavLink href={route('admin.users.index')} active={route().current('admin.users.*')}>
                                            👥 Users
                                        </NavLink>
                                        <NavLink href={route('admin.approvals.index')} active={route().current('admin.approvals.*')}>
                                            ✅ Approvals
                                        </NavLink>
                                        <NavLink href={route('admin.layers.index')} active={route().current('admin.layers.*')}>
                                            🗺️ Layers
                                        </NavLink>
                                        <NavLink href={route('admin.feedbacks.index')} active={route().current('admin.feedbacks.*')}>
                                            📬 Feedbacks
                                        </NavLink>
                                        <NavLink href={route('admin.settings.index')} active={route().current('admin.settings.*')}>
                                            ⚙️ Settings
                                        </NavLink>
                                    </>
                                )}
                                {isDataManager && (
                                    <>
                                        <NavLink href={route('manager.dashboard')} active={route().current('manager.dashboard')}>
                                            📋 Dashboard
                                        </NavLink>
                                    </>
                                )}
                                {!isAdmin && !isDataManager && (
                                    <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                        🏠 Dashboard
                                    </NavLink>
                                )}
                                <NavLink href={route('map')} active={route().current('map')}>
                                    🗺️ GIS Map
                                </NavLink>
                            </div>
                        </div>

                        {/* Right side: theme toggle + user menu */}
                        <div className="hidden sm:flex sm:items-center gap-3">
                            {/* Dark/Light Mode Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full bg-[#FCFAF8] dark:bg-[#38312D] text-stone-500 dark:text-[#D1CBC5] hover:bg-[#FCFAF8] dark:hover:bg-stone-800 transition text-lg"
                                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>

                            {/* User Dropdown */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 rounded-full bg-[#FCFAF8] dark:bg-[#38312D] pl-1 pr-3 py-1 text-sm font-medium text-stone-800 dark:text-[#E8E4DF] hover:bg-[#FCFAF8] dark:hover:bg-stone-800 transition"
                                    >
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                                        ) : (
                                            <span className="w-7 h-7 rounded-full bg-earth-dark text-white flex items-center justify-center text-xs font-bold">
                                                {user?.name?.[0]?.toUpperCase() || 'U'}
                                            </span>
                                        )}
                                        <span className="max-w-24 truncate">{user?.name}</span>
                                        <svg className="h-4 w-4 opacity-60" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <div className="px-4 py-2 text-xs text-stone-500 dark:text-[#A89F98] border-b border-gray-100 dark:border-gray-600">
                                        {user?.roles?.join(', ') || 'user'}
                                    </div>
                                    <Dropdown.Link href={route('profile.edit')}>⚙️ Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        🚪 Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* Mobile hamburger */}
                        <div className="-me-2 flex items-center sm:hidden gap-2">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full bg-[#FCFAF8] dark:bg-[#38312D] text-lg"
                            >
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-stone-500 dark:text-[#D1CBC5] hover:bg-[#FCFAF8] dark:hover:bg-stone-800 transition"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="space-y-1 pb-3 pt-2 border-t border-stone-200 dark:border-[#4A423C]">
                        {isAdmin && (
                            <>
                                <ResponsiveNavLink href={route('admin.dashboard')}>📊 Dashboard</ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.users.index')}>👥 Users</ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.approvals.index')}>✅ Approvals</ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.layers.index')}>🗺️ Layers</ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.feedbacks.index')}>📬 Feedbacks</ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.settings.index')}>⚙️ Settings</ResponsiveNavLink>
                            </>
                        )}
                        {isDataManager && (
                            <ResponsiveNavLink href={route('manager.dashboard')}>📋 Dashboard</ResponsiveNavLink>
                        )}
                        {!isAdmin && !isDataManager && (
                            <ResponsiveNavLink href={route('dashboard')}>🏠 Dashboard</ResponsiveNavLink>
                        )}
                        <ResponsiveNavLink href={route('map')}>🗺️ GIS Map</ResponsiveNavLink>
                    </div>

                    <div className="border-t border-stone-200 dark:border-[#4A423C] pb-1 pt-4">
                        <div className="px-4 mb-2">
                            <div className="text-base font-medium text-stone-800 dark:text-[#E8E4DF]">{user?.name}</div>
                            <div className="text-sm text-stone-500 dark:text-[#A89F98]">{user?.email}</div>
                        </div>
                        <ResponsiveNavLink href={route('profile.edit')}>⚙️ Profile</ResponsiveNavLink>
                        <ResponsiveNavLink method="post" href={route('logout')} as="button">🚪 Log Out</ResponsiveNavLink>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white dark:bg-[#2B2623] shadow-sm border-b border-gray-100 dark:border-[#4A423C]">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
