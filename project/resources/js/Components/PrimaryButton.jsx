export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-xl border border-transparent bg-earth-dark hover:bg-earth-dark/90 dark:bg-earth-warm dark:hover:bg-earth-warm/90 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-earth-warm focus:ring-offset-2 active:scale-95 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
