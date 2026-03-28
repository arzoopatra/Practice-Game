import { useEffect, useState, useRef } from "react";
import { CameraModal } from "../CameraModal";

// ... (Keep your imports the same) ...
import spriteWalk1 from "../assets/walking1.png";
import spriteWalk2 from "../assets/walking2.png";
import spriteJumping from "../assets/jumping.png";
import spriteLanding from "../assets/landing.png";
import starGreen from "../assets/littleGreenStar.png";
import starRed from "../assets/littleRedStar.png";
import starWhite from "../assets/littleWhiteStar.png";
import starYellow from "../assets/littleYellowStar.png";
import infoButton from "../assets/redi.png";
import infoButtonHover from "../assets/buttonhover.png";
import aslChart from "../assets/handSigns.jpg";
import screen1Bg from "../assets/forest.png";
import screen2Bg from "../assets/restaurant_.png";
import bgMusic from "../assets/music.mp3";
import clickSoundFile from "../assets/click.mp3";
import jumpSoundFile from "../assets/jump.mp3";
import hitSoundFile from "../assets/heartloss.mp3";
import collectSoundFile from "../assets/star&coincollect.mp3";
import gameOverSoundFile from "../assets/gameover.mp3";
import SoundControl from "../SoundControl";

export default function Game() {
  const [combo, setCombo] = useState(0);
  const [collectedStars, setCollectedStars] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isInfoHovered, setIsInfoHovered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const handleFail = () => {
    setCombo(0);
    setIsHit(true);

    setTimeout(() => {
      setIsHit(false);
    }, 300);
    setShowDamage(true);

    setTimeout(() => {
      setShowDamage(false);
    }, 600);

    setHearts((prev) => {
      if (prev <= 1) {
        playSound(gameOverRef);
        setShowFailPopup(true);
        return 0;
      }
      return prev - 1;
    });
  };
  const [timeLeft, setTimeLeft] = useState(420); // 7 minutes
  const [hearts, setHearts] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showFailPopup, setShowFailPopup] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0 || isGameOver) {
      setIsGameOver(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isGameOver]);

  // 1. TRACK ACTIVE SCREEN INDEPENDENTLY
  const [activeScreen, setActiveScreen] = useState(0);

  // 2. ADJUST FLOOR HEIGHT BASED ON SCREEN
  const floorY = activeScreen === 0 ? 150 : 60; // Lower floor for restaurant
  const [position, setPosition] = useState({ x: 100, y: 150 });

  const [animationState, setAnimationState] = useState<
    "walk" | "prep" | "jump" | "land"
  >("walk");
  const [walkFrame, setWalkFrame] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isWalking, setIsWalking] = useState(false);
  const [isLevelFading, setIsLevelFading] = useState(false);

  const requestRef = useRef<number>(0);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const currentLetter = alphabet[collectedStars] || "Done";

  const obstacleX1 = 400;
  const obstacleX2 = 900;
  const starImages = [starGreen, starRed, starWhite, starYellow];
  const [isMuted, setIsMuted] = useState(false);

  const screenIndex = Math.floor(collectedStars / 2) * 2;
  const star1Color = starImages[screenIndex % starImages.length];
  const star2Color = starImages[(screenIndex + 1) % starImages.length];
  const [isHit, setIsHit] = useState(false);
  const [showDamage, setShowDamage] = useState(false);

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const clickRef = useRef<HTMLAudioElement | null>(null);
  const jumpRef = useRef<HTMLAudioElement | null>(null);
  const hitRef = useRef<HTMLAudioElement | null>(null);
  const collectRef = useRef<HTMLAudioElement | null>(null);
  const gameOverRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    musicRef.current = new Audio(bgMusic);
    musicRef.current.loop = true;
    musicRef.current.volume = 0.3;

    clickRef.current = new Audio(clickSoundFile);
    jumpRef.current = new Audio(jumpSoundFile);
    hitRef.current = new Audio(hitSoundFile);
    collectRef.current = new Audio(collectSoundFile);
    gameOverRef.current = new Audio(gameOverSoundFile);

    musicRef.current.play().catch(() => {});
  }, []);

  useEffect(() => {
    const volume = isMuted ? 0 : 1;

    if (musicRef.current) musicRef.current.volume = isMuted ? 0 : 0.3;
    if (clickRef.current) clickRef.current.volume = volume;
    if (jumpRef.current) jumpRef.current.volume = volume;
    if (hitRef.current) hitRef.current.volume = volume;
    if (collectRef.current) collectRef.current.volume = volume;
    if (gameOverRef.current) gameOverRef.current.volume = volume;
  }, [isMuted]);

  const playSound = (ref: any) => {
    if (!ref.current) return;
    ref.current.currentTime = 0; 
    ref.current.play();
  };

  const playClick = () => {
    if (!clickRef.current) return;

    clickRef.current.currentTime = 0;

    clickRef.current
      .play()
      .then(() => {})
      .catch(() => {
        clickRef.current?.load();
        clickRef.current?.play();
      });
  };

  const backgroundImage = activeScreen === 0 ? screen1Bg : screen2Bg;

  const update = () => {
    if (
      animationState === "walk" &&
      !showCamera &&
      !isLevelFading &&
      !isFinished
    ) {
      let moving = false;
      let newX = position.x;

      if (keysPressed.current["ArrowRight"]) {
        newX += 6;
        setDirection(1);
        moving = true;
      }
      if (keysPressed.current["ArrowLeft"]) {
        newX -= 6;
        setDirection(-1);
        moving = true;
      }

      setIsWalking(moving);

      if (moving) {
        const atObstacle1 =
          newX >= obstacleX1 &&
          position.x < obstacleX1 &&
          collectedStars % 2 === 0;
        const atObstacle2 =
          newX >= obstacleX2 &&
          position.x < obstacleX2 &&
          collectedStars % 2 !== 0;

        if ((atObstacle1 || atObstacle2) && !showCamera) {
          setShowCamera(true);
          newX = atObstacle1 ? obstacleX1 : obstacleX2;
        }

        if (newX >= window.innerWidth - 50) handleLevelTransition();

        setPosition((prev) => ({ ...prev, x: newX }));
      }
    } else {
      setIsWalking(false);
    }
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    const down = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
    };
    const up = (e: KeyboardEvent) => {
      delete keysPressed.current[e.key];
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [
    animationState,
    showCamera,
    position.x,
    isLevelFading,
    isFinished,
    collectedStars,
    activeScreen,
  ]);

  useEffect(() => {
    if (!isWalking || animationState !== "walk") {
      setWalkFrame(0);
      return;
    }
    const interval = setInterval(
      () => setWalkFrame((prev) => (prev === 0 ? 1 : 0)),
      120,
    );
    return () => clearInterval(interval);
  }, [isWalking, animationState]);

  const handlePassObstacle = () => {
    playSound(jumpRef);
    setCombo((prev) => prev + 1);
    setShowCamera(false);
    setAnimationState("prep");

    setTimeout(() => {
      setAnimationState("jump");

      let upSteps = 5;

      const goUp = () => {
        if (upSteps > 0) {
          setPosition((prev) => ({
            x: prev.x + 20,
            y: prev.y + 40,
          }));
          upSteps--;
          setTimeout(goUp, 40);
        } else {
          goDown();
        }
      };

      let downSteps = 5;

      const goDown = () => {
        if (downSteps > 0) {
          setPosition((prev) => ({
            x: prev.x + 16,
            y: prev.y - 40,
          }));
          downSteps--;
          setTimeout(goDown, 40);
        } else {
          setPosition((prev) => ({ ...prev, y: floorY }));

          const nextCount = collectedStars + 1;
          playSound(collectRef);
          setCollectedStars(nextCount);

          if (nextCount >= alphabet.length) {
            setIsFinished(true);
          }

          setAnimationState("land");
          setTimeout(() => setAnimationState("walk"), 200);
        }
      };

      goUp();
    }, 150);
  };

  const handleLevelTransition = () => {
    setIsLevelFading(true);

    setTimeout(() => {
      const nextScreen = activeScreen === 0 ? 1 : 0;
      setActiveScreen(nextScreen);

      const nextFloorY = nextScreen === 0 ? 150 : 60;
      setPosition({ x: -80, y: nextFloorY });

      setIsLevelFading(false);
    }, 600);
  };

  if (isGameOver) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          overflow: "hidden",
          opacity: isLevelFading ? 0 : 1,

          transform: isHit ? "translateX(-12px)" : "translateX(0)",
          transition: "transform 0.1s",

          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <h1 style={{ fontSize: "2.5rem" }}>
          😔 You couldn’t recognize "{currentLetter}"
        </h1>

        <p style={{ marginTop: "10px", fontSize: "1.2rem" }}>
          Try again from here!
        </p>

        <div></div>

        <button
          onClick={() => {
            playClick();
            setHearts(3);
            setIsGameOver(false);
            setShowCamera(true);
          }}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Retry Letter
        </button>

        <button
          onClick={() => {
            playClick();
            setShowInfo(false);
          }}
        ></button>

        <button
          onClick={() => {
            playClick();
            setHearts(3);
            setShowFailPopup(false);
            setShowCamera(true);
          }}
        ></button>

        <button
          onClick={() => {
            playClick();
            window.location.reload();
          }}
        ></button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#cfe9ff",
          flexDirection: "column",
        }}
      >
        <h1 style={{ fontSize: "3rem" }}>🎉 Congratulations!</h1>
        <p style={{ fontSize: "1.5rem" }}>You've mastered the ASL Alphabet!</p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}
        >
          Play Again
        </button>
      </div>
    );
  }

  const currentSprite =
    animationState === "jump"
      ? spriteJumping
      : animationState === "walk"
        ? walkFrame === 1
          ? spriteWalk2
          : spriteWalk1
        : spriteLanding;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        opacity: isLevelFading ? 0 : 1,
        transition: "opacity 0.5s",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* UI Elements (Keep same) */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          backgroundColor: "#d4f8d4",
          padding: "12px 18px",
          borderRadius: "20px",
          fontWeight: "bold",
          fontSize: "1.1rem",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          border: "2px solid #a6e3a6",
        }}
      >
        ⭐ Letter {currentLetter} ({collectedStars}/26)
      </div>

      {/* TIMER BOX (same style as letter) */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 240,
          zIndex: 10,
          backgroundColor: "#d4f8d4",
          padding: "12px 18px",
          borderRadius: "20px",
          fontWeight: "bold",
          fontSize: "1.1rem",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          border: "2px solid #a6e3a6",
          minWidth: "100px",
          textAlign: "center",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        ⏱️{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
      </div>

      <SoundControl
        isMuted={isMuted}
        toggleMute={() => setIsMuted((prev) => !prev)}
        playClick={playClick}
      />

      <div
        style={{
          position: "absolute",
          top: 20,
          right: 180,
          zIndex: 10,
          fontSize: "2rem",
          display: "flex",
          alignItems: "center",
          height: "48px",

          transform: isHit ? "scale(1.4)" : "scale(1)",
          transition: "transform 0.2s ease",
        }}
      >
        {"❤️".repeat(hearts)}
      </div>

      {showDamage && (
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 180,
            color: "red",
            fontWeight: "bold",
            fontSize: "1.5rem",
            zIndex: 20,
            animation: "floatUp 0.6s ease-out",
          }}
        >
          -1 ❤️
        </div>
      )}

      {combo > 1 && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 20,
            background: "#fff3cd",
            padding: "8px 14px",
            borderRadius: "12px",
            fontWeight: "bold",
            fontSize: "1rem",
            border: "2px solid #ffe066",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          🔥 Combo x{combo}
        </div>
      )}
      <img
        src={isInfoHovered ? infoButtonHover : infoButton}
        alt="info"
        onMouseEnter={() => setIsInfoHovered(true)}
        onMouseLeave={() => setIsInfoHovered(false)}
        onClick={() => {
          playClick();
          setShowInfo(true);
        }}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: "60px",
          cursor: "pointer",
          zIndex: 20,
        }}
      />

      {showInfo && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 50,
          }}
        >
          <div style={{ position: "relative" }}>
            <img
              src={aslChart}
              alt="ASL Chart"
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                borderRadius: "12px",
              }}
            />
            <button
              onClick={() => {
                playClick();
                setShowInfo(false);
              }}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* STARS - LOWERED ON RESTAURANT SCREEN */}
      <img
        src={star1Color}
        alt="star1"
        style={{
          position: "absolute",
          left: obstacleX1 + 100,
          bottom: activeScreen === 0 ? 350 : 260,
          width: "70px",
          zIndex: 5,
          display:
            collectedStars % 2 !== 0 || position.x > obstacleX1 + 100
              ? "none"
              : "block",
        }}
      />

      <img
        src={star2Color}
        alt="star2"
        style={{
          position: "absolute",
          left: obstacleX2 + 100,
          bottom: activeScreen === 0 ? 350 : 260,
          width: "70px",
          zIndex: 5,
          display: position.x > obstacleX2 + 100 ? "none" : "block",
        }}
      />

      {/* SPRITE */}
      <img
        src={currentSprite}
        alt="sprite"
        style={{
          position: "absolute",
          left: position.x,
          bottom: position.y,
          width: "110px",
          transform: `scaleX(${direction})`,
          zIndex: 4,
          transition:
            animationState === "walk" ? "none" : "bottom 0.4s ease-out",
        }}
      />

      {showCamera && (
        <CameraModal
          onPass={handlePassObstacle}
          onFail={handleFail}
          targetLetter={currentLetter}
        />
      )}

      {showFailPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 200,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              textAlign: "center",
              width: "350px",
            }}
          >
            <h2>😔 Oops!</h2>
            <p style={{ marginTop: "10px" }}>
              You couldn’t recognize <b>{currentLetter}</b>
            </p>

            <button
              onClick={() => {
                setHearts(3);
                setShowFailPopup(false);
                setShowCamera(true);
              }}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                border: "none",
                borderRadius: "10px",
                background: "#4CAF50",
                color: "white",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}