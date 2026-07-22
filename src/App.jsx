import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle,
  Clock,
  MapPin,
  MusicNotes,
  Pause,
  Play,
  SpeakerHigh,
  SpeakerSlash,
  X,
} from "@phosphor-icons/react";

import heroPhoto from "./assets/anvika-hero-berry-edited.webp";
import memory00Photo from "./assets/anvika-memory-00.webp";
import memory01Photo from "./assets/anvika-memory-01.webp";
import memory02Photo from "./assets/anvika-memory-02.webp";
import memory03Photo from "./assets/anvika-memory-03.webp";
import memory04Photo from "./assets/anvika-memory-month-04.webp";
import memory05Photo from "./assets/anvika-memory-04.webp";
import memory06Photo from "./assets/anvika-memory-month-06.webp";
import memory07Photo from "./assets/anvika-memory-05.webp";
import memory08Photo from "./assets/anvika-memory-06.webp";
import memory09Photo from "./assets/anvika-memory-07.webp";
import memory10Photo from "./assets/anvika-memory-08.webp";
import memory11Photo from "./assets/anvika-memory-11.webp";
import berryEnvelope from "./assets/berry-envelope.webp";
import berryMap from "./assets/berry-map.jpg";
import berrySprig from "./assets/berry-sprig.webp";

const photos = [
  { src: memory00Photo, alt: "Anvika’s first memory" },
  { src: memory01Photo, alt: "Anvika at one month old" },
  { src: memory02Photo, alt: "Anvika at two months old" },
  { src: memory03Photo, alt: "Anvika at three months old" },
  { src: memory04Photo, alt: "Anvika at four months old" },
  { src: memory05Photo, alt: "Anvika at five months old" },
  { src: memory06Photo, alt: "Anvika at six months old" },
  { src: memory07Photo, alt: "Anvika at seven months old" },
  { src: memory08Photo, alt: "Anvika at eight months old" },
  { src: memory09Photo, alt: "Anvika at nine months old" },
  { src: memory10Photo, alt: "Anvika at ten months old" },
  { src: memory11Photo, alt: "Anvika at eleven months old" },
];

const melody = [
  523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46,
  659.25, 783.99, 987.77, 783.99, 587.33, 698.46, 783.99, 523.25,
];

const MUSIC_VOLUME = 0.065;
const MUSIC_SCROLL_VOLUME = 0.085;

function useBerryMelody() {
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const noteRef = useRef(0);
  const mutedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const stop = useCallback(() => {
    window.clearInterval(timerRef.current);
    timerRef.current = null;
    setPlaying(false);
  }, []);

  const play = useCallback(async () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!audioRef.current) {
      const context = new AudioContext();
      const gain = context.createGain();
      gain.gain.value = MUSIC_VOLUME;
      gain.connect(context.destination);
      audioRef.current = { context, gain };
    }

    const { context, gain } = audioRef.current;
    if (context.state !== "running") {
      try {
        await context.resume();
      } catch {
        setPlaying(false);
        return;
      }
    }

    if (context.state !== "running") {
      setPlaying(false);
      return;
    }

    const playNote = () => {
      const oscillator = context.createOscillator();
      const noteGain = context.createGain();
      const now = context.currentTime;
      oscillator.type = "sine";
      oscillator.frequency.value = melody[noteRef.current % melody.length];
      noteRef.current += 1;
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(mutedRef.current ? 0 : 0.65, now + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
      oscillator.connect(noteGain);
      noteGain.connect(gain);
      oscillator.start(now);
      oscillator.stop(now + 0.74);
    };

    playNote();
    window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(playNote, 760);
    setPlaying(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!audioRef.current) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      const volume = mutedRef.current
        ? 0
        : MUSIC_VOLUME + progress * (MUSIC_SCROLL_VOLUME - MUSIC_VOLUME);
      audioRef.current.gain.gain.setTargetAtTime(volume, audioRef.current.context.currentTime, 0.25);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => () => window.clearInterval(timerRef.current), []);

  const toggleMute = () => {
    setMuted((current) => {
      const next = !current;
      mutedRef.current = next;
      if (audioRef.current) {
        audioRef.current.gain.gain.setTargetAtTime(next ? 0 : MUSIC_VOLUME, audioRef.current.context.currentTime, 0.08);
      }
      return next;
    });
  };

  return { playing, muted, play, stop, toggleMute };
}

function SectionHeading({ eyebrow, children }) {
  return (
    <header className="section-heading">
      <span>{eyebrow}</span>
      <h2>{children}</h2>
      <img src={berrySprig} alt="" aria-hidden="true" />
    </header>
  );
}

export function App() {
  const [opened, setOpened] = useState(false);
  const [slide, setSlide] = useState(0);
  const [name, setName] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [cameraBusy, setCameraBusy] = useState(false);
  const [cameraNotice, setCameraNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const preloadedPhotosRef = useRef([]);
  const { playing, muted, play, stop, toggleMute } = useBerryMelody();

  const openInvitation = () => {
    setOpened(true);
    void play();
    window.setTimeout(() => {
      document.querySelector("#invitation")?.scrollIntoView({ behavior: "smooth" });
    }, 430);
  };

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
    setCameraBusy(false);
  }, []);

  useEffect(() => closeCamera, [closeCamera]);

  useEffect(() => {
    if (!opened || preloadedPhotosRef.current.length) return;

    preloadedPhotosRef.current = photos.map(({ src }) => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
      void image.decode?.().catch(() => {});
      return image;
    });
  }, [opened]);

  useEffect(() => {
    if (!cameraOpen || !streamRef.current || !videoRef.current) return undefined;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    void video.play().catch(() => {
      setCameraNotice("Your browser could not start the camera preview. Choose a photo from your device instead.");
    });
    return () => {
      video.srcObject = null;
    };
  }, [cameraOpen]);

  const startCamera = async () => {
    setError("");
    setCameraNotice("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraNotice("Camera access is not available in this browser. Choose a photo from your device instead.");
      return;
    }

    setCameraBusy(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "user" }, width: { ideal: 900 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch (cameraError) {
      const notice = cameraError?.name === "NotAllowedError"
        ? "Camera permission was blocked. Choose a photo from your device instead."
        : "We couldn’t open the camera here. Choose a photo from your device instead.";
      setCameraNotice(notice);
    } finally {
      setCameraBusy(false);
    }
  };

  const acceptPhoto = (blob) => {
    if (!blob) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoBlob(blob);
    setPhotoPreview(URL.createObjectURL(blob));
    setCameraNotice("");
    closeCamera();
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) {
      setCameraNotice("The camera is still warming up. Please try again in a moment.");
      return;
    }
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1200 / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(acceptPhoto, "image/jpeg", 0.82);
  };

  const submitRsvp = async (event) => {
    event.preventDefault();
    if (!name.trim() || !photoBlob) {
      setError("Please add your name and take a berry selfie first.");
      return;
    }

    setSubmitting(true);
    setError("");
    const endpoint = import.meta.env.VITE_RSVP_ENDPOINT;
    try {
      if (endpoint) {
        const payload = new FormData();
        payload.append("guest_name", name.trim());
        payload.append("photo", photoBlob, "berry-selfie.jpg");
        const response = await fetch(endpoint, { method: "POST", body: payload });
        if (!response.ok) throw new Error("RSVP could not be sent");
      } else {
        localStorage.setItem("anvika-rsvp-preview", JSON.stringify({ guestName: name.trim(), createdAt: new Date().toISOString() }));
        await new Promise((resolve) => window.setTimeout(resolve, 650));
      }
      setSubmitted(true);
    } catch {
      setError("We couldn’t send your RSVP just now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className={opened ? "site is-open" : "site"}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => {
        if (event.target instanceof HTMLImageElement) event.preventDefault();
      }}
    >
      <section className="berry-door" aria-label="Open Anvika’s birthday invitation">
        <div className="berry-door__content">
          <p className="eyebrow">A tiny invitation has ripened for you</p>
          <button className="berry-open" type="button" onClick={openInvitation}>
            <img src={berryEnvelope} alt="A strawberry-shaped invitation tied with ribbon" />
            <span>Tap the berry to open</span>
          </button>
          <p className="berry-door__name">Anvika’s first birthday</p>
        </div>
      </section>

      <div className="music-player" aria-label="Background music controls">
        <button type="button" onClick={playing ? stop : play} aria-label={playing ? "Pause music" : "Play music"}>
          {playing ? <Pause weight="fill" /> : <Play weight="fill" />}
        </button>
        <div>
          <span>Anvika’s little berry song</span>
          <small>{playing ? "Playing as you scroll" : "Paused"}</small>
        </div>
        <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute music" : "Mute music"}>
          {muted ? <SpeakerSlash /> : <SpeakerHigh />}
        </button>
      </div>

      <div id="invitation" className="invitation-paper">
        <section className="hero section-shell">
          <div className="hero__copy">
            <p className="eyebrow">Our little berry is turning</p>
            <div className="hero__one" aria-label="one">1</div>
            <h1><em>Anvika’s</em> Berry First Birthday</h1>
            <p className="hero__date">Sunday · 9 August 2026</p>
            <p className="hero__intro">A whole year of tiny giggles, cuddles, and sweetness. Come celebrate our sweetest little berry.</p>
            <a className="primary-button" href="#rsvp">RSVP for Anvika</a>
          </div>
          <figure className="hero__portrait">
            <img src={heroPhoto} alt="Anvika smiling in pink sunglasses" />
            <figcaption>One whole year of sweetness</figcaption>
          </figure>
        </section>

        <section className="memories section-shell" aria-labelledby="memories-title">
          <SectionHeading eyebrow="A year of tiny moments">Sweet little memories</SectionHeading>
          <div className="carousel">
            <button type="button" onClick={() => setSlide((slide + photos.length - 1) % photos.length)} aria-label="Previous photograph"><ArrowLeft /></button>
            <figure><img src={photos[slide].src} alt={photos[slide].alt} decoding="async" /></figure>
            <button type="button" onClick={() => setSlide((slide + 1) % photos.length)} aria-label="Next photograph"><ArrowRight /></button>
          </div>
          <div className="carousel__dots" aria-label={`Photograph ${slide + 1} of ${photos.length}`}>
            {photos.map((photo, index) => (
              <button key={photo.src} type="button" className={slide === index ? "active" : ""} onClick={() => setSlide(index)} aria-label={`Show photograph ${index + 1}`} />
            ))}
          </div>
        </section>

        <section className="details section-shell" aria-labelledby="details-title">
          <SectionHeading eyebrow="Save the date">Let’s celebrate!</SectionHeading>
          <div className="details__grid">
            <div className="details__list">
              <article><Clock weight="duotone" /><div><span>Time</span><strong>11:00 AM</strong></div></article>
              <article><MapPin weight="duotone" /><div><span>Venue</span><strong>Hofreiter BeerenCafé</strong></div></article>
              <p>Savitsstraße, 81929 München-Bogenhausen</p>
            </div>
            <figure className="map-card">
              <img src={berryMap} alt="Watercolor map of a little berry garden" />
              <a
                className="map-link"
                href="https://maps.app.goo.gl/toouCoTWDKSRXLM78"
                target="_blank"
                rel="noreferrer"
              >
                <MapPin weight="fill" /> Open in Maps
              </a>
            </figure>
          </div>
        </section>

        <section id="rsvp" className="rsvp section-shell" aria-labelledby="rsvp-title">
          <SectionHeading eyebrow="One little photo, one big memory">RSVP in 3 sweet steps</SectionHeading>
          {submitted ? (
            <div className="rsvp-success" role="status">
              <CheckCircle weight="duotone" />
              <h2>Thank you, berry much!</h2>
              <p>We can’t wait to celebrate with you and keep this sweet memory for Anvika.</p>
            </div>
          ) : (
            <form onSubmit={submitRsvp} className="rsvp-flow">
              <div className="rsvp-step">
                <span className="step-number">1</span>
                <div>
                  <label htmlFor="guest-name">Tell us who you are</label>
                  <input id="guest-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" autoComplete="name" required />
                </div>
              </div>

              <div className="rsvp-step rsvp-step--camera">
                <span className="step-number">2</span>
                <div>
                  <p className="rsvp-step__title">Take a berry selfie</p>
                  <p className="privacy-note">Your photo will only be seen by Anvika’s family.</p>
                  {photoPreview ? (
                    <div className="selfie-preview">
                      <img src={photoPreview} alt="Your RSVP selfie preview" />
                      <div className="selfie-actions">
                        <button type="button" onClick={startCamera}><Camera /> Retake</button>
                        <label htmlFor="rsvp-photo">Choose a different photo</label>
                      </div>
                    </div>
                  ) : (
                    <div className="camera-actions">
                      <button className="camera-button" type="button" onClick={startCamera} disabled={cameraBusy}>
                        <Camera weight="duotone" />
                        <span>{cameraBusy ? "Opening camera…" : "Open camera"}</span>
                      </button>
                      <label className="camera-file-button" htmlFor="rsvp-photo">Choose a photo instead</label>
                    </div>
                  )}
                  {cameraNotice && <p className="camera-notice" role="alert">{cameraNotice}</p>}
                  <input id="rsvp-photo" ref={fileRef} className="visually-hidden" type="file" accept="image/*" capture="user" onChange={(event) => acceptPhoto(event.target.files?.[0])} />
                </div>
              </div>

              <div className="rsvp-step rsvp-step--submit">
                <span className="step-number">3</span>
                <div>
                  <p className="rsvp-step__title">Send your RSVP</p>
                  <button className="primary-button" type="submit" disabled={submitting || !name.trim() || !photoBlob}>{submitting ? "Sending…" : "Send my RSVP"}</button>
                </div>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
            </form>
          )}
        </section>

        <footer><MusicNotes weight="duotone" /><strong>Thank you, berry much!</strong><span>We can’t wait to celebrate Anvika with you.</span></footer>
      </div>

      {cameraOpen && (
        <div className="camera-modal" role="dialog" aria-modal="true" aria-label="Take your RSVP selfie">
          <button className="camera-modal__close" type="button" onClick={closeCamera} aria-label="Close camera"><X /></button>
          <video ref={videoRef} muted playsInline />
          <p>Give us your biggest berry smile!</p>
          <button className="shutter" type="button" onClick={capturePhoto} aria-label="Take photograph"><Camera weight="fill" /></button>
        </div>
      )}
    </main>
  );
}
