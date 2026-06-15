// Ejemplo de un contador sin usar estados

export default function DeleteCounter2() {
    let count = 0;

    const increment = () => {
        count + 1;
        console.log("El nuevo valor es: ", count);
    }
    return (
        <div>
         <p>Contador: {count}</p>
         <button onClick={increment} className="border p-6 rounded-md bg-[var(--color-primary-400)]">
            Incrementar
         </button>
        </div>
    );
}