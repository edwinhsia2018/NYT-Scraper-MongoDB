var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var request = require("request");
var logger = require("morgan");

// Scraping Tools
var cheerio = require("cheerio");

// Requiring Models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initializing Express
var app = express();

// Morgan logger for request logging
app.use(logger("dev"));

// Body-parser to handle form submissions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/mongoScraper");

// Routes

app.get("/scrape", function (req, res) {
    request("http://www.macrumors.com", function (error, response, html) {
        var $ = cheerio.load(html);

        $(".article").each(function (i, element) {
            var result = {};
            result.link = $(element).children("linkback").attr("href");
            result.title = $(element).children("title").text();
            // var summary = $(this).children(".wsj-summary").text();

            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    return res.json(err);
                });
        });
        res.send("scrape complete");
    })
})

// Route to get all the articles
app.get("/articles", function (req, res) {
    dbm.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for finding a specific article
app.get("/articles/:id?", function(req, res){
    db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle){
        res.json(dbArticle)
    })
    .catch(function(err){
        res.json(err);
    });
});

// Route for updating and saving an article's notes
app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true })
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.listen(PORT, function () {
    console.log("App running on port 3000");
});