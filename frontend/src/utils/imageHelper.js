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

// Carga automática vía Vite de todas las imágenes generadas en assets/images/products
const GENERATED_PRODUCT_MODULES = import.meta.glob(
  "@/assets/images/products/*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default" }
);

const ALL_PRODUCT_ASSETS = {
  "punta-de-anca-hd.jpg": imgPunta,
  "costillas-bbq-hd.jpg": imgCostillas,
  "hamburguesa-hd.jpg": imgHamburguesa,
  "chicharron-hd.jpg": imgChicharron,
  "empanadas-hd.jpg": imgEmpanadas,
  "limonada-hd.jpg": imgLimonada,
  "coctel-fresa-hd.jpg": imgCoctel,
  "cerveza-hd.jpg": imgCerveza,
  "jugo-natural-hd.jpg": imgJugo,
  "postre-coco-hd.jpg": imgCoco,
  "tres-leches-hd.jpg": imgTresLeches,
  "papas-rusticas-hd.jpg": imgPapas,
  ...Object.fromEntries(
    Object.entries(GENERATED_PRODUCT_MODULES).map(([fullPath, src]) => [
      fullPath.split("/").pop().toLowerCase(),
      src,
    ])
  ),
};

const PRODUCT_FILENAME_BY_CODE = {
  "PAR-01": "punta-de-anca-hd.jpg",
  "PAR-02": "costillas-bbq-hd.jpg",
  "PAR-03": "hamburguesa-hd.jpg",
  "PAR-04": "pechuga-gratinada.jpg",
  "PAR-05": "salmon-parrilla.jpg",
  "PAR-06": "trucha-al-ajillo.jpg",
  "PAR-07": "picada-parrillera.jpg",
  "PAR-08": "fetuccini-camarones.jpg",
  "ENT-01": "chicharron-hd.jpg",
  "ENT-02": "empanadas-hd.jpg",
  "ENT-03": "chorizo-santandereano.jpg",
  "BEB-01": "limonada-hd.jpg",
  "BEB-02": "coctel-fresa-hd.jpg",
  "BEB-03": "cerveza-hd.jpg",
  "BEB-04": "jugo-natural-hd.jpg",
  "BEB-05": "limonada-coco.jpg",
  "POS-01": "postre-coco-hd.jpg",
  "POS-02": "tres-leches-hd.jpg",
  "POS-03": "tiramisu-clasico.jpg",
  "POS-04": "flan-caramelo.jpg",
  "POS-05": "volcan-chocolate.jpg",
  "GUA-01": "papas-rusticas-hd.jpg",
  "GUA-02": "maduro-con-queso.jpg",
  "GUA-03": "ensalada-cesar.jpg",
  "GUA-04": "arepa-con-queso.jpg",
};

const normalizeProductKey = (text = "") =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const PRODUCT_FILENAME_BY_NAME = {
  "punta de anca angus 400g": "punta-de-anca-hd.jpg",
  "costillas ahumadas bbq d'piero": "costillas-bbq-hd.jpg",
  "hamburguesa d'piero artesanal": "hamburguesa-hd.jpg",
  "pechuga gratinada a las brasas": "pechuga-gratinada.jpg",
  "salmon a la parrilla con eneldo": "salmon-parrilla.jpg",
  "trucha arcoiris al ajillo": "trucha-al-ajillo.jpg",
  "picada parrillera familiar d'piero": "picada-parrillera.jpg",
  "fetuccini alfredo con camarones": "fetuccini-camarones.jpg",
  "chicharron carnudo crocante": "chicharron-hd.jpg",
  "empanadas de carne & papa (x5)": "empanadas-hd.jpg",
  "chorizo santandereano con arepa": "chorizo-santandereano.jpg",
  "limonada hierbabuena artesanal": "limonada-hd.jpg",
  "coctel de frutos rojos & fresa": "coctel-fresa-hd.jpg",
  "cerveza artesanal rubia 330ml": "cerveza-hd.jpg",
  "jugo natural de fruta fresca": "jugo-natural-hd.jpg",
  "limonada de coco cremosa": "limonada-coco.jpg",
  "postre gourmet de coco": "postre-coco-hd.jpg",
  "torta tradicional tres leches": "tres-leches-hd.jpg",
  "tiramisu clasico italiano": "tiramisu-clasico.jpg",
  "flan de caramelo artesanal": "flan-caramelo.jpg",
  "volcan de chocolate fundido": "volcan-chocolate.jpg",
  "papas rusticas a las finas hierbas": "papas-rusticas-hd.jpg",
  "papas rusticas con romero & ajo": "papas-rusticas-hd.jpg",
  "platano maduro asado con queso": "maduro-con-queso.jpg",
  "ensalada cesar clasica": "ensalada-cesar.jpg",
  "arepa con queso asada a la brasa": "arepa-con-queso.jpg",
};

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
  ...ALL_PRODUCT_ASSETS,
};

/**
 * Resuelve la imagen correcta para un producto (usando importación Vite estática)
 */
export function getProductImage(product) {
  if (!product) return imgPunta;

  const url = String(product.image || product.image_url || "").trim();

  // Imágenes personalizadas cargadas por usuario (Data URL / HTTP)
  if (url.startsWith("data:image/") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // 1. Coincidencia exacta por nombre de archivo en image_url
  const filename = url.split("/").pop()?.split("?")[0]?.toLowerCase() || "";
  if (filename && ALL_PRODUCT_ASSETS[filename]) {
    return ALL_PRODUCT_ASSETS[filename];
  }

  // 2. Coincidencia exacta por código de platillo (PAR-04, BEB-05, ...)
  const codeKey = String(product.code || "").trim().toUpperCase();
  const codeFile = PRODUCT_FILENAME_BY_CODE[codeKey];
  if (codeFile && ALL_PRODUCT_ASSETS[codeFile]) {
    return ALL_PRODUCT_ASSETS[codeFile];
  }

  // 3. Coincidencia exacta por nombre normalizado (útil para detalles de órdenes / facturas)
  const exactNameFile = PRODUCT_FILENAME_BY_NAME[normalizeProductKey(product.title || product.name || "")];
  if (exactNameFile && ALL_PRODUCT_ASSETS[exactNameFile]) {
    return ALL_PRODUCT_ASSETS[exactNameFile];
  }

  // 4. Respaldos por palabras clave heredadas
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

  if (url && !url.startsWith("/src/") && !url.includes("undefined")) {
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
