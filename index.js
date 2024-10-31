const connectDB = require('./mongoose');
const express=require('express');
const app=express();
const mongoose=require('mongoose');
const session=require('express-session');
const mongodbstore=require("connect-mongodb-session")(session)
app.use(express.urlencoded({ extended: true }));

connectDB();




app.use(express.json());
app.use(express.static('public'));
app.set('view engine','ejs');
app.set('views', './view');


const store=new mongodbstore({
    uri:"mongodb://localhost:27017/TODO_list",
    collection:"userSession"
})


app.use(session({
    secret: 'this is secret',
    resave: false,
    saveUninitialized: true,
    store:store
    
}));



const Schema1 = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const Schema2=new mongoose.Schema({
    userId:String,
    task:String,
    completed:Boolean
})


const User=mongoose.model('User',Schema1);
const Task=mongoose.model('Task',Schema2);


// routes
app.get('/',(req,res)=>{

    res.render('profile');

   
})

app.get('/register',(req,res)=>{

    res.render('register');
})


// authentication

app.post('/login',async (req,res)=>{

    const {email,password}=req.body;

   

    try{

        const result=await  User.findOne({email:email});

           
            if(!result){
                return res.render('profile',{error:"Email does not exist"});
            }
       

        if(password===result.password)
        {    req.session.userId = result._id; 

            return res.redirect('/welcome');
        }
        else{

            return res.render('profile',{error:"please enter the correct password"});
        }
    }
    catch (err) {
        console.error(err);
         res.render('profile', { error: "Something went wrong. Try again." });
    }

  
})


app.get('/welcome', async (req, res) => {
    try {
        
        const tasks = await Task.find({ userId: req.session.userId });
        console.log(tasks);

        if (!tasks) {
            return res.render('welcome', { tasks: [] });  
        }   

            res.render('welcome', { tasks: tasks });
    } catch (err) {
        console.error(err);
        res.render('welcome', { tasks: [], error: "Something went wrong" });
    }
});


app.post('/register',async (req,res)=>{

    const {name,email,password}=req.body;

    try{
        const check= await User.findOne({email:email});

    
        if(check!==null){
           return  res.render('register',{error:"Email is already exists"});
        }
    
        const newuser=new User({name,email,password});

         const result = await newuser.save();
        
         res.redirect('/');
    
    }catch(error){
        console.error(error);
        res.render('register',{error:"registeration is failed try again!"});
    }
   

})


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});



//  tasks operation 


app.get('/addtask',async (req,res)=>{
    const tasks=await Task.find({userId:req.session.userId});

    res.redirect('/welcome');
})

app.post('/addtask',async (req,res)=>{

    const task=new Task({userId:req.session.userId, task:req.body.task, completed:false});

    await task.save();

    res.redirect('/welcome');
})

app.post('/removetask',async(req,res)=>{

    await Task.findByIdAndDelete(req.body.taskId);
    
    res.redirect('/welcome');
})




app.listen(8000,()=>{
    console.log("port is running");
})