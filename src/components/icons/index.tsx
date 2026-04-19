/**
 * Farmlink icon library — high-end custom SVG icons.
 *
 * Each icon is drawn on a 24x24 grid, 1.6px stroke. Use via:
 *   import { ShieldIcon } from "@/components/icons";
 *   <ShieldIcon size={18} className="text-primary" />
 *
 * Props mirror an <svg> element (size, strokeWidth, className, ...).
 */

import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

const make = (displayName: string, paths: React.ReactNode) =>
  Object.assign(
    forwardRef<SVGSVGElement, IconProps>(function GeneratedIcon(props, ref) {
      return (
        <Icon ref={ref} {...props}>
          {paths}
        </Icon>
      );
    }),
    { displayName },
  );

/* ---------- Navigation & UI ---------- */

export const HomeIcon = make(
  "HomeIcon",
  <>
    <path d="M3.5 11.2 12 4l8.5 7.2" />
    <path d="M5.5 10v9.5a.5.5 0 0 0 .5.5h4v-6h4v6h4a.5.5 0 0 0 .5-.5V10" />
  </>,
);

export const SearchIcon = make(
  "SearchIcon",
  <>
    <circle cx="10.75" cy="10.75" r="6.25" />
    <path d="m20 20-4.6-4.6" />
  </>,
);

export const PlusIcon = make(
  "PlusIcon",
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>,
);

export const BellIcon = make(
  "BellIcon",
  <>
    <path d="M6 10a6 6 0 1 1 12 0c0 3.2.8 5.1 1.8 6.2.4.4.1 1-.4 1H4.6c-.5 0-.8-.6-.4-1C5.2 15.1 6 13.2 6 10Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </>,
);

export const UserIcon = make(
  "UserIcon",
  <>
    <circle cx="12" cy="8.5" r="3.6" />
    <path d="M4.5 20c1-3.6 4.1-5.6 7.5-5.6s6.5 2 7.5 5.6" />
  </>,
);

export const BookmarkIcon = make(
  "BookmarkIcon",
  <>
    <path d="M6.5 4.5h11a.5.5 0 0 1 .5.5v15l-6-3.7L6 20V5a.5.5 0 0 1 .5-.5Z" />
  </>,
);

export const HeartIcon = make(
  "HeartIcon",
  <>
    <path d="M12 20s-7.5-4.4-7.5-10A4.5 4.5 0 0 1 12 7.4 4.5 4.5 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z" />
  </>,
);

export const ArrowRightIcon = make(
  "ArrowRightIcon",
  <>
    <path d="M4.5 12h14.5" />
    <path d="M13.5 6.5 20 12l-6.5 5.5" />
  </>,
);

export const ArrowLeftIcon = make(
  "ArrowLeftIcon",
  <>
    <path d="M19.5 12H5" />
    <path d="M10.5 17.5 4 12l6.5-5.5" />
  </>,
);

export const CloseIcon = make(
  "CloseIcon",
  <>
    <path d="m6 6 12 12" />
    <path d="M18 6 6 18" />
  </>,
);

export const CheckIcon = make(
  "CheckIcon",
  <>
    <path d="m4.5 12.5 4.5 4.5 10.5-10.5" />
  </>,
);

export const SignOutIcon = make(
  "SignOutIcon",
  <>
    <path d="M14 4.5h4a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-4" />
    <path d="M9 8.5 4.5 12 9 15.5" />
    <path d="M4.5 12h11" />
  </>,
);

/* ---------- Trust & verification ---------- */

export const ShieldIcon = make(
  "ShieldIcon",
  <>
    <path d="M12 3 4.5 5.5v6c0 4.7 3.2 8.6 7.5 9.5 4.3-.9 7.5-4.8 7.5-9.5v-6L12 3Z" />
    <path d="m8.5 12 2.5 2.5L15.5 10" />
  </>,
);

export const VerifiedBadgeIcon = make(
  "VerifiedBadgeIcon",
  <>
    <path d="M12 3.5 14 5l2.4-.4.7 2.3 2.1 1.2-.9 2.3.9 2.3-2.1 1.2-.7 2.3L14 15.5 12 17l-2-1.5-2.4.4-.7-2.3L4.8 12.4l.9-2.3-.9-2.3 2.1-1.2L7.6 4.6 10 5l2-1.5Z" />
    <path d="m9 11 2 2 4-4.5" />
  </>,
);

export const SparkleIcon = make(
  "SparkleIcon",
  <>
    <path d="M12 4 13.4 9 18.5 10.5 13.4 12 12 17l-1.4-5L5.5 10.5 10.6 9 12 4Z" />
    <path d="M19 16.5 19.6 18l1.4.5-1.4.5L19 20.5l-.6-1.5L17 18.5l1.4-.5L19 16.5Z" />
  </>,
);

/* ---------- Comms ---------- */

export const ChatBubbleIcon = make(
  "ChatBubbleIcon",
  <>
    <path d="M5 5.5h14a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-7L8 19v-3.5H5a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5Z" />
  </>,
);

export const WhatsAppIcon = make(
  "WhatsAppIcon",
  <>
    <path d="M4.5 19.5 6 15.6a8 8 0 1 1 3.4 3.4l-4.9.5Z" />
    <path d="M9 10.5c.4 1.5 1.5 2.6 3 3 .6.2 1 .1 1.4-.3l.7-.7 2 .8c.1 1.2-.7 2.2-1.9 2.4-2.7.4-6.3-3.2-5.9-5.9.2-1.2 1.2-2 2.4-1.9l.8 2-.7.7c-.4.4-.5.8-.3 1.4Z" />
  </>,
);

/* ---------- Place & logistics ---------- */

export const MapPinIcon = make(
  "MapPinIcon",
  <>
    <path d="M12 21c-3.5-4.2-6.5-7.6-6.5-11a6.5 6.5 0 0 1 13 0c0 3.4-3 6.8-6.5 11Z" />
    <circle cx="12" cy="10" r="2.4" />
  </>,
);

export const TruckIcon = make(
  "TruckIcon",
  <>
    <path d="M2.5 16.5V7a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v9.5" />
    <path d="M13.5 10h4l3 3v3.5h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </>,
);

export const CompassIcon = make(
  "CompassIcon",
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m14.5 9.5-1.2 3.8L9.5 14.5l1.2-3.8L14.5 9.5Z" />
  </>,
);

/* ---------- Marketplace & commerce ---------- */

export const TagIcon = make(
  "TagIcon",
  <>
    <path d="M4.5 4.5h6L20 14l-5.5 5.5L5 10V4.5Z" />
    <circle cx="8.2" cy="8.2" r="1.2" />
  </>,
);

export const StorefrontIcon = make(
  "StorefrontIcon",
  <>
    <path d="m4 9 1.5-4.5h13L20 9" />
    <path d="M4 9v.5a3 3 0 0 0 4 2.8 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 4-2.8V9" />
    <path d="M5.5 11.5V20h13v-8.5" />
    <path d="M10 20v-5h4v5" />
  </>,
);

export const ListingsIcon = make(
  "ListingsIcon",
  <>
    <rect x="4" y="4.5" width="16" height="15" rx="2" />
    <path d="M8 9.5h8" />
    <path d="M8 13h8" />
    <path d="M8 16.5h5" />
  </>,
);

/* ---------- Categories (livestock) ---------- */

export const CattleIcon = make(
  "CattleIcon",
  <>
    <path d="M5 8.5c.5-2 2-3 4-2.5l3 1 3-1c2-.5 3.5.5 4 2.5" />
    <path d="M6 8.5h12v6a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-6Z" />
    <path d="M10 13h.01M14 13h.01" />
  </>,
);

export const GoatIcon = make(
  "GoatIcon",
  <>
    <path d="M7 6 5.5 4M17 6l1.5-2" />
    <path d="M5 12c0-3 2-5 5-5h4c3 0 5 2 5 5v3a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4v-3Z" />
    <path d="M9 13h.01M15 13h.01" />
    <path d="M11 17h2" />
  </>,
);

export const SheepIcon = make(
  "SheepIcon",
  <>
    <circle cx="8" cy="11" r="2" />
    <circle cx="12" cy="9" r="2.2" />
    <circle cx="16" cy="11" r="2" />
    <circle cx="10" cy="13" r="2" />
    <circle cx="14" cy="13" r="2" />
    <path d="M7 16h10v1.5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V16Z" />
  </>,
);

export const PoultryIcon = make(
  "PoultryIcon",
  <>
    <path d="M14.5 5.5a3 3 0 1 1-2.5 4.5" />
    <path d="M12 10c-3.5 0-6 2.5-6 6v.5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-2.5" />
    <path d="M16 7.5h2l-1 1.5" />
    <path d="M9 19.5v1M13 19.5v1" />
  </>,
);

export const PigIcon = make(
  "PigIcon",
  <>
    <path d="M5 11c0-2.8 2.7-5 6-5s6 2.2 6 5v3a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-3Z" />
    <ellipse cx="11" cy="11.5" rx="2" ry="1.6" />
    <path d="M10 11.5h.01M12 11.5h.01" />
    <path d="M16.5 9.5 19 8" />
  </>,
);

export const RabbitIcon = make(
  "RabbitIcon",
  <>
    <path d="M8.5 4.5 9.5 9M12.5 4.5 11.5 9" />
    <path d="M5.5 13c0-2.5 2.5-4.5 5-4.5s5 2 5 4.5v.5c2 .3 3 1.6 3 3.5a2.5 2.5 0 0 1-2.5 2.5h-9A4 4 0 0 1 3 15.5C3 14 4 13 5.5 13Z" />
    <path d="M9 15.5h.01" />
  </>,
);

export const FishIcon = make(
  "FishIcon",
  <>
    <path d="M3 12c2-3.5 5.5-5.5 9-5.5s6 1.5 8 4l-2 1.5 2 1.5c-2 2.5-4.5 4-8 4s-7-2-9-5.5Z" />
    <path d="M16 12h.01" />
    <path d="M3 12c1 0 2 .8 2 2M3 12c1 0 2-.8 2-2" />
  </>,
);

export const EggIcon = make(
  "EggIcon",
  <>
    <path d="M12 3.5c3.5 0 6 4.5 6 9a6 6 0 1 1-12 0c0-4.5 2.5-9 6-9Z" />
  </>,
);

export const ShapesIcon = make(
  "ShapesIcon",
  <>
    <path d="M8 3.5 13 12H3l5-8.5Z" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
    <circle cx="7" cy="17" r="3.5" />
  </>,
);

/* ---------- Misc ---------- */

export const ImagePlusIcon = make(
  "ImagePlusIcon",
  <>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
    <path d="m3.5 16 4-4 4 4 3-3 5.5 5.5" />
    <circle cx="9" cy="9" r="1.5" />
    <path d="M18 3.5v5M15.5 6h5" />
  </>,
);

export const EyeIcon = make(
  "EyeIcon",
  <>
    <path d="M2.5 12C5 7.5 8.3 5 12 5s7 2.5 9.5 7c-2.5 4.5-5.8 7-9.5 7s-7-2.5-9.5-7Z" />
    <circle cx="12" cy="12" r="2.8" />
  </>,
);

export const SeedlingIcon = make(
  "SeedlingIcon",
  <>
    <path d="M12 20v-7" />
    <path d="M12 13c0-3.5-2.5-6-6-6 0 3.5 2.5 6 6 6Z" />
    <path d="M12 13c0-3 2-5.5 5-5.5C17 10.5 15 13 12 13Z" />
  </>,
);
