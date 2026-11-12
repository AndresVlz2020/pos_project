import { logoWhite, logoOrange } from "@/utils/imageHelper";

export default function BrandLogo({ className = "h-10 w-auto object-contain", alt = "D'Piero Restaurante" }) {
  return (
    <>
      <img
        src={logoWhite}
        alt={alt}
        className={`logo-dark-theme ${className}`}
        onError={(e) => {
          e.currentTarget.src = "/assets/images/logo-dpiero.png";
        }}
      />
      <img
        src={logoOrange}
        alt={alt}
        className={`logo-light-theme ${className}`}
        onError={(e) => {
          e.currentTarget.src = "/assets/images/logo-dpiero-orange.png";
        }}
      />
    </>
  );
}
