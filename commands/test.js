module.exports = {
    name: 'test',
    description: "test for timed delete!",
    execute(message, args){
        message.reply('Testing!')
        .then(msg => {
          msg.delete({ timeout: 10000 })
        })
        .catch(console.error);
    }
}