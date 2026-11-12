// Importaciones directas de Vite para empaquetado infalible
import imgPunta from "@/assets/images/punta-de-anca-hd.jpg";
import imgCostillas from "@/assets/images/costillas-bbq-hd.jpg";
import imgHamburguesa from "@/assets/images/hamburguesa-hd.jpg";
import imgChicharron from "@/assets/images/chicharron-hd.jpg";
import imgEmpanadas from "@/assets/images/empanadas-hd.jpg";
import imgLimonada from "@/assets/images/limonada-hd.jpg";
import imgCoctel from "@/assets/images/coctel-fresa-hd.jpg";
import imgCerveza from "@/assets/images/cerveza-hd.jpg";
import imgJugo from "@/assets/images/jugo-natural-hd.jpg";
import imgCoco from "@/assets/images/postre-coco-hd.jpg";
import imgTresLeches from "@/assets/images/tres-leches-hd.jpg";
import imgPapas from "@/assets/images/papas-rusticas-hd.jpg";

import imgCarnes from "@/assets/images/supplier-carnes.jpg";
import imgLacteos from "@/assets/images/supplier-lacteos.jpg";
import imgFruver from "@/assets/images/supplier-fruver.jpg";
import imgBebidas from "@/assets/images/supplier-bebidas.jpg";
import imgMariscos from "@/assets/images/supplier-mariscos.jpg";
import imgEmpaques from "@/assets/images/supplier-empaques.jpg";

import imgWorkerCarlos from "@/assets/images/worker-carlos.jpg";
import imgWorkerMaria from "@/assets/images/worker-maria.jpg";
import imgWorkerJuan from "@/assets/images/worker-juan.jpg";
import imgWorkerAna from "@/assets/images/worker-ana.jpg";

import logoWhite from "@/assets/images/logo-d,piero.png";
import logoOrange from "@/assets/images/logo-d,piero-orange.png";

// Mapa de productos según slug o coincidencias de nombre
export const PRODUCT_IMAGES = {
  punta: imgPunta,
  costilla: imgCostillas,
  hamburguesa: imgHamburguesa,
  chicharron: imgChicharron,
  empanada: imgEmpanadas,
  limonada: imgLimonada,
  coctel: imgCoctel,
  fresa: imgCoctel,
  cerveza: imgCerveza,
  jugo: imgJugo,
  coco: imgCoco,
  "tres leches": imgTresLeches,
  tres_leches: imgTresLeches,
  tresleches: imgTresLeches,
  papa: imgPapas,
};

/**
 * Resuelve la imagen correcta para un producto (usando importación Vite estática)
 */
export function getProductImage(product) {
  if (!product) return imgPunta;

  const url = product.image || product.image_url || "";
  const name = `${product.title || product.name || ""} ${product.code || ""} ${url}`.toLowerCase();

  if (name.includes("punta") || name.includes("anca") || name.includes("angus")) return imgPunta;
  if (name.includes("costilla") || name.includes("bbq")) return imgCostillas;
  if (name.includes("hamburguesa") || name.includes("burger")) return imgHamburguesa;
  if (name.includes("chicharron") || name.includes("chicharrón") || name.includes("panceta")) return imgChicharron;
  if (name.includes("empanada")) return imgEmpanadas;
  if (name.includes("limonada")) return imgLimonada;
  if (name.includes("coctel") || name.includes("fresa") || name.includes("rojos")) return imgCoctel;
  if (name.includes("cerveza") || name.includes("rubia")) return imgCerveza;
  if (name.includes("jugo") || name.includes("mora") || name.includes("mango")) return imgJugo;
  if (name.includes("coco")) return imgCoco;
  if (name.includes("tres") || name.includes("leche")) return imgTresLeches;
  if (name.includes("papa") || name.includes("rustica")) return imgPapas;

  if (url && typeof url === "string" && !url.startsWith("/src/") && !url.includes("undefined")) {
    return url;
  }

  return imgPunta;
}

/**
 * Resuelve la imagen y categoría para un proveedor
 */
export function getSupplierImage(supplier) {
  if (!supplier) return { image: imgLacteos, category: "Insumos Generales" };

  const text = `${supplier.companyName || supplier.company_name || supplier.name || ""} ${supplier.nit || ""} ${supplier.observation || supplier.address || ""}`.toLowerCase();

  if (text.includes("carne") || text.includes("pollo") || text.includes("avícola") || text.includes("avicola") || text.includes("embutido")) {
    return { image: imgCarnes, category: "Cárnicos, Aves y Embutidos" };
  }
  if (text.includes("lácteo") || text.includes("lacteo") || text.includes("queso") || text.includes("leche") || text.includes("mantequilla")) {
    return { image: imgLacteos, category: "Lácteos, Quesos y Derivados" };
  }
  if (text.includes("fruver") || text.includes("fruta") || text.includes("verdura") || text.includes("hortaliza") || text.includes("abasto")) {
    return { image: imgFruver, category: "Fruver, Frutas & Hortalizas" };
  }
  if (text.includes("café") || text.includes("cafe") || text.includes("bebida") || text.includes("cerveza") || text.includes("licor") || text.includes("vino") || text.includes("jarabe")) {
    return { image: imgBebidas, category: "Bebidas, Licores & Bar" };
  }
  if (text.includes("pesca") || text.includes("marisco") || text.includes("camarón") || text.includes("camaron")) {
    return { image: imgMariscos, category: "Pescados & Mariscos Frescos" };
  }
  if (text.includes("empaque") || text.includes("vaso") || text.includes("bolsa") || text.includes("limpieza") || text.includes("menaje") || text.includes("bio")) {
    return { image: imgEmpaques, category: "Empaques, Insumos & Menaje" };
  }

  return { image: imgLacteos, category: "Insumos Generales de Restaurante" };
}

/**
 * Resuelve la imagen de avatar para un usuario del sistema POS
 */
export function getUserAvatar(user) {
  if (!user) return imgWorkerCarlos;

  const text = `${user.userName || user.name || ""} ${user.role || user.userType || ""} ${user.userEmail || user.email || ""}`.toLowerCase();

  if (text.includes("maría") || text.includes("maria") || text.includes("cajera")) {
    return imgWorkerMaria;
  }
  if (text.includes("ana") || text.includes("cocina") || text.includes("cocin")) {
    return imgWorkerAna;
  }
  if (text.includes("santiago") || text.includes("admin") || text.includes("velez") || text.includes("juan")) {
    return imgWorkerJuan;
  }
  if (text.includes("carlos") || text.includes("mesero") || text.includes("salon")) {
    return imgWorkerCarlos;
  }

  return imgWorkerCarlos;
}

export {
  imgPunta,
  imgCostillas,
  imgHamburguesa,
  imgChicharron,
  imgEmpanadas,
  imgLimonada,
  imgCoctel,
  imgCerveza,
  imgJugo,
  imgCoco,
  imgTresLeches,
  imgPapas,
  imgCarnes,
  imgLacteos,
  imgFruver,
  imgBebidas,
  imgMariscos,
  imgEmpaques,
  imgWorkerCarlos,
  imgWorkerMaria,
  imgWorkerJuan,
  imgWorkerAna,
  logoWhite,
  logoOrange,
};
