import { MapPinIcon, WhatsAppIcon } from "@/components/icons";
import {
  SERVICE_CATEGORY_LABEL,
  type ServiceProvider,
} from "@/lib/services-data";

export function ServiceCard({ service }: { service: ServiceProvider }) {
  const wa = `https://wa.me/${service.whatsappE164.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
    `Hello, I found ${service.name} on Farmlink and would like to enquire.`,
  )}`;
  return (
    <article className="flex h-full flex-col rounded-2xl border-[1.5px] border-border bg-card p-5">
      <span className="inline-flex w-fit items-center rounded-full bg-primary-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-primary">
        {SERVICE_CATEGORY_LABEL[service.category]}
      </span>
      <h3 className="font-display mt-3 text-[17px] font-extrabold tracking-tight text-foreground">
        {service.name}
      </h3>
      <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-muted-foreground">
        <MapPinIcon size={12} />
        {service.region}
      </p>
      <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-foreground/80">
        {service.blurb}
      </p>
      <a
        href={wa}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-md bg-[#25D366] px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#20bd5a]"
      >
        <WhatsAppIcon size={16} />
        Contact on WhatsApp
      </a>
    </article>
  );
}
