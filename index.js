import admin from 'firebase-admin';
import express from 'express';
import { logger } from './config/winston.js';

import * as mysql from 'mysql2/promise';
import * as schedule from 'node-schedule';

import serAccount from './onlineclassnotificator-firebase-adminsdk-nqqtp-5c35f4312d.js';
import lunchData from './lunchData/LunchInfo.json';

admin.initializeApp({
    credential: admin.credential.cert(serAccount)
})

var app = express();

var pool = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "shdngus0512",
    database: "Jinsung"
})

async function sendMessage(studentid) {
    const connection = await pool.getConnection(async conn => conn);
    try {
        var [token] = await connection.query("SELECT * FROM class203token WHERE studentid = ?", [studentid]);
        console.log(token)
        connection.release();
    } catch(err) {
        console.log(err);
        connection.release();
    }
    
    let message = {
        data: {
            title: "테스트",
            body: "테스트 메세지입니다.",
        },
        token: token[0].token
    }

    admin.messaging()
        .send(message)
        .then(response => console.log('Successfully sent message:', response))
        .catch(err => console.log('Error Sending message:', err))
}

async function sendMessages(day, period) {
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            var [classToken] = await connection.query("SELECT * FROM class203token WHERE studentid");
            var [periodClass] = await connection.query("SELECT " + day + " FROM timetable203 WHERE PK = ?", [period]);
        } catch(err) {
            console.error(err);
            logger.error(err);
            connection.release();
        }

        classToken.forEach(async studentToken => {
            try {
                if(periodClass[0][day] === "탐구A") {
                    var [className] = await connection.query("SELECT 탐구A FROM class203 WHERE ID = ?", [studentToken.studentid]);
                    var [teacherName] = await connection.query("SELECT Name FROM researcha WHERE Class = ?", [className[0]['탐구A']]);
                    var [zoomNumber] = await connection.query("SELECT * FROM zoomnumber WHERE Name = ?", [teacherName[0].Name]);
                }
                else if(periodClass[0][day] === "탐구B") {
                    var [className] = await connection.query("SELECT 탐구B FROM class203 WHERE ID = ?", [studentToken.studentid]);
                    var [teacherName] = await connection.query("SELECT Name FROM researchb WHERE Class = ?", [className[0]['탐구B']]);
                    var [zoomNumber] = await connection.query("SELECT * FROM zoomnumber WHERE Name = ?", [teacherName[0].Name]);
                }
                else if(periodClass[0][day] === "생활교양") {
                    var [className] = await connection.query("SELECT 생활교양 FROM class203 WHERE ID = ?", [studentToken.studentid]);
                    var [teacherName] = await connection.query("SELECT Name FROM secondlanguage WHERE Class = ?", [className[0]['생활교양']]);
                    var [zoomNumber] = await connection.query("SELECT * FROM zoomnumber WHERE Name = ?", [teacherName[0].Name]);
                }
                else if(periodClass[0][day] === "예술") {
                    var [className] = await connection.query("SELECT 예술 FROM class203 WHERE ID = ?", [studentToken.studentid]);
                    var [teacherName] = await connection.query("SELECT Name FROM art WHERE Class = ?", [className[0]['예술']]);
                    var [zoomNumber] = await connection.query("SELECT * FROM zoomnumber WHERE Name = ?", [teacherName[0].Name]);
                }
                else {
                    var [teacherName] = await connection.query("SELECT " + day + " FROM teachername203 WHERE PK = ?", [period]);
                    var [zoomNumber] = await connection.query("SELECT * FROM zoomnumber WHERE Name = ?", [teacherName[0][day]]);
                }

                let message = {
                    data: {
                        title: periodClass[0][day],
                        body: zoomNumber[0].Name + " " + zoomNumber[0].MN + " " + zoomNumber[0].PN
                    },
                    token: studentToken.token
                }

                admin.messaging()
                    .send(message)
                    .then(response => {
                        console.log(`Successfully sent message: ${response}`);
                        logger.info(`Successfully sent message: ${response}`);
                    })
                    .catch(err => {
                        console.error(`Error Sending message: ${err}`);
                        logger.error(`Error Sending message: ${err}`);
                    })
            }
            catch(err) {
                console.error(err);
                logger.error(err);
            }
        })
        connection.release();
    }
    catch(err) {
        console.error(err);
        logger.error(err);
    }
}

const mondayPeriod1 = schedule.scheduleJob('35 8 * * 1', () => { sendMessages('Monday', 1) })
const mondayPeriod2 = schedule.scheduleJob('35 9 * * 1', () => { sendMessages('Monday', 2) })
const mondayPeriod3 = schedule.scheduleJob('35 10 * * 1', () => { sendMessages('Monday', 3) })
const mondayPeriod4 = schedule.scheduleJob('35 11 * * 1', () => { sendMessages('Monday', 4) })
const mondayPeriod5 = schedule.scheduleJob('35 13 * * 1', () => { sendMessages('Monday', 5) })
const mondayPeriod6 = schedule.scheduleJob('35 14 * * 1', () => { sendMessages('Monday', 6) })
const mondayPeriod7 = schedule.scheduleJob('35 15 * * 1', () => { sendMessages('Monday', 7) })

const TuesdayPeriod1 = schedule.scheduleJob('35 8 * * 2', () => { sendMessages('Tuesday', 1) })
const TuesdayPeriod2 = schedule.scheduleJob('35 9 * * 2', () => { sendMessages('Tuesday', 2) })
const TuesdayPeriod3 = schedule.scheduleJob('35 10 * * 2', () => { sendMessages('Tuesday', 3) })
const TuesdayPeriod4 = schedule.scheduleJob('35 11 * * 2', () => { sendMessages('Tuesday', 4) })
const TuesdayPeriod5 = schedule.scheduleJob('35 13 * * 2', () => { sendMessages('Tuesday', 5) })
const TuesdayPeriod6 = schedule.scheduleJob('35 14 * * 2', () => { sendMessages('Tuesday', 6) })
const TuesdayPeriod7 = schedule.scheduleJob('35 15 * * 2', () => { sendMessages('Tuesday', 7) })

const WednesdayPeriod1 = schedule.scheduleJob('35 8 * * 3', () => { sendMessages('Wednesday', 1) })
const WednesdayPeriod2 = schedule.scheduleJob('35 9 * * 3', () => { sendMessages('Wednesday', 2) })
const WednesdayPeriod3 = schedule.scheduleJob('35 10 * * 3', () => { sendMessages('Wednesday', 3) })
const WednesdayPeriod4 = schedule.scheduleJob('35 11 * * 3', () => { sendMessages('Wednesday', 4) })
const WednesdayPeriod5 = schedule.scheduleJob('35 13 * * 3', () => { sendMessages('Wednesday', 5) })
const WednesdayPeriod6 = schedule.scheduleJob('35 14 * * 3', () => { sendMessages('Wednesday', 6) })
const WednesdayPeriod7 = schedule.scheduleJob('35 15 * * 3', () => { sendMessages('Wednesday', 7) })

const ThursdayPeriod1 = schedule.scheduleJob('35 8 * * 4', () => { sendMessages('Thursday', 1) })
const ThursdayPeriod2 = schedule.scheduleJob('35 9 * * 4', () => { sendMessages('Thursday', 2) })
const ThursdayPeriod3 = schedule.scheduleJob('35 10 * * 4', () => { sendMessages('Thursday', 3) })
const ThursdayPeriod4 = schedule.scheduleJob('35 11 * * 4', () => { sendMessages('Thursday', 4) })
const ThursdayPeriod5 = schedule.scheduleJob('35 13 * * 4', () => { sendMessages('Thursday', 5) })
const ThursdayPeriod6 = schedule.scheduleJob('35 14 * * 4', () => { sendMessages('Thursday', 6) })
const ThursdayPeriod7 = schedule.scheduleJob('35 15 * * 4', () => { sendMessages('Thursday', 7) })

const FridayPeriod1 = schedule.scheduleJob('35 8 * * 5', () => { sendMessages('Friday', 1) })
const FridayPeriod2 = schedule.scheduleJob('35 9 * * 5', () => { sendMessages('Friday', 2) })
const FridayPeriod3 = schedule.scheduleJob('35 10 * * 5', () => { sendMessages('Friday', 3) })
const FridayPeriod4 = schedule.scheduleJob('35 11 * * 5', () => { sendMessages('Friday', 4) })
const FridayPeriod5 = schedule.scheduleJob('35 13 * * 5', () => { sendMessages('Friday', 5) })
const FridayPeriod6 = schedule.scheduleJob('35 14 * * 5', () => { sendMessages('Friday', 6) })

app.get('/', (req, res) => {
    sendMessage("20307")
    sendMessage("20301")
    res.send("asdf");
})

app.get('/login', async (req, res) => {
    console.log(`Login Attempt: ${req.query.id}`);
    logger.info(`Login Attempt: ${req.query.id}`)
    
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            var [ID, fields] = await connection.query("SELECT * FROM class203 WHERE ID = ?", [req.query.id]);
            connection.release();
        } catch(err) {
            console.error(err);
            logger.error(err);
        }
    } catch(err) {
        console.error(err);
        logger.error(err);
    }
    
    if(JSON.stringify(ID) === "[]") res.send({res: "No exist"})
    else res.send({res: "success"})
})

app.get('/register', async (req, res) => {
    console.log(`Register Attempt: ${req.query.id}, ${req.query.token}`);
    logger.info(`Register Attempt: ${req.query.id}, ${req.query.token}`);

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            var [studentToken, fields] = await connection.query("SELECT * FROM class203token WHERE studentid = ?", req.query.id);
            if(JSON.stringify(studentToken) === "[]") {
                await connection.query("INSERT INTO class203token(studentid, token) VALUES (?, ?)", [req.query.id, req.query.token]);
                res.send({res: "registered"});
            }
            else {
                await connection.query("UPDATE class203token SET token = ? WHERE studentid = ?", [req.query.token, req.query.id]);
                res.send({res: "updated"});
            }
            connection.release();
        } catch(err) {
            console.error(err);
            logger.error(err);
        }
    } catch(err) {
        console.error(err);
        logger.error(err);
    }
})

app.get('/203.json', async (req, res) => {
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            var [timetable203] = await connection.query("SELECT * FROM timetable203");
            res.send(timetable203);
            connection.release();
        }
        catch(err) {
            console.error(err);
            logger.error(err);
            res.send({res: "query failed"})
        }
    } catch(err) {
        console.error(err);
        logger.error(err);
        res.send({res: "sql server failed"})
    }
})

app.get('/lunch.json', async (req, res) => {
    var nowDate = new Date(Date.now());
    var yyyyMMdd = `${nowDate.getFullYear()}${("0" + (nowDate.getMonth()+1)).slice(-2)}${("0" + (nowDate.getDate())).slice(-2)}`;

    var lunchToday = lunchData.find(lunch => lunch.MLSV_YMD === yyyyMMdd);
    if(lunchToday === undefined) res.send({MLSV_YMD: "invalid"});
    else res.send(lunchToday);
})

app.listen(8888, () => {
    console.log("server starting with 8888");
    logger.info("server starting with 8888");
})