const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


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
        dBforUser[short] = urlDatabase[short]
        }
    }
    return dBforUser;
}

app.get("/", (req, res) => {
  res.redirect("/register");
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
    if (!req.cookies.userId) {
        res.redirect("/register");
    } else {
        let templateVars = { 
        urls: urlsForUser(req.cookies.userId),   

        // userId: req.cookies["userId"],
        user: users[req.cookies["userId"]],
              
        };
    res.render("urls_index", templateVars);
    }
});

app.get("/urls/new", (req, res) => {
    if (!req.cookies.userId) {
        res.redirect("/register");
    } else {
    let templateVars = { 
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
        user: users[req.cookies["userId"]],
        userId: req.cookies["userId"],
        };
    res.render("urls_new", templateVars);
    }
});

app.get("/urls/:shortURL", (req, res) => {
    if (!req.cookies.userId) {
        res.redirect("/register");
    } else {
    let templateVars = { 
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        userId: req.cookies["userId"],
        user: users[req.cookies["userId"]],
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
    if (req.cookies.userId) {
        return res.redirect("/urls");
    }
    res.render("registration");
});


app.post("/urls", (req, res) => {
   console.log(req.body);  // Log the POST request body to the console
    let randString = generateRandomString();
    urlDatabase[randString] = {
        longURL: req.body.longURL,
        userID: req.cookies.userId
    }
    res.redirect("/urls/" + randString);         
});

app.post("/urls/:shortURL/delete",(req, res) => {
    const shortURL = req.params.shortURL;
    const userID = req.cookies.userId;
    if (urlDatabase[shortURL].userID === userID){
        delete urlDatabase[shortURL];
    }
    
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
    let password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    let id = generateRandomID();
    
    let user = { id, email, password }; 
    users[id] = user;
    let userDB = userLookup(email)
    
    // let login = req.body.email;


    if( bcrypt.compareSync(email, hashedPassword)) {
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
    let id = generateRandomID();
    let userDB = userLookup(email)
    let password = bcrypt.hashSync(req.body.password, saltRounds)
    
    let user = { id, email, password }; 
    users[id] = user;

    if(email == '' || password == '') {
        res.status(400).render("registration")
        } else if ( email !== userDB ){
        res.cookie("userId",user.id);
        // return {email,password}
        console.log(`user is: ${email} and Password is:${password}`);
        res.redirect("/urls");
        } 
});

console.log(users);

app.listen(PORT, () => {
    console.log(`TinyApp listening on port ${PORT}!`);
});