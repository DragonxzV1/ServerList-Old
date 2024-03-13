const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')

module.exports = {
    name: "ticket_setup",
    description: 'ticket setup',
    options: [],
    async execute(bot, interaction) {
        if (!interaction.member.roles.cache.get('1118915489947721819')) return interaction.reply({ content: `**You are not allowed to use this command!**` })
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('requestticket:type:support')
                    .setLabel('Support')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setCustomId('requestticket:type:donation')
                    .setLabel('Donation')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setCustomId('requestticket:type:report')
                    .setLabel('Report')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setCustomId('requestticket:type:crimeaccess')
                    .setLabel('Crime Access')
                    .setStyle('SECONDARY'));



        const embed1 = new MessageEmbed()
            .setColor("GREY")
            .setTitle(interaction.guild.name)
            .setDescription(`**__Clapzy Development Open Ticket__**

            **There are several support options at your disposal that can help you get the help you need
            Whoever disrespects or curses will receive the appropriate punishment

            Thanks from the server Team**`)
            .setFooter({
                text: `${interaction.guild.name}`
            })

        interaction.channel.send({ components: [row], embeds: [embed1] })
        interaction.reply({ content: `**The command done!**`, ephemeral: true })
    },
};