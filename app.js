const express = require("express");
const bodyParser = require("body-parser");
const PromiseFtp = require("promise-ftp");
const morgan = require("morgan");
const app = express();
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
const ftp = new PromiseFtp();

app.use(async (req,res,next) => {
	// Website you wish to allow to connect
	res.setHeader("Access-Control-Allow-Origin", "*");
    
	// Request methods you wish to allow
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
	// Request headers you wish to allow
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    
	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader("Access-Control-Allow-Credentials", true);
	next();
});

app.use("/", async (req,res,next) => {
	let error = {};
	let messageServer = "";
	console.log(req.body);
	const status = ftp.getConnectionStatus();
	if(status != "connected" && (!req.body.host || !req.body.user || !req.body.password)){
		error.status = 400;
		error.message = "Bad Request";
		next(error);
	}else if(status != "connected" && req.method !== "POST"){
		error.status = 404;
		error.message = "Not Found";
		next(error);
	}else{
		if(ftp.getConnectionStatus() !== "connected"){
			try{
				messageServer = await ftp.connect(req.body);
			}catch(err){
				error = err;
				next(error);
			}
			req.messageServer = {
				message:messageServer,
				rootDir:await ftp.list("/")
			};
			res.status = "connected";
			next();
		}
	}
});

app.use(["/",/[/]+[:\w\W]*/],async (req,res,next) => {
	
	try{
		const getDirectory = await ftp.list(req.url);
		req.directory = getDirectory;
	}catch(err){
		next(err);
	}
	next();
});

app.post("/",(req,res) => {
	res.send(req.messageServer);
});

app.get("/", async (req,res) => {
	res.send(JSON.stringify(req.directory));
});

app.get(/[/home]+[:\w\W]*/,(req,res) => {
	res.send(`${JSON.stringify(req.directory)} matched`);
});

app.use("/",(err,req,res,next) => {
	res.send({message:err.message,status:err.code});
	next();
});


app.listen(3000, () => {
	console.log("server is started");
});