# FindMyAir
============

This README provides an overview of our project FindMyAir.

FindMyAir suggests 'suitable' Airbnbs based on user's preferences like:
   * Price of Airbnb
   * Proximity of Airbnb to various places of interest (by commute time and cost)
   * Safety of the Airbnb's neighbourhood

The project has two primary components: 'FindMyAir UI' (folder named `findmyair`) and 'FindMyAir API' folder named `findmyair-api`).

We describe them below in the order of their dependency.

## FindMyAir API
================

The folder holds all (deployable) code for the FindMyAir's Application programming interface (API). It is developed using Python.

### Description
---------------

The APIs are served as a Python Flask server. We use various Python libraries such as numpy, sklearn, pandas for our data analysis and serving the API requests.

### Installation
----------------

Requirements:
    * Python 3

Setup:
    $ pip install -r requirements.txt

### Execution
-------------

The server can be started (in development mode) using the following code
    $ python -m Flask run

This will start the server to listen on http://localhost:5000

The APIs can be executed in a standalone manner using Postman. Otherwise, they would be hit by the UI application described below.

## FindMyAir UI
===============

The folder holds all (deployable) code for the FindMyAir's User interface (UI). It is developed using Node.js. It communicates with FindMyAir API (described above) for getting data and Airbnb suggestsions. 

### Description
---------------

The UI is hosted as a Express.js server which provides an easy way to model a HTTP server using Node.js. The pages are served as Embedded JavaScript Template (EJS) hydrated with data. We use multiple front-end libraries like JQuery, Leaflet (and its plugins) to build the web page. We try keeping the pages as mobile responsive as we can. 

The Express.js server has routes which allows the JavaScript code in the browser to talk to backend API server (described below in FindMyAir API). 

### Installation
----------------

Requirements:
    * NodeJS v10+ 
    * NPM v6.9.0+ (auto-shipped with Node v10)

Setup:
    ```
    $ cd findmyair/
    $ npm install
    ```

### Execution
---------------

#### Start the server
The local server can started with the following command:
```
npm run start
```

This should start the server at http://localhost:3000/

By default, the UI is designed to talk to the FindMyAir backend API at https://findmyair-api.herokuapp.com. This can be overriden by:
```
BACKEND_URL=localhost:5000 npm run start
```

This will assume that FindMyAir API server is running on http://localhost:5000.

#### Interact with the UI
* Open a (modern) browser of choice
* Go to http://localhost:3000/
* You should see a map of New York with inputs on the left.
* Select Number of Days, select ititernary for each day, convey your priorities using the UI and press Submit
* You should see the suggestions for Airbnbs that 'suit' your preferences on the map and also as a list towards the left.
* You can click/hover over any Airbnb to see the suggested ititernary from that Airbnb and can go to the actual listing URL.  
