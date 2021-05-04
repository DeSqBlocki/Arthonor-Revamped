module.exports = {
  name: 'help',
  description: "I need halp",
  execute(message, args) {
    const Discord = require("discord.js")

    const argument = args[0]
    const namearr = ["8ball", "author", "avatar", 'checkhonor', "checknuts",'cry',"gibnuts", "help",'hug', "lb", "luv",'np', "nuts", "nutslb", 'pat','queue','slap', "timer", "wge"]
    const descarr = ['Frag den Bot und er gibt dir vielleicht eine passende Antwort', 'Wer hats erfunden? ;)', 'Zeigt dir deinen Avatar', 'Check dein Honor Level', 'Check deez nuts, yo!','Cry at or for someone :c','Verteile Nuts an deine Freunde . . . oder deine Feinde >:)', 'Das hier. . .', 'Hug Someone really... fcking...HARD?!','Zeigt das Honor Leaderboard', 'Somebody to love~','Show you the current song in #Tarators', 'gib nuts!', 'Zeigt das Nuts Leaderboard', 'Head Pat Someone! :33','Shows you the current queue of #Tartaros','Slap someone, simple as that :D','Setze, Lösche, und Liste deinen Timer', `World's Greatest Expert Commands, Please Check WGE Command List!`]
    const usearr = ['$8ball [Frage]', '$author', '$avatar [@User optional]', '$checkhonor [@User optional]', '$checknuts [@User optional]','$cry [@User]','$gibnuts [@User] [Nuts Amount]', '$help [option available]', '$hug [@User]','$lb', '$luv [@User]','$np', '$nuts', '$nutslb','$pat [@User]','$queue','$slap [@User]', '$timer [commands]', '$wge [commands] or $wge help [commands]']

    var i
      if (!argument) {
        //no arguments were given
      } else if (namearr.indexOf(argument) >= 0) {
        i = namearr.indexOf(argument);
      } else {
        return message.channel.send(`missing/wrong argument(s), please refer to [$help]`)
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
  }
}