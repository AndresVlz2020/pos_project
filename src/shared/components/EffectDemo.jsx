// EffectDemo.jsx
// Effecto con un array vacio, o sea sin dependencias
// Este efecto se ejecuta una sola vez, cuando el componente se monta por primera vez
import { useEffect, useState } from "react";
export default function EffectDemo(){
    const [message, setMessage] = useState("Cargando...")

    useEffect(() => {

        setTimeout(() => {

            setMessage("Componente cargado")
        }, 2000);

    }, []);
        
        return <h1>{message}</h1>;
}