const db = require('quick.db');
module.exports = {
    sleep: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    checkChannels: async function(parnetId) {
    let guild = bot.guilds.cache.get('1164162441790373979');
    let channels = guild.channels.cache.filter((x) => x.type === 'GUILD_TEXT' && x.parentId === parnetId && db.has(`servers_${x.parentId}.${x.id}`))
    .sort((a,b) => db.get(`servers_${b.parentId}.${b.id}.votes`) - db.get(`servers_${a.parentId}.${a.id}.votes`)).map((x) => x)

    for (let i = 0; i < channels.length; i++) {
    let info = db.get(`servers_${channels[i].parentId}.${channels[i].id}`);
    if(!info) return;
    await channels[i].setName(channels[i].name.replace(`${channels[i].name.split('-')[0]}`, `${i+1}`)).catch((err) => {});
    await channels[i].setPosition(i).then((newChannel) => console.log(`[LOG] ${newChannel.name} new position is ${newChannel.position}`))
    };
    },
    isUrl: function(str) {
        let res = /((([(https)(http)]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
        if(res.test(str)) {
            return true;
        };
            return false;
    }
};