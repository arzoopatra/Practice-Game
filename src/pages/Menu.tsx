import backgroundImg from "../assets/StartingMenu.png";
export default function Menu() {
  return (
    <div
      className="page-container"
      style={{
        display: "flex",
        minHeight: "100vh",
        minWidth: "100vw",
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
    </div>
  );
}
