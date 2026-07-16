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

import heroPhoto from "./assets/anvika-hero-berry.jpg";
import flyingPhoto from "./assets/anvika-flying-berry.jpg";
import fairyPhoto from "./assets/anvika-fairy-berry.jpg";
import berryEnvelope from "./assets/berry-envelope.webp";
import berryMap from "./assets/berry-map.jpg";
import berrySprig from "./assets/berry-sprig.webp";

const photos = [
  { src: heroPhoto, alt: "Anvika surrounded by a watercolor berry garden" },
  { src: flyingPhoto, alt: "Anvika playing in a magical berry storybook scene" },
  { src: fairyPhoto, alt: "Anvika in a playful watercolor berry garden" },
];

const melody = [
  523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46,
  659.25, 783.99, 987.77, 783.99, 587.33, 698.46, 783.99, 523.25,
];

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

  const play = useCallback(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!audioRef.current) {
      const context = new AudioContext();
      const gain = context.createGain();
      gain.gain.value = 0.035;
      gain.connect(context.destination);
      audioRef.current = { context, gain };
    }

    const { context, gain } = audioRef.current;
    setPlaying(true);
    if (context.state === "suspended") {
      void context.resume().catch(() => setPlaying(false));
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
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!audioRef.current) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      const volume = mutedRef.current ? 0 : 0.025 + progress * 0.02;
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
        audioRef.current.gain.gain.setTargetAtTime(next ? 0 : 0.035, audioRef.current.context.currentTime, 0.08);
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
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const { playing, muted, play, stop, toggleMute } = useBerryMelody();

  const openInvitation = () => {
    setOpened(true);
    play();
    window.setTimeout(() => {
      document.querySelector("#invitation")?.scrollIntoView({ behavior: "smooth" });
    }, 430);
  };

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }, []);

  useEffect(() => closeCamera, [closeCamera]);

  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 900 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 0);
    } catch {
      fileRef.current?.click();
    }
  };

  const acceptPhoto = (blob) => {
    if (!blob) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoBlob(blob);
    setPhotoPreview(URL.createObjectURL(blob));
    closeCamera();
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
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
    const invitationToken = new URLSearchParams(window.location.search).get("invite") || "";

    try {
      if (endpoint) {
        const payload = new FormData();
        payload.append("guest_name", name.trim());
        payload.append("photo", photoBlob, "berry-selfie.jpg");
        payload.append("invitation_token", invitationToken);
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
    <main className={opened ? "site is-open" : "site"}>
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
            <img src={heroPhoto} alt="Anvika in a watercolor berry garden" />
            <figcaption>One whole year of sweetness</figcaption>
          </figure>
        </section>

        <section className="memories section-shell" aria-labelledby="memories-title">
          <SectionHeading eyebrow="A year of tiny moments">Sweet little memories</SectionHeading>
          <div className="carousel">
            <button type="button" onClick={() => setSlide((slide + photos.length - 1) % photos.length)} aria-label="Previous photograph"><ArrowLeft /></button>
            <figure><img src={photos[slide].src} alt={photos[slide].alt} /></figure>
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
                      <button type="button" onClick={startCamera}><Camera /> Retake</button>
                    </div>
                  ) : (
                    <button className="camera-button" type="button" onClick={startCamera}><Camera weight="duotone" /><span>Open camera</span></button>
                  )}
                  <input ref={fileRef} className="visually-hidden" type="file" accept="image/*" capture="user" onChange={(event) => acceptPhoto(event.target.files?.[0])} />
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
