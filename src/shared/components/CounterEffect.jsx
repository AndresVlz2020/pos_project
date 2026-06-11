// Componente CounterEffect

// Este componente muestra un contador que se incrementa cada segundo utilizando el hook useEffect para manejar el efecto de temporizador.

import { useEffect, useState } from "react";
import Button from "./Button";
export default function CounterEffect(){

    // Se crea el estaado
    const [count, setCount] = useState(0);
    const [Message, setMessage] = useState("")

    // Se crea el efecto
    useEffect(() => {

        if (count === 0) {
           setMessage(`El contador cambió a: ${count}`);
        }
        else{
            setMessage(`El contador cambió a: ${count}`)
        }   
    },[count])

    return(
        <div>
            <h2>{count}</h2>
            <p>{Message}</p>

            <Button variant="primary" onClick={() => setCount(count + 1)}>Incrementar</Button>
        </div>
    )


}   
