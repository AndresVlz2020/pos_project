// Importaciones optimizadas WebP vía Vite + re-export de avatares compartidos
import imgPunta from "@/assets/images/punta-de-anca-hd.webp";
import imgCostillas from "@/assets/images/costillas-bbq-hd.webp";
import imgHamburguesa from "@/assets/images/hamburguesa-hd.webp";
import imgChicharron from "@/assets/images/chicharron-hd.webp";
import imgEmpanadas from "@/assets/images/empanadas-hd.webp";
import imgLimonada from "@/assets/images/limonada-hd.webp";
import imgCoctel from "@/assets/images/coctel-fresa-hd.webp";
import imgCerveza from "@/assets/images/cerveza-hd.webp";
import imgJugo from "@/assets/images/jugo-natural-hd.webp";
import imgCoco from "@/assets/images/postre-coco-hd.webp";
import imgTresLeches from "@/assets/images/tres-leches-hd.webp";
import imgPapas from "@/assets/images/papas-rusticas-hd.webp";

import imgCarnes from "@/assets/images/supplier-carnes.webp";
import imgLacteos from "@/assets/images/supplier-lacteos.webp";
import imgFruver from "@/assets/images/supplier-fruver.webp";
import imgBebidas from "@/assets/images/supplier-bebidas.webp";
import imgMariscos from "@/assets/images/supplier-mariscos.webp";
import imgEmpaques from "@/assets/images/supplier-empaques.webp";

import {
  resolveUploadedAssetUrl,
  getUserAvatar,
  imgWorkerCarlos,
  imgWorkerMaria,
  imgWorkerJuan,
  imgWorkerAna,
  logoOrange,
} from "./avatarHelper";

// Carga automática vía Vite de todas las imágenes optimizadas en assets/images/products
const GENERATED_PRODUCT_MODULES = import.meta.glob(
  "@/assets/images/products/*.{webp,jpg,jpeg,png}",
  { eager: true, import: "default" }
);

const ALL_PRODUCT_ASSETS = {
  "punta-de-anca-hd.jpg": imgPunta,
  "punta-de-anca-hd.webp": imgPunta,
  "costillas-bbq-hd.jpg": imgCostillas,
  "costillas-bbq-hd.webp": imgCostillas,
  "hamburguesa-hd.jpg": imgHamburguesa,
  "hamburguesa-hd.webp": imgHamburguesa,
  "chicharron-hd.jpg": imgChicharron,
  "chicharron-hd.webp": imgChicharron,
  "empanadas-hd.jpg": imgEmpanadas,
  "empanadas-hd.webp": imgEmpanadas,
  "limonada-hd.jpg": imgLimonada,
  "limonada-hd.webp": imgLimonada,
  "coctel-fresa-hd.jpg": imgCoctel,
  "coctel-fresa-hd.webp": imgCoctel,
  "cerveza-hd.jpg": imgCerveza,
  "cerveza-hd.webp": imgCerveza,
  "jugo-natural-hd.jpg": imgJugo,
  "jugo-natural-hd.webp": imgJugo,
  "postre-coco-hd.jpg": imgCoco,
  "postre-coco-hd.webp": imgCoco,
  "tres-leches-hd.jpg": imgTresLeches,
  "tres-leches-hd.webp": imgTresLeches,
  "papas-rusticas-hd.jpg": imgPapas,
  "papas-rusticas-hd.webp": imgPapas,
  ...Object.fromEntries(
    Object.entries(GENERATED_PRODUCT_MODULES).flatMap(([fullPath, src]) => {
      const name = fullPath.split("/").pop().toLowerCase();
      const jpgAlias = name.replace(/\.webp$/i, ".jpg");
      return name === jpgAlias ? [[name, src]] : [[name, src], [jpgAlias, src]];
    })
  ),
};

const PRODUCT_FILENAME_BY_CODE = {
  "PAR-01": "punta-de-anca-hd.webp",
  "PAR-02": "costillas-bbq-hd.webp",
  "PAR-03": "hamburguesa-hd.webp",
  "PAR-04": "pechuga-gratinada.webp",
  "PAR-05": "salmon-parrilla.webp",
  "PAR-06": "trucha-al-ajillo.webp",
  "PAR-07": "picada-parrillera.webp",
  "PAR-08": "fetuccini-camarones.webp",
  "ENT-01": "chicharron-hd.webp",
  "ENT-02": "empanadas-hd.webp",
  "ENT-03": "chorizo-santandereano.webp",
  "BEB-01": "limonada-hd.webp",
  "BEB-02": "coctel-fresa-hd.webp",
  "BEB-03": "cerveza-hd.webp",
  "BEB-04": "jugo-natural-hd.webp",
  "BEB-05": "limonada-coco.webp",
  "POS-01": "postre-coco-hd.webp",
  "POS-02": "tres-leches-hd.webp",
  "POS-03": "tiramisu-clasico.webp",
  "POS-04": "flan-caramelo.webp",
  "POS-05": "volcan-chocolate.webp",
  "GUA-01": "papas-rusticas-hd.webp",
  "GUA-02": "maduro-con-queso.webp",
  "GUA-03": "ensalada-cesar.webp",
  "GUA-04": "arepa-con-queso.webp",
};

const normalizeProductKey = (text = "") =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const PRODUCT_FILENAME_BY_NAME = {
  "punta de anca angus 400g": "punta-de-anca-hd.webp",
  "costillas ahumadas bbq d'piero": "costillas-bbq-hd.webp",
  "hamburguesa d'piero artesanal": "hamburguesa-hd.webp",
  "pechuga gratinada a las brasas": "pechuga-gratinada.webp",
  "salmon a la parrilla con eneldo": "salmon-parrilla.webp",
  "trucha arcoiris al ajillo": "trucha-al-ajillo.webp",
  "picada parrillera familiar d'piero": "picada-parrillera.webp",
  "fetuccini alfredo con camarones": "fetuccini-camarones.webp",
  "chicharron carnudo crocante": "chicharron-hd.webp",
  "empanadas de carne & papa (x5)": "empanadas-hd.webp",
  "chorizo santandereano con arepa": "chorizo-santandereano.webp",
  "limonada hierbabuena artesanal": "limonada-hd.webp",
  "coctel de frutos rojos & fresa": "coctel-fresa-hd.webp",
  "cerveza artesanal rubia 330ml": "cerveza-hd.webp",
  "jugo natural de fruta fresca": "jugo-natural-hd.webp",
  "limonada de coco cremosa": "limonada-coco.webp",
  "postre gourmet de coco": "postre-coco-hd.webp",
  "torta tradicional tres leches": "tres-leches-hd.webp",
  "tiramisu clasico italiano": "tiramisu-clasico.webp",
  "flan de caramelo artesanal": "flan-caramelo.webp",
  "volcan de chocolate fundido": "volcan-chocolate.webp",
  "papas rusticas a las finas hierbas": "papas-rusticas-hd.webp",
  "papas rusticas con romero & ajo": "papas-rusticas-hd.webp",
  "platano maduro asado con queso": "maduro-con-queso.webp",
  "ensalada cesar clasica": "ensalada-cesar.webp",
  "arepa con queso asada a la brasa": "arepa-con-queso.webp",
};

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
 * Resuelve la imagen correcta para un producto (usando importación Vite optimizada o backend uploads)
 */
export function getProductImage(product) {
  if (!product) return imgPunta;

  const url = String(product.image || product.image_url || "").trim();

  // Imágenes almacenadas físicamente en backend/uploads
  const uploadedUrl = resolveUploadedAssetUrl(url);
  if (uploadedUrl) {
    return uploadedUrl;
  }

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

  // 3. Coincidencia exacta por nombre normalizado
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

export {
  resolveUploadedAssetUrl,
  getUserAvatar,
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
  logoOrange,
};
