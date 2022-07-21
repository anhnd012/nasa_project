const express = require('express');

const launchesRouter = express.Router();

const { httpGetAllLaunches, httpPostAddLaunch, httpAbortLaunch } = require('../../controllers/launches.controller');

launchesRouter.get('/', httpGetAllLaunches);
launchesRouter.post('/', httpPostAddLaunch);
launchesRouter.delete('/:id', httpAbortLaunch);

module.exports = launchesRouter; 