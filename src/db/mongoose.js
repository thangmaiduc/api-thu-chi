const mongoose = require("mongoose");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(
    ''+process.env.MONGODB_URL,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true
    },
    (res) => {
      if(res)
      console.log("Error: "+ res);
      else console.log("Connected to DB");
    }
  );
}
