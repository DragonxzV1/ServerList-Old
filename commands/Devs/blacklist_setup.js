const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')

module.exports = {
    name: "blacklist_setup",
    description: 'blacklist setup',
    options: [],
    async execute(bot, interaction) {
        if (!interaction.member.roles.cache.get('1164162441853280313')) return interaction.reply({ content: `**You are not allowed to use this command!**` })
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('blacklist:add')
                    .setLabel('Blacklist Add')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('blacklist:remove')
                    .setLabel('Blacklist Remove')
                    .setStyle('DANGER'));



        const embed = new MessageEmbed()
        .setAuthor({
            name: 'ServerList - Blacklist',
            iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setColor('BLUE')
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setDescription(`\`\`\`Do you want to add or remove a server from the blacklist?\`\`\``)
        .setFooter({
            text: 'ServerList - Blacklist'
        });
        interaction.channel.send({ components: [row], embeds: [embed] })
        interaction.reply({ content: `**The command done!**`, ephemeral: true })
    },
};