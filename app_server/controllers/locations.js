const request = require('request');
let nodeGeocoder = require('node-geocoder');
const apiOptions = {
  server: 'http://localhost:3000'
};
if (process.env.NODE_ENV === 'production') {
    apiOptions.server = 'https://aqueous-oasis-18092.herokuapp.com';
}

const formatDistance = (distance) => {
  let thisDistance = 0;
  let unit = 'm';
  if (distance > 1000) {
    thisDistance = parseFloat(distance / 1000).toFixed(1);
    unit = 'miles';
  } else {
    thisDistance = Math.floor(distance);
  }
  return thisDistance + unit;
};

const showError = (req, res, status) => {
  let title = '';
  let content = '';

  if (status === 404) {
    title = '404, page not found';
    content = 'Oh dear, Looks like we can\'t find this page. Sorry';
  } else {
    title = `${status}, something's gone wrong`;
    content = 'Something, somewhere, has gone just a little bit wrong.';
  }
  res.status(status);
  res.render('generic-text', {
    title,
    content
  });
};


const renderHomepage = (req, res, responseBody) => {
    console.log('entered');
    console.log('responseBody', responseBody);
    let message = null;
    if ((responseBody instanceof Array)) {
        message = 'API lookup error';
        responseBody = [];
    } else {
        if (!responseBody.length) {
            message = 'No places found nearby';
        }
    }
    var loc = JSON.parse(responseBody);
    if (loc.length) {
        let data = loc.map((item) => {
            item.distance = formatDistance(item.distance);
            return item;
        });
    }



    res.render('locations-list',
        {
            title: 'Meal Loc8r - Free meal finder',
            pageHeader: {
                title: 'Meal Loc8r',
                strapLine: 'Find places giving out free meals near you!'
            },
            sidebar: "Meal Loc8r helps you find free meals during the coronavirus pandemic. Many thanks to these great organizations doing their part during these tough times.",
            locations: loc,
            message
        }
    );

  
};

const homelist = (req, res) => {
    const path = '/api/locations';
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'GET',
        json: {},
        qs: {
            lng: -0.7992599,
            lat: 51.378091,
            maxDistance: 20
        }
    };
    request(
        requestOptions,
        (err, { statusCode }, body) => {
            let data = [];
            
            body.forEach(bo => {
                console.log('body:', bo.name);
            });
            if (statusCode === 200 && body.length) {
                data = body.map((item) => {
                    item.distance = formatDistance(item.distance);
                    return item;
                });
            }
            renderHomepage(req, res, data);
        }
    );
};

const renderDetailPage = (req, res, location) => {
    res.render('location-info',
        {
            title: location.name,
            pageHeader: {
                title: location.name,
            },
            sidebar: {
                context: 'is on Meal Loc8r because they are one of the many organizations providing free meals during this coronovirus pandemic.',
                callToAction: 'If you would like to pitch in and get your organization listed - please reach out to Shawn@yoodle.com.'
            },

            location
        }
    );
};

const renderLocations = (req, res) => {
    res.render('location-search',
        {
            title: 'Search Locations',
            pageHeader: {
                title: 'Search Locations',
                strapLine: 'Find places giving out free meals near you!'
            },
            sidebar: "Meal Loc8r helps you find free meals during the coronavirus pandemic. Many thanks to these great organizations doing their part during these tough times.",
            error: req.query.err
        }
    );
};

const getLocationInfo = (req, res, callback) => {
  const path = `/api/locations/${req.params.locationid}`;
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: 'GET',
    json: {}
  };
  request(
    requestOptions,
    (err, {statusCode}, body) => {
      const data = body;
      if (statusCode === 200) {
        data.coords = {
          lng: body.coords[0],
          lat: body.coords[1]
        }
        callback(req, res, data);
      } else {
        showError(req, res, statusCode);
      }
    }
  );
};

const getLocations = (req, res) => {

    const path = `/api/locationsearch?zipcode=${req.query.zipcode}`;
    let url = `${apiOptions.server}${path}`;

    console.log(url);
    request(url, function (err, resp, body) {
        console.log(body);
        if (resp.statusCode === 200) {
            //res.redirect('/locationsRender');
            renderHomepage(req, res, body);
        } else {
            showError(req, res, resp.statusCode);
        }
    });
};

const locationInfo = (req, res) => {
  getLocationInfo(req, res,
    (req, res, responseData) => renderDetailPage(req, res, responseData)
  );
};

const renderReviewForm = (req, res) => {
  res.render('location-review-form',
    {
      title: 'Adding Locations',
      pageHeader: { title: 'Add Locations' },
      error: req.query.err
    }
  );
};

const addReview = (req, res) => {
  getLocationInfo(req, res,
    (req, res, responseData) => renderReviewForm(req, res, responseData)
  );
};

function getCoordinatesFromZipcode(zipcode, callback) {
    let options = {
        provider: 'openstreetmap'
    };


    let geoCoder = nodeGeocoder(options);
    geoCoder.geocode(zipcode)
        .then((res) => {
            res.forEach(location => {
                if (location.countryCode === 'US') {
                    callback(location);
                    throw Exception();
                }
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

const doAddLocation = (req, res) => {
    zipcode = req.body.zip;
    console.log('zip', zipcode);
    getCoordinatesFromZipcode(zipcode, function (coordinates) {
        req.body.lat = coordinates.latitude;
        req.body.lng = coordinates.longitude;
        console.log('doAddLocation');
        console.log('lat:', req.body.lat);
        doAddLoc(req, res);
    });
    
    
};

const doAddLoc = (req, res) => {
    console.log('lat', req.body.lat);
    const path = '/api/locations';
    const postdata = {
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        description: req.body.description,
        lng: req.body.lng,
        lat: req.body.lat,
        facebookUrl: req.body.facebookUrl,
        twitterUrl: req.body.twitterUrl,
        phoneNumber: req.body.phoneNumber
    };
    const requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'POST',
        json: postdata
    };
    console.log(postdata);   
    if (!postdata.name || !postdata.address || !postdata.zip || !postdata.facebookUrl || !postdata.phoneNumber) {
        res.redirect('/admin');
      
    } else {
        request(
            requestOptions,
            (err, { statusCode }) => {
                if (statusCode === 201) {
                    console.log('201');
                    res.redirect('/admin');
                } else if (statusCode === 400) {
                    console.log('400');
                    res.redirect('/admin');
                } else {
                    showError(req, res, statusCode);
                }
            }
        );
    }
};
const doAddReview = (req, res) => {
  const locationid = req.params.locationid;
  const path = `/api/locations/${locationid}/reviews`;
  const postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: 'POST',
    json: postdata
  };
  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    res.redirect(`/location/${locationid}/review/new?err=val`);
  } else {
    request(
      requestOptions,
      (err, {statusCode}, {name}) => {
        if (statusCode === 201) {
          res.redirect(`/location/${locationid}`);
        } else if (statusCode === 400 && name && name === 'ValidationError') {
          res.redirect(`/location/${locationid}/review/new?err=val`);
        } else {
          showError(req, res, statusCode);
        }
      }
    );
  }
};

module.exports = {
    renderLocations,
    homelist,
    locationInfo,
    addReview,
    doAddReview,
    doAddLocation,
    renderReviewForm,
    getLocations,
    renderHomepage
};
