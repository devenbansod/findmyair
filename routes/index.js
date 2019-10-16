var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

/* GET Map page */
router.get('/map', function (req, res, next) {
    const lat = req.query.lat || 40.75362,
        long = req.query.long || -73.98377;

    res.render('map', {
        locations: {
            lat,
            long
        }
    });
});

module.exports = router;
