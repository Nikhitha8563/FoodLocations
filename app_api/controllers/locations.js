const mongoose = require('mongoose');
const Loc = mongoose.model('Location');
let nodeGeocoder = require('node-geocoder');


const locationsByZipCode = function (req, res) {
    zipcode = req.query.zipcode;

    getCoordinatesFromZipcode(zipcode, function (coordinates) {
        req.query.lat = coordinates.latitude;
        req.query.lng = coordinates.longitude;
        locationsListByDistance(req, res);
    });

};

function getCoordinatesFromZipcode(zipcode, callback) {
    let options = {
        provider: 'openstreetmap'
    };


    let geoCoder = nodeGeocoder(options);
    geoCoder.geocode(zipcode)
        .then((res) => {
            console.log('geocoder res: ', res);
            res.forEach(location => {
                if (location.countryCode === 'US') {
                    callback(location);
                    //throw Exception();
                }
            });
        })
        .catch((err) => {
            console.log(err);
        });
};


const locationsListByDistance = async (req, res) => {
  const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    //console.log('lat',lat);
  const near = {
    type: "Point",
    coordinates: [lng, lat]
  };
  const geoOptions = {
    distanceField: "distance.calculated",
    key: 'coords',
    spherical: true,
    maxDistance: 20000
    //limit: 10
  };
  if ((!lng && lng !== 0) || (!lat && lat !== 0)) {
    return res
      .status(404)
      .json({ "message": "lng and lat query parameters are required" });
  }

  try {
    const results = await Loc.aggregate([
      {
        $geoNear: {
          near,
          ...geoOptions
        }
      }
    ]);
    const locations = results.map(result => {
      return {
        _id: result._id,
        name: result.name,
          address: result.address,
          city: result.city,
          state: result.state,
          zip: result.zip,
          description: result.description,
          lng: result.lng,
          lat: result.lat,
          twitterUrl: result.twitterUrl,
          facebookUrl: result.facebookUrl,
          phoneNumber: result.phoneNumber

      }
    });
      res.setHeader("Content-Type", "text/html");
     
      locations.forEach(location => {
          console.log('loc1:', location.name);
      });

    res
      .status(200)
        .json(locations);
  } catch (err) {
    res
      .status(404)
      .json(err);
  }
};

const locationsCreate = (req, res) => {
    console.log('locationsCreate');
    //console.log(req);
  Loc.create({
      name: req.body.name,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      description: req.body.description,
      coords: {
          type: "Point",
          coordinates: [
              parseFloat(req.body.lng),
              parseFloat(req.body.lat)
          ]
      },
        facebookUrl: req.body.facebookUrl,
        twitterUrl: req.body.twitterUrl,
        phoneNumber: req.body.phoneNumber
  },
  (err, location) => {
    if (err) {
      res
        .status(400)
        .json(err);
    } else {
        console.log('success');
      res
        .status(201)
        .json(location);
    }
  });
};

const locationsReadOne = (req, res) => {
    Loc
      .findById(req.params.locationid)
      .exec((err, location) => {
        if (!location) {
          return res
            .status(404)
            .json({"message": "location not found"});
        } else if (err) {
          return res
            .status(404)
            .json(err);
        } else {
          return res
            .status(200)
            .json(location);
        }
      });
};

/*public getLocations(lat: number, lng: number) : Promise<Location[]> {
    const url: string = `${this.apiBaseUrl}/locations?lng=${lng}&lat=${lat}`;
    return this.http.get(url).toPromise().then(response => response.json() as Location[]).catch(this.handleError);
}*/

/*const locationsUpdateOne = (req, res) => {
  if (!req.params.locationid) {
    return res
      .status(404)
      .json({
        "message": "Not found, locationid is required"
      });
  }
  Loc
    .findById(req.params.locationid)
    .select('-reviews -rating')
    .exec((err, location) => {
      if (!location) {
        return res
          .status(404)
          .json({
            "message": "locationid not found"
          });
      } else if (err) {
        return res
          .status(400)
          .json(err);
      }
      location.name = req.body.name;
      location.address = req.body.address;
      location.facilities = req.body.facilities.split(',');
      location.coords = [
        parseFloat(req.body.lng),
        parseFloat(req.body.lat)
      ];
      location.openingTimes = [{
        days: req.body.days1,
        opening: req.body.opening1,
        closing: req.body.closing1,
        closed: req.body.closed1,
      }, {
        days: req.body.days2,
        opening: req.body.opening2,
        closing: req.body.closing2,
        closed: req.body.closed2,
      }];
      location.save((err, loc) => {
        if (err) {
          res
            .status(404)
            .json(err);
        } else {
          res
            .status(200)
            .json(loc);
        }
      });
    }
  );
};*/
const locationsDeleteOne = (req, res) => {
  const {locationid} = req.params;
  if (locationid) {
    Loc
      .findByIdAndRemove(locationid)
      .exec((err, location) => {
          if (err) {
            return res
              .status(404)
              .json(err);
          }
          res
            .status(204)
            .json(null);
        }
    );
  } else {
    res
      .status(404)
      .json({
        "message": "No Location"
      });
  }
};

module.exports = {
  locationsListByDistance,
  locationsByZipCode,
  locationsCreate,
  locationsReadOne,
  locationsDeleteOne
};
