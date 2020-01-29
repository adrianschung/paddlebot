const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const request = require('request');
const txtomp3 = require('text-to-mp3');
const client = new Discord.Client();

const nameCommands = [
  'anyway', 'back', 'bday', 'bus', 'chainsaw', 'cocksplat', 'dalton',
  'deraadt', 'donut', 'equity', 'fewer', 'name', 'fts', 'noun', 'ing',
  'keep', 'king', 'legend', 'linus', 'madison', 'nugget', 'off', 'outside',
  'problem', 'rockstar', 'shakespeare', 'shutup', 'think', 'thinking',
  'thumbs', 'waste', 'xmas', 'yoda', 'you',
];

async function handleResponse(body, message) {
  body = body.split(' - ')[0];
  await saveTts(body);
  await playMessage(message);
}

async function saveTts(message) {
  await txtomp3.saveMP3(message, 'tts.mp3').then(function(absoluteFilePath) {
    console.log(absoluteFilePath);
  })
    .catch(function(err) {
      console.log(err);
    });
}

async function playMessage(message) {
  const connection = await message.member.voice.channel.join();
  const dispatcher = await connection.play('tts.mp3');
  dispatcher.on('finish', function() {
    connection.disconnect();
  });
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

  if (message.member.voice.channel) {

    if (command === 'gamer') {
      const string = args[0] + ', you\'re such a fucking gamer!';
      handleResponse(string, message);
    }
    else if (command === 'subscribe') {
      const string = 'Make sure to like, comment, and fucking subscribe.';
      handleResponse(string, message);
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
