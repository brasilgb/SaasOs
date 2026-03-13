import { useActiveSection } from "@/Utils/use-active-section";
import { useState } from "react";

export default function LegalSidebar({ sections }: any) {

  const active = useActiveSection(sections.map((s: any) => s.id));
  const [open, setOpen] = useState(false);

  return (
    <aside>

      {/* botão mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden mb-6 text-sm font-medium"
      >
        Índice
      </button>

      <nav
        className={`
        ${open ? "block" : "hidden"}
        lg:block
        sticky top-24
        space-y-2
        text-sm
        `}
      >

        <p className="font-semibold mb-4 text-foreground">
          Índice
        </p>

        {sections.map((section: any) => (

          <a
            key={section.id}
            href={`#${section.id}`}
            className={`
              block
              border-l
              pl-3
              py-1
              transition-colors

              ${
                active === section.id
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }
            `}
          >
            {section.title}
          </a>

        ))}

      </nav>

    </aside>
  );
}