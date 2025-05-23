const express = require('express');
const morgan = require('morgan');
const { connect_to_DB } = require('./lib/mongo');

const api = require('./api');

const app = express();
const port = process.env.PORT || 8000;

/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(express.json());
app.use(express.static('public'));

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api);

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

/*
 * This route will catch any errors thrown from our API endpoints and return
 * a response with a 500 status to the client.
 */
app.use('*', function (err, req, res, next) {
  console.error("== Error:", err)
  res.status(500).send({
      err: "Server error.  Please try again later."
  })
})

// app.listen(port, function() {
//   console.log("== Server is running on port", port);
// });

connect_to_DB().then(() => {
  app.listen(port, function () {
    console.log("== Server is running on port", port);
  });
}).catch(err => {
  console.error("Failed to connect to DB:", err);
  process.exit(1); 
});
