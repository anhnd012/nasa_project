const express = require('express');

const planetsRouter = express.Router();

const { httpGetAllPlanet } = require('../../controllers/planets.controller');

planetsRouter.get('/', httpGetAllPlanet);

module.exports = planetsRouter;