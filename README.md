# AutoCat
AutoCat is a Discord.js bot that automatically sends cat pictures or GIFs to a Discord server channel.

Cat pictures and GIFs are from the CATAAS (Cat as a service) API (https://cataas.com/)

## Commands
- /cat: Sends a cat picture
- /gif: Sends a cat GIF
- /start: Schedules automatic cat pictures or GIFs to a user-specified channel at a user-specified time (UTC)
- /info: Information about the bot
- /list: Lists scheduled cats in the server
- /stop: Stops the automatic cat pictures or GIFs

## Files
- bot.js: The main bot file
- config.json: The bot token, not included in the repository
- scheduler.js: Schedules and sends automatic pictures
- schedules.json: The schedule database (channels, times)

## Screenshots
<img width="371" height="408" alt="Automatic GIF" src="https://github.com/user-attachments/assets/00e84d7a-9d78-4e30-8181-b9a9c8ee31e5" />

<img width="420" height="417" alt="/cat" src="https://github.com/user-attachments/assets/993648cc-c973-423d-8d5b-fb8d05149960" />

<img width="346" height="299" alt="Schedule" src="https://github.com/user-attachments/assets/31bffc8d-3558-479d-b708-124c620f3c03" />


## Installation
1. Install the Node.js dependencies (npm install discord.js @discordjs/builders node-cron, fs)
2. Download the bot.js and scheduler.js file
3. Create a config.json file with your bot token
4. Create a schedules.json file. If it does not exist, the bot will create one.
5. Run the bot (node bot.js)
