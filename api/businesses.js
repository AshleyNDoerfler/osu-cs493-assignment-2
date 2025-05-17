const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

// const businesses = require('../data/businesses');
// const { reviews } = require('./reviews');
// const { photos } = require('./photos');
const { getCollection } = require('../lib/mongo');

exports.router = router;
// exports.businesses = businesses;

/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
  ownerid: { required: true },
  name: { required: true },
  address: { required: true },
  city: { required: true },
  state: { required: true },
  zip: { required: true },
  phone: { required: true },
  category: { required: true },
  subcategory: { required: true },
  website: { required: false },
  email: { required: false }
};

let iterId = 0;

/*
 * Route to return a list of businesses.
 */
router.get('/', async function (req, res, next) {

  /*
   * Compute page number based on optional query string parameter `page`.
   * Make sure page is within allowed bounds.
   */
  try{
    console.log("Getting business")
    const businesses = await getCollection('businesses').find().toArray();
    let page = parseInt(req.query.page) || 1;
    const numPerPage = 10;
    const lastPage = Math.ceil(businesses.length / numPerPage);
    page = page > lastPage ? lastPage : page;
    page = page < 1 ? 1 : page;

    /*
    * Calculate starting and ending indices of businesses on requested page and
    * slice out the corresponsing sub-array of busibesses.
    */
    const start = (page - 1) * numPerPage;
    const end = start + numPerPage;
    const pageBusinesses = businesses.slice(start, end);

    /*
    * Generate HATEOAS links for surrounding pages.
    */
    const links = {};
    if (page < lastPage) {
      links.nextPage = `/businesses?page=${page + 1}`;
      links.lastPage = `/businesses?page=${lastPage}`;
    }
    if (page > 1) {
      links.prevPage = `/businesses?page=${page - 1}`;
      links.firstPage = '/businesses?page=1';
    }

    /*
    * Construct and send response.
    */
    res.status(200).json({
      businesses: pageBusinesses,
      pageNumber: page,
      totalPages: lastPage,
      pageSize: numPerPage,
      totalCount: businesses.length,
      links: links
    });
  }catch(err){
    console.error("Error in GET /businesses:", err);  // <-- log real error
    res.status(500).json({ err: "Server error.  Please try again later." });
  }

});

/*
 * Route to create a new business.
 */
router.post('/', async function (req, res, next) {
  try {
    if (validateAgainstSchema(req.body, businessSchema)) {
      const business = extractValidFields(req.body, businessSchema);
      const collection = await getCollection('businesses');
      const result = await collection.insertOne(business);

      const id = (collection.toArray()).length + 1;

      res.status(201).json({
        id: result.id,
        links: {
          business: `/businesses/${result.insertedId}`
        }
      });
    } else {
      res.status(400).json({
        error: "Request body is not a valid business object"
      });
    }
  } catch (err) {
    next(err);
  }
});

/*
 * Route to fetch info about a specific business.
 */
router.get('/:businessid', async function (req, res, next) {
  try {
    const businessid = req.params.businessid;
    if (!businessid) {
      return res.status(400).json({ error: "Invalid business ID." });
    }

    const collection = await getCollection('businesses');
    const business = await collection.findOne({ id: businessid });

    if (business) {
      res.status(200).json(business);
    } else {
      res.status(404).json({ error: "Business not found." });
    }
  } catch (err) {
    next(err);
  }
});

/*
 * Route to replace data for a business.
 */
router.put('/:businessid', async function (req, res, next) {
  try {
    const businessid = req.params.businessid;
    if (!businessid) {
      return res.status(400).json({ error: "Invalid business ID." });
    }

    if (validateAgainstSchema(req.body, businessSchema)) {
      const business = extractValidFields(req.body, businessSchema);
      const collection = await getCollection('businesses');
      const result = await collection.replaceOne({ id: businessid }, business);

      if (result.matchedCount > 0) {
        res.status(200).json({
          links: { business: `/businesses/${businessid}` }
        });
      } else {
        res.status(404).json({ error: "Business not found." });
      }
    } else {
      res.status(400).json({ error: "Invalid business object." });
    }
  } catch (err) {
    next(err);
  }
});

/*
 * Route to delete a business.
 */
router.delete('/:businessid', async function (req, res, next) {
  try {
    const businessid = req.params.businessid;
    if (!businessid) {
      return res.status(400).json({ error: "Invalid business ID." });
    }

    const collection = await getCollection('businesses');
    const result = await collection.deleteOne({ id: businessid });

    if (result.deletedCount > 0) {
      res.status(204).end();
    } else {
      res.status(404).json({ error: "Business not found." });
    }
  } catch (err) {
    next(err);
  }
});
