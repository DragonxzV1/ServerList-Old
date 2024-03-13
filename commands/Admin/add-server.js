const Discord = require('discord.js');
const { isUrl } = require('../../functions.js');
const db = require('quick.db');

module.exports = {
    name: 'add-server',
    description: '[ADMIN] adds a server to the list of servers',
    options: [
        {
            name: 'servername',
            description: 'Name of the server',
            type: 3,
            required: true,
        },
        {
            name: 'serverdescription',
            description: 'Description of the server',
            type: 3,
            required: true,
        },
        {
            name: 'servericon',
            description: 'Icon of the server',
            type: 11,
            required: true,
        },
        {
            name: 'serverowner',
            description: 'Owner of the server',
            type: 6,
            required: true,
        },
        {
            name: 'serverlink',
            description: 'Link to the server',
            type: 3,
            required: true,
        },
        {
            name: 'type',
            description: 'Type of the server',
            type: 3,
            choices: [
                {
                  name: 'Whitelist & Allowlist',
                  value: '1164162449054892062'
                },
                {
                  name: 'Public Roleplay',
                  value: '1164162445443604497'
                },
                {
                    name: 'Fun Servers',
                    value: '1164162449654693969'
                },
                {
                    name: 'Shop',
                    value: '1164162449054892063'
                },
                {
                    name: 'Community Servers',
                    value: '1164162449654693973'
                },
                {
                    name: 'hosting',
                    value: '1164162449054892066'
                },
                {
                    name: 'YouTuber Server',
                    value: '1164162449654693971'
                }
              ], 
            required: true,
        }
    ],

    async execute(bot, interaction) {
        if(!interaction.member.roles.cache.has('1164162441853280313')) return interaction.reply({content: 'You are not allowed to use this command.', ephemeral:true});
        let name = interaction.options.getString('servername');
        let description = interaction.options.getString('serverdescription');
        let icon = interaction.options.getAttachment('servericon');
        let ownerid = interaction.options.getUser('serverowner');
        let link = interaction.options.getString('serverlink');
        let type = interaction.options.getString('type');

        interaction.guild.members.cache.get(ownerid.id)?.roles.add('1164162441790373986').catch((err) => {}); // Owner RoleID
        
        if(interaction.guild.channels.cache.filter((x) => x.parentId === type).size === 50) return interaction.reply({content: 'You can only have 50 servers in the same category.', ephemeral:true});
        if(isUrl(link) === false) return interaction.reply({content: 'The link is not a valid URL.', ephemeral:true});
        interaction.guild.channels.create('0-'+name, {
            parent: type,
            type: 'GUILD_TEXT',
            reason: 'Added server' 
        }).then(async(c) => {
            c.permissionOverwrites.set([
                {
                    id: interaction.guild.roles.everyone,
                    deny: ['VIEW_CHANNEL'],
                },
                {
                    id: '1164162441790373985', //memberID
                    deny: ['SEND_MESSAGES'],
                    allow: ['VIEW_CHANNEL']
                }
                ]);
            
                let buttons = new Discord.MessageActionRow()
                .addComponents(new Discord.MessageButton()
                .setCustomId(`serverVote-${c.id}`)
                .setLabel(`Vote now!`)
                .setStyle('PRIMARY')).addComponents(new Discord.MessageButton()
                .setCustomId(`owneroptions-${c.id}`)
                .setLabel(`Owner Options`)
                .setStyle('SUCCESS')).addComponents(new Discord.MessageButton()
                .setCustomId(`staffoptions-${c.id}`)
                .setLabel(`Staff Options`)
                .setStyle('SECONDARY'))

            let embed = new Discord.MessageEmbed()
            .setAuthor({name: name, iconURL: icon.attachment || interaction.guild.iconURL({dynamic:true})})
            .setColor('BLUE')
            .setDescription(description)
            .setThumbnail(icon.attachment || interaction.guild.iconURL({dynamic:true}))
            .addFields(
                {name: 'Discord Link', value: `[Click Here](${link})`, inline: true},
                {name: 'Server Owner', value: `${ownerid}`, inline: true},
                {name: 'Votes', value: `0`, inline: true},
            )
            .setTimestamp()
            .setFooter({text: '© Server List IL'})
            c.send({embeds:[embed],components:[buttons]}).then((m) => {
                db.set(`servers_${type}.${c.id}`, {
                    name: name,
                    description: description,
                    icon: icon.attachment,
                    votes: 0,
                    link: link,
                    messageid: m.id,
                    ownerid: ownerid.id,
                    doubleboost: false
                });
            })
        });
        interaction.reply({content: 'Server added!', ephemeral:true});
    },
};