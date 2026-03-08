console.log("START SERVER", __filename);

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})