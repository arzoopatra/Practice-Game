import musicIcon from "./assets/music.png";
import noMusicIcon from "./assets/nomusic.png";
export default function SoundControl({ isMuted, toggleMute, playClick }: any) {
  return (
    <button
      onClick={() => {
        playClick();
        toggleMute();
      }}
      style={{
        position: "absolute",
        top: 20,
        right: 100,
        zIndex: 50,

        width: "60px",
        height: "60px",

        background: "transparent",   
        border: "none",              
        outline: "none",              
        boxShadow: "none",            

        cursor: "pointer",
        padding: 0,                   
      }}
    >
      <img
        src={isMuted ? noMusicIcon : musicIcon}        
        alt="sound"
        style={{
          width: "60px",
          height: "60px",
          pointerEvents: "none",  
        }}
      />
    </button>
  );
}