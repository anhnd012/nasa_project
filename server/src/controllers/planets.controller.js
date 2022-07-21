const { getAllPlanets} = require('../models/planets.model');

async function httpGetAllPlanet(req, res) {
    console.log("It's going here");
    return res.status(200).json(await getAllPlanets());
}




module.exports = {
    httpGetAllPlanet,
}