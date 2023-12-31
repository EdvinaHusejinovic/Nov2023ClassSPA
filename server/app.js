import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import pizzas from "./routers/pizzas.js";

// Load environment variables from .env files
dotenv.config();

const app = express();

// MongoDB
mongoose.connect(process.env.MONGODB, {
  // Configuration options to remove deprecation warnings, just include them to remove clutter
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// map the constant db to mongoose.connection
const db = mongoose.connection;

// tell us that the connection to the database was successful
db.on("error", console.error.bind(console, "Connection Error:"));
db.once(
  "open",
  console.log.bind(console, "Successfully opened connection to Mongo!")
);

// get the PORT from the environment variables, OR use 4040 as default
const PORT = process.env.PORT || 4040;

// CORS Middleware
const cors = (req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type, Accept,Authorization,Origin"
  );
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
};

// Logging Middleware
const logging = (request, response, next) => {
  console.log(
    `${request.method} ${request.url} ${new Date().toLocaleString("en-us")}`
  );
  next();
};

app.use(cors);
app.use(express.json());
app.use(logging);

// NOTE: Middleware goes before the creation of routes :)

// Request handlers go here
app.get("/status", (request, response) => {
  response.status(200).json({ message: "Service healthy" });
});

// THIS IS AN EXAMPLE TO SHOWING OFF REQUEST PARAMETERS
// Handle the request with HTTP GET method with query parameters and a url parameter
app.get("/weather/:city", (request, response) => {
  // Express adds a "params" Object to requests that has an matches parameter created using the colon syntax
  const city = request.params.city;

  // Set defaults values for the query string parameters
  let cloudy = "clear";
  let rainy = false;
  let lowTemp = 32;
  // check if the request.query.cloudy attribute exists
  if ("cloudy" in request.query) {
    // If so update the variable with the query string value
    cloudy = request.query.cloudy;
  }
  if ("rainy" in request.query && request.query.rainy === "true") {
    rainy = request.query.rainy;
  }
  if ("lowtemp" in request.query) {
    lowTemp = Number(request.query.lowtemp);
  }

  // Generate a random number to use as the temperature
  // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
  const min = 70;
  const max = 90;
  const temp = Math.floor(Math.random() * (max - min + 1) + min);
  // handle GET request for weather with an route parameter of "city"
  response.json({
    text: `The weather in ${city} is ${temp} degrees today.`,
    cloudy: cloudy,
    // When the key and value variable are named the same you can omit the value variable
    rainy,
    temp: {
      current: temp,
      low: lowTemp
    },
    city
  });
});

app.use("/pizzas", pizzas);

app.listen(PORT, () => console.log("Listening on port 4040"));

//BASIC HTTP SERVER BELOW
// // 'Import' the http module
// import http from 'http';
// // Initialize the http server
// const server = http.createServer((request, response) => {
//     // Handle the request from http://localhost:4040/status with HTTP GET method
//     if (request.url === "/status" && request.method === "GET") {
//       // Create the headers for response
//       response.writeHead(200, { "Content-Type": "application/json" });
//       // Create the response body
//       response.write(JSON.stringify({ message: "Service healthy" }));
//       // End and return the response
//       response.end();
//     }
//   })
//   // Tell the HTTP server to start listening
//   .listen(4040);

// // Let the humans know I am running and listening on 4040
// console.log("Listening on port 4040");
