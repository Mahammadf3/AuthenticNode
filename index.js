const express=require("express");
const app=express();
const path=require("path");

const bcrypt=require("bcrypt");

const {open}=require("sqlite");
const sqlite3=require("sqlite3")
const jwt=require("jsonwebtoken")


app.use(express.json());
const database=path.join(__dirname,"cricket.db");
let db=null;
const connectData=async()=>{
    try{
        db=await open({
            filename:database,
            driver:sqlite3.Database,
        })
        app.listen(3009,()=>{
            console.log("server running successfully")
        })
    }
    catch(e){
        console.log(`check the error${error}`)
    }
}

connectData()

app.get("/", async(request,response)=>{
    const a=`
    SELECT * FROM CRICKET;`;
    const b= await db.all(a);
    response.send(b);
})


app.put("/cricket/:Id/",async(request,response)=>{
    const {Id}=request.params;
    const crickData=request.body;
    const{id,
        name,
        age,
        debut,
        centuris,
        halfcenturies,
        country}=crickData;

        const upData=`
        update
        cricket
        set
        id=${id},
        name='${name}',
        age= ${age},
        debut='${debut}',
        centuries= ${centuris},
        half_centuries= ${halfcenturies},
        country='${country}'
        where id=${Id};
        `;
        await db.run(upData);
        response.send("updated Successfully");

})

app.delete("/cricket/:Id",async(request,response)=>{
    const {Id}=request.params;
    const del=`
    Delete from cricket
    where id=${Id};
    `;
    await db.run(del);
    response.send("Deleted")

})

app.post("/register/", async(request,response)=>{
    const bigData=request.body;
    const{id,
    name,
    age,
    debut,
    centuris,
    halfcenturies,
    country,
    password}=bigData;
    const user= await bcrypt.hash(password,10);
  
    const preData=`select * from cricket where name='${name}';`;
    const firstResult=await db.get(preData);
 
    if(firstResult === undefined){
        const has=`insert into cricket
        (id,name,age,debut,centuries,half_centuries,country,password)
        values
        (${id},'${name}',${age},'${debut}',${centuris},${halfcenturies},'${country}','${user}');
        `;
        await db.run(has);
        response.send("register")
    }
    else{
        response.status(400);
        response.send("userAll Ready exit");
      
    }
})

app.post("/login", async (request, response) => {
    const bigData=request.body;
    const{
    name,
    password}=bigData;
    const preData = `SELECT * FROM cricket WHERE name = '${name}'`;
    const dbUser = await db.get(preData);
   
    if (dbUser === undefined) {
      response.status(400);
      response.send("Invalid User");
    } else {
      const isPasswordMatched = await bcrypt.compare(password, dbUser.PASSWORD);
      if (isPasswordMatched===true) {
        const payload={name:name,}

        const jwtToken=jwt.sign(payload,"first");
        response.send({jwtToken})
        
      } else {
        response.status(400);
        response.send("Invalid Password");
      }
    }
  });

  app.get("/cricket1/", async(request,response)=>{
    let jwtToken;
    const header=request.headers["authorization"];
    if(header !==undefined){
       jwtToken= header.split(" ")[1];
    }
    if(jwtToken===undefined){
        response.status(400);
        response.send("inValid");

    }else{
        jwt.verify(jwtToken,"first", async(error,payload)=>{
            if(error){
                response.send("inValid")
            }
            else{
                const a=`
                select * from cricket;`;
                const data=await db.all(a);
                response.send(data);
            }

        })
    }

  })