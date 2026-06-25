// Componente CounterEffect

// Este componente muestra un contador que se incrementa cada segundo utilizando el hook useEffect para manejar el efecto de temporizador.

import { useState } from "react";
export default function CounterEffect(){

    // Se crea el estaado
    const [count, setCount] = useState(0);

    // Valor derivado durante el render (no necesita useEffect)
    const message = `El contador cambió a: ${count}`;

    return(
        <div>
            <h2>{count}</h2>
            <p>{message}</p>

            <button onClick={() => setCount(count + 1)} className="border p-6   bg-green-300">Incrementar efecto </button>
        </div>
    )


}   
