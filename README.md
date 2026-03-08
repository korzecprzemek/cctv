# CCTV Dashboard

Web-based CCTV dashboard built with:
- React
- Node.js / Express
- MediaMTX
- WebRTC

Using ffmpeg and a sample.mp4 file for prototype tests.

## Setup:
- ```docker compose up```
- ```ffmpeg -re -stream_loop -1 -i sample.mp4 -c copy -f rtsp rtsp://127.0.0.1:8554/cam1 ```
- ```npm install; npm start {backend i frontend}```

## Local *.mp4* test
- ```ffplay rtsp://127.0.0.1:8554/cam1```

## Dashboard

<img src="docs/dashboard.png" width="500">