const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')

module.exports = {
    name: "needed_setup",
    description: 'needed setup',
    options: [],
    async execute(bot, interaction) {
        if (!interaction.member.roles.cache.get('1164162441853280313')) return interaction.reply({ content: `**You are not allowed to use this command!**` })
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('needed:searchwork')
                    .setLabel('מחפש עבודה')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('needed:need')
                    .setLabel('דרוש')
                    .setStyle('SUCCESS'));



        const embed = new MessageEmbed()
        .setAuthor({
            name: 'ServerList - Find a job',
            iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setColor('BLUE')
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setDescription(`במידה ואתם מציעים את עצמכם לעבודה לחצו על \`מחפש עבודה\`
        במידה ואתם מחפשים מישהו לעבודה לחצו על \`דרוש\``)
        .setFooter({
            text: 'ServerList - Find a job'
        });
        interaction.channel.send({ components: [row], embeds: [embed] })
        interaction.reply({ content: `**The command done!**`, ephemeral: true })
    },
};