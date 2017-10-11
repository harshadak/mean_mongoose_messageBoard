// Require the Express Module
var express = require('express');
// Create an Express App
var app = express();

var mongoose = require('mongoose');

// This is how we connect to the mongodb database using mongoose -- "basic_mongoose" is the name of
//   our db in mongodb -- this should match the name of the db you are going to use for your project.
mongoose.connect('mongodb://localhost/message_comment');

// define Schema variable
var Schema = mongoose.Schema;

// define Message Schema
var MessageSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 4},
    text: {type: String, required: true, maxlength: 100}, 
    _comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true });

// define Comment Schema
var CommentSchema = new mongoose.Schema({
    _message: {type: Schema.Types.ObjectId, ref: 'Message'},
    name: {type: String, required: true, minlength: 4},
    text: {type: String, required: true, maxlength: 100}
}, {timestamps: true });

// set our models by passing them their respective Schemas
// Creating collections. Mongoose renames the collection names to lower case plurals like "messages"
// Collections are created only after your first save.
mongoose.model('Message', MessageSchema);
mongoose.model('Comment', CommentSchema);

// store our models in variables
var Message = mongoose.model('Message');
var Comment = mongoose.model('Comment');

mongoose.Promise = global.Promise;

// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
var path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');

// Routes

// Root Request
// Route to display all the messages
app.get('/', function(req, res) {
    // This is where we will retrieve the users from the database and include them in the view page we will be rendering.
    Message.find({}, false, true)
    .populate('_comments')
    .exec(function(err, messages) {
        res.render('index', {messageBank: messages});
    })

    // Message.find({}, function(err, messages) {
    //     if(err) {
    //         console.log("Something went wrong", err);
    //     } else {
    //         console.log("All the messages: ", messages);
    //         res.render('index', {messageBank: messages});
    //     }  
    // })
});

// Route to save messages
app.post('/messages', function(req, res) {
    console.log("POST DATA", req.body);
    Message.create(req.body, function(err, message) {
        if(err) {
            console.log("Something went wrong", err.errors);
            res.render('index', {errors: err.errors});
        } else {
            console.log("Successfully posted a message");
            res.redirect('/');
        }
    })
});

// Route to create comments for each message
app.post('/comments/:id', function(req, res) {
    Message.findOne({_id: req.params.id}, function(err, message){
        // data from form on the front end
        var comment = new Comment(req.body);
        //  set the reference like this:
        comment._message = message._id;
        // now save both to the DB
        console.log("@@@@@@@@@@@@@@@@@@@", comment);
        comment.save(function(err){
            message._comments.push(comment);
            message.save(function(err){
                if(err) {
                    console.log("Something went wrong", err.errors);
                    res.render('index', {errors: err.errors});
                } else {
                    res.redirect('/');
                }
            });
        });
    });
})

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
});
