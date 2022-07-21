const http = require('http');

require('dotenv').config();

const { mongoConnect } = require('./services/mongo');

const app = require('./app');

const { loadingData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);


async function startServer() {
    await mongoConnect()
    try {
        const hi = await loadingData();
        await loadLaunchData();
        console.log(hi);
    }catch(err){
        console.log(err);
    }

    server.listen(PORT , () => {
        console.log(`Listening on port ${PORT}`);
    })

}

startServer()


 