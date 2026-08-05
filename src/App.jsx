import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  Balloon,
  Brain,
  Camera,
  CheckCircle,
  Clock,
  Crown,
  LockKey,
  LockKeyOpen,
  MapPin,
  MicrophoneStage,
  MusicNotes,
  PawPrint,
  Pause,
  PersonSimpleRun,
  Play,
  Smiley,
  Sparkle,
  SpeakerHigh,
  SpeakerSlash,
  Tree,
  Trophy,
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
import backgroundMusic from "./assets/riverbend-serenade.mp3";
import { teamSlugs, teams } from "./gameData.js";

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

const MUSIC_VOLUME = 0.3;
const MUSIC_SCROLL_VOLUME = 0.38;
const MAX_RSVP_PHOTO_DIMENSION = 1600;

function loadPhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("We couldn’t read this photo. Please choose a JPEG, PNG, or WebP image."));
    };
    image.src = url;
  });
}

async function preparePhoto(file) {
  if (!file || (file.type && !file.type.startsWith("image/"))) {
    throw new Error("Please choose an image from your photo library.");
  }

  const image = await loadPhoto(file);
  const scale = Math.min(
    1,
    MAX_RSVP_PHOTO_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("We couldn’t prepare this photo. Please choose another one."));
      },
      "image/jpeg",
      0.82,
    );
  });
}

function useBackgroundMusic() {
  const audioRef = useRef(null);
  const mutedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const play = useCallback(async () => {
    if (!audioRef.current) {
      const audio = new Audio(backgroundMusic);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = MUSIC_VOLUME;
      audio.setAttribute("playsinline", "");
      audio.onended = () => setPlaying(false);
      audio.onpause = () => setPlaying(false);
      audio.onplay = () => setPlaying(true);
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    audio.muted = mutedRef.current;
    try {
      await audio.play();
    } catch {
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!audioRef.current) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      const volume = MUSIC_VOLUME + progress * (MUSIC_SCROLL_VOLUME - MUSIC_VOLUME);
      audioRef.current.volume = volume;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => () => {
    if (!audioRef.current) return;
    audioRef.current.onended = null;
    audioRef.current.onpause = null;
    audioRef.current.onplay = null;
    audioRef.current.pause();
    audioRef.current.src = "";
    audioRef.current = null;
  }, []);

  const toggleMute = () => {
    setMuted((current) => {
      const next = !current;
      mutedRef.current = next;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  };

  return { playing, muted, play, stop, toggleMute };
}

function SectionHeading({ eyebrow, children, id }) {
  return (
    <header className="section-heading">
      <span>{eyebrow}</span>
      <h2 id={id}>{children}</h2>
      <img src={berrySprig} alt="" aria-hidden="true" />
    </header>
  );
}

function SiteTabs({ gameActive = false, invitationHref = "#invitation", gameHref = "./game/" }) {
  return (
    <nav className="site-tabs" aria-label="Invitation sections">
      <a className={!gameActive ? "active" : ""} href={invitationHref}>Invitation</a>
      <a className={gameActive ? "active" : ""} href={gameHref}>Birthday game</a>
    </nav>
  );
}

function Invitation() {
  const gameAvailability = useGameAvailability();
  const [opened, setOpened] = useState(false);
  const [slide, setSlide] = useState(0);
  const [name, setName] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [cameraBusy, setCameraBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [cameraNotice, setCameraNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const preloadedPhotosRef = useRef([]);
  const { playing, muted, play, stop, toggleMute } = useBackgroundMusic();

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

  const choosePhoto = async (file) => {
    if (!file) return;
    setPhotoBusy(true);
    setError("");
    setCameraNotice("");
    try {
      acceptPhoto(await preparePhoto(file));
    } catch (photoError) {
      setError(
        photoError instanceof Error
          ? photoError.message
          : "We couldn’t prepare this photo. Please choose another one.",
      );
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
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
        const result = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(
            result?.error === "Photo must be an image under 5 MB"
              ? "This photo is still too large. Please choose another one."
              : "We couldn’t send your RSVP just now. Please try again.",
          );
        }
      } else {
        localStorage.setItem("anvika-rsvp-preview", JSON.stringify({ guestName: name.trim(), createdAt: new Date().toISOString() }));
        await new Promise((resolve) => window.setTimeout(resolve, 650));
      }
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We couldn’t send your RSVP just now. Please try again.",
      );
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
      {gameAvailability.status === "ready" && gameAvailability.enabled && <SiteTabs />}
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
          <span>Riverbend Serenade</span>
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
                      <label className="camera-file-button" htmlFor="rsvp-photo">
                        {photoBusy ? "Preparing photo…" : "Choose a photo instead"}
                      </label>
                    </div>
                  )}
                  {cameraNotice && <p className="camera-notice" role="alert">{cameraNotice}</p>}
                  <input
                    id="rsvp-photo"
                    ref={fileRef}
                    className="visually-hidden"
                    type="file"
                    accept="image/*"
                    disabled={photoBusy}
                    onChange={(event) => void choosePhoto(event.target.files?.[0])}
                  />
                </div>
              </div>

              <div className="rsvp-step rsvp-step--submit">
                <span className="step-number">3</span>
                <div>
                  <p className="rsvp-step__title">Send your RSVP</p>
                  <button className="primary-button" type="submit" disabled={submitting || photoBusy || !name.trim() || !photoBlob}>{submitting ? "Sending…" : "Send my RSVP"}</button>
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

const teamIcons = {
  trophy: Trophy,
  balloon: Balloon,
  paw: PawPrint,
  camera: Camera,
  microphone: MicrophoneStage,
  baby: Baby,
  smiley: Smiley,
  brain: Brain,
  dance: PersonSimpleRun,
  crown: Crown,
};

const GAME_STATUS_ENDPOINT =
  import.meta.env.VITE_GAME_STATUS_ENDPOINT ||
  "https://zvabtewgyvmgsbcjcjio.supabase.co/functions/v1/game-team-status";

async function readTeamApproval(teamSlug, revealRiddle = false) {
  const url = new URL(GAME_STATUS_ENDPOINT);
  url.searchParams.set("team", teamSlug);
  if (revealRiddle) url.searchParams.set("reveal", "1");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || !result) {
    throw new Error(result?.error || "Unable to check team approval");
  }
  return result;
}

async function readGameAvailability() {
  const url = new URL(GAME_STATUS_ENDPOINT);
  url.searchParams.set("scope", "game");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || typeof result?.enabled !== "boolean") {
    throw new Error(result?.error || "Unable to check game availability");
  }
  return result.enabled;
}

function useGameAvailability() {
  const [availability, setAvailability] = useState({ status: "checking", enabled: false });

  useEffect(() => {
    let active = true;
    readGameAvailability()
      .then((enabled) => {
        if (active) setAvailability({ status: "ready", enabled });
      })
      .catch(() => {
        if (active) setAvailability({ status: "error", enabled: false });
      });
    return () => {
      active = false;
    };
  }, []);

  return availability;
}

async function submitRiddleAnswer(teamSlug, answer) {
  const response = await fetch(GAME_STATUS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ team: teamSlug, answer }),
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || !result) {
    throw new Error(result?.error || "Unable to check the answer");
  }
  return result;
}

function resolveGameRoute() {
  const segments = window.location.pathname.split("/").filter(Boolean);
  if (segments.at(-1) === "game") return { kind: "index" };

  const teamIndex = segments.findIndex((segment) => teamSlugs.includes(segment));
  if (teamIndex === -1) return null;

  const team = teams.find(({ slug }) => slug === segments[teamIndex]);
  return {
    kind: segments[teamIndex + 1] === "riddle" ? "riddle" : "challenge",
    team,
  };
}

function GameMusicPlayer() {
  const { playing, muted, play, stop, toggleMute } = useBackgroundMusic();
  return (
    <div className="music-player game-music-player" aria-label="Background music controls">
      <button type="button" onClick={playing ? stop : play} aria-label={playing ? "Pause music" : "Play music"}>
        {playing ? <Pause weight="fill" /> : <Play weight="fill" />}
      </button>
      <div>
        <span>Riverbend Serenade</span>
        <small>{playing ? "Playing during the mission" : "Tap play for party music"}</small>
      </div>
      <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute music" : "Mute music"}>
        {muted ? <SpeakerSlash /> : <SpeakerHigh />}
      </button>
    </div>
  );
}

function GameShell({ route, children }) {
  const gameAvailability = useGameAvailability();
  const showTabs = gameAvailability.status === "ready" && gameAvailability.enabled;
  const invitationHref = route.kind === "riddle" ? "../../" : "../";
  const gameHref = route.kind === "riddle"
    ? "../../game/"
    : route.kind === "challenge"
      ? "../game/"
      : "./";

  return (
    <main className={showTabs ? "site is-open game-site has-site-tabs" : "site is-open game-site"}>
      {showTabs && <SiteTabs gameActive invitationHref={invitationHref} gameHref={gameHref} />}
      <div className="game-paper">
        {children}
        <footer className="game-footer">
          <MusicNotes weight="duotone" />
          <strong>Anvika’s Great Birthday Treasure Hunt</strong>
          <span>Complete your mission. Keep your answer secret.</span>
        </footer>
      </div>
      <GameMusicPlayer />
    </main>
  );
}

function TeamMark({ team }) {
  const Icon = teamIcons[team.icon];
  return (
    <div className="team-mark" aria-hidden="true">
      <span>{team.number}</span>
      <Icon weight="duotone" />
    </div>
  );
}

function GameIndex() {
  return (
    <GameShell route={{ kind: "index" }}>
      <section className="game-hero section-shell">
        <div className="game-hero__copy">
          <p className="eyebrow">Anvika’s 1st birthday</p>
          <h1>Great Birthday<br />Treasure Hunt</h1>
          <p>Find your family team, open your secret mission, and do not reveal your answer to anyone else.</p>
        </div>
        <div className="game-hero__seal" aria-hidden="true">
          <Sparkle weight="duotone" />
          <strong>10</strong>
          <span>family missions</span>
        </div>
      </section>

      <section className="team-picker section-shell" aria-labelledby="choose-team-title">
        <SectionHeading eyebrow="Choose carefully" id="choose-team-title">Find your family team</SectionHeading>
        <p className="team-picker__intro">Only open the team assigned to your family.</p>
        <div className="team-grid">
          {teams.map((team) => {
            const Icon = teamIcons[team.icon];
            return (
              <a className="team-card" href={`../${team.slug}/`} key={team.slug}>
                <span className="team-card__number">Team {team.number}</span>
                <Icon weight="duotone" aria-hidden="true" />
                <div>
                  <h2>{team.title}</h2>
                  <p>{team.teaser}</p>
                </div>
                <ArrowRight className="team-card__arrow" aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </section>
    </GameShell>
  );
}

function ChallengePage({ team }) {
  const { challenge } = team;
  const [approvalState, setApprovalState] = useState("idle");
  const [approvalMessage, setApprovalMessage] = useState("");

  const openApprovedRiddle = async () => {
    setApprovalState("checking");
    setApprovalMessage("");
    try {
      const result = await readTeamApproval(team.slug);
      if (!result.approved) {
        setApprovalState("waiting");
        setApprovalMessage(`Team ${team.number} is not approved yet. Ask Anvika's parents, then try again.`);
        return;
      }
      setApprovalState("approved");
      window.location.assign("./riddle/");
    } catch {
      setApprovalState("error");
      setApprovalMessage("We could not check approval just now. Please try again.");
    }
  };

  return (
    <GameShell route={{ kind: "challenge" }}>
      <section className="mission-page section-shell">
        <a className="game-back-link" href="../game/"><ArrowLeft /> All teams</a>
        <article className="mission-card">
          <TeamMark team={team} />
          <p className="mission-card__eyebrow">Team {team.number} · Secret family mission</p>
          <h1>{team.title}</h1>
          <p className="mission-card__intro">{challenge.intro}</p>

          {challenge.photo && (
            <figure className="mission-reference">
              <img src={heroPhoto} alt="Anvika wearing pink sunglasses in her stroller" />
              <figcaption>Your pose to recreate</figcaption>
            </figure>
          )}

          <div className="mission-blocks">
            {challenge.blocks.map((block) => (
              <section key={block.title}>
                <h2>{block.title}</h2>
                <ul>
                  {block.lines.map((line) => <li key={line}>{line}</li>)}
                </ul>
              </section>
            ))}
          </div>

          <div className="mission-finish">
            <CheckCircle weight="duotone" aria-hidden="true" />
            <p>{challenge.finish}</p>
          </div>

          <button
            className="primary-button mission-riddle-link"
            type="button"
            onClick={openApprovedRiddle}
            disabled={approvalState === "checking" || approvalState === "approved"}
          >
            <LockKeyOpen weight="bold" />
            {approvalState === "checking" ? "Checking parent approval..." : "Mission complete - check approval"}
          </button>
          {approvalMessage && (
            <p className={`approval-message approval-message--${approvalState}`} role="status">
              {approvalMessage}
            </p>
          )}
        </article>
      </section>
    </GameShell>
  );
}

function RiddlePage({ team }) {
  const [riddleState, setRiddleState] = useState("checking");
  const [riddle, setRiddle] = useState(null);
  const [guess, setGuess] = useState("");
  const [solved, setSolved] = useState(false);
  const [guessError, setGuessError] = useState("");
  const [answerBusy, setAnswerBusy] = useState(false);

  const loadRiddle = useCallback(async () => {
    setRiddleState("checking");
    setGuessError("");
    try {
      const result = await readTeamApproval(team.slug, true);
      if (!result.approved) {
        setRiddle(null);
        setRiddleState("locked");
        return;
      }
      if (
        !result.riddle ||
        !Array.isArray(result.riddle.clues) ||
        !result.riddle.question
      ) {
        throw new Error("Riddle is unavailable");
      }
      setRiddle(result.riddle);
      setRiddleState("ready");
    } catch {
      setRiddle(null);
      setRiddleState("error");
    }
  }, [team.slug]);

  useEffect(() => {
    void loadRiddle();
  }, [loadRiddle]);

  const checkAnswer = async (event) => {
    event.preventDefault();
    setAnswerBusy(true);
    setGuessError("");
    try {
      const result = await submitRiddleAnswer(team.slug, guess.trim());
      if (!result.approved) {
        setRiddle(null);
        setRiddleState("locked");
        return;
      }
      if (result.correct) {
        setSolved(true);
        window.setTimeout(() => document.querySelector("#final-instruction")?.scrollIntoView({ behavior: "smooth" }), 80);
        return;
      }
      setGuessError("Not quite. Read every clue once more and try again.");
    } catch {
      setGuessError("We could not check your answer just now. Please try again.");
    } finally {
      setAnswerBusy(false);
    }
  };

  if (riddleState !== "ready" || !riddle) {
    const checking = riddleState === "checking";
    return (
      <GameShell route={{ kind: "riddle" }}>
        <section className="riddle-page section-shell">
          <a className="game-back-link" href="../"><ArrowLeft /> Back to mission</a>
          <article className="riddle-card riddle-card--locked">
            <TeamMark team={team} />
            <LockKey weight="duotone" aria-hidden="true" />
            <p className="mission-card__eyebrow">Team {team.number} · Mystery card</p>
            <h1>{checking ? "Checking approval..." : "Riddle still locked"}</h1>
            <p className="riddle-card__intro">
              {checking
                ? "Asking Supabase whether Anvika's parents approved your mission."
                : riddleState === "error"
                  ? "We could not reach the approval check. Your riddle remains safely locked."
                  : `Anvika's parents have not approved Team ${team.number} yet.`}
            </p>
            {!checking && (
              <button className="primary-button approval-retry" type="button" onClick={loadRiddle}>
                Check approval again
              </button>
            )}
          </article>
        </section>
      </GameShell>
    );
  }

  return (
    <GameShell route={{ kind: "riddle" }}>
      <section className="riddle-page section-shell">
        <a className="game-back-link" href="../"><ArrowLeft /> Back to mission</a>
        <article className="riddle-card">
          <TeamMark team={team} />
          <p className="mission-card__eyebrow">Team {team.number} · Mystery card</p>
          <h1>One final riddle</h1>
          {riddle.intro && <p className="riddle-card__intro">{riddle.intro}</p>}
          <div className="riddle-clues">
            {riddle.clues.map((clue) => <p key={clue}>{clue}</p>)}
          </div>
          <p className="riddle-question">{riddle.question}</p>

          {!solved && (
            <form className="riddle-answer" onSubmit={checkAnswer}>
              <label htmlFor="riddle-guess">Your secret answer</label>
              <div>
                <input
                  id="riddle-guess"
                  value={guess}
                  onChange={(event) => setGuess(event.target.value)}
                  placeholder="Type your answer"
                  autoComplete="off"
                  required
                />
                <button className="primary-button" type="submit" disabled={answerBusy}>
                  {answerBusy ? "Checking..." : "Check answer"}
                </button>
              </div>
              {guessError && <p className="riddle-error" role="alert">{guessError}</p>}
            </form>
          )}

          {solved && (
            <section className="final-instruction" id="final-instruction" aria-live="polite">
              <Tree weight="duotone" aria-hidden="true" />
              <p className="eyebrow">Correct · Final instruction</p>
              <h2>Find the tree wearing Anvika’s birthday ribbon.</h2>
              <p>Do not open the treasure. Wait there for the other detectives - and do not tell them the answer.</p>
            </section>
          )}
        </article>
      </section>
    </GameShell>
  );
}

function GameExperience({ route }) {
  if (route.kind === "index") return <GameIndex />;
  if (route.kind === "riddle") return <RiddlePage team={route.team} />;
  return <ChallengePage team={route.team} />;
}

export function App() {
  const gameRoute = resolveGameRoute();
  return gameRoute ? <GameExperience route={gameRoute} /> : <Invitation />;
}
