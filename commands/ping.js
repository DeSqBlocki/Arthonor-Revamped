module.exports = {
    name: 'ping',
    description: "this is a ping command!",
    execute(message, args){
  // It sends the user "Pinging" and then returns ping
  message.channel.send("Pinging...").then(m =>{
    var ping = m.createdTimestamp - message.createdTimestamp;
    message.channel.send('Pong!\r\nPing is `' + `${ping}` + 'ms!`')
  });
}
}

