const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();

app.get("/video/:name", (req, res) => {
  const { name } = req.params;

  const pathVideo = path.resolve("src", "videos", name);

  if (!fs.existsSync(pathVideo)) {
    res.status(404).json({
      message: "Vídeo não encontrado!",
    });
    return;
  }

  const stat = fs.statSync(pathVideo);
  const fileSize = stat.size;
  const { range } = req.headers;

  let start = 0;
  if (range) {
    [start] = range.replace(/bytes=/, "").split("-");
    start = Number(start);
  }

  const end = fileSize - 1;
  const chunkSize = end - start + 1;

  res.set({
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": "video/mp4",
    //"Content-Type": "video/x-matroska",
  });

  res.status(206);

  const stream = fs.createReadStream(pathVideo, { start, end });
  stream.on("open", () => stream.pipe(res));
  stream.on("error", (streamErr) => res.end(streamErr));
});

app.listen(3000, () => {
  console.log("server is runnig");
});
