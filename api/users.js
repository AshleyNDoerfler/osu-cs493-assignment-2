const router = require('express').Router();

exports.router = router;

// const { businesses } = require('./businesses');
// const { reviews } = require('./reviews');
// const { photos } = require('./photos');
const { getCollection } = require('../lib/mongo');

function parseObjectId(id) {
  try {
    return new ObjectId(id);
  } catch (e) {
    return null;
  }
}

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userid/businesses', async function (req, res) {
  try{
    const userid = parseObjectId(req.params.userid);
    const userBusinesses = await getCollection('businesses').find({ownerid: userid}).toArray(); 
    res.status(200).json({
      businesses: userBusinesses
    });
  } catch (err) {
    next(err);
  }
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userid/reviews', async function (req, res) {
  try{
    const userid = parseObjectId(req.params.userid);
    const userReviews = await getCollection('reviews').find({userid:userid}).toArray();
    res.status(200).json({
      reviews: userReviews
    });
  } catch (err) {
    next(err);
  }
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:userid/photos', async function (req, res) {
  try{
    const userid = parseObjectId(req.params.userid);
    const userPhotos = await getCollection('photos').find({userid: userid}).toArray();
    res.status(200).json({
      photos: userPhotos
    });
  } catch (err) {
    next(err);
  }
});
