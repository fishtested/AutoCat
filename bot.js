const { SlashCommandBuilder } = require('@discordjs/builders')
const { token } = require('/config.json');
const { Client, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { initJobs, addSch, remSch, getSch } = require('./scheduler.js');

client.once(Events.ClientReady, async readyClient => {
    console.log(`Connected as ${readyClient.user.tag}!`);
    await registerCommands();
    initJobs(client);
});

async function registerCommands() {
    const commands = [
        new SlashCommandBuilder()
            .setName('info')
            .setDescription('Information about the bot'),
        new SlashCommandBuilder()
            .setName('cat')
            .setDescription('Sends a cat'),
        new SlashCommandBuilder()
            .setName('list')
            .setDescription('Lists all scheduled automatic cats'),
        new SlashCommandBuilder()
            .setName('start')
            .setDescription('Schedule automatic cat pictures')
            .addStringOption(option =>
                option.setName('time')
                    .setDescription('Time in 24h (HH:MM)')
                    .setRequired(true))
            .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send the cats')
                .setRequired(true)),
        new SlashCommandBuilder()
            .setName('stop')
            .setDescription('Stop automatic cat pictures')
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('Channel to cancel')
                    .setRequired(true)),
    ].map(cmd => cmd.toJSON());

    try {
        await client.application.commands.set(commands);
        console.log('Commands registered');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;
    
    // info
    if (commandName === 'info') {
        try {
            await interaction.reply(`AutoCat automatically sends cat pictures to a Discord server.`)
        } catch (error) {
            console.error(error);
        }
    }

    // cat
    if (commandName === 'cat') {
        try {
            const req = await fetch(`https://cataas.com/cat?json=true`);
            if (!req.ok) throw new Error(`Error ${req.status}`);
            const data = await req.json();
            const url = data.url;
            await interaction.reply(`${url}`)
        } catch (error) {
            console.error(error);
        }
    }

    // list
    if (commandName === 'list') {
        const schedules = getSch(interaction.guildId);
        if (!schedules.length) {
            await interaction.reply('No scheduled cats.');
        } else {
            const list = schedules.map(s => `<#${s.channelId}> at ${s.time}`).join('\n');
            await interaction.reply(`Scheduled cats:\n${list}`);
        }
    }

    // start
    if (commandName === 'start') {
        const time = interaction.options.getString('time');
        const channel = interaction.options.getChannel('channel');
        addSch(interaction.guildId, channel.id, time, client);
        await interaction.reply(`Scheduled cats for <#${channel.id}> at ${time}`);
    }

    // stop
    if (commandName === 'stop') {
        const channel = interaction.options.getChannel('channel');
        remSch(interaction.guildId, channel.id);
        await interaction.reply(`Stopped scheduled cats for <#${channel.id}>\nThe cats are not mad, just disappointed.`);
    }
});


client.login(token);
