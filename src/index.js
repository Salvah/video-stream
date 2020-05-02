const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

const mimeNames = {
  ".mp4": "video/mp4",
  ".mkv": "video/x-matroska",
};

const getMimeNameFromExt = (ext) => {
  const mime = mimeNames[ext.toLowerCase()];

  if (mime === null) return "application/octet-stream";
  return mime;
};

const getRangeHeader = (range, fileSize) => {
  if (range === null || range === undefined || range.length === 0) return null;

  const [, start, end] = range
    .split(/bytes=([0-9]*)-([0-9]*)/)
    .map((r) => parseInt(r));
  const interval = {
    start: isNaN(start) ? 0 : start,
    end: isNaN(end) ? fileSize - 1 : end,
  };
  return { ...interval, size: interval.end - interval.start + 1 };
};

const sendResponse = (res, status, headers, stream) => {
  res.writeHead(status, headers);

  if (stream !== null) {
    // Quando a stream tiver pronta, ela começa a passar a resposta para o cliente
    stream.on("open", () => {
      console.log("open");
      stream.pipe(res);
    });
    stream.on("error", (streamErr) => {
      console.log("error");
      res.end(streamErr);
    });
    return null;
  }
  res.end();

  return null;
};

const app = express();
app.use(cors());
app.get("/", (req, res) => {
  res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <link rel="icon" href="data:;base64,iVBORw0KGgo=">
          <title>Videostream</title>
        </head>
        <body>
        <input type="radio"  checked name="video" value="file1.mp4" /> File 1
      <input type="radio" name="video" value="file2.mp4" /> File 2
      <input type="radio" name="video" value="file3.mp4" /> File 3
      <br />
      <video
        src="https://video-stream-njs.herokuapp.com/video/file1.mp4"
        type="video/mp4"
        controls
      ></video>

      <script>
        const base = "https://video-stream-njs.herokuapp.com/video/";
        const video = document.querySelector("video");
        const options = document.querySelectorAll("input");
        options.forEach((option) =>
          option.addEventListener("click", function () {
            video.src = base + this.value;
            video.play();
          })
        );
        video.onerror = () => {
          alert("Vídeo não encontrado!");
        };
      </script>
        </body>
      </html>
      `);
});
app.get("/video/:name", (req, res) => {
  const { name } = req.params;

  // Resolver o caminho no arquivo
  const pathVideo = path.resolve("src", "videos", name);

  // Se o arquivo não existe retorne 404.
  if (!fs.existsSync(pathVideo)) {
    sendResponse(res, 404, null, null);
    return null;
  }

  // Pega informações do arquivo (tamanho, permissoes, se é arquivo, diretorio)
  const stat = fs.statSync(pathVideo);

  // Pegamos o tamanho do arquivo
  const fileSize = stat.size;

  /**
   * Accept-Ranges: é utilizado pelo servidor para indicar que ele suporta requisições parciais. O valor deste campo indica a unidade utilizada para definir o tamanho
   * Content-Type: Tipo do conteúdo
   */

  const headers = {
    "Accept-Ranges": "bytes",
    "Content-Type": getMimeNameFromExt(path.extname(pathVideo)),
  };

  // bytes=n-
  const { range } = req.headers;

  const result = getRangeHeader(range, fileSize);

  if (result === null) {
    /**
     * Content-Length: amanho do conteúdo
     */
    headers["Content-Length"] = fileSize;
    sendResponse(res, 200, headers, fs.createReadStream(pathVideo));
    return null;
  }

  const { size, ...interval } = result;
  const { start, end } = interval;

  if (start >= fileSize || end >= fileSize) {
    headers["Content-Range"] = `bytes */${fileSize}`;
    sendResponse(res, 416, headers, null);
    return null;
  }

  /**
   * Content-Range:  indica em que lugar uma mensagem parcial pertence em uma mensagem completa no corpo. unit start-end/size
   * Content-Length: Tamanho do conteúdo
   */
  headers["Content-Range"] = "bytes " + start + "-" + end + "/" + fileSize;
  headers["Content-Length"] = size;
  headers["Cache-Control"] = "no-cache";

  console.log(start, end, size, fileSize);

  sendResponse(res, 206, headers, fs.createReadStream(pathVideo, interval));
});

app.listen(process.env.PORT || 3000, () => {
  console.log("server is runnig");
});
