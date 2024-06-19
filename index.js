const mineflayer = require("mineflayer");
const readline = require("readline");
const {MicrosoftAuthFlow} = require('prismarine-auth');
const port = process.env.PORT || 10000;
const keep_alive = require("./keep_alive");
const persist = require('node-persist');

const botConfigs = [
  {
    host: 'donutsmp.net',
    username: 'abdoram999@gmail.com',
    auth: 'microsoft'
  },
  
  {
    host: 'donutsmp.net',
    username: 'yossefman123@gmail.com',
    auth: 'microsoft'
  },
  
  {
    host: 'donutsmp.net',
    username: 'malekahmed2006@outlook.com',
    auth: 'microsoft'
  },
  
  /*{
    host: 'T2eelYaBoody.aternos.me',
    username: 'bot02',
    //auth: 'offline'
  }*/
];

const bots = [];

async function createBot(config, index) {
  console.log(`Creating bot ${index} with config:`, config);

  const bot = mineflayer.createBot(config);
  bots[index] = bot;

  // Handle anti-AFK measures
  function antiAFK() {
    if (!bot.entity) {
      console.log(
        `Bot ${index} entity is not available, skipping antiAFK action.`,
      );
      return;
    }
    bot.setControlState("jump", true);
    setTimeout(() => bot.setControlState("jump", false), 200);
    try {
      bot.look(
        Math.random() * 2 * Math.PI,
        (Math.random() * Math.PI) / 2 - Math.PI / 4,
        true,
      );
    } catch (err) {
      console.log(`Error while looking around: ${err}`);
    }
  }

  function sendPeriodicCommands() {
    if (bot.entity) {
      bot.chat("/shard");
      setTimeout(() => {
        bot.chat("/afk 3");
      }, 3000);
    } else {
      console.log(`Bot ${index} is not ready to send commands.`);
    }
  }

  bot.once("spawn", () => {
    setInterval(antiAFK, 60000); // Jump and look around every minute
    setInterval(sendPeriodicCommands, 60000); // Send /shard every 60 seconds and /afk 3 every 3 minutes
  });

  // Handle chat messages
  bot.on("chat", (username, message) => {
    if (username !== bot.username) {
      const formattedMessage = message.replace(
        /shards?/gi,
        (match) => `<span style="color: purple">${match}</span>`,
      );
      console.log(`${username}: ${formattedMessage}`);
      keep_alive.addMessage(username, formattedMessage);
    }
  });

  // Input for sending messages
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", (input) => {
    if (input.startsWith("/chat ")) {
      const message = input.slice(6);
      bots.forEach((b, i) => b.chat(message)); // Send message with both bots
    } else {
      console.log('Invalid command. Use "/chat <message>" to send a message.');
    }
  });

  bot.on("error", (err) => {
    console.error(`Bot ${index} Error:`, err);
  });
  bot.on("end", () => {
    console.log(`Bot ${index} disconnected, attempting to reconnect...`);
    setTimeout(() => {
      createBot(config, index);
    }, 10000);
  });
}

// Create and manage both bots
botConfigs.forEach((config, index) => createBot(config, index));

// This is a big comment.
