const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const { prefix, token } = require('./config.json');
const request = require('request');
const txtomp3 = require('text-to-mp3');
const ytdl = require('ytdl-core');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const queue = new Map();
const search = require('youtube-search')

const opts = {
  maxResults: 1,
  key: 'AIzaSyDoQsQ3T13YPGGKckh8o-664jP_rw1Rq94'
};

const nameCommands = [
  'anyway', 'back', 'bday', 'bus', 'chainsaw', 'cocksplat', 'dalton',
  'deraadt', 'donut', 'equity', 'fewer', 'name', 'fts', 'ing', 'keep',
  'king', 'legend', 'linus', 'look', 'madison', 'nugget', 'off', 'outside',
  'problem', 'rockstar', 'shakespeare', 'shutup', 'think', 'thinking',
  'thumbs', 'waste', 'xmas', 'yoda', 'you',
];

async function handleResponse(body, message) {
  body = body.split(' - ')[0];
  body = body.match(/.{1,199}(\s|$)/g);
  const messages = ['tts0.mp3'];
  for (const i in body) {
    if (i == 0) {
      await saveTts(body[i]);
    }
    else {
      const name = 'tts' + i.toString() + '.mp3';
      await saveTts(body[i], name);
      messages.push(name);
    }
  }
  await playMessage(message, messages);
}

async function saveTts(message, name = 'tts0.mp3') {
  await txtomp3.saveMP3(message, name);
}

async function playMessage(message, messages = ['tts0.mp3']) {
  const connection = await message.member.voice.channel.join();
  if (messages.length > 1) {
    const dispatcher = connection.play(messages[0]);
    dispatcher.on('finish', () => {
      const secondDispatcher = connection.play(messages[1]);
      secondDispatcher.on('finish', () => {
        connection.disconnect();
      });
    });
  }
  else {
    const dispatcher = connection.play(messages[0]);
    dispatcher.on('finish', () => {
      connection.disconnect();
    });
  }
}

async function execute(message, serverQueue) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send("Not in a channel dumbfuck");
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT")|| !permissions.has("SPEAK")) {
    return message.channel.send("I need the permissions you dumbfuck");
  }

  const songUrl = await search(string, opts, function(err, results) {
    if(err) return console.log(err);
  
    results[0].link;
  });
  const songInfo = await ytdl.getInfo(songUrl);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url
  };

  if (!serverQueue) {
    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(message.guild, queueConstruct.songs[0])
    } catch(err) {
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }

  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue dumbfuck!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music dumbfuck!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip dumbfuck!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music dumbfuck!"
    );
    
  if (!serverQueue)
    return message.channel.send("There is no song that I could stop!");
    
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

function nameOptions(command, name) {
  return({
    url: ['https://foaas.com', command, name, 'FOAASBOT'].join('/'),
    headers: {
      'Accept': 'text/plain',
    },
  });
}

function options(command) {
  return({
    url: ['https://foaas.com', command, 'FOAASBOT'].join('/'),
    headers: {
      'Accept': 'text/plain',
    },
  });
}

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(' ');
  const command = args.shift().toLowerCase();
  const serverQueue = queue.get(message.guild.id);

  if (message.member.voice.channel) {

    if (command === 'gamer') {
      const string = args[0] + ', you\'re such a fucking gamer!';
      handleResponse(string, message);
    }
    else if (command === 'jj') {
      const string = message.author.username + 'fucked jayjays dad';
      handleResponse(string, message);
    }
    else if (command === 'subscribe') {
      const string = 'Make sure to like, comment, and fucking subscribe.';
      handleResponse(string, message);
    }
    else if (command === 'test') {
      const string = 'The bot is fucking working.';
      handleResponse(string, message);
    }
    else if (command === 'say') {
      const string = args.join(' ');
      handleResponse(string, message);
    }
    else if (command === 'play') {
      execute(message, serverQueue);
    }
    else if (command === 'skip') {
      skip(message, serverQueue);
    }
    else if (command === 'stop') {
      stop(message, serverQueue);
    }
    else if (nameCommands.includes(command)) {
      if (args.length !== 1) {
        return message.channel.send('Provide 1 name.');
      }
      else {
        request(nameOptions(command, args[0]), function(error, response, body) {
          if (response.statusCode == 200) {
            handleResponse(body, message);
          }
          else {
            return message.channel.send('It\'s doomed');
          }
        });
      }
    }
    else {
      request(options(command), async function(error, response, body) {
        if (response.statusCode == 200) {
          handleResponse(body, message);
        }
        else {
          return message.channel.send('It\'s doomed');
        }
      });
    }
  }

});

client.login(token);
