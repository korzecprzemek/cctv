import { useEffect, useState } from "react";

function App() {
  const [cameras, setCameras] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/cameras")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch cameras");
        }
        return res.json();
      })
      .then((data) => setCameras(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>CCTV Dashboard</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {cameras.map((camera) => (
          <div
            key={camera.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            <h3>{camera.name}</h3>
            <p>{camera.id}</p>

            <iframe
              src={camera.streamUrl}
              title={camera.name}
              width="100%"
              height="220"
              style={{ border: "none", background: "#000" }}
              allow="autoplay; fullscreen"
            />
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;