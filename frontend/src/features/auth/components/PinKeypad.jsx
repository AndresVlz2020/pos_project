import { useState } from "react";
import { ArrowLeft, Delete, Check } from "lucide-react";
import { formatRole } from "./QuickAccessSelector";

export default function PinKeypad({ selectedStaff, onBack, onValidatePin, pinError, onClearError }) {
  const [pinInput, setPinInput] = useState("");

  const handleNumpadPress = (digit) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      if (onClearError) onClearError();

      if (nextPin.length === 4) {
        onValidatePin(nextPin, () => {
          setPinInput("");
        });
      }
    }
  };

  const handleNumpadDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
    if (onClearError) onClearError();
  };

  const handleNumpadClear = () => {
    setPinInput("");
    if (onClearError) onClearError();
  };

  const handleConfirm = () => {
    if (pinInput.length === 4) {
      onValidatePin(pinInput, () => {
        setPinInput("");
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-primary-800)]">
        <div>
          <p className="text-xs font-bold text-[var(--color-white)] leading-tight">
            {selectedStaff.userName || selectedStaff.name}
          </p>
          <p className="text-[11px] text-[var(--color-secondary-400)] font-medium mt-0.5">
            {formatRole(selectedStaff.role)}
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-secondary-400)] hover:underline cursor-pointer"
        >
          <ArrowLeft className="size-3" />
          <span>Cambiar</span>
        </button>
      </div>

      <div className="py-1 text-center">
        <p className="text-xs text-[var(--color-gray-400)] mb-2">Ingresa tu PIN de 4 dígitos</p>
        <div className="flex items-center justify-center gap-3">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pinInput.length > index;
            return (
              <div
                key={index}
                className={`size-3.5 rounded-full transition-all duration-150 ${
                  isFilled
                    ? "bg-[var(--color-secondary-500)] scale-110"
                    : "border-2 border-[var(--color-primary-700)] bg-[var(--color-primary-950)]"
                }`}
              />
            );
          })}
        </div>

        {pinError && (
          <p className="text-xs text-red-400 mt-2 font-medium">
            {pinError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleNumpadPress(num.toString())}
            className="bg-[var(--color-primary-800)] hover:bg-[var(--color-primary-700)] border border-[var(--color-primary-700)] text-[var(--color-white)] text-xl font-bold rounded-xl h-14 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          onClick={handleNumpadDelete}
          aria-label="Borrar dígito"
          className="bg-[var(--color-primary-800)] hover:bg-[var(--color-primary-700)] border border-[var(--color-primary-700)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] text-xl font-bold rounded-xl h-14 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
        >
          <Delete className="size-5" />
        </button>

        <button
          type="button"
          onClick={() => handleNumpadPress("0")}
          className="bg-[var(--color-primary-800)] hover:bg-[var(--color-primary-700)] border border-[var(--color-primary-700)] text-[var(--color-white)] text-xl font-bold rounded-xl h-14 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
        >
          0
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          aria-label="Confirmar PIN"
          className="bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-[var(--color-white)] text-xl font-bold rounded-xl h-14 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
        >
          <Check className="size-6" />
        </button>
      </div>

      <div className="text-center pt-0.5">
        <button
          type="button"
          onClick={handleNumpadClear}
          className="text-[11px] text-[var(--color-gray-500)] hover:text-[var(--color-gray-300)] cursor-pointer"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
