const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

// const reviews = require('../data/reviews');
const { getCollection, ObjectId } = require('../lib/mongo');

exports.router = router;
// exports.reviews = reviews;

/*
 * Schema describing required/optional fields of a review object.
 */
const reviewSchema = {
  userid: { required: true },
  businessid: { required: true },
  dollars: { required: true },
  stars: { required: true },
  review: { required: false }
};


/*
 * Route to create a new review.
 */
router.post('/', async function (req, res, next) {
  try{
    if (validateAgainstSchema(req.body, reviewSchema)) {

      const review = extractValidFields(req.body, reviewSchema);
      const reviews = await getCollection('reviews').toArray();

      const duplicate = await getCollection.findOne({
        userid: review.userid,
        businessid: review.businessid
      });

      if (duplicate) {
        res.status(403).json({
          error: "User has already posted a review of this business"
        });
      } else {
        review.id = reviews.length;
        const updated_reviews = await getCollection.insertOne(review);
        res.status(201).json({
          id: updated_reviews.id,
          links: {
            review: `/reviews/${review.id}`,
            business: `/businesses/${review.businessid}`
          }
        });
      }

    } else {
      res.status(400).json({
        error: "Request body is not a valid review object"
      });
    }
  } catch (err) {
    next(err)
  }
});

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewID', async function (req, res, next) {
  try{
    const reviewID = req.params.reviewID;

    if(!reviewID){
      return res.status(400).json({ error: "Invalid review ID." });
    }

    const collection = await getCollection('reviews');
    const review = await collection.findOne({id: reviewID}).toArray();

    if (review) {
      res.status(200).json(review);
    } else {
      next();
    }
  } catch (err){
    next(err);
  }

});

/*
 * Route to update a review.
 */
router.put('/:reviewID', async function (req, res, next) {
  try{
    const reviewID = req.params.reviewID;
    const collection = await getCollection('reviews');
    const existingReview = await collection.findOne({id: reviewID}).toArray();
    if (existingReview) {

      if (validateAgainstSchema(req.body, reviewSchema)) {
        /*
        * Make sure the updated review has the same businessid and userid as
        * the existing review.
        */
        let updatedReview = extractValidFields(req.body, reviewSchema);
        const newReview = await collection.replaceOne({id: reviewID}, updatedReview);
        if (updatedReview.businessid === existingReview.businessid && updatedReview.userid === existingReview.userid) {
          
          res.status(200).json({
            links: {
              review: `/reviews/${reviewID}`,
              business: `/businesses/${updatedReview.businessid}`
            }
          });
        } else {
          res.status(403).json({
            error: "Updated review cannot modify businessid or userid"
          });
        }
      } else {
        res.status(400).json({
          error: "Request body is not a valid review object"
        });
      }

    } else {
      next();
    }
} catch (err) {
  next(err);
}
});

/*
 * Route to delete a review.
 */
router.delete('/:reviewID', async function (req, res, next) {
  try{
    const reviewID = req.params.reviewID;
    const review = await getCollection('reviews').findOne({id: reviewID});
    if (review) {
      const updated_reviews = await getCollection('reviews').deleteOne({id: reviewID});
      res.status(204).end();
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});
