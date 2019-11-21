var express = require('express');
var router = express.Router();
const poisModel = require('../models/pois');
var request = require('request');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

/* GET Map page */
router.get('/map', async function (req, res, next) {
    const lat = req.query.lat || 40.75362,
        long = req.query.long || -73.98377;
    res.render('map', {
        locations: {
            lat,
            long
        },
        pois: (await poisModel.getPOIs()).map((poi) => poi.details)
    });
});


router.post('/map', function (req, res, next) {
    data = req.body;
    console.log("query", data)
    request.post(poisModel["BACKEND_URL"]+'/suggested-airbnbs?order_by=total_score', {
        json: data
    }, (error, result, body) => {
        if (error) {
            console.error(error)
            return
        }
      
      if (result.statusCode == 200) {
        console.log(body);
        res.end(JSON.stringify(body));        
      }
      
    })
});

router.get('/results', function (req, res, next) {
    res.render('results', {suggestions: "123"});
});

module.exports = router;
