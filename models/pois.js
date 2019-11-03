const request = require('request-promise-native');

const BACKEND_URL = 'https://' + (process.env.BACKEND_URL || 'findmyair-api.herokuapp.com');

module.exports = {
	getPOIs: async function getPOIs() {
        const options = {
            method: 'GET',
            uri: BACKEND_URL + '/pois',
            headers: {
                'Content-Type': 'application/json',
            },
            json: true
        };

        try {
            const responseBody = await request(options);
            return responseBody.listings;
        } catch (err) {
            throw err;
        }
    }
}