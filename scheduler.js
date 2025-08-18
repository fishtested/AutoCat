const cron = require('node-cron');
const fs = require('fs');
const schedulefile = __dirname + '/schedules.json';

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

function addSch(guildId, channelId, time, client, skipSave = false) { 
    const key = `${guildId}-${channelId}`;
    const [hour, minute] = time.split(':');
    const cronTime = `${minute} ${hour} * * *`;

    if (jobs[key]) {
        jobs[key].stop();
        delete jobs[key];
    }

    schedules = schedules.filter(s => !(s.guildId === guildId && s.channelId === channelId));

    const job = cron.schedule(cronTime, async () => {
        const channel = await client.channels.fetch(channelId)
        try {
            await interaction.deferReply();
            const res = await fetch(`https://cataas.com/cat?json=true`);
            if (!res.ok) throw new Error(`CATAAS error ${res.status}`);
            const data = await res.json();
            const catRes = await fetch(data.url);
            if (!catRes.ok) throw new Error(`Failed to download cat: ${res.status}`);
            const buffer = Buffer.from(await catRes.arrayBuffer());
            const cat = new AttachmentBuilder(buffer, { name: `catimage-${Date.now()}.gif`});
            await interaction.editReply({ files: [cat] });
        } catch (error) {
            console.error('Failed to download cat', error);
            await interaction.editReply('Error: Failed to send. Cats may be tired.');
        }})

    jobs[key] = job;
    schedules.push({ guildId, channelId, time });
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
        addSch(s.guildId, s.channelId, s.time, client, true);
    }
}

module.exports = { addSch, remSch, getSch, initJobs };
