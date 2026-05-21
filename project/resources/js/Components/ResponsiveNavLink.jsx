import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-earth-warm bg-earth-dark/5 text-earth-dark dark:text-earth-cream focus:border-earth-dark focus:bg-earth-dark/10'
                    : 'border-transparent text-stone-600 dark:text-stone-400 hover:border-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900 hover:text-stone-800 dark:hover:text-stone-200 focus:border-stone-300 focus:bg-stone-50 focus:text-stone-800'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
