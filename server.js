
const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
const PDFDocument = require("pdfkit");

const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = new sqlite3.Database("./database.db");

db.run(`
CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT
)
`);

// ============================
// FREE CALLMEBOT API
// ============================

const INSTANCE_ID = "instance175472";
const TOKEN = "9zgkd31y44o5g7zu";

app.get("/", (req, res) => {
    res.render("index", { message: null });
});

app.post("/send", async (req, res) => {

    const phone = req.body.phone;

    try {

        // SEND MESSAGE
       await axios.post(
  `https://api.ultramsg.com/${INSTANCE_ID}/messages/chat`,
  {
    token: TOKEN,
    to: phone,
    body: "Hello from WhatsApp App"
  }
);

await axios.post(
  `https://api.ultramsg.com/${INSTANCE_ID}/messages/image`,
  {
    token: TOKEN,
    to: phone,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/da/Taj-Mahal.jpg",
    caption: "UP Monument Image"
  }
);

        db.run(
            "INSERT INTO entries(phone) VALUES(?)",
            [phone]
        );

        res.render("index", {
            message: "Massage Send Successfully"
        });

    } catch (error) {

        console.log(error.message);

        res.render("index", {
            message: "Error Sending Message"
        });
    }

});

app.get("/entries", (req, res) => {

    db.all(
        "SELECT * FROM entries",
        [],
        (err, rows) => {

            res.render("entries", {
                entries: rows
            });

        }
    );

});

app.get("/download-pdf", (req, res) => {

    db.all(
        "SELECT * FROM entries",
        [],
        (err, rows) => {

            const doc = new PDFDocument();

            res.setHeader(
                "Content-Type",
                "application/pdf"
            );

            res.setHeader(
                "Content-Disposition",
                "attachment; filename=entries.pdf"
            );

            doc.pipe(res);

            doc.fontSize(20).text("Saved Entries");

            doc.moveDown();

            rows.forEach((row) => {
                doc.fontSize(14).text(row.phone);
            });

            doc.end();

        }
    );

});

app.listen(port, () => {
    console.log("Application Running:");
    console.log("http://localhost:3000");
});
