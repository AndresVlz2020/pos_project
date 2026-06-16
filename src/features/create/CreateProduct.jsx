import { Input, Select, Button } from "@/shared";
import ImgUpload from "@/assets/icons/upload.png";
import ImgUploadBar from "@/assets/icons/upload-bar.png";

export default function CreateProduct() {
    return (
        <div className="h-full bg-white min-h-screen">
            <div className="
                    w-full bg-[var(--color-primary-950)] text-[var(--color-text-inverse)]
                "
            >
                <div className=
                        "max-w-7xl mx-auto px-6 py-4 flex items-center gap-4"
                >
                    <button type="
                                button
                            "
                            className="
                                px-3 py-1 rounded-md border border-[var(--color-text-inverse)] text-[var(--color-text-inverse)]"
                    >
                        ←
                    </button>
                    <h1 className="
                            text-2xl font-bold
                        "
                    >
                        Crear Orden
                    </h1>
                </div>
            </div>
            <div className="
                    flex 
                    gap-24
                    mt-22
                    h-full
                    justify-center
                "
            >
                <div className="w-40 mt-8 gap-200">
                    <img ImgUpload
                        src={ImgUpload} 
                        alt="image-icon"
                        className="
                            h-40
                            w-50
                        "
                    />
                    <p className="
                        text-center
                    ">
                        Suba un Archivo
                    </p>
                    <img ImgUploadBar
                        src={ImgUploadBar} 
                        alt="upload-bar"
                        className="
                            h-40
                            w-50
                        "
                    />
                    <p className="
                        text-center
                    "
                    >
                        Suba un codigo de barras
                    </p>
                </div>
                <form>
                    <Input
                        label="ID"
                        name="product-id"
                        placeholder="Ingrese el ID del producto"
                    />
                    <Select
                        label="Estado del producto"
                        name="product-status"
                        placeholder="Seleccione"
                    />
                    <Input
                        label="Nombre del producto"
                        name="product-name"
                        placeholder="Ingrese el nombre del producto"
                    />
                    <Input
                        label="Cuentandante"
                        name="product-accountant"
                        placeholder="Cuentandante"
                    />
                    <Input
                        label="Descripcion"
                        name="product-description"
                        placeholder="Ingrese la descripcion"
                    />
                    <Input
                        label="Ubicacion"
                        name="product-location"
                        placeholder="Ingrese la ubicacion"
                    />
                </form>
        
                <form>
                    <Input
                        label="Numero Lote"
                        name="number-batch"
                        placeholder="Lote"
                    />
                    <Input
                        label="Cantidad Maxima"
                        name="max-amount"
                        placeholder="Maxima"
                    />
                    <Input
                        label="Cantidad Minima"
                        name="min-amount"
                        placeholder="Minima"
                    />
                    <Input
                        label="Valor de la compra"
                        name="price-buy"
                        placeholder="Ingrese el valor de la compra"
                    />
                    <Input
                        label="Valor de la venta"
                        name="price-sell"
                        placeholder="Ingrese el valor de la venta"
                    />
                    <Input
                        label="Valor total del lote"
                        name="price-sell"
                        placeholder="Ingrese el valor de la venta"
                    />
                </form>
                <form>
                    <Input
                        label="Fecha de vencimiento"
                        name="expiration-date"
                        placeholder="Ingrese la fecha"
                    />
                </form>
            </div>
            <div className="w-full flex justify-center mt-12">
                <Button
                    className="
                        w-60
                        p-2 
                        rounded-md
                        bg-[var(--color-primary-950)]
                        text-white
                    "
                >
                    Confirmar Informacion
                </Button>
            </div>
        </div>
    );
}