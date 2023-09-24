/* Unsuccessful Attempt to Code Redis Server to App*/
import { errorToJSON } from 'next/dist/server/render';
import { createClient } from 'redis';

const redis = require("redis");
const client = createClient({   
    password: 'OGJVvk2ohY6GIzeOjQ8kElSr8bJhXuvm',
    socket: {
        host: 'redis-14850.c62.us-east-1-4.ec2.cloud.redislabs.com',
        port: 14850
    }
})

client.on('connect', () => {
    console.log("Client connected to redis...")
})

client.on('ready ', () => {
    console.log('Client connected to redis and ready to use...')
})

client.on('error', (err) => {
    console.log(err.message)
})

client.on('end', () => {
    console.log("Client disconnected from redis...")
})

process.on('SIGINT', () => {
    client.quit()
})

module.exports = client