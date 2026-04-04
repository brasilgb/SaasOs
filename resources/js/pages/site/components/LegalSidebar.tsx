import { useActiveSection } from '@/Utils/use-active-section';
import { useState } from 'react';

export default function LegalSidebar({ sections }: any) {
    const active = useActiveSection(sections.map((s: any) => s.id));
    const [open, setOpen] = useState(false);

    return (
        <aside>
            {/* botão mobile */}
            <button onClick={() => setOpen(!open)} className="mb-6 text-sm font-medium lg:hidden">
                Índice
            </button>

            <nav className={` ${open ? 'block' : 'hidden'} sticky top-24 space-y-2 text-sm lg:block`}>
                <p className="text-foreground mb-4 font-semibold">Índice</p>

                {sections.map((section: any) => (
                    <a
                        key={section.id}
                        href={`#${section.id}`}
                        className={`block border-l py-1 pl-3 transition-colors ${
                            active === section.id
                                ? 'border-primary text-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground border-transparent'
                        } `}
                    >
                        {section.title}
                    </a>
                ))}
            </nav>
        </aside>
    );
}
