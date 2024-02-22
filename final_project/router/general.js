const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
  const password = req.body.password;

  if(username && password){
    if(!isValid(username)){
        users.push({"username": username, "password": password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
    }else{
        return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    let BookList = new Promise((resolve, reject)=>{
        resolve(books)
      })
      BookList.then((book)=> res.send(JSON.stringify(book, null, 4)));
});

// Get book details based on ISBN
function getIsbn(isbn) {
    return new Promise((resolve, reject) => {
        let bookisbn = parseInt(isbn);
        if (books[bookisbn]) {
            resolve(books[bookisbn]);
        } else {
            reject({status:404, message:`ISBN not found`});
        }
    })
}

public_users.get('/isbn/:isbn',function (req, res) {
    getIsbn(req.params.isbn)
    .then(
        (data) => res.send(data),
        (err) => res.status(err.status).json({message: err.message})
    );
 });
  
// Get book details based on author
function getBooks() {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
}
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
      getBooks()
      .then((bookEntries) => Object.values(bookEntries))
      .then((books) => books.filter((book) => book.author === author))
      .then((filteredBooks) => res.send(filteredBooks));
  });

// Get all books based on title

public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    getBooks()
    .then((bookEntries) => Object.values(bookEntries))
    .then((books) => books.filter((book) => book.title === title))
    .then((filteredBooks) => res.send(filteredBooks));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const filtered_books = books[isbn];
    res.send(filtered_books.reviews)
});

module.exports.general = public_users;
