import { API_URL } from "@/features/config";

const SPOKEN_STORAGE_PREFIX = "dpiero_spoken_notifs_";

function getSpokenSet(userId) {
  try {
    const raw = sessionStorage.getItem(`${SPOKEN_STORAGE_PREFIX}${userId || "u"}`);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map(Number) : []);
  } catch {
    return new Set();
  }
}

function markSpokenId(userId, id) {
  try {
    const set = getSpokenSet(userId);
    set.add(Number(id));
    sessionStorage.setItem(
      `${SPOKEN_STORAGE_PREFIX}${userId || "u"}`,
      JSON.stringify(Array.from(set).slice(-100))
    );
  } catch {
    // ignorar errores de almacenamiento
  }
}

function speakWithBrowserFallback(text) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-CO";
    utterance.rate = 0.96;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /es-co/i.test(v.lang)) ||
      voices.find((v) => /^es/i.test(v.lang));
    if (preferred) {
      utterance.voice = preferred;
    }
    window.speechSynthesis.speak(utterance);
  } catch {
    // ignorar si speechSynthesis no está disponible
  }
}

/**
 * Reproduce en voz alta la solicitud de mesero usando el endpoint neural (msedge-tts),
 * con respaldo automático a Web Speech API si el navegador bloquea o falla la red.
 */
export async function playWaiterCallVoice(text) {
  const cleanText = String(text || "").trim();
  if (!cleanText) return;

  const ttsUrl = `${API_URL}/notifications/tts?text=${encodeURIComponent(cleanText)}`;

  try {
    const audio = new Audio(ttsUrl);
    audio.preload = "auto";
    audio.volume = 1;
    await audio.play();
  } catch {
    speakWithBrowserFallback(cleanText);
  }
}

export function announceUnreadWaiterCalls(rows = [], userId, isMesero) {
  if (!isMesero || !Array.isArray(rows) || rows.length === 0) return;
  const spoken = getSpokenSet(userId);

  const pendingCalls = rows.filter(
    (n) =>
      n?.type === "waiter_call" &&
      !n?.isRead &&
      !spoken.has(Number(n.id))
  );

  if (pendingCalls.length === 0) return;

  // Marcar todas como anunciadas para evitar repeticiones
  pendingCalls.forEach((n) => markSpokenId(userId, n.id));

  // Reproducir la más reciente en voz alta
  const latest = pendingCalls[0];
  const digitsMatch = String(latest.tableNumber || "").match(/\d+/);
  const shortNum = latest.metadata?.tableShortNumber || (digitsMatch ? digitsMatch[0] : latest.tableNumber || "");
  const spokenText =
    latest.metadata?.spokenText || `Mesero solicitado a mesa ${shortNum}`;

  playWaiterCallVoice(spokenText);
}
