const express=require("express");
const app=express();
var _ = require('lodash');
const bodyParser=require("body-parser");
const date= require(__dirname + "/date.js");
console.log(date());
// var item=""

const mongoose = require("mongoose");



app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-nikhil:Nikhil%402653@cluster0.oo0d3gd.mongodb.net/todolistDB");

const itemsSchema= new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "welcome to ur todolists"
});
const item2 = new Item({
  name: "hit the + button to add a todolist"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});


//rendering


// inserting to our DB
const defaultItem=[item1, item2, item3];


const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req,res){
Item.find({}, function(err, foundItems){
  console.log(foundItems);
  if(foundItems.length===0){


    Item.insertMany(defaultItem, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("inserted successfully");
      }
    });


  }
  else{
    const day= date()
      res.render("list",{Listtitle: "today", newListItems: foundItems});
  }


});


});
app.post("/", function(req,res){
  const itemName= req.body.newItem;
  const listName= req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName==="today"){
item.save();
res.redirect("/");
}
else{
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}
});


app.post("/delete", function(req,res){
  const checkedid=req.body.checkbox;
  const listName=req.body.listName;
if(listName==="today"){
  Item.findByIdAndRemove(checkedid, function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("deleted the checked item");
        res.redirect("/");
    }
  });

}
else{
  List.findOneAndUpdate({name: listName },{$pull: {items: {_id: checkedid}}},function(err, foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}



});


app.get("/:parametername", function(req,res){
const paramName=_.capitalize(req.params.parametername);
List.findOne({name: paramName}, function(err, foundList){
  if(!err){
    if(!foundList){
    // then create a new list
    const list = new List({
      name: paramName,
      items: defaultItem
    });
    list.save();
    res.redirect("/"+paramName);
    }
    else{
  // then display the existing list
  res.render("list", {Listtitle: foundList.name, newListItems: foundList.items})
    }
  }
});

});

app.get("/work", function(req,res){
  res.render("list",{Listtitle:"Work List",newListItems:workItems  });
});
app.post("/work",function(req,res){
  const item= req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.get("/about",function(req,res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}






app.listen(port, function(req,res){
  console.log("server is running on port 3000 or heroku");
});
