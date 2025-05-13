const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

// const photos = require('../data/photos');
const { getCollection, ObjectId } = require('../lib/mongo');

exports.router = router;
// exports.photos = photos;

/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  userid: { required: true },
  businessid: { required: true },
  caption: { required: false }
};

function parseObjectId(id) {
  try {
    return new ObjectId(id);
  } catch (e) {
    return null;
  }
}


/*
 * Route to create a new photo.
 */
router.post('/', async function (req, res, next) {
  try{
    if (validateAgainstSchema(req.body, photoSchema)) {
      const photo = extractValidFields(req.body, photoSchema);
      const collection = await getCollection('photos');
  
      const updated_photos = await collection.insertOne(photo);

      res.status(201).json({
        id: updated_photos.insertedId, // go back and get it from db instead for all of these?
        links: {
          photo: `/photos/${updated_photos.insertedId}`,
          business: `/businesses/${photo.businessid}`
        }
      });
    } else {
      res.status(400).json({
        error: "Request body is not a valid photo object"
      });
    }
  } catch (err) {
    next(err);
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoID', async function (req, res, next) {
  try{
    const photoID = parseObjectId(req.params.photoID);
    if (!photoID){
      return res.status(400).json({ error: "Invalid photo ID."});
    }

    const collection = await getCollection('photos');
    const photo = await collection.findOne({_id: photoID});

    if (photo) {
      res.status(200).json(photo);
    } else {
      res.status(404).json({ error: "Photo not found."});
    }
  } catch (err) {
    next(err);
  }
});

/*
 * Route to update a photo.
 */
router.put('/:photoID', async function (req, res, next) {
  try{
    const photoID = parseObjectId(req.params.photoID);

    if (validateAgainstSchema(req.body, photoSchema)) {
        /*
        * Make sure the updated photo has the same businessid and userid as
        * the existing photo.
        */
      const updatedPhoto = extractValidFields(req.body, photoSchema);
      const collection = await getCollection('photos');
      const existingPhoto = await collection.findOne({_id: photoID}).toArray();
        if (existingPhoto && updatedPhoto.businessid === existingPhoto.businessid && updatedPhoto.userid === existingPhoto.userid) {
          // photos[photoID] = updatedPhoto;
          // photos[photoID].id = photoID;
          const updated_photos = await collection.replaceOne({_id: photoID}, updatedPhoto);
          res.status(200).json({
            links: {
              photo: `/photos/${updated_photos.insertedId}`,
              business: `/businesses/${photo.businessid}`
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
  } catch (err) {
    next(err);
  }
});

/*
 * Route to delete a photo.
 */
router.delete('/:photoID', async function (req, res, next) {
  try{
    const photoID = parseObjectId(req.params.photoID);
    if (!photoID) {
      return res.status(400).json({ error: "Invalid photo ID." });
    }
    const updated_photos = await getCollection('photos').deleteOne({_id: photoID})

    if (updated_photos.deleteCount > 0) {
      res.status(204).end();
    } else {
      res.status(404).json({ error: "Photo not found." });
    }
  } catch (err) {
    next(err)
  }
});
