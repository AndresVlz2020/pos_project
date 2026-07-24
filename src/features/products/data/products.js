import imgPunta from "@/assets/images/punta-de-anca.png";
import imgLimonada from "@/assets/images/limonada.png";
import imgPostre from "@/assets/images/postre-coco.png";
import imgCoctel from "@/assets/images/coctel-fresa.png";

export const products = [
    {
        id: "punta-anca",
        title: "Punta de anca",
        price: 56000,
        description: "Punta de anca acompañada de guarnición de la casa",
        image: imgPunta,
        category: "platos fuertes"
    },
    {
        id: "limonada",
        title: "Limonada",
        price: 10000,
        description: "Limonada refrescante preparada al momento",
        image: imgLimonada,
        category: "bebidas"
    },
    {
        id: "postre-coco",
        title: "Postre de Coco",
        price: 17000,
        description: "Postre de coco suave y dulce",
        image: imgPostre,
        category: "postres"
    },
    {
        id: "coctel-fresa",
        title: "Coctel Fresa",
        price: 12000,
        description: "Cóctel de fresa preparado con fruta fresca",
        image: imgCoctel,
        category: "bebidas"
    }
];
