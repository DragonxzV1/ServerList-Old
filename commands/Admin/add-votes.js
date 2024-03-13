const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'add-votes',
    description: '[ADMIN] adds a vote to the list of votes',
    options: [
        {
            name: 'channel',
            description: 'Channel to add the vote to',
            type: 7,
            required: true,
        },
        {
            name: 'votes',
            description: 'Number of votes to add',
            type: 10,
            required: true,
        }
    ],

    async execute(bot, interaction) {
        if(!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply({content: 'You are not allowed to use this command.', ephemeral:true});
        let channel = interaction.options.getChannel('channel');
        let votes = interaction.options.getNumber('votes');

        db.add(`servers_${channel.parentId}.${channel.id}.votes`, votes);
        let embed = new Discord.MessageEmbed()
        .setAuthor({name: db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.name`), iconURL: db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.icon`) || interaction.guild.iconURL({dynamic:true})})
        .setColor('BLUE')
        .setDescription(db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.description`))
        .setThumbnail(db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.icon`) || interaction.guild.iconURL({dynamic:true}))
        .addFields(
            {name: 'Discord Link', value: `[Click Here](${db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.link`)})`, inline: true},
            {name: 'Server Owner', value: `<@${db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.ownerid`)}>`, inline: true},
            {name: 'Votes', value: `${db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.votes`)}`, inline: true},
        )
        .setTimestamp()
        .setFooter({text: '© Server List IL'})
        await channel.messages.fetch(db.get(db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.messageid`)))
        channel.messages.cache.get(db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.messageid`)).edit({embeds:[embed]});
        interaction.reply({content: 'Votes added.', ephemeral:true});
    },
};