const express = require('express');
const bodyParser = require('body-parser');
const PromiseFtp = require('promise-ftp');

const app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
const ftp = new PromiseFtp();
async function ftpConnect(options={}){
    return await ftp.connect(options)
}

app.use('/',async (req,res,next) => {
    if(ftp.getConnectionStatus() !== "connected"){
        try{
            connect = await ftpConnect(req.body)
        }catch(err){
            next(err)
        }
        res.send("connected")
    }
    next()
})

app.use(['/',/[/]+[:\w\W]*/],async (req,res,next) => {
    try{
        getDirectory = await ftp.list(req.url);
        req.directory = getDirectory
    }catch(err){
        next(err)
    }
    next()
})

app.get('/', async (req,res,next) => {
    res.send(JSON.stringify(req.directory))
})

app.get(/[/]+[:\w\W]*/,(req,res,next) => {
    res.send(`${JSON.stringify(req.directory)} matched`)
})

app.use('/',(err,req,res,next) => {
    res.send({message:err.message,status:err.code})
})


app.listen(3000, () => {
    console.log("server is started")
})