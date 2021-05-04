const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION'] });
const prefix = '$';

const fs = require('fs');
const { waitForDebugger } = require('inspector');
const { exit } = require('process');
const { Console } = require('console');
const { isNull } = require('util');
const userData = JSON.parse(fs.readFileSync('Storage/userData.json', 'utf8'));
const birthdays = JSON.parse(fs.readFileSync('Storage/birthdays.json', 'utf8'));
const wgelist = JSON.parse(fs.readFileSync('Storage/wge.json', 'utf8'))
const nutCooldown = new Set();
const ms = require('ms')
const ytdl = require('ytdl-core');
const ytpl = require('ytpl')
const ytSearch = require('yt-search');
const { getInfo } = require('ytdl-core');
const { indexOf } = require('ffmpeg-static');
const { get } = require('http');
const queue = []
const durations = [];
const musictitle = [];
const thumbnail = []
const feedbackjson = JSON.parse(fs.readFileSync('Storage/feedback.json', 'utf8'));
var songIndex = 0
var userCountInChannel = 0
var dispatcher
var loopCheck = false
var round = 0
// const profilesTemplate = {
//   id: user.id,
//   honors: 0,
//   reason: [],
//   nuts: 0,
//   time: []
// }



client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  client.commands.set(command.name, command);
}

//START OF EVENT (READY)
client.on('ready', async () => {
  //START OF BOT INFOS
  console.log('Starting Bot. . .\r\n');
  client.user.setActivity("Red Dead Depression", {
    type: "STREAMING",
    url: "https://www.twitch.tv/desq_blocki",
  });
  //END OF BOT INFOS

  //START OF BDAYCHECKER  
  var currentdate = new Date();
  var bdaycheck = `${(currentdate.getDate() < 10 ? '0' : '') + currentdate.getDate()}.${((currentdate.getMonth() + 1) < 10 ? '0' : '') + (currentdate.getMonth() + 1)}.`
  var key, count = 0;
  for (key in birthdays.geburtstage) {
    count++;
  };
  //counts entries of birthdays

  var i = 0;
  var chek = 0;
  var bdid = 0;
  const guild = client.guilds.cache.get('353902391021535242')
  const bdrole = guild.roles.cache.get('702877228857557002')

  do {
    if (birthdays.geburtstage[i].bday === bdaycheck) {
      chek = 1;
      bdid = i;
    }
    let member = guild.members.cache.get(birthdays.geburtstage[i].id)
    member.roles.remove(bdrole)
    //removes birthday role for every user
    i++;
  } while (i != count);
  if (chek == 1) {
    console.log('Heute ist ein Geburtstag! ' + bdaycheck);
    //logs current date
    let member = guild.members.cache.get(birthdays.geburtstage[bdid].id)
    member.roles.add(bdrole);
  } else {
    console.log('Heute ist kein Geburtstag! ' + bdaycheck);
    //logs current date
  }
  //END OF BDAYCHECKER

  console.log(`Es ist ${(currentdate.getHours() < 10 ? '0' : '') + currentdate.getHours()}:${(currentdate.getMinutes() < 10 ? '0' : '') + currentdate.getMinutes()}:${(currentdate.getSeconds() < 10 ? '0' : '') + currentdate.getSeconds()}`)
  //logs current timestamp

  //START OF TIMER
  function delTimer(i, j) {
    for (let h = 0; h < userData.Honor[i].time.length; h++) {
      if (userData.Honor[i].time[j] === targettime) {
        userData.Honor[i].time.splice(j, 1)
      }
    }
  }
  const botchannel = client.channels.cache.find(channel => channel.name === 'schmiede-der-bots')
  for (let i = 0; i < userData.Honor.length; i++) {
    if (userData.Honor[i].time.length) {
      for (let j = 0; j < userData.Honor[i].time.length; j++) {
        if (userData.Honor[i].time[j] < Date.now()) {
          console.log('-Dead Timer Cleared-')
          userData.Honor[i].time.splice(j, 1)
          j--
        } else {
          var currenttime = new Date()
          var targettime = new Date(userData.Honor[i].time[j])
          var time = targettime.getTime() - currenttime.getTime()
          console.log(`Timer with [${time}ms] remaining was restarted for [${userData.Honor[i].id}]`)
          setTimeout(() => {
            botchannel.send(`<@${userData.Honor[i].id}>, dein neugestarteter Timer ist abgelaufen!`)
          }, time);
          if (targettime.getHours() === currenttime.getHours() && targettime.getDate() === currenttime.getDate()) {
            delTimer(i, j)
          }
        }
      }
    }
    fs.writeFile('Storage/userData.json', JSON.stringify(userData), (err) => {
      if (err) console.error(err)
    });
  }

  //END OF TIMER

  //START OF WGE TIMER
  var i2 = 0
  while (i2 != wgelist.teilnahme.length) {
    if (!wgelist.teilnahme[i2].time) {
      //ignore empty/non-existent entries
    } else {
      function msToTime(duration) {
        var milliseconds = parseInt((duration % 1000) / 100),
          seconds = Math.floor((duration / 1000) % 60),
          minutes = Math.floor((duration / (1000 * 60)) % 60),
          hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
          days = Math.floor((duration / (1000 * 60 * 60 * 24)) % 7);

        days = (days < 10) ? "0" + days : days;
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;


        return days + "d " + hours + "h " + minutes + "m " + seconds + "s";
      }
      console.log(`WGE Thema: [${wgelist.teilnahme[i2].theme}] restarted! ${msToTime(wgelist.teilnahme[i2].time - currentdate.getTime())} remaining`)
      if ((wgelist.teilnahme[i2].time - 86400000) <= currentdate.getTime()) {
        let channel = client.channels.cache.find(channel => channel.name === 'worlds-greatest-expert')
        channel.send(`<@${wgelist.teilnahme[i2].id}>, Du hast noch weniger als 24h verbleibend für dein Thema: ${wgelist.teilnahme[i2].theme}!`)
      }
      //log the successful restart of a wge timer and its remaining time
      var wgeid = i2
      setTimeout(() => {
        const channel = client.channels.cache.find(channel => channel.name === 'worlds-greatest-expert')
        channel.send(`<@${wgelist.teilnahme[wgeid].id}>, deine Zeit ist abgelaufen! Tickets werden zurückgesetzt. . .`)
        delete wgelist.teilnahme[wgeid].time
        delete wgelist.teilnahme[wgeid].theme
        var j = 0
        while (j != wgelist.teilnahme.length) {
          if (wgelist.teilnahme[j].tickets >= 2) {
            wgelist.teilnahme[j].tickets--
          }
          j++
        }
        wgelist.teilnahme[wgeid].tickets = 0
        fs.writeFile('Storage/wge.json', JSON.stringify(wgelist), (err) => {
          if (err) console.error(err)
        });
        //restart any TimeOut of the WGE Timer (total of 1 week)
      }, wgelist.teilnahme[i2].time - currentdate.getTime());
    }
    i2++
  }
  //END OF WGE TIMER

  console.log('');
  console.log('HonorCounter is ready!');
  console.log('');
});

//START OF EVENT (VOICESTATEUDPATE)
client.on("voiceStateUpdate", async function (oldMember, newMember) {
  //event handler for {mute,deafen,vc change, etc}
  const guild = client.guilds.cache.get('353902391021535242') //caches guild by id
  const voiceChannel = guild.channels.cache.get('353903072310722561') //caches voicechannel by id
  var playlist //iterates playlist for inter-functional use
  const streamOptions = `{ filter: 'audioonly', highWaterMark: 1<<25 }` //iterates streamOptions for Opus
  var connection //iterates playlist for inter-functional use

  const delay = ms => new Promise(res => setTimeout(res, ms)); //function used for await in while loop
  if (userCountInChannel < 0) { //known bug: users inside afk channel were not registered an count towards userCountInChannel-- upon leaving. 
    userCountInChannel = 0 //This fixes the bot to stay!
  }
  //join event
  if (newMember.channelID === '353903072310722561' && oldMember.channelID != newMember.channelID) {
    //checks channelID and where the user came from/went to
    userCountInChannel++ // add count to userCount so that the bot plays music as long as at least 1 person is in the channel
    playlist = await ytpl('PLjSh2s1ASTgsSdjCgFbpo18RAYF_dHf46') //fetches playlist infos from YT
    function getPlaylistInfo() { //function for the first user joining the afk channel
      var i = 0
      var tdur = 0

      for (var property in playlist.items) { // goes through every item in playlist.items
        queue[i] = playlist.items[property].shortUrl //saves url at index i
        durations[i] = playlist.items[property].durationSec //saves durations in seconds at index i
        musictitle[i] = playlist.items[property].title //saves title at index i
        thumbnail[i] = playlist.items[property].bestThumbnail.url
        tdur += playlist.items[property].durationSec * 1000 //adds up total durations for w/e reason
        i++
      }
    }
    const streaming = async () => {
      const currentdate = new Date() //gets current date
      const now = `${(currentdate.getHours() < 10 ? '0' : '') + currentdate.getHours()}:${(currentdate.getMinutes() < 10 ? '0' : '') + currentdate.getMinutes()}:${(currentdate.getSeconds() < 10 ? '0' : '') + currentdate.getSeconds()}`
      //creates current time string
      const newdate = new Date(currentdate.getTime() + (durations[songIndex] * 1000)) //gets date by adding current date and song duration in ms
      const then = `${(newdate.getHours() < 10 ? '0' : '') + newdate.getHours()}:${(newdate.getMinutes() < 10 ? '0' : '') + newdate.getMinutes()}:${(newdate.getSeconds() < 10 ? '0' : '') + newdate.getSeconds()}`
      //creates target time string
      const stream = ytdl(queue[songIndex], { seek: 0, volume: 0.5 }) //iterates stream from ytdl-core(url, options)
      dispatcher = await connection.play(stream, streamOptions) //defines StreamDispatcher from .play(stream, streamOptions)
      console.log('\x1b[32m' ,`[${now}] - Now Playing: ${musictitle[songIndex]} - ETA: ${durations[songIndex]}s = ${then} [${songIndex + 1}/${queue.length}]\x1b[0m`)//logs [time] - [title] - [duration in s] = [target time] - [songposition/totalsongs]
      dispatcher.on('error', console.error) //error log
      if (songIndex == queue.length) {
        songIndex = 0
        console.log(`${round} Runde(n) fertig!`)
        //reset index after 1 round and logs rounds
      } else {
        songIndex++
        //continues SongIndex for next Song
      }
    }
    if (userCountInChannel === 1) {
      console.log(userCountInChannel + ' User ist im Tartaros')
    } else {
      console.log(userCountInChannel + ' User sind im Tartaros')
    }
    
    loopCheck = true
    if (userCountInChannel === 1 && loopCheck === true) {
      getPlaylistInfo()
      await delay(3000)
      connection = await voiceChannel.join()
      await voiceChannel.guild.me.edit({ mute: false })
      while (loopCheck === true) {
        streaming()
        await delay(durations[songIndex] * 1000)
        if (songIndex === queue.length) {
          songIndex = 0
        }
      }
    }
  }

  //leave event
  if (oldMember.channelID === '353903072310722561' && oldMember.channelID != newMember.channelID) {
    //checks channelID and where the user came from/went to
    userCountInChannel--
    const leaving = async () => {
      if (dispatcher) {
        await dispatcher.destroy()
        await delay(3000)
        await voiceChannel.leave()
      } else {
        await delay(3000)
        await voiceChannel.leave()
      }

    }
    if (userCountInChannel <= 1) {
      if (userCountInChannel === 1) {
        console.log(userCountInChannel + ' User ist im Tartaros')
      } else {
        console.log(userCountInChannel + ' User sind im Tartaros')
      }
      await leaving()
      loopCheck = false
    }
    
  }
})
//END OF EVENT (VOICESTATEUPDATE)

client.on("debug", message => {
  if (message.includes('VOICE') || message.includes('WS')) console.log(message)
})

//START OF EVENT (MEMBER JOIN)
client.on('guildMemberAdd', member => {
  const channel = client.channels.cache.find(channel => channel.name === 'hermeskammer')
  channel.send('Willkommen auf dem Olymp, <@' + member.user + '>! Bitte werf einen Blick auf <#455023824791011338>')
  console.log(member.user.username + ' joined');
  member.roles.add('400722216028733444')
});
//END OF EVENT (MEMBER JOIN)

//START OF EVENT (MEMBER LEAVE)
client.on('guildMemberRemove', guildMemberRemove => {
  console.log(guildMemberRemove.user.username + ' left');
});
//END OF EVENT (MEMBER LEAVE)

//START OF EVENT (MESSAGE SENT)
client.on('message', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  //if message doesn't start with the bot prefix or author is a bot, then ignore
  const args = message.content.slice(prefix.length).split(/ +/);
  //iterate args array by splitting each space into its own entry
  const command = args.shift().toLowerCase();
  function getUserFromMention(mention) {
    //creates function for mentions
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
      mention = mention.slice(2, -1);

      if (mention.startsWith('!')) {
        mention = mention.slice(1);
      }

      return client.users.cache.get(mention);
      //returns valid user infos
    }
  }
  //COMMAND: NP || NOW PLAYING
  if (command === 'np') {
    if (!musictitle.length || songIndex == 0) {
      return message.channel.send('Could Not Get Playlist Information, Please Make Sure The Bot Played Music At Least Once!')
    } else {
      const input = `${musictitle[songIndex - 1]} [${songIndex}/${queue.length}]\nDuration: ${durations[songIndex - 1]}s`
      const embed = new Discord.MessageEmbed()
        .setTitle(`-Now Playing-`)
        .setColor(0x51267)
        .setThumbnail(thumbnail[songIndex - 1])
        .addFields({ name: 'Current Song:', value: input, inline: true });

      return message.channel.send(embed)
    }
  }
  if (command === 'queue') {
    var next5 = []
    for (let i = 0; i != 5; i++) {
      next5[i] = `○ ${musictitle[songIndex + i]} [${songIndex + 1 + i}/${queue.length}]`
    }
    if (!musictitle.length) {
      return message.channel.send('Could Not Get Playlist Information, Please Make Sure The Bot Played Music At Least Once!')
    } else {
      const embed = new Discord.MessageEmbed()
        .setTitle(`-Current Tartaros Queue-`)
        .setColor(0x51267)
        .setThumbnail(message.guild.iconURL())
        .addFields({ name: 'Next 5 Songs:', value: next5, inline: true });

      return message.channel.send(embed)
    }
  }
  //COMMAND: FEEDBACK
  if (command === 'feedback') {
    if (!args.length) {
      return message.channel.send('Please specify something!')
    }
    const feedback = args.join(' ')
    console.log(feedback)
    feedbackjson.feedback.push(feedback)
    fs.writeFile('Storage/feedback.json', JSON.stringify(feedbackjson), (err) => {
      if (err) console.error(err)
    });
    return message.channel.send(`[${feedback}] sent.`)
  }
  //COMMAND: INBOX [DESQBLOCKI LOCKED]
  if (command === 'inbox') {
    if (message.author.id === '140508899064283136') {
      var feedback
      var feedbackarr = []
      var i = 0
      while (i != feedbackjson.feedback.length) {
        feedback = feedbackjson.feedback[i]
        feedbackarr.push(feedback)
        i++
      }
      if (!feedback){
        return message.channel.send('No messages in inbox!')
      }
      const embed = new Discord.MessageEmbed()
        .setTitle(`-Feedback Inbox-`)
        .setColor(0x51267)
        .setThumbnail(message.guild.iconURL())
        .addFields({ name: 'Feedback:', value: feedbackarr, inline: true });
      message.channel.send(embed);
    } else {
      return message.channel.send('You have no permission to use this command!')
    }
  }
  //COMMAND: GIBNUTS
  if (command === 'gibnuts') {
    const user = getUserFromMention(args[0])
    const author = message.author
    if (!user || !args[1] || isNaN(args[1])) {
      return message.channel.send(`missing argument(s), please refer to [$help ${command}]`)
    }
    if (user.id === author.id) {
      return message.channel.send('Du kannst dir nicht selber Nuts geben!')
    }

    const transfer = parseInt(args[1])

    var uid = 0
    var i = 0
    var check = 0

    do {
      if (userData.Honor[i].id === author.id) {
        uid = i;
        check = 1
      }
      i++;
      //standard search loop
    } while (i != userData.Honor.length)

    if (check === 1) {
      //author is in database
      if (userData.Honor[uid].nuts < transfer) {
        return message.channel.send('Du hast nicht genug Nuts!')
      }
      var uid2 = 0
      var i2 = 0
      var check2 = 0
      do {
        if (userData.Honor[i2].id === user.id) {
          uid2 = i2;
          check2 = 1
        }
        i2++;
        //standard search loop
      } while (i2 != userData.Honor.length)
      if (check2 === 1) {
        //target is in database
        userData.Honor[uid2].nuts += transfer
        userData.Honor[uid].nuts -= transfer
        message.channel.send(`<@${author.id}> hat <@${user.id}> **${transfer}** Nuts gesendet     <:chestnut:829906666551902238>➕➕`)
      } else {
        //target is not in database
        return message.channel.send('Ich kenne diese Person leider nicht :(')
      }
    } else {
      //author is not in database
      return message.channel.send('Du hast noch keine Nuts gesammelt!')
    }
    fs.writeFile('Storage/userData.json', JSON.stringify(userData), (err) => {
      if (err) console.error(err)
    });
  }
  //COMMAND: MITTWOCH
  if (command === 'mittwoch') {
    var date = new Date()
    var weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

    var filename

    if (weekdays[date.getDay()] == "Mittwoch") {
      filename = "wednesday"
      message.channel.send("Es ist Mittwoch, meine Kerle!")
    } else {
      filename = "notwednesday"
      message.channel.send("Es ist nicht Mittwoch, meine Kerle . . .")
    }
    const attachment = new Discord.MessageAttachment(`assets/${filename}.jpg`, `${filename}.jpg`);
    const embed = new Discord.MessageEmbed()
      .setTitle(`${filename}.jpg`)
      .setColor(0x51267)
      .setTimestamp()
      .attachFiles(attachment)
      .setImage(`attachment://${filename}.jpg`);
    message.channel.send(embed)
  }
  //COMMAND: WGE
  if (command === 'wge') {
    var sur = args[0]
    if (!sur) {
      return message.channel.send(`missing argument(s), please refer to [$${command} help]`)
    }
    if (sur === 'set') {
      var user = getUserFromMention(args[1])
      if (!user || !args[2]) {
        return message.channel.send(`missing argument(s), please refer to [$help ${command}]`)
      }
      var theme = args.join(' ').slice(args[0].length + args[1].length + 2)
      console.log(theme)
      console.log(args)
      theme = theme.trimStart()

      var uid = 0
      var i = 0
      var search = 0

      while (search != wgelist.teilnahme.length) {
        if (wgelist.teilnahme[search].time) {
          delete wgelist.teilnahme[search].time
          delete wgelist.teilnahme[search].theme
          fs.writeFile('Storage/wge.json', JSON.stringify(wgelist), (err) => {
            if (err) console.error(err)
          });
        }
        search++
        //searches database for existing data and deletes excess entries
      }

      while (i != wgelist.teilnahme.length) {
        if (wgelist.teilnahme[i].id === user.id) {
          uid = i
        }
        i++
        //searches database for user and save position
      }

      if (!wgelist.teilnahme[uid]) {
        return message.channel.send(`${user} ist noch nicht in der Teilnehmerliste!`)
        //if user doesn't exist in the database, return message
      } else if (wgelist.teilnahme[uid].yn === "n") {
        message.channel.send(`${user} nimmt nicht an WGE teil! Bitte wähle eine andere Person`)
        //if user does exist in the database, but doesn't participate at WGE, return message
      } else if (wgelist.teilnahme[uid].yn === "y") {
        message.channel.send(`${user}, du wurdest ausgewählt! Du hast nun 7 Tage Zeit, um deine Expertise zum Thema "${theme}" zur Schau zu stellen`)
        //if user does exist in the databse and agrees to particpate, then return message and theme and start timer


        var time = new Date()
        //get current time in ms
        wgelist.teilnahme[uid].time = time.getTime() + 604800000
        //add 1 week in ms to current time and store
        wgelist.teilnahme[uid].theme = theme
        //set theme in database
        fs.writeFile('Storage/wge.json', JSON.stringify(wgelist), (err) => {
          if (err) console.error(err)
        });
        //write changes
      }
    } else if (sur === 'random') {
      if (!args[1]) {
        return message.channel.send(`missing argument(s), please refer to [$${command} help]`)
      }
      var theme = args.join(' ').slice(args[0].length + 1)
      theme = theme.trimStart()

      //gets user by % chance from wge
      var uid = 0
      var i = 0
      var j = 0
      var ticketpool = []
      var tickets = []
      var count = 0
      var alltickets = 0

      while (i != wgelist.teilnahme.length) {
        if (wgelist.teilnahme[i].yn === 'y') {
          alltickets += wgelist.teilnahme[i].tickets
        }
        if (wgelist.teilnahme[i].time) {
          delete wgelist.teilnahme[i].time
          delete wgelist.teilnahme[i].theme
          console.log('Vorheriges WGE beendet und geloescht!')
        }
        i++
      }
      var i = 0
      while (ticketpool.length < alltickets) {
        ticketpool[i] = wgelist.teilnahme[j].id
        tickets[i] = wgelist.teilnahme[j].tickets
        if (count == wgelist.teilnahme[j].tickets) {
          j++
          count = 0
        } else {
          count++
        }
        i++
      }
      const random = Math.floor(Math.random() * ticketpool.length)
      const winnerID = ticketpool[random]
      const winnerTickets = tickets[random]
      const winnerChance = Math.round(((tickets[random] / alltickets) * 100) * 100) / 100
      console.log(`<@${winnerID}> hat mit ${winnerTickets} Tickets und somit einer Wahrscheinlichkeit von ${winnerChance}% gewonnen`)
      message.channel.send(`<@${winnerID}>, Du hast nun 7 Tage Zeit um deine Expertise zum Thema "${theme}" zur Schau zu stellen. Viel Erfolg!`)

      var i = 0
      while (i < wgelist.teilnahme.length) {
        if (wgelist.teilnahme[i].id == winnerID) {
          wgelist.teilnahme[i].tickets = 0
          wgelist.teilnahme[i].theme = theme
          wgelist.teilnahme[i].time = Date.now() + 604800000
        } else {
          wgelist.teilnahme[i].tickets++
        }
        i++
      }
      fs.writeFile('Storage/wge.json', JSON.stringify(wgelist), (err) => {
        if (err) console.error(err)
      });

    } else if (sur === 'remove') {
      var user = getUserFromMention(args[1])
      if (!user) {
        user = message.author
        //get user from mentions, or set author to user if noone was mentioned
      }

      var uid = 0
      var i = 0
      var check = 0

      while (i != wgelist.teilnahme.length) {
        if (wgelist.teilnahme[i].id === user.id) {
          check = 1
          uid = i
        }
        i++
        //check database for user and store position
      }
      if (check == 0) {
        const input = {
          id: user.id,
          yn: 'n',
          tickets: 1,
        }
        //if no user exists, add a profile to the database
        wgelist.teilnahme.push(input)
        console.log(input)
        message.channel.send(`${user} ist jetzt in der Teilnehmerliste und **nimmt nicht** teil`)
        fs.writeFile('Storage/wge.json', JSON.stringify(wgelist), (err) => {
          if (err) console.error(err)
        });
        //write changes to database
      } else {
        if (wgelist.teilnahme[uid].yn === "n") {
          message.channel.send(`${user} ist bereits in der Teilnehmerliste als **nimmt nicht** teil eingetragen`)
          //if user is known to database and already participates, return message
        } else {
          message.channel.send(`${user} **nimmt nicht** mehr teil`)
          wgelist.teilnahme[uid].yn = "n"
          //set user participation to n
          fs.writeFile('Storage/wge.json', JSON.stringify(wgelist), (err) => {
            if (err) console.error(err)
          });
          //write changes to database
        }
      }
      console.log(`${user} wurde von der WGE Teilnehmerliste entfernt`)
      //log user
    } else if (sur === 'add') {
      var user = getUserFromMention(args[1])
      if (!user) {
        user = message.author
        //get user from mentions, or set author to user if noone was mentioned
      }

      var uid = 0
      var i = 0
      var check = 0

      while (i != wgelist.teilnahme.length) {
        if (wgelist.teilnahme[i].id === user.id) {
          check = 1
          uid = i
        }
        i++
        //check database for user and store position
      }
      if (check == 0) {
        const input = {
          id: user.id,
          yn: 'y',
          tickets: 1,
        }
        //if no user exists, add a profile to the database
        wgelist.teilnahme.push(input)
        message.channel.send(`${user} ist jetzt in der Teilnehmerliste und **nimmt** teil`)
        fs.writeFile('Storage/wge.json', JSON.stringify(wgelist), (err) => {
          if (err) console.error(err)
        });
        //write change to databse
      } else {
        if (wgelist.teilnahme[uid].yn === "y") {
          message.channel.send(`${user} ist bereits in der Teilnehmerliste als **nimmt** teil eingetragen`)
          //if user is already in the database and participates, return message
        } else {
          message.channel.send(`${user} **nimmt** jetzt teil`)
          wgelist.teilnahme[uid].yn = "y"
          //if user is in database, change participation
          fs.writeFile('Storage/wge.json', JSON.stringify(wgelist), (err) => {
            if (err) console.error(err)
          });
          //write chagne to database
        }
      }
      console.log(`${user} wurde zur WGE Teilnehmerliste hinzugefügt`)
      //log user
    } else if (sur === 'time') {
      var uid
      var i = 0

      while (i != wgelist.teilnahme.length) {
        if (wgelist.teilnahme[i].time) {
          uid = i
        }
        i++
      }
      if (!uid) {
        return message.channel.send('Gerade ist kein aktiver WGE')
      }
      if (wgelist.teilnahme[uid].time) {
        desttime = wgelist.teilnahme[uid].time
        const currentdate = new Date()
        function msToTime(duration) {
          var milliseconds = parseInt((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
            days = Math.floor((duration / (1000 * 60 * 60 * 24)) % 7);

          days = (days < 10) ? "0" + days : days;
          hours = (hours < 10) ? "0" + hours : hours;
          minutes = (minutes < 10) ? "0" + minutes : minutes;
          seconds = (seconds < 10) ? "0" + seconds : seconds;


          return days + " Tage " + hours + " Stunden " + minutes + " Minuten " + seconds + " Sekunden";
        }
        const embed = new Discord.MessageEmbed()
          .setTitle("-Aktiver WGE-")
          .addFields(
            { name: 'Thema:', value: `${wgelist.teilnahme[uid].theme}` },
            { name: 'Zeit:', value: `${msToTime(wgelist.teilnahme[uid].time - currentdate.getTime())} verbleibend` },
            { name: 'Experte:', value: `<@${wgelist.teilnahme[uid].id}>` }
          )
          .setColor(0x51267)
          .setTimestamp()
          .setThumbnail(message.guild.iconURL())
          .setFooter("please notify my creator for further help")

        message.channel.send(embed);
      } else {
        return message.channel.send('Gerade ist kein WGE Timer gesetzt')
      }

    } else if (sur === 'info') {
      const embed = new Discord.MessageEmbed()
        .setTitle("-World's Greatest Expert-")
        .setDescription("Someone thinks you're the **World's Greatest Expert** (Patent pending) and you have to prove your expertise in the given topic \r\n \r\nCheck out the $wge commands for further help")
        .setColor(0x51267)
        .setTimestamp()
        .setFooter("please notify my creator for further help")
        .setThumbnail(message.guild.iconURL())

      message.channel.send(embed);
    } else if (sur === 'help') {
      const argument = args[1]
      const namearr = ['add', 'help', 'info', 'list', 'random', 'remove', 'set', 'tickets', 'time']
      const descarr = ['adds a user to the wge participation list', 'shows this help window', 'shows you what this game is about', 'lists current participants of WGE', 'randomly assigns a user to a wge theme', 'removes a user from the wge participation list', 'assigns a user to a wge theme', 'shows your current tickets', 'shows remaining time of the current wge']
      const usearr = ['$wge add [user or self]', '$wge help [command]', '$info', '$wge list', '$wge random', '$wge remove [user or self]', '$wge set [user] [theme]', '$wge tickets', '$wge time']
      var i
      if (!argument) {
        //no arguments were given
      } else if (namearr.indexOf(argument) >= 0) {
        i = namearr.indexOf(argument);
      } else {
        return message.channel.send(`missing/wrong argument(s), please refer to [$wge help]`)
      }
      if (!argument) {
        const embed = new Discord.MessageEmbed()
          .setTitle("-Command List-")
          .addFields({ name: 'Commands:', value: namearr, inline: true })
          .setDescription(`${namearr.length} Commands available!`)
          .setColor(0x51267)
          .setTimestamp()
          .setThumbnail(message.guild.iconURL())
          .setFooter("please notify my creator for further help")
        return message.channel.send(embed);
      } else {
        const embed = new Discord.MessageEmbed()
          .setTitle(namearr[i])
          .setDescription(descarr[i])
          .addFields({ name: 'Usage:', value: usearr[i], inline: true })
          .setColor(0x51267)
          .setTimestamp()
          .setThumbnail(message.guild.iconURL())
          .setFooter("please notify my creator for further help")
        return message.channel.send(embed);
      }
    } else if (sur === 'tickets') {
      var user
      if (!args[1]) {
        user = message.author
      } else {
        user = getUserFromMention(args[1])
      }
      var i = 0
      var uid
      var alltickets = 0
      var chec = 0
      while (i != wgelist.teilnahme.length) {
        if (wgelist.teilnahme[i].yn == 'y') {
          if (wgelist.teilnahme[i].id == user.id) {
            uid = i
            chec = 1
          }
          alltickets += wgelist.teilnahme[i].tickets
        }
        i++
      }
      if (chec == 0) {
        return message.channel.send('Dieser Nutzer ist nicht in der Liste!')
      }
      var chance = Math.round(((wgelist.teilnahme[uid].tickets / alltickets) * 100) * 100) / 100
      if (!args[1]) {
        return message.channel.send(`Du hast ${wgelist.teilnahme[uid].tickets} Tickets und somit eine Chance von ${chance}%`)
      } else {
        return message.channel.send(`Diese Person hat ${wgelist.teilnahme[uid].tickets} Tickets und somit eine Chance von ${chance}%`)
      }

    } else if (sur === 'list') {
      var users = []
      var i = 0
      var skips = 0
      while (i != wgelist.teilnahme.length) {
        if (wgelist.teilnahme[i].yn === 'y') {
          users[skips] = `<@${wgelist.teilnahme[i].id}> [${wgelist.teilnahme[i].tickets}]`
          skips++
        }
        i++
      }

      const embed = new Discord.MessageEmbed()
        .setTitle("-Teilnehmerliste-")
        .setThumbnail(message.guild.iconURL())
        .setDescription("Gerade nehmen folgende Personen an WGE teil. . .")
        .addFields({ name: 'Teilnehmer:', value: users },)
        .setColor(0x51267)
        .setTimestamp()
        .setFooter("please notify my creator for further help")
      message.channel.send(embed);
    } else {
      return message.channel.send(`missing argument(s), please refer to [$help ${command}]`)
    }
  }
  //COMMAND: NUTSLB
  if (command === 'nutslb') {
    var i = 0;
    var sorter = [];
    var element

    while (i != userData.Honor.length) {
      element = userData.Honor[i].nuts
      sorter.push(element);
      sorter.sort(function (a, b) {
        return b - a;
      });
      i++;
      //adds nuts to sorter, then sorts descending from highest value
    }
    var i = 0;
    var a = 0;
    var z = [];

    while (i < 5) {
      //Top 5 Werte
      while (a != userData.Honor.length) {
        if (!userData.Honor[a].nuts) {
          userData.Honor[a].nuts = 0
          fs.writeFile('Storage/userData.json', JSON.stringify(userData), (err) => {
            if (err) console.error(err)
          });
          //sets nonexistent values to 0 for leaderboard purposes
        }
        //DB durchsuchen
        if (userData.Honor[a].nuts === sorter[i]) {
          //ID merken
          if (!z.includes(`<@${userData.Honor[a].id}> : ${userData.Honor[a].nuts} Nuts`, 0)) {
            //Duplicates suchen
            z[i] = `<@${userData.Honor[a].id}> : ${userData.Honor[a].nuts} Nuts`;
          }
        }
        a++;
      }
      //search the database for all nuts
      a = 0;
      i++;
    }
    const embed = new Discord.MessageEmbed()
      .setAuthor(`Nuts Leaderboard!`)
      .setColor(0x51267)
      .setThumbnail(message.guild.iconURL())
      .addFields({ name: 'Top 5:', value: z, inline: true });
    message.channel.send(embed);
    //creates and sends embed of the TOP 5 highest nut values
  }
  //COMMAND: TIMER
  if (command === 'timer') {
    const sur = args[0]
    if (!sur) {
      return message.channel.send(`missing argument(s), please refer to [$${command} help]`)
    }
    if (sur === 'set') {
      const user = message.author
      var time = args[1]
      if (!time) {
        return message.channel.send('Wann soll ich dich denn erinnern?')
      }
      const currentdate = new Date();
      var param = args.join(' ').slice(args[1].length + args[0].length + 1)
      param = param.trimStart()
      const rdmarr = [`Dein Timer von ${time} ist um. Erinnere mich nochmal, woran ich dich erinnern sollte...`, `Dein Timer von ${time} ist um! Oh guck mal, da war eine Nuss im Timer :0`, `Dein Timer von ${time} ist um!`]

      if (ms(time) === undefined) {
        return message.channel.send('Please use time properly!')
      }
      const rdm = Math.floor(Math.random() * rdmarr.length)

      if (!param) {
        param = rdmarr[rdm]
      }
      const newdate = new Date(currentdate.getTime() + ms(time))
      var desttime = `**${(newdate.getHours() < 10 ? '0' : '') + newdate.getHours()}:${(newdate.getMinutes() < 10 ? '0' : '') + newdate.getMinutes()}:${(newdate.getSeconds() < 10 ? '0' : '') + newdate.getSeconds()}**`

      var check = 0
      var uid = 0
      var i = 0

      do {
        if (userData.Honor[i].id === user.id) {
          check = 1
          uid = i
        }
        i++
      } while (i != userData.Honor.length)

      if (!userData.Honor[uid].id) {
        const input = {
          id: user.id,
          honors: 0,
          reason: [],
          nuts: 0,
          time: [newdate.getTime()]
        }
        userData.Honor.push(input)
      } else {
        if (userData.Honor[uid].time) {
          userData.Honor[uid].time.push(newdate.getTime())
        } else {
          userData.Honor[uid].time = [newdate.getTime()]
        }
      }
      if (rdm == 1) {
        userData.Honor[uid].nuts++
      }
      fs.writeFile('Storage/userData.json', JSON.stringify(userData), (err) => {
        if (err) console.error(err)
      });

      function delTimer(param) {
        for (var i = 0; i < userData.Honor[uid].time.length; i++) {
          if (userData.Honor[uid].time[i] === newdate.getTime()) {
            userData.Honor[uid].time.splice(i, 1)
            message.reply(param)
          }
        }
      }
      message.channel.send(`Timer set! Ich erinnere dich in ${time} um ${desttime}`)
      setTimeout(() => {
        delTimer(param)
        fs.writeFile('Storage/userData.json', JSON.stringify(userData), (err) => {
          if (err) console.error(err)
        });

      }, ms(time));
    } else if (sur === 'list') {
      var user
      if (!user) {
        user = message.author
      } else {
        user = getUserFromMention(args[1])
      }

      var uid = 0
      var i = 0

      do {
        if (userData.Honor[i].id === user.id) {
          check = 1
          uid = i
        }
        i++
        //search the databse for user and check if he exists
      } while (i != userData.Honor.length)

      let checker = 0
      let timearr = []
      function msToTime(duration) {
        var milliseconds = parseInt((duration % 1000) / 100),
          seconds = Math.floor((duration / 1000) % 60),
          minutes = Math.floor((duration / (1000 * 60)) % 60),
          hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
          days = Math.floor((duration / (1000 * 60 * 60 * 24)) % 7);

        days = (days < 10) ? "0" + days : days;
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;


        return days + "d " + hours + "h " + minutes + "m " + seconds + "s";
      }
      for (let i = 0; i < userData.Honor[uid].time.length; i++) {
        if (userData.Honor[uid].time[i] > Date.now()) {
          var date = new Date(userData.Honor[uid].time[i])
          var cdate = Date.now()
          timearr[checker] = `${msToTime(date.getTime() - cdate)} [${checker}]`
          checker++
        }
      }
      if (checker == 0) {
        if (message.author.id === user.id) {
          return message.channel.send('Du hast keinen Timer gesetzt!')
        } else {
          return message.channel.send('Dieser Nutzer hat keinen aktiven Timer gesetzt!')
        }
      }
      const embed = new Discord.MessageEmbed()
        .setAuthor(`-Active Timers-`)
        .setThumbnail(message.guild.iconURL())
        .setColor(0x51267)
        .addFields({ name: 'verbleibende Zeit:', value: timearr, inline: true })
        .setFooter(`Timers of ${user.username}`)
      message.channel.send(embed);
      //sends embedded message with all covnerted values
    } else if (sur === 'help') {
      const argument = args[1]
      const namearr = ['delete', 'help', 'list', 'set']
      const descarr = ['deletes a timer from the list', 'shows you a helpful window', 'lists all active timer', 'set a new timer']
      const usearr = ['$timer delete [Index]', '$timer help', '$timer list [@User optional]', '$timer set [time + h,m,s] [reminder optional]']

      var i
      if (!argument) {
        //no arguments were given
      } else if (namearr.indexOf(argument) >= 0) {
        i = namearr.indexOf(argument);
      } else {
        return message.channel.send(`missing/wrong argument(s), please refer to [$wge help]`)
      }
      if (!argument) {
        const embed = new Discord.MessageEmbed()
          .setTitle("-Command List-")
          .addFields({ name: 'Commands:', value: namearr, inline: true })
          .setDescription(`${namearr.length} Commands available!`)
          .setColor(0x51267)
          .setTimestamp()
          .setThumbnail(message.guild.iconURL())
          .setFooter("please notify my creator for further help")
        return message.channel.send(embed);
      } else {
        const embed = new Discord.MessageEmbed()
          .setTitle(namearr[i])
          .setDescription(descarr[i])
          .addFields({ name: 'Usage:', value: usearr[i], inline: true })
          .setColor(0x51267)
          .setTimestamp()
          .setThumbnail(message.guild.iconURL())
          .setFooter("please notify my creator for further help")
        return message.channel.send(embed);
      }
    } else if (sur === 'delete') {
      const index = args[1]
      const user = message.author
      if (!index || isNaN(index)) {
        return message.channel.send('Please use a valid number or refer to [$timer help]')
      }
      let i = 0
      let uid
      do {
        if (userData.Honor[i].id === user.id) {
          check = 1
          uid = i
          break
        }
        i++
        //search the databse for user and check if he exists
      } while (i != userData.Honor.length)
      userData.Honor[uid].time.splice(index, 1)
      fs.writeFile('Storage/userData.json', JSON.stringify(userData), (err) => {
        if (err) console.error(err)
      });
      return message.channel.send(`Timer an Index ${index} gelöscht `)
    } else {
      return message.channel.send(`please refer to [$timer help ${sur}]`)
    }
  }
  //COMMAND: CHECKNUTS
  if (command === 'checknuts') {
    var newUser = getUserFromMention(args[0])
    if (!newUser) {
      newUser = message.author
    }
    //if no user was mentionied, set author as target user

    var check = 0
    var uid = 0
    var i = 0

    do {
      if (userData.Honor[i].id === newUser.id) {
        check = 1;
        uid = i;
      }
      i++;
      //search database for user
    } while (i != userData.Honor.length)

    if (check == 1) {
      //data does exist
      if (!userData.Honor[uid].nuts) {
        //data exists, but not updated yet
        userData.Honor[uid].nuts = 0;
        fs.writeFile('Storage/userData.json', JSON.stringify(userData), (err) => {
          if (err) console.error(err)
        });
        //write changes to database
      }

      if (userData.Honor[uid].nuts > 0) {
        //if user has more than 0 nuts, return value in message
        message.channel.send(`${newUser} hat bereits **${userData.Honor[uid].nuts}** Nüsse gesammelt! <:surprised_yeesh:808577706073260053>`);
      } else {
        //if user has no nuts, return message
        message.channel.send(`${newUser} hat noch keine Nüsse gesammelt! >:(`);
      }

    } else {
      //data does not exist
      message.channel.send(`${newUser} hat noch keine Nüsse gesammelt! >:(`);

      const input = {
        id: newUser.id,
        honors: 0,
        reason: [],
        nuts: 0,
        time: []
      }
      //create new profile
      userData.Honor.push(input);
      fs.writeFile('Storage/userData.json', JSON.stringify(userData), (err) => {
        if (err) console.error(err)
      });
      //write changes to database
    }
  }
  //COMMAND: NUTS
  if (command === 'nuts') {
    var newUser = message.author
    if (nutCooldown.has(newUser.id)) {
      message.channel.send('Du hast zu schnell genutted! >:(')
      //check if the user has already used this command in the past hour
    } else {
      var check = 0
      var uid = 0
      var i = 0

      do {
        if (userData.Honor[i].id === newUser.id) {
          check = 1;
          uid = i;
        }
        i++;
        //search database for user
      } while (i != userData.Honor.length)

      var value = Math.floor(Math.random() * 10)
      //creates random value for nuts

      if (value == 1) {
        //Singular
        message.reply('Du hast eine Nuss bekommen! <:chestnut:829906666551902238>')
      } else if (value > 0) {
        //Plural
        message.reply(`Du hast ${value} Nüsse bekommen! <:chestnut:829906666551902238>`)
      } else {
        //Nichts
        message.reply('Du hast keine Nuss bekommen! <:shooketh_yeesh:808577698271199272>')
      }

      if (check == 1) {
        //data does exist
        if (!userData.Honor[uid].nuts) {
          message.channel.send('Deus Nut! Du bekommst eine Bonus Nuss zum ersten Mal. <:DeusNut:829395908067328031>')
          value++;
          userData.Honor[uid].nuts = value
          //Bonus nut for the first time and writes it to database
        } else {
          userData.Honor[uid].nuts += value
          //adds value to existing data
        }
        fs.writeFile('Storage/userData.json', JSON.stringify(userData), (err) => {
          if (err) console.error(err)
        });
        //writes changes to database

      } else {
        //data does not exist
        message.channel.send('Deus Nut! Du bekommst eine Bonus Nuss zum ersten Mal. <:DeusNut:829395908067328031>') //<:Honor2:748242575701311530>
        value++;
        //random value + 1 for the first time using the command

        const input = {
          id: newUser.id,
          honors: 0,
          reason: [],
          nuts: value,
          time: []
        }
        //creates new profile with added value
        userData.Honor.push(input);
        fs.writeFile('Storage/userData.json', JSON.stringify(userData), (err) => {
          if (err) console.error(err)
        });
        //writes changes to database
      }

      nutCooldown.add(newUser.id);
      //adds user to cooldown set
      setTimeout(() => {
        nutCooldown.delete(newUser.id);
        //deletes cooldown after 1h
      }, 3600000)
      //sets timeout to 1h
    }
  }
  //COMMAND: LEADERBOARD
  if (command === 'lb') {
    var i = 0;
    var sorter = [];
    var element

    while (i != userData.Honor.length) {
      element = userData.Honor[i].honors
      sorter.push(element);
      sorter.sort(function (a, b) {
        return b - a;
      });
      //puts all honors into the sorter and sorts them in descending order
      i++;
      //search database for honors
    }

    var i = 0;
    var a = 0;
    var z = [];

    while (i < 5) {
      //Top 5 Werte
      while (a != userData.Honor.length) {
        //DB durchsuchen
        if (userData.Honor[a].honors === sorter[i]) {
          //ID merken, erstmal in console
          if (!z.includes(`<@${userData.Honor[a].id}> : ${userData.Honor[a].honors} Honors`, 0)) {
            //Duplicates suchen
            z[i] = `<@${userData.Honor[a].id}> : ${userData.Honor[a].honors} Honors`;
          }
        }
        a++;
      }
      a = 0;
      i++;
    }
    const embed = new Discord.MessageEmbed()
      .setAuthor(`Honor Leaderboard!`)
      .setColor(0x51267)
      .addFields({ name: 'Top 5:', value: z, inline: true })
      .setThumbnail(message.guild.iconURL())
    message.channel.send(embed);
    //creates and sends embedded value of sorted honors
  }
  //COMMAND: SETBDAY
  if (command == 'setbday') {
    if (message.author.id === '140508899064283136') {
      var user = getUserFromMention(args[0]);
      var date = args[1];
      //get user and date
      if (!user || !date) {
        return message.channel.send(`missing argument(s), please refer to [$help ${command}]`)
        //returns message, if no user or date was given
      } else {
        var key, count = 0;
        for (key in birthdays.geburtstage) {
          count++;
        };
        //count every birthday entry

        var i = 0;
        var checker = 0;
        do {
          if (user.id == birthdays.geburtstage[i].id) {
            checker = 1;
          }
          i++;
          //search database for user
        } while (i != count);
        if (checker == 0) {
          const input = {
            id: user.id,
            bday: date,
          }
          //if no user exists in database, create new profile
          birthdays.geburtstage.push(input);
          message.channel.send('Birthday Was Added To Database!')
          fs.writeFile('Storage/birthdays.json', JSON.stringify(birthdays), (err) => {
            if (err) console.error(err)
          });
          //write changes to database
        } else {
          return message.channel.send(`${user} is already in my database!`);
          //return message if users birthday is in database
        }
      }
    } else {
      return message.reply('You are not authorized to use this command! >:(');
      //return message if not authorized
    }
  }
  //COMMAND: LUV
  if (command == 'luv') {
    const user = getUserFromMention(args[0]);
    //get user from mentions
    var luvgifs = [
      "https://media.giphy.com/media/M90mJvfWfd5mbUuULX/giphy.gif",
      "https://media.giphy.com/media/hVle3v01CScLyGRe0i/giphy.gif",
      "https://media.giphy.com/media/hVle3v01CScLyGRe0i/giphy.gif",
      "https://media.giphy.com/media/eiRpSPB8OSGVcbkOIJ/giphy.gif",
      "https://media.giphy.com/media/ifB1v1W3Db0GIW7uTA/giphy.gif",
      "https://media.giphy.com/media/yc2pHdAoxVOrJ2m5Ha/giphy.gif",
      "https://media.giphy.com/media/Tia2InBEWaQgckP3UG/giphy.gif",
      "https://media.giphy.com/media/l41JWw65TcBGjPpRK/giphy.gif",
      "https://media.giphy.com/media/M8o1MOwcwsWOmueqN4/giphy.gif",
      "https://media.giphy.com/media/L4UOYLu2quhaRqrTDI/giphy.gif",
      "https://media.giphy.com/media/4N1wOi78ZGzSB6H7vK/giphy.gif",
      "https://media.giphy.com/media/RkbLjHIVtiJYyHnHvB/giphy.gif",
      "https://media.giphy.com/media/l4pTdcifPZLpDjL1e/giphy.gif",
      "https://media.giphy.com/media/WOrZJR85BBDyhahWsX/giphy.gif",
    ];
    //static gif links in array
    const gif = luvgifs[Math.floor(Math.random() * luvgifs.length)];
    var content
    //creates random number for gif index
    if (!user) {
      return message.channel.send('Ich sehe, dass du Liebe vergeben willst, aber wen willst du den lieb haben?')
      //returns message if no one was mentioned
    } else if (user.id != message.author.id) {
      content = `<@${message.author.id}> gibt luv an <@${user.id}>`
      //returns message and sends gif image
    } else {
      content = `<@${user.id}> luv'ed sich selbst ;3`
    }
    const embed = new Discord.MessageEmbed()
      .setColor(15277667)
      .setTimestamp()
      .setAuthor(`LUV!`)
      .setFooter(`gesendet von ${message.author.username}`)
      .setImage(gif);
    return message.channel.send(content).then(message.channel.send(embed))
  }
  //COMMAND: HUG
  if (command == 'hug') {
    const user = getUserFromMention(args[0]);
    //get user from mentions
    var huggifs = [
      'https://media.giphy.com/media/xT39CXg70nNS0MFNLy/giphy.gif',
      'https://media.giphy.com/media/3o6Zt4vkcksbhanNzW/giphy.gif',
      'https://media.giphy.com/media/yidUzriaAGJbsxt58k/giphy.gif',
      'https://media.giphy.com/media/U4LhzzpfTP7NZ4UlmH/giphy.gif',
      'https://media.giphy.com/media/3oEdv4hwWTzBhWvaU0/giphy.gif',
      'https://media.giphy.com/media/3M4NpbLCTxBqU/giphy.gif',
      'https://media.giphy.com/media/ZBQhoZC0nqknSviPqT/giphy.gif',
      'https://media.giphy.com/media/EvYHHSntaIl5m/giphy.gif',
      'https://media.giphy.com/media/3oEhnaf39dUjrk2Ag0/giphy.gif',
      'https://media.giphy.com/media/2GnS81AihShS8/giphy.gif',
      'https://media.giphy.com/media/13YrHUvPzUUmkM/giphy.gif',
      'https://media.giphy.com/media/3o6Zth3OnNv6qDGQ9y/giphy.gif',
      'https://media.giphy.com/media/jGRHaDpv4Y4mRU5hkF/giphy.gif',
      'https://media.giphy.com/media/ijoPIfKO0YQlW/giphy.gif',
      'https://media.giphy.com/media/52dOyY6pGuv1S/giphy.gif',
      'https://media.giphy.com/media/Vur30c2hOsnFm/giphy.gif',
      'https://media.giphy.com/media/wecXIPnE28m2c/giphy.gif',
      'https://media.giphy.com/media/o4m0lVqF2cuNa/giphy.gif',
      'https://media.giphy.com/media/1434tCcpb5B7EI/giphy.gif',
      'https://media.giphy.com/media/adTDFaG92ulxu/giphy.gif'
    ];
    //static gif links in array
    const gif = huggifs[Math.floor(Math.random() * huggifs.length)];
    //creates random number for gif index
    var content
    if (!user) {
      return message.reply(`Ich sehe, dass du jemanden hug'en willst, aber wen denn genau? :c`);
      //returns message if no one was mentioned
    } else if (user.id != message.author.id) {
      content = `<@${message.author.id}> gibt einen big hug an <@${user.id}>`

      //returns message and sends gif image
    } else {
      content = `<@${user.id}> hug'ed sich selbst ;}`
    }
    const embed = new Discord.MessageEmbed()
      .setColor(10181046)
      .setTimestamp()
      .setAuthor(`HUG!`)
      .setFooter(`gesendet von ${message.author.username}`)
      .setImage(gif);
    return message.channel.send(content).then(message.channel.send(embed))
  }
  //COMMAND: PAT
  if (command == 'pat') {
    const user = getUserFromMention(args[0]);
    //get user from mentions
    var petgifs = [
      'https://media.giphy.com/media/SQHZfImZYdz8AwUCMr/giphy.gif',
      'https://media.giphy.com/media/TA6Fq1irTioFO/giphy.gif',
      'https://media1.tenor.com/images/4f897d8b392005401a05b4b50576ecaa/tenor.gif?itemid=16037974',
      'https://media.giphy.com/media/3o7TKvargxFJiHyf6M/giphy.gif',
      'https://media.giphy.com/media/QxqqwXQuSWufNazWWU/giphy.gif',
      'https://media.giphy.com/media/Gx2vpQi2WPToc/giphy.gif',
      'https://media.giphy.com/media/ASsGSJEh0a63u/giphy.gif',
      'https://media.giphy.com/media/WaEDmi1vk4vFm/giphy.gif',
      'https://media.giphy.com/media/ARSp9T7wwxNcs/giphy.gif',
      'https://media.giphy.com/media/5tmRHwTlHAA9WkVxTU/giphy.gif',
      'https://media.giphy.com/media/lOaf0LBA2mluwm8cY8/giphy.gif',
      'https://media.giphy.com/media/l1LbUHrJb7GpuOHK0/giphy.gif',
      'https://media.giphy.com/media/3oFzmm13V0h44D61bi/giphy.gif',
      'https://media.giphy.com/media/M3a51DMeWvYUo/giphy.gif',
      'https://media.giphy.com/media/e7xQm1dtF9Zni/giphy.gif',
      'https://media.giphy.com/media/Lp6T9KxDEgsWA/giphy.gif',

    ];
    //static gif links in array
    const gif = petgifs[Math.floor(Math.random() * petgifs.length)];
    //creates random number for gif index
    var content
    if (!user) {
      return message.reply(`Ich sehe, dass du jemanden pat'en willst, aber wen denn genau? :c`);
      //returns message if no one was mentioned
    } else if (user.id != message.author.id) {
      content = `<@${message.author.id}> pat'ed an <@${user.id}>`
      //returns message and sends gif image
    } else {
      content = `<@${user.id}> pat'ed sich selbst @.@`
    }
    const embed = new Discord.MessageEmbed()
      .setColor(7419530)
      .setTimestamp()
      .setAuthor(`PET!`)
      .setFooter(`gesendet von ${message.author.username}`)
      .setImage(gif);
    return message.channel.send(content).then(message.channel.send(embed))
  }
  //COMMAND: CRY
  if (command == 'cry') {
    const user = getUserFromMention(args[0]);
    //get user from mentions
    var crygifs = [
      'https://media.giphy.com/media/3o6wrvdHFbwBrUFenu/giphy.gif',
      'https://media.giphy.com/media/L95W4wv8nnb9K/giphy.gif',
      'https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif',
      'https://media.giphy.com/media/26ufcVAp3AiJJsrIs/giphy.gif',
      'https://media.giphy.com/media/j0qSbeNFuzjhXKFVSP/giphy.gif',
      'https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif',
      'https://media.giphy.com/media/2WxWfiavndgcM/giphy.gif',
      'https://media.giphy.com/media/KDRv3QggAjyo/giphy.gif',
      'https://media.giphy.com/media/qQdL532ZANbjy/giphy.gif',
      'https://media.giphy.com/media/3fmRTfVIKMRiM/giphy.gif',
      'https://media.giphy.com/media/3ohs4t2IT01ev5F4jK/giphy.gif',
      'https://media.giphy.com/media/3o7qEciAHeStgj1idG/giphy.gif',
      'https://media.giphy.com/media/qscdhWs5o3yb6/giphy.gif',
      'https://media.giphy.com/media/ROF8OQvDmxytW/giphy.gif',
      'https://media.giphy.com/media/P53TSsopKicrm/giphy.gif',
      'https://media.giphy.com/media/3ov9jUBdDA5FFFITOU/giphy.gif',
      'https://media.giphy.com/media/3oz8xtjqF9RCTxnlKg/giphy.gif'
    ];
    //static gif links in array
    const gif = crygifs[Math.floor(Math.random() * crygifs.length)];
    //creates random number for gif index
    var content
    if (!user) {
      return message.reply(`Ich sehe, dass du cry'en willst, aber mit wem denn genau? :c`);
      //returns message if no one was mentioned
    } else if (user.id != message.author.id) {
      content = `<@${message.author.id}> weint mit <@${user.id}>`
      //returns message and sends gif image
    } else {
      content = `<@${user.id}> weint alleine T-T`
    }
    const embed = new Discord.MessageEmbed()
      .setColor(1752220)
      .setTimestamp()
      .setAuthor(`CRY!`)
      .setFooter(`gesendet von ${message.author.username}`)
      .setImage(gif);
    return message.channel.send(content).then(message.channel.send(embed))
  }
  //COMMAND: SLAP
  if (command == 'slap') {
    const user = getUserFromMention(args[0]);
    //get user from mentions
    var slapgifs = [
      'https://media.giphy.com/media/xUNd9HZq1itMkiK652/giphy.gif',
      'https://media.giphy.com/media/xUO4t2gkWBxDi/giphy.gif',
      'https://media.giphy.com/media/m6etefcEsTANa/giphy.gif',
      'https://media.giphy.com/media/Gf3AUz3eBNbTW/giphy.gif',
      'https://media.giphy.com/media/9U5J7JpaYBr68/giphy.gif',
      'https://media.giphy.com/media/RrLbvyvatbi36/giphy.gif',
      'https://media.giphy.com/media/VTVkjiRwO4LgA/giphy.gif',
      'https://media.giphy.com/media/10DRaO76k9sgHC/giphy.gif',
      'https://media.giphy.com/media/j3iGKfXRKlLqw/giphy.gif',
      'https://media.giphy.com/media/4Nphcg0CCOfba/giphy.gif',
      'https://media.giphy.com/media/LD8TdEcyuJxu0/giphy.gif',
      'https://media.giphy.com/media/uqSU9IEYEKAbS/giphy.gif',
      'https://media.giphy.com/media/1zgOyLCRxCmV5G3GFZ/giphy.gif',
      'https://media.giphy.com/media/jt38YxwGTevEkFWWoY/giphy.gif',
      'https://media.giphy.com/media/s5zXKfeXaa6ZO/giphy.gif',
      'https://media.giphy.com/media/3ohfFOrOAW9GaczHc4/giphy.gif',
      'https://media.giphy.com/media/vi2ciYHi5u0FO/giphy.gif',
      'https://media.giphy.com/media/Qs0I2VdbIqNkk/giphy.gif',
      'https://media.giphy.com/media/WLXO8OZmq0JK8/giphy.gif',
      'https://media.giphy.com/media/UCyuDunJK0l6U/giphy.gif',
      'https://media.giphy.com/media/kTBjwh6IWbLPy/giphy.gif'
    ];
    //static gif links in array
    const gif = slapgifs[Math.floor(Math.random() * slapgifs.length)];
    //creates random number for gif index
    var content
    if (!user) {
      return message.reply(`Ich sehe, dass du slap'en willst, aber wen denn genau? :c`);
      //returns message if no one was mentioned
    } else if (user.id != message.author.id) {
      content = `<@${message.author.id}> slap'ed <@${user.id}>`
    } else {
      content = `<@${user.id}> slap'ed sich selbst 0-0`
    }
    const embed = new Discord.MessageEmbed()
      .setColor(10038562)
      .setTimestamp()
      .setAuthor(`SLAP!`)
      .setFooter(`gesendet von ${message.author.username}`)
      .setImage(gif);
    return message.channel.send(content).then(message.channel.send(embed))
  }
  //COMMAND: 8BALL
  if (command == '8ball') {
    if (args == '') {
      return message.channel.send('Stell mir doch bitte eine Frage, ich kann immerhin keine Gedanken lesen...unless? ;)');
      //checks for any arguments
    } else {
      const random = Math.floor(Math.random() * 20);
      //iterates a random number from 0 to 19
      if (random == 0) {
        //Positive Antworten
        return message.channel.send('Absolut, so wie die Authorität unserer Göttin!');
      } else if (random == 1) {
        return message.channel.send('Unterschätze es nicht, genauso wie Roberts sexual frustration');
      } else if (random == 2) {
        return message.channel.send('Ich zedaz so');
      } else if (random == 3) {
        return message.channel.send('Ohne Zweifel');
      } else if (random == 4) {
        return message.channel.send('Definitiv, Alter');
      } else if (random == 5) {
        return message.channel.send('Microsoft Outlook gut');
      } else if (random == 6) {
        return message.channel.send('Das Sternzeichen von Yeesh leuchtet heute stark dafür');
      } else if (random == 7) {
        return message.channel.send('Mit "Support-Desk am Freitagabend" - Wahrscheinlichkeit');
      } else if (random == 8) {
        return message.channel.send('Ist die Nase von Julius wunderschön und lang?');
      } else if (random == 9) {
        return message.channel.send('So wahr wie Laviis Zeichnkünste');
        //Neutrale Antworten
      } else if (random == 10) {
        return message.channel.send('nein...ja... vielleicht?');
      } else if (random == 11) {
        return message.channel.send('Frag mich nachher nochmal');
      } else if (random == 12) {
        return message.channel.send('Die Kalkulationen sind leicht off, ich aber nicht ;)');
      } else if (random == 13) {
        return message.channel.send('Ich sag es dir ein ander Mal');
      } else if (random == 14) {
        return message.channel.send('Ohne schwere Zeiten, würden wir die guten Zeiten nie schätzen');
        //Negative Antworten
      } else if (random == 15) {
        return message.channel.send('Genauso schlecht wie eine Ketzerei gegen den Olymp');
      } else if (random == 16) {
        return message.channel.send('Hat der Fuchs uns jemals verraten?...**hust**');
      } else if (random == 17) {
        return message.channel.send('Mein Outlook ist abgeschmiert, mist');
      } else if (random == 18) {
        return message.channel.send('Ich bezweifle es. A propos, zweifel nicht an den Götter und ihren Priester!');
      } else if (random == 19) {
        return message.channel.send('Meine Quellen sagen.... WARNUNG! Artikel 17: Die betroffene Person hat das Recht, von dem Verantwortlichen zu verlangen, dass sie betreffende personenbezogene Daten unverzüglich gelöscht werden, und der Verantwortliche ist verpflichtet, personenbezogene Daten unverzüglich zu löschen, sofern einer der folgenden Gründe zutrifft **ERROR ERROR ERROR**?');
      } else {
        return;
      }
    }
  }
  //COMMAND: DOGGO [SCHALESCHNUEFFLER LOCKED]
  if (command == 'doggo') {
    if (message.author.id == '353902552888377346') {
      const attachment = new Discord.MessageAttachment('assets/doggo.jpg', 'doggo.jpg');
      //creates attachment from local doggo image

      message.channel.send({
        embed: {
          files: [
            attachment
          ],
          image: {
            url: 'attachment://doggo.jpg'
          }
        }
      });
      //creates embed with doggo image

      var text = [
        'Ich habe dich vermisst, woof!',
        'Lass uns spielen!',
        'Denk dran, ich werde immer hier sein.',
        'Du hast gerufen, Herrchen?',
        'Depression, WO?! Ich belle sie weg.',
      ]
      //creates array with potential messages
      let myText = text[Math.floor(Math.random() * text.length)]
      //chooses random index
      message.channel.send(myText);
      //sends random message
    } else {
      return message.reply('Du bist nicht mein Herrchen! >:(')
      //if no permissions, then return message
    }
  }
  //COMMAND: PET [SCHALESCHNUEFFLER LOCKED]
  if (command == 'pet') {
    if (message.author.id == '353902552888377346') {
      const attachment = new Discord.MessageAttachment('assets/doggo.jpg', 'doggo.jpg');
      //creates attachement from local doggo image
      message.channel.send({
        embed: {
          files: [
            attachment
          ],
          image: {
            url: 'attachment://doggo.jpg'
          }
        }
      });
      //creates embed from doggo image
      var petText = [
        '*loving growl*',
        'Danke, das habe ich gebraucht.',
        'Ein bisschen tiefer.',
        'Ja, genau dort!'
      ]
      //creates array with potential messages
      let myPetText = petText[Math.floor(Math.random() * petText.length)]
      //chooses random index
      message.channel.send(myPetText);
      //sends random message
    } else {
      return message.reply('Du bist nicht mein Herrchen! >:(')
      //if no permissions, then return message
    }
  }
  //COMMAND: STATUS
  if (command == 'status') {
    if (message.author.id == '140508899064283136') {
      return message.channel.send('I am alive, daddy :D');
    } else {
      return message.channel.send("I am online");
    }
  }
  //COMMAND: AVATAR
  if (command == 'avatar') {
    let user = getUserFromMention(args[0])
    var content
    if (!user) {
      user = message.author
    }
    if (user.id === message.author.id) {
      content = `-Your Avatar-`
    } else {
      content = `-${user.username}'s Avatar-`
    }
    const embed = new Discord.MessageEmbed()
      .setColor(2123412)
      .setAuthor(content)
      .setImage(user.displayAvatarURL({ dynamic: true }))
    return message.channel.send(embed);
  }
  //COMMAND: HONORHISTORY [ADMIN LOCKED]
  if (command === 'honorhistory') {
    if (message.member.hasPermission("VIEW_AUDIT_LOG")) {
      var newUser = getUserFromMention(args[0])
      if (!newUser) {
        newUser = message.author
      }
      //gets user from mention or sets user to author

      var check = 0;
      var uid = 0
      var i = 0

      do {
        if (userData.Honor[i].id === newUser.id) {
          uid = i;
          check = 1;
        }
        i++;
        //searches database for user
      } while (i != userData.Honor.length)

      if (check == 1) {
        if (!userData.Honor[uid].reason) {
          return message.channel.send('This User has no Honor History!')
          //if user has no reason value, return message
        }
        var reasons = userData.Honor[uid].reason
        //get reasons and create array
        const embed = new Discord.MessageEmbed()
          .setAuthor(`Honor History!`)
          .setColor(0x51267)
          .addFields({ name: 'reasons:', value: reasons, inline: true })
          .setFooter(`Honor History of User: ${newUser.username}`)
        message.channel.send(embed)
        //create and send embed with honor reasons
      } else {
        userData.Honor[uid].reason = []
        fs.writeFile('Storage/userData.json', JSON.stringify(userData), (err) => {
          if (err) console.error(err)
        });
        //if user is in database, but has no reason entry, create one
      }
    } else {
      message.channel.send('You do not have the required permissions to use this command')
      //if no permission, return message
    }
  }
  //COMMAND: DISHONOR [ADMIN LOCKED]
  if (command === 'dishonor') {
    if (message.member.hasPermission("VIEW_AUDIT_LOG")) {
      const newUser = getUserFromMention(args[0])
      //gets user from mention 
      if (!newUser) {
        return message.channel.send(`missing argument(s), please refer to [$help ${command}]`)
        //returns message if no user was given
      }
      var reason = args.join(' ').slice(args[0].length)
      reason = reason.trimStart()
      //gets all arguments after user and combines them
      if (!reason) {
        return message.channel.send(`missing argument(s), please refer to [$help ${command}]`)
      }
      var check = 0
      var uid = 0
      var i = 0

      do {
        if (userData.Honor[i].id === newUser.id) {
          check = 1;
          uid = i;
        }
        i++;
        //search database for user
      } while (i != userData.Honor.length)

      reason = "[-] " + reason

      if (check == 1) {
        //data does exist
        if (userData.Honor[uid].honors > -20) {
          if (userData.Honor[uid].honors) {
            userData.Honor[uid].honors--
            //honors data does exist and user was already given honor/dishonor
          } else {
            userData.Honor[uid] = -1
            //honors data does exist, but user does not have the honors element
          }
          if (!userData.Honor[uid].reason) {
            userData.Honor[uid].reason = [reason]
            //reason data does not exist, so we create a first entry for reason
          } else {
            userData.Honor[uid].reason.push(reason)
            //reason data does exist, so we append reason to the end
          }
        } else {
          return message.channel.send(`<@${message.author.id}> tried to dishonor <@${message.mentions.users.first().id}>, but they are at Max Dishonor Level! <:Honor2:748242575701311530><:Honor2:748242575701311530><:Honor2:748242575701311530>`)
          //returns message if user is already at max dishonor value
        }
      } else {
        //data does not exist
        const input = {
          id: newUser.id,
          honors: -1,
          reason: [reason],
          nuts: 0,
          time: []
        }
        //if user does not exist in databse, create a new profile
        userData.Honor.push(input);
        //write changes to database
      }
      fs.writeFile('Storage/userData.json', JSON.stringify(userData), (err) => {
        if (err) console.error(err)
      });

      return message.channel.send(`<@${message.author.id}> has dishonored <@${message.mentions.users.first().id}> <:Honor2:748242575701311530>`);
      //returns message after successfully adding it to database
    } else {
      return message.channel.send('You do not have the required permissions to use this command')
      //returns message, if no permissions
    }
  }
  //COMMAND: HONOR [ADMIN LOCKED]
  if (command === 'honor') {
    if (message.member.hasPermission("VIEW_AUDIT_LOG")) {
      const newUser = getUserFromMention(args[0])
      //gets user from mention
      if (!newUser) {
        return message.channel.send(`missing argument(s), please refer to [$help ${command}]`)
      }
      //returns message, if no user mentioned
      var reason = args.join(' ').slice(args[0].length)
      reason = reason.trimStart()
      //gets all arguments after user and combines them
      if (!reason) {
        return message.channel.send(`missing argument(s), please refer to [$help ${command}]`)
      }

      var check = 0
      var uid = 0
      var i = 0

      do {
        if (userData.Honor[i].id === newUser.id) {
          check = 1;
          uid = i;
        }
        i++;
        //searches database for user
      } while (i != userData.Honor.length)

      reason = "[+] " + reason

      if (check == 1) {
        //data does exist
        if (userData.Honor[uid].honors < 20) {
          if (userData.Honor[uid].honors) {
            userData.Honor[uid].honors++
            //honors data does exist and user was already given honor/dishonor
          } else {
            userData.Honor[uid] = 1
            //honors data does exist, but user does not have the honors element
          }
          if (!userData.Honor[uid].reason) {
            userData.Honor[uid].reason = [reason]
            //reason data does not exist, so we create a first entry for reason
          } else {
            userData.Honor[uid].reason.push(reason)
            //reason data does exist, so we append reason to the end
          }
        } else {
          return message.channel.send(`<@${message.author.id}> tried to honor <@${message.mentions.users.first().id}>, but they are at Max Honor Level! <:Honor1:748242575873278115> <:Honor1:748242575873278115> <:Honor1:748242575873278115>`)
        }
      } else {
        //data does not exist
        const input = {
          id: newUser.id,
          honors: 1,
          reason: [reason],
          nuts: 0,
          time: []
        }
        //if user is not in database, create new profile
        userData.Honor.push(input);
        //write changes to database
      }
      fs.writeFile('Storage/userData.json', JSON.stringify(userData), (err) => {
        if (err) console.error(err)
      });
      return message.channel.send(`<@${message.author.id}> has honored <@${message.mentions.users.first().id}> <:Honor1:748242575873278115>`);
      //returns message upon successfully honoring someone
    } else {
      return message.channel.send('You do not have the required permissions to use this command')
      //return message, if no permissions
    }
  }
  //COMMAND: CHECKHONOR
  if (command === 'checkhonor') {
    var newUser = getUserFromMention(args[0])
    if (!newUser) {
      newUser = message.author
    }
    //get user from mention or set author to user
    var check = 0
    var uid = 0
    var i = 0

    do {
      if (userData.Honor[i].id === newUser.id) {
        check = 1;
        uid = i;
      }
      i++;
      //search databse for user
    } while (i != userData.Honor.length)

    if (check == 1) {
      //data does exist
      message.channel.send('You received **' + userData.Honor[uid].honors + '** Honors in total!');
      //send message of total honor value
      if (userData.Honor[uid].honors < 0) {
        message.channel.send('What happened to Loyalty?! <:Honor2:748242575701311530>')
      } else if (userData.Honor[uid].honors > 0) {
        message.channel.send('real good, boah, REAL GOOD! <:Honor1:748242575873278115>')
      } else if (userData.Honor[uid].honors === 0) {
        message.channel.send('Choose a goddamn side!')
      } else if (userData.Honor[uid].honors === 20) {
        message.channel.send('This User is at max Honor Level! <:Honor1:748242575873278115> <:Honor1:748242575873278115> <:Honor1:748242575873278115>')
      } else if (userData.Honor[uid].honors === -20) {
        message.channel.send('This User is at max Dishonor Level! <:Honor2:748242575701311530> <:Honor2:748242575701311530> <:Honor2:748242575701311530>')
      }
      //send bonus message depending on honor value
    } else {
      //data does not exist
      message.channel.send('You received **0** Honors in total!');
      message.channel.send('Choose a goddamn side!');
      //send message for new users in database

      const input = {
        id: newUser.id,
        honors: 0,
        reason: "",
        nuts: 0,
        time: []
      }
      //create new profile
      userData.Honor.push(input);
      fs.writeFile('Storage/userData.json', JSON.stringify(userData), (err) => {
        if (err) console.error(err)
      });
      //write changes to databse
    }
  }






  //START OF TEST COMMAND!
  //COMMAND: PING
  if (command === 'ping') {
    client.commands.get('ping').execute(message, args);
    //ping - pong, easy as that
  }
  //COMMAND: AUTHOR
  if (command === 'author') {
    client.commands.get('author').execute(message, args);
    //gives credit to author
  }
  //COMMAND: HELP
  if (command === 'help') {
    client.commands.get('help').execute(message, args);
    //help menu with a list of all commands
  }
  //COMMAND: TEST [REDACTED]
  if (command === 'test') {
    client.commands.get('test').execute(message, args);
    //test command, please ignore
  }
  //END OF TEST COMMANDS!
});
//END OF EVENT (MESSAGE SENT)

client.login(config.token);

//CODE WRITTEN BY DESQBLOCKI
//ADD ME ON DISCORD "DeSqBlocki#2568"
