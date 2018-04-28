var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var request = require("request");

// Scraping Tools
var cheerio = require("cheerio");

// Requiring Models
var db = require("./models");

var PORT = 3000;

// Initializing Express
var app = express();

// Body-parser to handle form submissions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/mongoScraper");

// Routes

app.get("/scrape", function (req, res) {
    request("http://www.wsj.com", function (error, response, html) {
        var $ = cheerio.load(html);
        var results = [];

        $(".wsj-headline-link").each(function (i, element) {
            var url = $(element).children().attr("href");
            var title = $(element).children().text();
            var summary = $(element).children(".wsj-summary").text();

            db.scrapedData.insert({
                title: title,
                summary: summary,
                url: url
            }),
                function (err, inserted) {
                    if (err) {
                        console.log(err);
                    }
                    else { }
                    console.log(inserted);
                }
        })
    })
    res.send("scrape complete");
})

app.get("/articles", function (req, res) {
    db.scrapedData.find({}, function (error, found) {
        if (error) {
            console.log(error);
        }
        else {
            res.json(found);
        }
    })
})

app.post("/articles/:id", function(req, res){
    db.Comment.create(req.body)
    .then(function(dbComment){
        return db.Article.findOneAndUpdate({ _id: req.params.id}, {comment: dbComment._id}, { new: true })
    })
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    })
})

app.listen(PORT, function () {
    console.log("App running on port 3000");
});