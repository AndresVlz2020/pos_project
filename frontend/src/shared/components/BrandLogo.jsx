import logoWhite from "@/assets/images/logo-d,piero.png";
import logoOrange from "@/assets/images/logo-d,piero-orange.png";

export default function BrandLogo({ className = "h-10 w-auto object-contain", alt = "D'Piero Restaurante" }) {
  return (
    <>
      <img
        src={logoWhite}
        alt={alt}
        className={`logo-dark-theme ${className}`}
      />
      <img
        src={logoOrange}
        alt={alt}
        className={`logo-light-theme ${className}`}
      />
    </>
  );
}
