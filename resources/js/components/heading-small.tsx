export default function HeadingSmall({ title, description, license, time_remaining }: { title: string; description?: string, license?: string, time_remaining?: string }) {
    return (
        <header>
            <h3 className="mb-0.5 text-base font-medium">{title} <span className="font-semibold text-sky-500">{license}</span> <span className="text-amber-600">{time_remaining}</span></h3>
            {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </header>
    );
}
