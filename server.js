var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var request = require("request");
var logger = require("morgan");
var exphbs = require("express-handlebars");

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

// Handlebars Setup
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

// Routes

app.get("/scrape", function (req, res) {
    request("http://www.nytimes.com", function (error, response, html) {
        var $ = cheerio.load(html);
        var result = {};
        $(".story").each(function (i, element) {
            var link = $(element).find("a").attr("href");
            var title = $(element).find("li").text();
            var summary = $(element).find(".summary").text();
            var img = $(element).children().find("img").attr("src");
            result.link = link;
            result.title = title;
            result.summary = summary;
            result.img = img;

            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    return res.json(err);
                });
        });
        console.log("scrape complete");
        res.redirect("/articles");
    })
})

// Route to get all the articles
app.get("/", function (req, res) {
    db.Article.find({}, null, { sort: { created: -1 } }, function (err, data) {
        if (data.length == 0) {
            res.render("placeholder", { message: "There's nothing scraped yet.  Please click on 'Scrape' for the latest news articles" });
        }
        else {
            res.render("index", { articles: data });
        }
    });
});

// Route for finding a specific article
app.get("/articles/:id?", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle)
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for searching the article's text
app.post("/search", function(req, res) {
	console.log(req.body.search);
	Article.find(
        {$text: {$search: req.body.search, $caseSensitive: false}}, null,
        {sort: {created: -1}}, function(err, data) {
		console.log(data);
		if (data.length === 0) {
            res.render("placeholder", 
            {message: "Nothing has been found. Please try other keywords."});
		}
		else {
			res.render("search", {search: data})
		}
	})
});

// Route for accessing saved articles
app.get("/saved", function (req, res) {
    Article.find({ saved: true }, null, { sort: { created: -1 } }, function (err, data) {
        if (data.length === 0) {
            res.render("placeholder", 
            { message: "You have not saved any articles yet. Try to save some news by clicking \"Save Article\"!" });
        }
        else {
            res.render("saved", { saved: data });
        }
    });
});

// Route for updating and saving an article's notes
app.post("/note/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate(
                { _id: req.params.id },
                { note: dbNote._id },
                { new: true })
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for saving an article
app.post("/save/:id", function (req, res) {
    db.Article.findById(req.params.id, function (err, data) {
        if (data.saved) {
            Article.findByIdAndUpdate(req.params.id, { $set: { saved: false, status: "Save Article" } }, { new: true }, function (err, data) {
                res.redirect("/");
            });
        }
        else {
            Article.findByIdAndUpdate(req.params.id, { $set: { saved: true, status: "Saved" } }, { new: true }, function (err, data) {
                res.redirect("/saved");
            });
        }
    });
});

app.listen(PORT, function () {
    console.log("App running on port 3000");
});