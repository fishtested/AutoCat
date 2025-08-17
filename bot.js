const { SlashCommandBuilder } = require('@discordjs/builders')
const { token } = require('./config.json');
const { Client, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async readyClient => {
    console.log(`Connected as ${readyClient.user.tag}!`);
    await registerCommands();
});

async function registerCommands() {
    const commands = [
        new SlashCommandBuilder()
            .setName('info')
            .setDescription('Information about the bot'),
        new SlashCommandBuilder()
            .setName('cat')
            .setDescription('Sends a cat')
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
});


client.login(token);
