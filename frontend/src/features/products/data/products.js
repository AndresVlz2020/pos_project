import imgPunta from "@/assets/images/punta-de-anca-hd.jpg";
import imgLimonada from "@/assets/images/limonada-hd.jpg";
import imgPostre from "@/assets/images/postre-coco-hd.jpg";
import imgCoctel from "@/assets/images/coctel-fresa-hd.jpg";
import imgCostillas from "@/assets/images/costillas-bbq-hd.jpg";
import imgHamburguesa from "@/assets/images/hamburguesa-hd.jpg";
import imgChicharron from "@/assets/images/chicharron-hd.jpg";
import imgEmpanadas from "@/assets/images/empanadas-hd.jpg";
import imgCerveza from "@/assets/images/cerveza-hd.jpg";
import imgJugo from "@/assets/images/jugo-natural-hd.jpg";
import imgTresLeches from "@/assets/images/tres-leches-hd.jpg";
import imgPapas from "@/assets/images/papas-rusticas-hd.jpg";

export const products = [
    {
        id: "punta-anca",
        code: "PAR-01",
        title: "Punta de Anca Angus 400g",
        price: 56000,
        description: "Corte angus certificado madurado a la brasa con chimichurri rústico y sal marina",
        image: imgPunta,
        category: "platos fuertes",
        stock: 18,
        status: "Disponible"
    },
    {
        id: "costillas-bbq",
        code: "PAR-02",
        title: "Costillas Ahumadas BBQ D'Piero",
        price: 48000,
        description: "Costillas de cerdo seleccionadas, cocción lenta al carbón por 6 horas y glaseado BBQ de la casa",
        image: imgCostillas,
        category: "platos fuertes",
        stock: 12,
        status: "Disponible"
    },
    {
        id: "hamburguesa-angus",
        code: "PAR-03",
        title: "Hamburguesa D'Piero Artesanal",
        price: 34000,
        description: "200g carne angus a la parrilla, queso cheddar fundido, tocineta ahumada y pan brioche artesanal",
        image: imgHamburguesa,
        category: "platos fuertes",
        stock: 25,
        status: "Disponible"
    },
    {
        id: "chicharron-crocante",
        code: "ENT-01",
        title: "Chicharrón Carnudo Crocante",
        price: 28000,
        description: "Tiras de tocino carnudo crujiente con arepitas santandereanas y limón mandarino",
        image: imgChicharron,
        category: "entradas",
        stock: 15,
        status: "Disponible"
    },
    {
        id: "empanadas-criollas",
        code: "ENT-02",
        title: "Empanadas de Carne & Papa (x5)",
        price: 18000,
        description: "Cinco empanadas crujientes rellenas de lomo picado y papa criolla con ají casero",
        image: imgEmpanadas,
        category: "entradas",
        stock: 30,
        status: "Disponible"
    },
    {
        id: "limonada-hierbabuena",
        code: "BEB-01",
        title: "Limonada Hierbabuena Artesanal",
        price: 10000,
        description: "Zumo de limón recién exprimido macerado con hierbabuena fresca y hielo frappé",
        image: imgLimonada,
        category: "bebidas",
        stock: 45,
        status: "Disponible"
    },
    {
        id: "coctel-fresa",
        code: "BEB-02",
        title: "Cóctel de Frutos Rojos & Fresa",
        price: 24000,
        description: "Mixología de autor a base de fresas orgánicas, toques cítricos, vodka premium y escarchado",
        image: imgCoctel,
        category: "bebidas",
        stock: 20,
        status: "Disponible"
    },
    {
        id: "cerveza-artesanal",
        code: "BEB-03",
        title: "Cerveza Artesanal Rubia 330ml",
        price: 14000,
        description: "Cerveza artesanal de la casa tipo Pale Ale, notas florales y cuerpo equilibrado",
        image: imgCerveza,
        category: "bebidas",
        stock: 36,
        status: "Disponible"
    },
    {
        id: "jugo-natural",
        code: "BEB-04",
        title: "Jugo Natural de Fruta Fresca",
        price: 9000,
        description: "Jugo natural en agua o leche (Mandarina, Maracuyá, Mango o Lulo)",
        image: imgJugo,
        category: "bebidas",
        stock: 40,
        status: "Disponible"
    },
    {
        id: "postre-coco",
        code: "POS-01",
        title: "Postre Gourmet de Coco",
        price: 17000,
        description: "Flan cremoso de leche de coco natural con láminas de coco tostado y caramelo dorado",
        image: imgPostre,
        category: "postres",
        stock: 14,
        status: "Disponible"
    },
    {
        id: "tres-leches",
        code: "POS-02",
        title: "Torta Tradicional Tres Leches",
        price: 16000,
        description: "Bizcochuelo bañado en salsa de tres leches con merengue suizo y canela fina",
        image: imgTresLeches,
        category: "postres",
        stock: 10,
        status: "Disponible"
    },
    {
        id: "papas-rusticas",
        code: "GUA-01",
        title: "Papas Rústicas con Romero & Ajo",
        price: 12000,
        description: "Porción de papas doradas con cáscara, sal marina gruesa, romero y salsa alioli",
        image: imgPapas,
        category: "guarniciones",
        stock: 50,
        status: "Disponible"
    }
];

