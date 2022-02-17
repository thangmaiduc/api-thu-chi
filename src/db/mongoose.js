const mongoose = require("mongoose")




main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/test',()=>console.log("Successfully connect to Database "),(e)=>console.log(e.message) )
  
}





