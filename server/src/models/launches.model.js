// const launches = new Map();

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

const DEFAULT_FLIGHT_NUMBER = 100;

// let lastFlightNumber = 100;

const launch = {
    flightNumber: 100,
    mission: 'Kepler Exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customer: ['ZTM', 'NASA'],
    upcoming: true,
    success: true,
} 

// launches.set(launch.flightNumber, launch);

const SPACEX_API_URL = "https://api.spacexdata.com/v5/launches/query"

async function populateLaunches (){
    console.log("Downloading launch data...");
    const response = await axios.post(SPACEX_API_URL, {
            query: {},
            options:{
                pagination: false,
                populate: [
                    {
                        path: 'rocket',
                        select: {
                            'name': 1
                        }
                    },
                    {
                        path: 'payloads',
                        select: {
                            'customers': 1
                        }
                    }
                ]
            }
    });

    if(response.status !== 200){
        console.log('Problem dowloading launch data');
        throw new Error('Launch data dowloading failed');
    }

    const launchDocs = response.data.docs;
    for(const launchDoc of launchDocs){
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers']
        })
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers : customers,
        }

        console.log(`${launch.flightNumber}, ${launch.mission}, ${launch.customers}`);
    }
}

async function loadLaunchData () {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: "Falcon 1",
        mission: "FalconSat",
    });
    if(firstLaunch) {
        console.log("Launch data already loaded");
        return;
    }

    await populateLaunches();
}

async function findLaunch(filter){
    return await launchesDatabase.findOne(filter);
}

async function existLaunchWithID (launchId) {
    return await launchesDatabase.find({
        flightNumber: launchId
    });
}



async function saveLaunch (launch) {
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch
    ,{
        upsert: true
    });
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber');

    if(!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function scheduleNewLaunch(launch){

    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if(!planet){
        throw new Error('No matching planet found');
    }

    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['Zero to Mastery', 'NASA'],
        flightNumber: newFlightNumber,
    });

    await saveLaunch(newLaunch);
}

// function getAllLaunches () {
//     return Array.from(launches.values());
// }

async function getAllLaunches(skip, limit) {
    return await launchesDatabase.find({}, {
       '_id' : 0,
       '__v': 0 
    })
    .sort({ flightNumber: 1})
    .skip(skip)
    .limit(limit);
}

// function addNewLaunch (launch) {
//     lastFlightNumber++;
//     launches.set(lastFlightNumber, Object.assign(launch, {
//         flightNumber : lastFlightNumber,
//         customer: ['Zero to Mastery', 'NASA'],
//         upcoming: true,
//         success: true,
//     }))
// }

// function getSpecificLaunch(id) {
//     for ( let [key, value] of launches){
//         if(parseInt(key) === id){
//             launches.delete(`${id}`);
//         } 
//     }
// }

async function abortLaunchById (launchId) {
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false,
    });
    
    return aborted.modifiedCount === 1;
}

module.exports = {
    loadLaunchData,
    getAllLaunches,
    scheduleNewLaunch,
    // getSpecificLaunch
    existLaunchWithID,
    abortLaunchById
}