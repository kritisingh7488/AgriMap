import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-earth-warm text-stone-900 dark:text-white focus:border-earth-dark'
                    : 'border-transparent text-stone-550 dark:text-stone-400 hover:border-stone-300 hover:text-stone-700 dark:hover:text-stone-300 focus:border-stone-350 focus:text-stone-700') +
                className
            }
        >
            {children}
        </Link>
    );
}
