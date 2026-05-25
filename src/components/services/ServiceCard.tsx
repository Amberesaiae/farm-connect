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
    <article className="group flex h-full flex-col rounded-[20px] bg-card p-2.5 transition-transform hover:-translate-y-1">
      <div className="grid aspect-[5/3] place-items-center rounded-[16px] bg-surface-mint">
        <span className="font-display text-[20px] font-extrabold tracking-tight text-primary">
          {SERVICE_CATEGORY_LABEL[service.category]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-1.5 pb-1 pt-3">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <MapPinIcon size={11} />
          {service.region}
        </p>
        <h3 className="font-display text-[16px] font-extrabold leading-tight tracking-tight text-foreground">
          {service.name}
        </h3>
        <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
          {service.blurb}
        </p>
        <a
          href={wa}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-[12.5px] font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          <WhatsAppIcon size={14} />
          WhatsApp the provider
        </a>
      </div>
    </article>
  );
}
