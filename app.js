const express = require('express');
const body_parser = require('body-parser');
const date = require(__dirname + "/date.js");
const ejs = require('ejs');
const mongoose = require("mongoose")

const app = express();
const work_items = [];

app.set('view engine', "ejs");

app.use(body_parser.urlencoded({extended:true}));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/todolistDB")

const itemsSchema = new mongoose.Schema ({
   name: String
});

// const itemsSchema = {
//   name: String
// };

const Item = mongoose.model("Item",itemsSchema)

const item1 = new Item ({
  name: "Kill bill"
});


const item2 = new Item ({
  name: "Kill bill2"
});


const defaultItems = [item1,item2];

Item.find({},function(err,results){
  if (err) {
    console.log(err);
  }
  else {
    if (results.length == 0) {
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log("problem inserting defualt items");
        }
        else {
          console.log("defualt items added to DB");
        }
      })
    }
  }
})


app.get("/",function(req,res) {
  Item.find({},function(err,results){
    if (err){
      console.log(err);
    }
    else {
      let day= date.getDate()
      res.render("list",{list_title: day,list_items: results, route_name:""});
    }
  });
});

app.post("/", function(req,res){
  if (req.body.list === "work") {
    work_items.push(req.body.newitem);
  }
  else {
    items.push(req.body.newitem);
  }
  res.redirect("/"+req.body.list);
});

// app.post("/work", function(req,res){
//
//   work_items.push(req.body.newitem);
//   res.redirect("/work");
// })



app.get("/about",function(req,res) {
  res.render("about");
})

app.get("/work",function(req,res) {
  let day= date.getDate()
  res.render("list",{list_title: "Work list:"+day,list_items: work_items,route_name:"work"});
})

app.listen(3001, function(){
  console.log("Server up and listening on port 3000");
})
