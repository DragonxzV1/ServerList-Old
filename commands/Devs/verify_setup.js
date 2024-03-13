const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')

module.exports = {
    name: "verify_setup",
    description: 'verify setup',
    options: [],
    async execute(bot, interaction) {
        if (!interaction.member.roles.cache.get('1118915489947721819')) return message.reply({ content: `**You are not allowed to use this command!**` })
        const row = new MessageActionRow() // יוצר משתנה בשם row, שהמשתנה מחזיר row של buttons
        .addComponents( // מוסיף כפתורים
        new MessageButton() // יוצר כפתור
        .setCustomId('verify') // עושה id לכפתור
        .setLabel('Click Here')
        .setStyle('SECONDARY') // עושה צבע לכפתור
        );
        const embed = new MessageEmbed()
        .setAuthor({name: 'Welcome to Clapzy Development Verify System'})
        .setDescription(' # \`Click the button below to verify.\`')
        .setFooter({text: "Made by : Clapzy#8061"})
        .setColor("GREY")

        interaction.channel.send({ embeds: [embed], components: [row] })
        interaction.reply({ content: `**Verify System Setuped!**`, ephemeral: true })
    },
};
