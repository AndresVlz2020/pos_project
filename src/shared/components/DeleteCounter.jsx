import { useState } from 'react';

export default function DeleteCounter() {
    const [count, setCount] = useState(0);

    const increment = () => {
        setCount(count + 1);
    }

    const decrement = () => {
        setCount(count - 1);
    }

    const reset = () => {
        setCount(0);
    }

    return (
        <div className='border p-6 rounded-md bg-blue-500'>
            <p>Contador: {count}</p>
            <button onClick={increment} className='mr-2'>Incrementar</button>
            <button onClick={decrement} className='mr-2'>Decrementar</button>
            <button onClick={reset}>Reset</button>
        </div>
    );
}
