const express = require('express');
const body_parser = require('body-parser');
const date = require(__dirname + "/date.js");
const ejs = require('ejs');
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();
const work_items = [];

app.set('view engine', "ejs");

app.use(body_parser.urlencoded({extended:true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://todo-app:T3qWH8VCD0NYbz43@lilium-cluster.iuqxq.mongodb.net/todolistdb?retryWrites=true&w=majority")

const itemsSchema = new mongoose.Schema ({
   name: String
});

const listsSchema = new mongoose.Schema ({
  name: String,
  items: [itemsSchema]
});


const Item = mongoose.model("Item",itemsSchema)
const List = mongoose.model("List",listsSchema)

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

app.get("/:listType", function(req, res){
  const listName = _.capitalize(req.params.listType);
  List.findOne({name: listName},function(err,foundOne){
    if (!err) {
      if (!foundOne) {
        const newList = new List({
          name: req.params.listType,
          items: defaultItems
        })
        newList.save();
        res.redirect("/"+listName);
      }
      else {
        res.render("list",{list_title: listName ,list_items: foundOne.items, route_name:listName});
      }
    }
  })

})

app.post("/", function(req,res){

  console.log(req.body);
  const listName = req.body.list
  const newItemName = req.body.newitem

  const new_item = new Item ({
    name: newItemName
  });

  if (listName=="") {
    new_item.save()
    res.redirect("/");
  } else {
    console.log(listName)
    List.findOne({name: listName},function(err,foundList){
      if (!err) {
        if (foundList) {
          foundList.items.push(new_item);
          foundList.save()
          res.redirect("/"+foundList.name);
        }
      }
    });
  }

});

app.post("/delete", function(req,res){
  console.log(req.body);
  const itemId = req.body.checkbox
  const listName = req.body.listName
  if (listName=="") {
    Item.deleteOne({_id: itemId}, function(err) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("Properly deleted item");
      }
      res.redirect("/");
    })
  }
  else {
    List.findOneAndUpdate({name: listName},{$pull:{items: {_id: itemId}}},function(err,foundList){
      if (!err) {
        console.log("Properly deleted item");
        res.redirect("/"+foundList.name);
      }
    });
  }
});







app.listen(3001, function(){
  console.log("Server up and listening on port 3000");
})
