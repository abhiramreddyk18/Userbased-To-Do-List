const mongoose=require('mongoose');

const url='mongodb://localhost:27017/TODO_list';


const connectDB=async()=>{

    mongoose.connect('mongodb://localhost:27017/TODO_list')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


};

module.exports=connectDB;