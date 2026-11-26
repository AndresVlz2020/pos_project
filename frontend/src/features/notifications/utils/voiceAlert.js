import { API_URL } from "@/features/config";

const SPOKEN_STORAGE_PREFIX = "dpiero_spoken_notifs_";

let sharedAudioCtx = null;
let pendingSpokenQueue = [];
let unlockListenersAttached = false;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new Ctx();
  }
  return sharedAudioCtx;
}

function attachUnlockListeners() {
  if (unlockListenersAttached || typeof window === "undefined") return;
  unlockListenersAttached = true;

  const unlock = async () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        // ignorar
      }
    }
    if (pendingSpokenQueue.length > 0) {
      const nextText = pendingSpokenQueue.shift();
      pendingSpokenQueue = [];
      if (nextText) {
        playWaiterCallVoice(nextText);
      }
    }
  };

  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
  window.addEventListener("touchstart", unlock, { passive: true });
}

attachUnlockListeners();

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
    utterance.volume = 1.0;

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
 * Reproduce automáticamente y a volumen alto la solicitud de mesero
 * usando el endpoint neural (msedge-tts) + amplificación Web Audio API.
 */
export async function playWaiterCallVoice(text) {
  const cleanText = String(text || "").trim();
  if (!cleanText) return;

  const ttsUrl = `${API_URL}/notifications/tts?text=${encodeURIComponent(cleanText)}`;

  try {
    const res = await fetch(ttsUrl);
    if (!res.ok) throw new Error("TTS HTTP error");
    const arrayBuf = await res.arrayBuffer();

    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === "suspended") {
        await ctx.resume().catch(() => {});
      }
      if (ctx.state === "running") {
        const audioBuf = await ctx.decodeAudioData(arrayBuf.slice(0));
        const source = ctx.createBufferSource();
        source.buffer = audioBuf;

        // Amplificación fuerte con compresor para que suene duro y claro sin saturar
        const gainNode = ctx.createGain();
        gainNode.gain.value = 3.2;

        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-18, ctx.currentTime);
        compressor.knee.setValueAtTime(6, ctx.currentTime);
        compressor.ratio.setValueAtTime(10, ctx.currentTime);

        source.connect(gainNode);
        gainNode.connect(compressor);
        compressor.connect(ctx.destination);
        source.start(0);
        return;
      }
    }

    const blobUrl = URL.createObjectURL(new Blob([arrayBuf], { type: "audio/mpeg" }));
    const audio = new Audio(blobUrl);
    audio.volume = 1;
    audio.onended = () => URL.revokeObjectURL(blobUrl);
    try {
      await audio.play();
    } catch {
      URL.revokeObjectURL(blobUrl);
      pendingSpokenQueue.push(cleanText);
    }
  } catch {
    // Solo usar speechSynthesis si el servidor TTS no responde
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

  pendingCalls.forEach((n) => markSpokenId(userId, n.id));

  const latest = pendingCalls[0];
  const digitsMatch = String(latest.tableNumber || "").match(/\d+/);
  const shortNum =
    latest.metadata?.tableShortNumber ||
    (digitsMatch ? digitsMatch[0] : latest.tableNumber || "");
  const spokenText =
    latest.metadata?.spokenText || `Mesero solicitado a mesa ${shortNum}`;

  playWaiterCallVoice(spokenText);
}
