const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

// const photos = require('../data/photos');
const { getCollection, ObjectId } = require('../lib/mongo');

exports.router = router;
exports.photos = photos;

/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  userid: { required: true },
  businessid: { required: true },
  caption: { required: false }
};


/*
 * Route to create a new photo.
 */
router.post('/', async function (req, res, next) {
  if (validateAgainstSchema(req.body, photoSchema)) {
    const photos = await getCollection('photos').find().toArray();
    const photo = extractValidFields(req.body, photoSchema);
    photo.id = photos.length;
    const updated_photos = await getCollection('photos').insertOne(photo);
    res.status(201).json({
      id: photo.id, // go back and get it from db instead for all of these?
      links: {
        photo: `/photos/${photo.id}`,
        business: `/businesses/${photo.businessid}`
      }
    });
  } else {
    res.status(400).json({
      error: "Request body is not a valid photo object"
    });
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoID', async function (req, res, next) {
  const photoID = new ObjectId(req.params.photoID);
  const photo = await getCollection('photos').findOne({_id: photoID});

  if (photo) {
    res.status(200).json(photo);
  } else {
    next();
  }
});

/*
 * Route to update a photo.
 */
router.put('/:photoID', async function (req, res, next) {
  const photoID = new ObjectId(req.params.photoID);

  if (validateAgainstSchema(req.body, photoSchema)) {
      /*
       * Make sure the updated photo has the same businessid and userid as
       * the existing photo.
       */
    const updatedPhoto = extractValidFields(req.body, photoSchema);
    const existingPhoto = await getCollection('photos').findOne({_id: photoID}).toArray();
      if (existingPhoto && updatedPhoto.businessid === existingPhoto.businessid && updatedPhoto.userid === existingPhoto.userid) {
        // photos[photoID] = updatedPhoto;
        // photos[photoID].id = photoID;
        updated_photos = await getCollection('photos').replesOne({_id: photoID}, updatedPhoto);
        res.status(200).json({
          links: {
            photo: `/photos/${photoID}`, // TODO?
            business: `/businesses/${updatedPhoto.businessid}`
          }
        });
      } else {
        res.status(403).json({
          error: "Updated photo cannot modify businessid or userid"
        });
      }
    } else {
      res.status(400).json({
        error: "Request body is not a valid photo object"
      });
    }

  // } else {
  //   next();
  // }
});

/*
 * Route to delete a photo.
 */
router.delete('/:photoID', function (req, res, next) {
  const photoID = parseInt(req.params.photoID);
  if (photos[photoID]) {
    photos[photoID] = null;
    res.status(204).end();
  } else {
    next();
  }
});
