import { logoOrange } from "@/utils/avatarHelper";

export default function BrandLogo({ className = "h-10 w-auto object-contain", alt = "D'Piero Restaurante" }) {
  return (
    <span className="relative inline-flex items-center shrink-0">
      <img
        src={logoOrange}
        alt={alt}
        width={460}
        height={75}
        style={{ aspectRatio: "460 / 75" }}
        fetchPriority="high"
        decoding="sync"
        className={`block ${className} dark:opacity-0`}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/assets/images/logo-dpiero-orange.png";
        }}
      />
      <span
        aria-hidden="true"
        className="hidden dark:block absolute inset-0"
        style={{
          backgroundColor: "var(--md-sys-color-primary)",
          WebkitMaskImage: `url("${logoOrange}")`,
          maskImage: `url("${logoOrange}")`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
    </span>
  );
}
