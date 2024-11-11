const { spawn } = require('node:child_process');
const { timingSafeEqual } = require("node:crypto");

let sshx = null;

const createSSHX = () => new Promise((resolve) => {
    sshx = {
        link: "",
        childProcess: spawn(require("./config.json").sshxPath, ["-q"])
    }
    sshx.childProcess.on("error", (l) => {
        console.error("Crashing!!!!")
        console.error(l)
    })
    sshx.childProcess.stdout.on("data", (l) => {
        sshx.link = l.toString().trim();
        resolve();
    })
})

const destroySSHX = () => new Promise((resolve) => {
    sshx.childProcess.on("close", () => {
        sshx = null;
        resolve();
    })
    sshx.childProcess.kill("SIGTERM");
})

const express = require('express')
const app = express()
const port = require("./config.json").port;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
    res.setHeader("Content-Type", "text/html")
    res.send(`
    <!DOCTYPE html>
    <html>
       <head>
          <title>sshx-web</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
       </head>
       <body><main class="container">
          <h1>log in</h1>
          <form action="/action" method="POST">
            <label for="pass">password please:</label><br>
            <input type="password" id="pass" name="pass"><br>
            <input type="submit" value="Log In">
          </form> 
          <br>
          <a href="/shutdown">shutdown the sshx server</a>
       </main></body>
    </html>
    `.trim())
})

app.get('/shutdown', (_req, res) => {
    res.setHeader("Content-Type", "text/html")
    res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>sshx-web</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
      </head>
      <body><main class="container">
        <h1>shutdown</h1>
        <form action="/action-shutdown" method="POST">
          <label for="pass">password please:</label><br>
          <input type="password" id="pass" name="pass"><br>
          <input type="submit" value="Shutdown">
        </form> 
      </body>
    </html>
    `.trim())
})

app.post("/action", async (req, res) => {
    const pass = (req.body.pass);
    let success = false;
    for (const allowed of require("./config.json").allowedPasswords) {
        try {
            if (timingSafeEqual(Buffer.from(pass, "utf16le"), Buffer.from(allowed, "utf16le"))) {
                success = true;
                break;
            }
        } catch { }
    }
    if (!success) {
        res.send("Wrong password!")
        return;
    }
    if (sshx === null) {
        console.log("Creating SSHX...")
        await createSSHX();
        console.log("SSHX at: " + sshx.link)
        res.redirect(sshx.link);
    } else res.redirect(sshx.link)
})

app.post("/action-shutdown", async (req, res) => {
    const pass = (req.body.pass);
    let success = false;
    for (const allowed of require("./config.json").allowedPasswords) {
        if (timingSafeEqual(Buffer.from(pass, "utf16le"), Buffer.from(allowed, "utf16le"))) {
            success = true;
            break;
        }
    }
    if (!success) {
        res.send("Wrong password")
        return;
    }
    if (sshx === null) {
        res.send("SSHX already down")
    } else {
        await destroySSHX();
        res.send("Success! SSHX is down.")
    }
})

app.listen(port, () => {
    console.log(`Listening on :${port}`)
})
