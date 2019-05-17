const express = require("express");
const app = express();
const PORT = 8081; // default port 8081
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cookieSession = require('cookie-session');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
    name: '"session"',
    keys: ["key1"],
}));


const users = {
    "userRandomID": {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk"
    }
};

const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

function generateRandomString() {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < 6; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function generateRandomID() {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < 10; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function userLookup (email) {
    for (let id in users) {
        if (email === users[id].email) {
           return users[id];
        }
    }
}

function urlsForUser(loggedInId){
    let dBforUser = {};
    for (let short in urlDatabase){
        if(loggedInId === urlDatabase[short].userID){
        dBforUser[short] = urlDatabase[short];
        }
    }
    return dBforUser;
}

// All the GET Responses:
app.get("/", (req, res) => {
    res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});
app.get("/u", (req, res) => {
    res.json(users);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/register");
    } else {
        let templateVars = {
        urls: urlsForUser(req.session.userId),
        user: users[req.session["userId"]],
        };
    res.render("urls_index", templateVars);
    }

    console.log("this is the reqSession: " + req.session.userId);
});

app.get("/urls/new", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/register");
    } else {
    let templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
        user: users[req.session["userId"]],
        userId: req.session["userId"],
        };
    res.render("urls_new", templateVars);
    }
});

app.get("/urls/:shortURL", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/register");
    } else {
    let templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        userId: req.session["userId"],
        user: users[req.session["userId"]],
        urls: urlDatabase,
        };
    res.render("urlsShow", templateVars);
    }
});

app.get("/u/:shortURL", (req, res) => {

    const longURL = urlDatabase[req.params.shortURL].longURL;
console.log("the get for /:short" + longURL);
    res.redirect("http://" + longURL);
});

app.get("/register", (req, res) => {
    if (req.session.userId) {
        return res.redirect("/urls");
    }
    res.render("registration");
});


// All the POST responses:
app.post("/urls", (req, res) => {
    console.log(req.body); 
    let randString = generateRandomString();
    urlDatabase[randString] = {
        longURL: req.body.longURL,
        userID: req.session.userId
    };
    res.redirect("/urls/" + randString);
});

app.post("/urls/:shortURL/delete",(req, res) => {
    const shortURL = req.params.shortURL;
    const userID = req.session.userId;
    if (urlDatabase[shortURL].userID === userID){
        delete urlDatabase[shortURL];
    }

    res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
    const shortURL = req.params.shortURL;
	const longURL = req.body.longURL;
	urlDatabase[shortURL] = longURL;
	res.redirect("/urls");
});

app.post("/login",(req, res) => {
    let email = req.body.email;
    let password = bcrypt.hashSync(req.body.password, saltRounds);
    let userDB = userLookup(email);

    if(userDB) {
        if (bcrypt.compareSync(req.body.password, userDB.password)) {
            req.session.userId = userDB.id;
            console.log(`user ${email} is logged in`);
            res.redirect("/urls");
        } else {
            res.send("<h1>Ooops, try again!</h1>")
        } 
    } else {
        res.send("<h1>Ooops, try again!</h1>")
    };
});

app.post("/logOut",(req, res) => {
    req.session = null;
    res.redirect("/register");
});

app.post("/register",(req, res) => {
    let email = req.body.email;
    let id = generateRandomID();
    let userDB = userLookup(email)
    let password = bcrypt.hashSync(req.body.password, saltRounds)

    let user = { id, email, password };
    users[id] = user;


    if(email == '' || password == '') {
        res.status(400).render("registration")
        } else if ( email !== userDB ){
            req.session.userId = id;
            res.redirect("/urls");
        }
        console.log(user);
});

// Port Listening
app.listen(PORT, () => {
    console.log(`TinyApp listening on port ${PORT}!`);
});
