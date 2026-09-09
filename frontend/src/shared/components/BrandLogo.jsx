import logo from "@/assets/images/logo-d,piero-orange.png";

export default function BrandLogo({ className = "h-10 w-auto object-contain", alt = "D'Piero Restaurante" }) {
  return (
    <img
      src={logo}
      alt={alt}
      className={className}
    />
  );
}
