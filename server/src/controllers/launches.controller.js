
const { getPagination } = require('../services/query');

const { getAllLaunches, scheduleNewLaunch, existLaunchWithID, abortLaunchById } = require('../models/launches.model');

async function  httpGetAllLaunches (req, res) {
    const { skip, limit } = getPagination(req.query);
    const launches = await getAllLaunches(skip, limit);
    return res.status(200).json(launches);
};

async  function httpPostAddLaunch (req, res) {
    const launch = req.body;
    if(!launch.mission || !launch.rocket || !launch.launchDate 
        || !launch.target)
    {
        return res.status(400).json({
            error: "Missing required launch property",
        })
    }

    launch.launchDate = new Date(launch.launchDate);
    
    if (isNaN(launch.launchDate)){
        return res.status(400).json({
            error: 'Invalid launch date'
        })
    }
    await scheduleNewLaunch(launch);
    return res.status(201).json(launch);
}

// function httpAbortLaunch (req, res) {
//     const launchId = req.params.id;
//     console.log(launchId);
//     getSpecificLaunch(launchId);
//     return res.status(200).json({
//         success: 'Delete success',
//     })
// }

async function httpAbortLaunch (req, res) {
    const launchId = Number(req.params.id);
    const existLaunch = await existLaunchWithID(launchId);
    if(!existLaunch){
        // If launch doesn't exist
        return res.status(404).json({
            error: 'Launch not found'
        }) 
    }

    // If launch does exist
    const aborted = await abortLaunchById(launchId);

    if (!aborted){
        return res.status(400),json({
            error: 'Launch not aborted',
        })
    }
    return res.status(200).json({
        ok : true
    });
}

module.exports = {
    httpGetAllLaunches,
    httpPostAddLaunch,
    httpAbortLaunch
}