const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.get("/", (req, res) => {
  res.status(200).send("Hello World");
  return;
  //   res.send(`
  //     <!DOCTYPE html>
  //     <html lang="pt-BR">
  //       <head>
  //         <meta charset="UTF-8" />
  //         <link rel="icon" href="data:;base64,iVBORw0KGgo=">
  //         <title>Videostream</title>
  //       </head>
  //       <body>
  //       <input type="radio"  checked name="video" value="file1.mp4" /> File 1
  //     <input type="radio" name="video" value="file2.mp4" /> File 2
  //     <input type="radio" name="video" value="file3.mp4" /> File 3
  //     <br />
  //     <video
  //       src="http://localhost:3000/video/file1.mp4"
  //       type="video/mp4"
  //       controls
  //     ></video>

  //     <script>
  //       const base = 'http://localhost:3000/video/';
  //       const video = document.querySelector("video");
  //       const options = document.querySelectorAll("input");
  //       options.forEach((option) =>
  //         option.addEventListener("click", function () {
  //           video.src = base + this.value;
  //           video.play();
  //         })
  //       );
  //       video.onerror = () => {
  //         alert("Vídeo não encontrado!");
  //       };
  //     </script>
  //       </body>
  //     </html>
  //     `);
});
app.get("/video/:name", (req, res) => {
  res.send("Video");
  //   const { name } = req.params;

  //   const pathVideo = path.resolve("src", "videos", name);

  //   if (!fs.existsSync(pathVideo)) {
  //     res.status(404).json({
  //       message: "Vídeo não encontrado!",
  //     });
  //     return;
  //   }

  //   const stat = fs.statSync(pathVideo);
  //   const fileSize = stat.size;
  //   const { range } = req.headers;

  //   let start = 0;
  //   if (range) {
  //     [start] = range.replace(/bytes=/, "").split("-");
  //     start = Number(start);
  //   }

  //   const end = fileSize - 1;
  //   const chunkSize = end - start + 1;

  //   res.set({
  //     "Content-Range": `bytes ${start}-${end}/${fileSize}`,
  //     "Accept-Ranges": "bytes",
  //     "Content-Length": chunkSize,
  //     "Content-Type": "video/mp4",
  //   });

  //   res.status(206);

  //   const stream = fs.createReadStream(pathVideo, { start, end });
  //   stream.on("open", () => stream.pipe(res));
  //   stream.on("error", (streamErr) => res.end(streamErr));
});

app.listen(3000, () => {
  console.log("server is runnig");
});
