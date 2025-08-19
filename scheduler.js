const cron = require('node-cron');
const fs = require('fs');
const schedulefile = __dirname + '/schedules.json';
const { AttachmentBuilder } = require('discord.js');

let schedules = [];
let jobs = {};

function saveSch() {
    fs.writeFileSync(schedulefile, JSON.stringify(schedules, null, 2));
}

function loadSch() {
    if (fs.existsSync(schedulefile)) {
        try {
            const data = fs.readFileSync(schedulefile, 'utf8');
            schedules = data ? JSON.parse(data) : [];
        } catch (err) {
            console.error('Failed to load schedules.json, resetting to empty array.', err);
            schedules = [];
        }
    }
}

function addSch(guildId, channelId, time, client, type, skipSave = false) { 
    const key = `${guildId}-${channelId}`;
    const [hour, minute] = time.split(':');
    const cronTime = `${minute} ${hour} * * *`;

    if (jobs[key]) {
        jobs[key].stop();
        delete jobs[key];
    }

    schedules = schedules.filter(s => !(s.guildId === guildId && s.channelId === channelId));

    const job = cron.schedule(cronTime, async () => {
        try {
            let apiUrl;
            let ext;
            if (type === 'GIFs') {
                apiUrl = 'https://cataas.com/cat/gif?json=true';
                ext = 'gif';
                type = 'gif';
            } else {
                apiUrl = 'https://cataas.com/cat?json=true';
                ext = 'jpg';
                type = 'jpg';
            }
            const channel = await client.channels.fetch(channelId);
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error(`CATAAS error ${res.status}`);
            const data = await res.json();
            const catRes = await fetch(data.url);
            if (!catRes.ok) throw new Error(`Failed to download cat: ${catRes.status}`);
            const buffer = Buffer.from(await catRes.arrayBuffer());
            const cat = new AttachmentBuilder(buffer, { name: `cat${ext}-${Date.now()}.${ext}` });
            await channel.send({ files: [cat] });
            console.log(`Cat ${ext} sent!`);
        } catch (error) {
            console.error('Failed to download cat', error);
        }
    });    

    jobs[key] = job;
    schedules.push({ guildId, channelId, time, type });
    if (!skipSave) saveSch();
}

function remSch(guildId, channelId) {
    const key = `${guildId}-${channelId}`;
    if (jobs[key]) {
        jobs[key].stop();
        delete jobs[key];
    }    
    schedules = schedules.filter(s => !(s.guildId === guildId && s.channelId === channelId));
    saveSch();
}

function getSch(guildId) {
    return schedules.filter(s => s.guildId === guildId);
}


function initJobs(client) {
    loadSch();
    for (const s of schedules) {
        addSch(s.guildId, s.channelId, s.time, client, s.type, true);
    }
}

module.exports = { addSch, remSch, getSch, initJobs };
