const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
    console.log(req.cookies);
    let templateVars = { 
    urls: urlDatabase,    
    userId: req.cookies["userId"],
    email: req.cookies["email"]
    };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    let templateVars = { 
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
        userId: req.cookies["userId"],
        email: req.cookies["email"]
    };
    res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { 
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      userId: req.cookies["userId"],
      email: req.cookies["email"]
    };
  res.render("urlsShow", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect("http://" + longURL);
});

app.get("/register", (req, res) => {
    res.render("registration");
});

app.post("/urls", (req, res) => {
   console.log(req.body);  // Log the POST request body to the console
  let randString = generateRandomString();
  urlDatabase[randString] = req.body.longURL;
  res.redirect("/urls/" + randString);         
});

app.post("/urls/:shortURL/delete",(req, res) => {
    const shortURL = req.params.shortURL;
	delete urlDatabase[shortURL];
    res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
	// console.log('I am editing a URL');
    const shortURL = req.params.shortURL;
	const longURL = req.body.longURL;
	urlDatabase[shortURL] = longURL;
	res.redirect("/urls");
});

app.post("/login",(req, res) => {
    console.log("THIS IS THE BODY", req.body);
    let email = req.body.email;
    let password =req.body.password;
    let id = generateRandomID();
    
    let user = { id, email, password }; 
    users[id] = user;
    let userDB = userLookup(email)

    // let login = req.body.email;


    if( userDB.password !== password ) {
        res.status(403).render("registration")
        } else if ( userDB.email !== email ){
        res.status(403).redirect("/register")
        } else {
        res.cookie("userId",user.id);
        console.log(`user is: ${email} and Password is:${password}`);
        res.redirect("/urls");
        } 

   
});

app.post("/logOut",(req, res) => {
    console.log(`${req.body.email} has logged out.`);
    res.clearCookie("userId");
    res.redirect("/register");
});

app.post("/register",(req, res) => {
    let email = req.body.email;
    let password =req.body.password;
    let id = generateRandomID();
    let userDB = userLookup(email)
    
    let user = { id, email, password }; 
    users[id] = user;

    if(email == '' || password == '') {
        res.status(400).render("registration")
        } else if ( userDB !== email ){
        res.status(400).redirect("/register")
        } else {
        res.cookie("userId",user.id);
        // return {email,password}
        console.log(`user is: ${email} and Password is:${password}`);
        res.redirect("/urls");
        } 
});



app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});