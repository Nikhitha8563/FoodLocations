const express = require('express');
const router = express.Router();
const ctrlLocations = require('../controllers/locations');
const ctrlOthers = require('../controllers/others');

router.get('/', ctrlLocations.homelist);
router.get('/admin', ctrlLocations.renderReviewForm)
    .post('/admin', ctrlLocations.doAddLocation);
router.get('/location/:locationid', ctrlLocations.locationInfo);
router
  .route('/location/:locationid/review/new')
  .get(ctrlLocations.addReview)
    .post(ctrlLocations.doAddReview);

router.get('/locationsearch', ctrlLocations.getLocations);
router.get('/locations', ctrlLocations.renderLocations);
router.get('/locationsRender', ctrlLocations.renderHomepage);

router.get('/about', ctrlOthers.about);

module.exports = router;
