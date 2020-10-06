const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const request = require('request');
const txtomp3 = require('text-to-mp3');
const client = new Discord.Client();

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
  if (!message.content.startsWith(prefix) || message.author.bot || message.author.tag == 'Chung has a small china dick#8463') return;

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
    else if (command === 'test') {
      const string = 'The bot is fucking working.';
      handleResponse(string, message);
    }
    else if (command === 'say') {
      args = args.join(' ');
      handleResponse(args, message);
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
