console.log("START SERVER", __filename);

const { spawn } = require("child_process");

let ffmpegProcess = null;

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let cameras = [
    { id: "cam1", name: "Camera 1", streamUrl: "http://127.0.0.1:8889/cam1" },
    { id: "cam2", name: "Camera 2", streamUrl: "http://127.0.0.1:8889/cam2" },
];

// GET all
app.get("/cameras", (req, res) => {
    res.json(cameras);
})

// GET ONE
app.get("/cameras/:id", (req, res) => {
    const camera = cameras.find( (c) => c.id === req.params.id);

    if (!camera) {
        return res.status(404).json( {error: "Camera not found" });
    }

    res.json(camera);
});

//POST
app.post("/cameras", (req, res) => {
    const { id, name, streamUrl } = req.body;

    if (!id || !name || !streamUrl) {
        return res.status(400).json({ error: "id, name and streamUrl are required"});
    }

    const exists = cameras.some( (c) => c.id === id);

    if(exists) {
        return res.status(409).json({ error: "Camera with this id already exists"});
    }

    const newCamera = { id, name, streamUrl };
    cameras.push(newCamera);

    res.status(201).json(newCamera);
});

console.log("SERVER FILE:", __filename);

app.put("/test-put", (req, res) => {
  console.log("TEST PUT HIT");
  res.json({ ok: true });
});

//PUT
app.put("/cameras/:id", (req, res) => {
    console.log("PUT HIT", req.params.id, req.body);
    const index = cameras.findIndex( (c) => c.id === req.params.id);

    if (index === -1) {
        return res.status(404).json( {error: "Camera not found"});
    }

    const {name, streamUrl} = req.body;

    cameras[index] = {
        ...cameras[index],
        ...(name && { name }),
        ...(streamUrl && { streamUrl}),
    };

    res.json(cameras[index]);
});

//DELETE
app.delete("/cameras/:id", (req, res) => {
    const index = cameras.findIndex( (c) => c.id === req.params.id);

    if(index === -1) {
        return res.status(404).json({error: "Camera not found"});
    }

    const deleted = cameras[index];
    cameras.splice(index,1);

    res.json(deleted);
});

app.post("/mosaic/start", (req, res) => {
  if (ffmpegProcess) {
    return res.json({ message: "already running" });
  }

ffmpegProcess = spawn("ffmpeg", [
  "-rtsp_transport", "tcp","-fflags", "nobuffer", "-flags", "low_delay", "-i", "rtsp://localhost:8554/cam1",
  "-rtsp_transport", "tcp","-fflags", "nobuffer", "-flags", "low_delay", "-i", "rtsp://localhost:8554/cam2",
  "-rtsp_transport", "tcp","-fflags", "nobuffer", "-flags", "low_delay", "-i", "rtsp://localhost:8554/cam3",
  "-rtsp_transport", "tcp","-fflags", "nobuffer", "-flags", "low_delay", "-i", "rtsp://localhost:8554/cam4",
  "-filter_complex",
  "[0:v]scale=640:360[v0];[1:v]scale=640:360[v1];[2:v]scale=640:360[v2];[3:v]scale=640:360[v3];[v0][v1][v2][v3]xstack=inputs=4:layout=0_0|640_0|0_360|640_360[v]",
  "-map", "[v]",
  "-c:v", "libx264",
  "-preset", "veryfast",
  "-tune", "zerolatency",
  "-f", "rtsp",
  "rtsp://localhost:8554/mosaic"
]);

  ffmpegProcess.stderr.on("data", (data) => {
    console.log(`ffmpeg: ${data}`);
  });

  ffmpegProcess.on("close", () => {
    console.log("ffmpeg stopped");
    ffmpegProcess = null;
  });

  res.json({ message: "mosaic started" });
});

app.post("/mosaic/stop", (req, res) => {
  if (ffmpegProcess) {
    ffmpegProcess.kill("SIGINT");
    ffmpegProcess = null;
  }
  res.json({ message: "mosaic stopped" });
});

app.listen(3001, () => {
  console.log("API on 3001");
});