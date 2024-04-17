const express = require("express");
const app = express();
const fs=require('fs');
const users = require("./MOCK_DATA.json");
const { error } = require("console");
const port = 8008;

//Middleware Built-in for POSTMAN:
app.use(express.urlencoded({extended:false}));

//Custom MiddleWares:
app.use((req,res,next)=>{
  fs.appendFile("logs.txt",`${Date.now()} : ${req.ip} : ${req.method} : ${req.url}\n`,(data,err)=>{
    next();
  })
 
})

//Response as HTML:
app.get("/users", (req, res) => {
  const html = `
    <ul>
    ${users
      .map((user) => `<li>${user.first_name}</li>`)
      .join(
        ""
      )} // user is denoting an object in users file and mapping user.first_name for each object.
    </ul>
    `;
  res.send(html);
});

//REST API:

//*** route: /api/users/:id ***
app
  .route("/api/users/:id")


  .get((req, res) => {
    const id = Number(req.params.id);
    //FInding a user whose Id matches with the current id entered in the path from teh users file.
    const index = users.findIndex((user) => user.id === id);
    if(index===-1){
      res.status(404).json({error:"User not found."});// Hnadling error for user not found!
    }
    return res.json(users[index]);// Retrieving user's info based on its index.
  })


  .patch((req, res) => {
    //Task: Update/ Modify User's data at given ID.
    const id= Number(req.params.id);
    const index= users.findIndex((user=>user.id===id));
    if(index===-1){
      return res.status(404).json({error:"User Not Found!"});
    }
    const updateData=req.body;
    Object.assign(users[index],updateData);//Updating user's information by merging old data with new Data.
    // res.json(users[index]);
    return res.json({status:"User Updated Successfully!"});
  })


  .delete((req, res) => {
    //Task: Delete User at given ID.
    const id= Number(req.params.id);
    const index= users.findIndex((user)=>user.id===id); 
    if(index===-1){
     return res.status(404).json({error:"User  not found."});
    }
    users.splice(index,1);
    return res.json({status:"User Deleted",id});
  });

// *** route: /api/users ***

// Using Middle Ware to check the missing field.
app.use((req,res,next)=>{
  const body=req.body;
  if(!body.first_name || !body.last_name || !body.email || !body.country){
    return res.status(400).json({message:"Fill all the missing fields."});
  }
  else{
    next();
  }
})

//Middle Ware to check if the user already exists or not.
app.use((req,res,next)=>{
  const body=req.body;
  const existingUser= users.find((user)=>user.first_name===body.first_name && user.last_name===body.last_name && user.email===body.email);
  if(existingUser){
    return res.status(400).json({message:"User already exists at ID:",id:existingUser.id});
  }else{
    next();
  }
})

app
  .route("/api/users")


  .get((req, res) => {
    res.setHeader("X-devName","Sameer Malek");//Will be visible in response headers as a Custom Header.
    res.json(users);
  })


  .post((req,res) => {
    //Task: Create a user
    const body=req.body;
    users.push({...body, id:users.length+1});
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users),(data,err)=>{
       return res.status(201).json({status:"Success", id:users.length});
    });
    
  });

//Listening to the port:
app.listen(port, () => {
  console.log(`Your Server have started at port: ${port}`);
});
