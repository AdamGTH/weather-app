const express = require("express");

const port = process.env.PORT || 5000; // port który da heroku lub port 5000

const app = express();

app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.listen(port);
