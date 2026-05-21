export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-stone-200 text-earth-dark shadow-sm focus:ring-earth-dark ' +
                className
            }
        />
    );
}
