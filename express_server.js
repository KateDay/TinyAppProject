const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.redirect("/urls");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    let templateVars = { 
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
        username: req.cookies["username"]
    };
    res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      username: req.cookies["username"]
    };
  res.render("urlsShow", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect("http://" + longURL);
  });


function generateRandomString() {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < 6; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

app.post("/urls", (req, res) => {
   console.log(req.body);  // Log the POST request body to the console
  let randString = generateRandomString();
  urlDatabase[randString] = req.body.longURL
  res.redirect("/urls/" + randString);         
});

app.post("/urls/:shortURL/delete",(req, res) => {
    const shortURL = req.params.shortURL
	delete urlDatabase[shortURL]
    res.redirect("/urls");
})

app.post("/urls/:shortURL/update", (req, res) => {
	console.log('I am editing a URL')
    const shortURL = req.params.shortURL
	const longURL = req.body.longURL
	urlDatabase[shortURL] = longURL
	res.redirect("/urls");
})

app.post("/login",(req, res) => {
    let login = req.body.username;
    res.cookie("username", req.body.username)
    console.log(`Username is: ${login}`);
    res.redirect("/urls");
})

app.post("/logOut",(req, res) => {
    console.log(`${req.body.username} has logged out.`);
    res.clearCookie("username");
    res.redirect("/urls");
})


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });
  