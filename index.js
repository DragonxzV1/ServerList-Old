const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const ms = require('ms');
const fetch = require('node-fetch');
const { checkChannels, sleep, isUrl } = require('./functions.js');
const Cooldown = require('command-cooldown');
const db = require('quick.db');

const bot = new Discord.Client({
    intents: Object.keys(Discord.Intents.FLAGS),
    partials: ['CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION', 'USER']
});
global.bot = bot;
bot.slashCommands = new Discord.Collection();
const data = [];

function antiratelimit(interaction) {
    if (!interaction.user.bot) {
        if (!data[interaction.user.id]) data[interaction.user.id] = {
            lastCommand: 0,
            cooldown: 0
        };
        if (data[interaction.user.id].lastCommand + data[interaction.user.id].cooldown > Date.now()) return 'limited';
        data[interaction.user.id].lastCommand = Date.now();
        data[interaction.user.id].cooldown = 1000;
    }
};
async function updated(interaction) {
    let embed = new Discord.MessageEmbed()
        .setAuthor({ name: db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.name`), iconURL: db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.icon`) || interaction.guild.iconURL({ dynamic: true }) })
        .setColor('BLUE')
        .setDescription(db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.description`) || '--')
        .setThumbnail(db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.icon`))
        .addFields(
            { name: 'Discord Link', value: `[Click Here](${db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.link`)})`, inline: true },
            { name: 'Server Owner', value: `<@${db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.ownerid`)}>`, inline: true },
            { name: 'Votes', value: `${db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.votes`)}`, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: '© Server List IL' })
    await interaction.channel.messages.fetch(db.get(db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.messageid`)));
    interaction.channel.messages.cache.get(db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.messageid`)).edit({ embeds: [embed] });
};

process.on('unhandledRejection', (reason, p) => {
    console.log(reason, p);
});
process.on('uncaughtException', (err, origin) => {
    console.log(err, origin);
});
process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log(err, origin);
});
process.on('multipleResolves', (type, promise, reason) => {
    console.log(type, promise, reason);
});

bot.on('ready', async () => {
    db.delete('limited');
    bot.guilds.cache.get('1164162441790373979')?.commands.set(data); // GUILDID
    console.log(`${bot.user.username} is online!`);

    setInterval(async () => {
        const guild = bot.guilds.cache.get('1164162441790373979'); // GUILDID
        bot.user.setActivity({ name: `${guild.memberCount.toLocaleString()} Members | ${guild.channels.cache.filter((x) => x.parentId === '1164162449054892062' || x.parentId === '1164162445443604497' || x.parentId === '1164162449654693969' || x.parentId === '1164162449054892063' || x.parentId === '1164162449654693973' || x.parentId === '1164162449054892066' || x.parentId === '1164162449654693971').size}`, type: 'WATCHING' }); // CATEGORYID

        checkChannels('1164162449054892062').then(() => { // Whitelist / Allowlist
            checkChannels('1164162445443604497').then(() => { // Public Roleplay

            }).then(() => {
                checkChannels('1164162449654693969'); // Fun
            }).then(() => {
                checkChannels('1164162449054892063') // Stores
            }).then(() => {
                checkChannels('1146142677323235470') // Community 
            }).then(() => {
                checkChannels('1164162449054892066') // hosting 
            }).then(() => {
                checkChannels('1164162449654693971') // YouTuber
            })

        });
    }, 600000);
});
bot.on('messageReactionAdd', (reaction, user) => {
    if (!user.bot) return;
    if (reaction.message.id === '' && reaction.emoji === '👍') reaction.message.guild.members.cache.get(user.id).roles.add(''); // MEMBERID
});
bot.on('channelDelete', channel => {
    if (channel.type === 'GUILD_TEXT') {
        if (db.has(`servers_${channel.parentId}.${channel.id}`)) {
            db.delete(`servers_${channel.parentId}.${channel.id}`);
        };
    };
});

fs.readdirSync('./commands/').forEach((folder) => {
    const files = fs.readdirSync(`./commands/${folder}/`);
    files.filter((f) => f.endsWith('js')).forEach(fileName => {
        const command = require(`./commands/${folder}/${fileName}`);
        bot.slashCommands.set(command.name, command);
        data.push({
            name: command.name,
            description: command.description,
            options: command.options
        });
        console.log(`LOG | (${command.name} | ${folder}) Loaded!`);
    });
});

const servercolor = "#0066ff"
const servername = "Clapzy Developerment"
const staff = "1118915489935130712"
const logs = "1133276424803979345"
const serverlogo = "https://cdn.discordapp.com/attachments/1119201682153279498/1124250897631936552/hi1.gif"

bot.on('interactionCreate', async (interaction) => {
    console.log(interaction.customId)
    if (antiratelimit(interaction) === 'limited') {
        interaction.reply({ content: 'You are being rate limited! Please wait a bit before using this action again.', ephemeral: true });
        db.set(`limited.${interaction.user.id}`, true);
        setTimeout(() => {
            db.delete(`limited.${interaction.user.id}`);
        }, ms('1m'));
        return;
    };
    if (db.has(`limited.${interaction.user.id}`)) return;
    if (interaction.isCommand()) {
        if (!bot.slashCommands.has(interaction.commandName)) return;
        console.log(`LOG | ${interaction} | ${interaction.user.tag} - ${interaction.user.id} | ${interaction.guild.name}`)
        bot.slashCommands.get(interaction.commandName).execute(bot, interaction);
    } else if (interaction.isButton()) {
        if (interaction.customId.startsWith('serverVote')) {
            let cd = await Cooldown.checkCoolDown(interaction.user.id, `${interaction.user.id}_${interaction.channelId}`);

            let totalSeconds = (cd.res.rem / 1000);
            let days = Math.floor(totalSeconds / 86400);
            totalSeconds %= 86400;
            let hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            let minutes = Math.floor(totalSeconds / 60);
            let seconds = Math.floor(totalSeconds % 60);

            let min = minutes;
            let hour = hours;
            let day = days;

            if (days === 0) days = '';
            if (days > 0) days = `${day} days, `;

            if (hours === 0) hours = '';
            if (hours > 0) hours = `${hour} hours, `;

            if (minutes === 0) minutes = '';
            if (minutes > 0) minutes = `${min} minutes, `;

            if (!cd.res.ready) return interaction.reply({ content: `You have to wait **${days}${hours}${minutes}${seconds} seconds**`, ephemeral: true });

            if (interaction.member.roles.cache.has('1146136907940642908')) { // BOOSTERROLEID
                Cooldown.addCoolDown(interaction.user.id, 21600000, `${interaction.user.id}_${interaction.channelId}`);
            } else {
                Cooldown.addCoolDown(interaction.user.id, 43200000, `${interaction.user.id}_${interaction.channelId}`);
            };
            let voteChannel = bot.channels.cache.get('1146136908855005226'); // VOTECHANNELID

            if (db.has(`servers_${interaction.channel.parentId}.${interaction.channelId}.boost`)) {
                db.add(`servers_${interaction.channel.parentId}.${interaction.channelId}.votes`, 2);
            } else {
                db.add(`servers_${interaction.channel.parentId}.${interaction.channelId}.votes`, 1);
            };
            db.add(`users_${interaction.user.id}.votes`, 1);

            let VoteEmbed = new Discord.MessageEmbed()
                .setColor('BLUE')
                .setDescription(`**${interaction.user.tag}** has voted for ${interaction.channel}, Server now has **${db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.votes`)}** Votes!`)
            voteChannel.send({ embeds: [VoteEmbed] });

            let embed = new Discord.MessageEmbed()
                .setAuthor({ name: db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.name`), iconURL: db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.icon`) || interaction.guild.iconURL({ dynamic: true }) })
                .setColor('BLUE')
                .setDescription(db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.description`))
                .setThumbnail(db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.icon`))
                .addFields(
                    { name: 'Discord Link', value: `[Click Here](${db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.link`)})`, inline: true },
                    { name: 'Server Owner', value: `<@${db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.ownerid`)}>`, inline: true },
                    { name: 'Votes', value: `${db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.votes`)}`, inline: true },
                )
                .setTimestamp()
                .setFooter({ text: '© Server List IL' })
            sleep(2000);
            interaction.message.edit({ embeds: [embed] });
            interaction.reply({ content: 'Thank you for voting!', ephemeral: true });
        } else if (interaction.customId == 'verify') {
            let errorembed = new MessageEmbed()
                .setColor("#95A5A6")
                .setDescription("**You have successfully received the role <@&1118915489935130706>**")
            interaction.reply({ embeds: [errorembed], ephemeral: true })
            interaction.member.roles.add('1118915489935130706')
        } else if (interaction.customId.startsWith('staffoptions')) {
            if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({ content: 'You are not allowed to use this command!', ephemeral: true });

            let buttons = new Discord.MessageActionRow()
                .addComponents(new Discord.MessageButton()
                    .setCustomId(`delete-${interaction.customId}`)
                    .setLabel('Delete')
                    .setStyle('DANGER')).addComponents(new Discord.MessageButton()
                        .setCustomId(`doubleboost-${interaction.customId}`)
                        .setLabel('DoubleBoost')
                        .setStyle('PRIMARY'))

            let controlpanel = new Discord.MessageEmbed()
                .setColor('BLUE')
                .setDescription(`\`\`\`Support team ticket controls\`\`\``)
            interaction.reply({ embeds: [controlpanel], components: [buttons], ephemeral: true });
        } else if (interaction.customId.startsWith('delete')) {
            if (!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply({ content: 'You are not allowed to use this command!', ephemeral: true });
            interaction.channel.delete();
        } else if (interaction.customId.startsWith('doubleboost')) {
            if (!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply({ content: 'You are not allowed to use this command!', ephemeral: true });
            if (db.has(`servers_${interaction.channel.parentId}.${interaction.channelId}.boost`)) {
                interaction.channel.setName(interaction.channel.name?.replace('🚀', ''))
                db.delete(`servers_${interaction.channel.parentId}.${interaction.channelId}.boost`);
                interaction.reply({ content: 'DoubleBoost has been disabled!', ephemeral: true });
                return;
            };
            interaction.channel.setName(interaction.channel.name + '🚀');
            db.set(`servers_${interaction.channel.parentId}.${interaction.channelId}.boost`, true);
            interaction.reply({ content: 'DoubleBoost has been enabled!', ephemeral: true });
        } else if (interaction.customId.startsWith('owneroptions')) {
            if (db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.ownerid`) === interaction.member.id) {
                const buttons = new Discord.MessageActionRow()
                    .addComponents(new Discord.MessageButton()
                        .setCustomId(`serverName-${interaction.customId}`)
                        .setLabel('Server Name')
                        .setDisabled(false)
                        .setStyle('PRIMARY')).addComponents(new Discord.MessageButton()
                            .setCustomId(`serverDescription-${interaction.customId}`)
                            .setLabel('Description')
                            .setDisabled(false)
                            .setStyle('PRIMARY')).addComponents(new Discord.MessageButton()
                                .setCustomId(`serverIcon-${interaction.customId}`)
                                .setLabel('Icon')
                                .setDisabled(false)
                                .setStyle('PRIMARY')).addComponents(new Discord.MessageButton()
                                    .setCustomId(`serverLink-${interaction.customId}`)
                                    .setLabel('Link')
                                    .setDisabled(false)
                                    .setStyle('PRIMARY'))

                const controlpanel = new Discord.MessageEmbed()
                    .setColor('DARK_BLUE')
                    .setDescription(`\`\`\`Owner controls\`\`\``)
                interaction.reply({ embeds: [controlpanel], components: [buttons], ephemeral: true });
            } else {
                return interaction.reply({ content: 'You are not allowed to use this command!', ephemeral: true });
            }
        } else if (interaction.customId.startsWith('serverName')) {
            const modal = new Discord.Modal()
                .setCustomId('modal:serverName:' + interaction.channel.id)
                .setTitle('Server Name Change');

            const input = new Discord.TextInputComponent()
                .setCustomId('input:serverName')
                .setLabel('type the new server name here')
                .setMinLength(1)
                .setMaxLength(20)
                .setStyle('SHORT');
            const row = new Discord.MessageActionRow().addComponents(input);
            modal.addComponents(row);
            await interaction.showModal(modal);
        } else if (interaction.customId.startsWith('serverDescription')) {
            const modal = new Discord.Modal()
                .setCustomId('modal:serverDescription:' + interaction.channel.id)
                .setTitle('Server Description Change');

            const input = new Discord.TextInputComponent()
                .setCustomId('input:serverDescription')
                .setLabel('type the new server description here')
                .setStyle('PARAGRAPH');

            const row = new Discord.MessageActionRow().addComponents(input);
            modal.addComponents(row);
            await interaction.showModal(modal);
        } else if (interaction.customId.startsWith('serverIcon')) {
            const modal = new Discord.Modal()
                .setCustomId('modal:serverIcon:' + interaction.channel.id)
                .setTitle('Server Icon Change');

            const input = new Discord.TextInputComponent()
                .setCustomId('input:serverIcon')
                .setLabel('type the new server icon here')
                .setMinLength(1)
                .setMaxLength(200)
                .setStyle('SHORT');

            const row = new Discord.MessageActionRow().addComponents(input);
            modal.addComponents(row);
            await interaction.showModal(modal);
        } else if (interaction.customId.startsWith('serverLink')) {
            const modal = new Discord.Modal()
                .setCustomId('modal:serverLink:' + interaction.channel.id)
                .setTitle('Server Link Change');

            const input = new Discord.TextInputComponent()
                .setCustomId('input:serverLink')
                .setLabel('type the new server link here')
                .setMinLength(1)
                .setMaxLength(50)
                .setStyle('SHORT');

            const row = new Discord.MessageActionRow().addComponents(input);
            modal.addComponents(row);
            await interaction.showModal(modal);
        } else if (interaction.customId.startsWith('requestticket')) {
            const type = interaction.customId.split(':')[2];

            if (interaction.guild.channels.cache.find((x) => x.topic?.toString() === interaction.member.id)) return interaction.reply({ content: `You already have a ticket open!`, ephemeral: true });
            interaction.guild.channels.create(`ticket-${interaction.member.user.tag}`, {
                type: 'GUILD_TEXT',
                topic: interaction.member.id,
                parent: '1129431150625034301', // TICKETCATEGORYID
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: ['VIEW_CHANNEL']
                    },
                    {
                        id: interaction.member.id,
                        allow: ['VIEW_CHANNEL']
                    },
                    {
                        id: staff,
                        allow: ['VIEW_CHANNEL']
                    }
                ],
                reason: `Ticket created by ${interaction.member.user.tag}`
            }).then((c) => {
                const button = new Discord.MessageActionRow().addComponents(
                    new Discord.MessageButton()
                        .setCustomId('ticket:staffoptions')
                        .setLabel('Staff Options')
                        .setStyle('SECONDARY')
                );
                const embed = new MessageEmbed()
                    .setAuthor({
                        name: servername,
                        iconURL: serverlogo
                    })
                    .setColor(servercolor)
                    .setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`**Hello ${interaction.member.user.tag}, Thank you for contacting our support team!\nPlease describe your issue in detail and a staff member will be with you shortly.**`)
                    .addFields(
                        {
                            name: 'Owner',
                            value: `${interaction.member}`
                        },
                        {
                            name: 'Ticket Type',
                            value: `${type}`
                        }
                    )
                    .setTimestamp();
                c.send({ content: `<@&${staff}>`, embeds: [embed], components: [button] });
                interaction.reply({
                    content: `Your ticket has been created! ${c}`,
                    ephemeral: true
                });
                if (logs) {
                    const channel = interaction.guild.channels.cache.get(logs);
                    if (channel) {
                        const embed = new Discord.MessageEmbed()
                            .setAuthor({
                                name: servername + ' | Ticket Logs',
                                iconURL: serverlogo
                            })
                            .setColor(servercolor)
                            .setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true }))
                            .addFields(
                                {
                                    name: 'Action',
                                    value: 'Created',
                                    inline: true
                                },
                                {
                                    name: 'Ticket Name',
                                    value: `\`ticket-${interaction.member.user.tag}\``,
                                    inline: true
                                },
                                {
                                    name: 'Ticket Owner',
                                    value: `${interaction.member}`,
                                    inline: true
                                },
                                {
                                    name: 'Moderator',
                                    value: 'None',
                                    inline: true
                                },
                                {
                                    name: 'Ticket Type',
                                    value: `${type}`,
                                    inline: true
                                }
                            )
                            .setTimestamp();
                        channel.send({ embeds: [embed] });
                    };
                };
            });
        } else if (interaction.customId === 'ticket:staffoptions') {
            if (!interaction.member.roles.cache.has(staff)) return interaction.reply({ content: `You do not have permission to use this button!`, ephemeral: true });
            const buttons = new Discord.MessageActionRow().addComponents(
                new Discord.MessageButton()
                    .setCustomId('ticket:delete')
                    .setLabel('Delete Ticket')
                    .setStyle('DANGER'),
                new Discord.MessageButton()
                    .setCustomId('ticket:savetranscript')
                    .setLabel('Save Transcript')
                    .setStyle('SECONDARY'));
            const buttons2 = new Discord.MessageActionRow().addComponents(
                new Discord.MessageButton()
                    .setCustomId('ticket:rename')
                    .setLabel('Rename')
                    .setStyle('PRIMARY'),
                new Discord.MessageButton()
                    .setCustomId('ticket:adduser')
                    .setLabel('Add User')
                    .setStyle('SUCCESS'),
                new Discord.MessageButton()
                    .setCustomId('ticket:removeuser')
                    .setLabel('Remove User')
                    .setStyle('DANGER')
            );
            const embed = new Discord.MessageEmbed()
                .setAuthor({
                    name: 'Staff Options',
                    iconURL: serverlogo
                })
                .setColor('BLUE')
                .setDescription(`\`\`\`Select an option below to perform an action on this ticket.\`\`\``)
                .setTimestamp();
            interaction.reply({
                embeds: [embed],
                components: [buttons, buttons2],
                ephemeral: true
            })
        } else if (interaction.customId === 'ticket:delete') {
            const deleteModal = new Discord.Modal()
                .setTitle('Delete Ticket')
                .setCustomId('deleteModal');
            const deleteInput = new Discord.TextInputComponent()
                .setCustomId('deleteInput')
                .setLabel('Reason')
                .setStyle('SHORT');
            const row = new Discord.MessageActionRow().addComponents(deleteInput);
            deleteModal.addComponents(row);
            interaction.showModal(deleteModal);
        } else if (interaction.customId === 'ticket:savetranscript') {
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            const content = messages.map((m) => `${m.author.tag} (${m.author.id}): ${m.content.length >= 1 ? m.content : 'EMBED OR FILE'}`).reverse().join('\n------------------\n');
            const attachment = new Discord.MessageAttachment(Buffer.from(content), 'transcript.txt');
            interaction.reply({
                files: [attachment]
            });

            if (logs) {
                const channel = interaction.guild.channels.cache.get(logs);
                if (channel) {
                    const embed = new Discord.MessageEmbed()
                        .setAuthor({
                            name: servername + ' | Ticket Logs',
                            iconURL: serverlogo
                        })
                        .setColor(servercolor)
                        .setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true }))
                        .addFields(
                            {
                                name: 'Action',
                                value: 'Transcript Saved',
                                inline: true
                            },
                            {
                                name: 'Ticket Name',
                                value: `\`ticket-${interaction.channel.name}\``,
                                inline: true
                            },
                            {
                                name: 'Ticket Owner',
                                value: `<@${interaction.channel.topic}>`,
                                inline: true
                            },
                            {
                                name: 'Moderator',
                                value: `${interaction.member}`,
                                inline: true
                            }
                        )
                        .setTimestamp();
                    channel.send({ embeds: [embed], files: [attachment] });
                };
            };
        } else if (interaction.customId === 'ticket:rename') {
            const renameModal = new Discord.Modal()
                .setTitle('Rename Ticket')
                .setCustomId('renameModal');
            const renameInput = new Discord.TextInputComponent()
                .setCustomId('renameInput')
                .setLabel('New Ticket Name')
                .setStyle('SHORT');
            const row = new Discord.MessageActionRow().addComponents(renameInput);
            renameModal.addComponents(row);
            interaction.showModal(renameModal);
        } else if (interaction.customId === 'ticket:adduser') {
            const adduserModal = new Discord.Modal()
                .setTitle('AddUser Ticket')
                .setCustomId('adduserModal');
            const adduserInput = new Discord.TextInputComponent()
                .setCustomId('adduserInput')
                .setLabel('User ID')
                .setStyle('SHORT');
            const row = new Discord.MessageActionRow().addComponents(adduserInput);
            adduserModal.addComponents(row);
            interaction.showModal(adduserModal);
        } else if (interaction.customId === 'ticket:removeuser') {
            const removeuserModal = new Discord.Modal()
                .setTitle('RemoveUser Ticket')
                .setCustomId('removeuserModal');
            const removeuserInput = new Discord.TextInputComponent()
                .setCustomId('removeuserInput')
                .setLabel('User ID')
                .setStyle('SHORT');
            const row = new Discord.MessageActionRow().addComponents(removeuserInput);
            removeuserModal.addComponents(row);
            interaction.showModal(removeuserModal);
        } else if (interaction.customId.startsWith('needed')) {
            const type = interaction.customId.split(':')[1];
            const modal = new Discord.Modal()
                .setTitle('Find a Job')
                .setCustomId('needed:' + type)
            const input = new Discord.TextInputComponent()
                .setCustomId('neededInput')
                .setLabel('Type your message')
                .setStyle('PARAGRAPH');
            const row = new Discord.MessageActionRow().addComponents(input);
            modal.addComponents(row);
            interaction.showModal(modal);
        } else if (interaction.customId.startsWith('blacklist')) {
            if (!interaction.member.roles.cache.has('1164162441853280313')) return interaction.reply({ content: `You do not have permission to use this button!`, ephemeral: true });
            const type = interaction.customId.split(':')[1];
            if (type === 'add') {
                const modal = new Discord.Modal()
                    .setTitle('Blacklist Add')
                    .setCustomId('blacklist:add');

                const userId = new Discord.TextInputComponent()
                    .setCustomId('blacklistUserInput')
                    .setLabel('User ID')
                    .setStyle('SHORT');

                const reason = new Discord.TextInputComponent()
                    .setCustomId('blacklistReasonInput')
                    .setLabel('Reason')
                    .setStyle('PARAGRAPH');

                const proof = new Discord.TextInputComponent()
                    .setCustomId('blacklistProofInput')
                    .setLabel('Proof')
                    .setStyle('PARAGRAPH');

                const row = new Discord.MessageActionRow().addComponents(userId);
                const row2 = new Discord.MessageActionRow().addComponents(reason);
                const row3 = new Discord.MessageActionRow().addComponents(proof);
                modal.addComponents(row, row2, row3);
                interaction.showModal(modal);
            } else if (type === 'remove') {
                const modal = new Discord.Modal()
                    .setTitle('Blacklist Remove')
                    .setCustomId('blacklist:remove');

                const userId = new Discord.TextInputComponent()
                    .setCustomId('blacklistUserInput')
                    .setLabel('User ID')
                    .setStyle('SHORT');

                const row = new Discord.MessageActionRow().addComponents(userId);
                modal.addComponents(row);
                interaction.showModal(modal);
            } else {
                interaction.reply({
                    content: 'Invalid type provided.',
                    ephemeral: true
                });
            };
        };
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'renameModal') {
            const input = interaction.fields.getTextInputValue('renameInput');
            interaction.channel.setName('ticket-' + input);
            interaction.reply({
                content: `Ticket renamed to \`${input}\``,
                ephemeral: true
            });

            if (logs) {
                const channel = interaction.guild.channels.cache.get(logs);
                if (channel) {
                    const embed = new Discord.MessageEmbed()
                        .setAuthor({
                            name: servername + ' | Ticket Logs',
                            iconURL: serverlogo
                        })
                        .setColor(servercolor)
                        .setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true }))
                        .addFields(
                            {
                                name: 'Action',
                                value: 'Renamed',
                                inline: true
                            },
                            {
                                name: 'Ticket Name',
                                value: `\`ticket-${input}\``,
                                inline: true
                            },
                            {
                                name: 'Ticket Owner',
                                value: `<@${interaction.channel.topic}>`,
                                inline: true
                            },
                            {
                                name: 'Moderator',
                                value: `${interaction.member}`,
                                inline: true
                            }
                        )
                        .setTimestamp();
                    channel.send({ embeds: [embed] });
                };
            };
        } else if (interaction.customId === 'adduserModal') {
            const input = interaction.fields.getTextInputValue('adduserInput');
            const member = await interaction.guild.members.fetch(input).catch((err) => { });
            if (!member) return interaction.reply({
                content: 'Invalid user ID provided.',
                ephemeral: true
            });
            interaction.channel.permissionOverwrites.create(member, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true
            });
            interaction.reply({
                content: `Added ${member} to the ticket.`,
                ephemeral: true
            });
            if (logs) {
                const channel = interaction.guild.channels.cache.get(logs);
                if (channel) {
                    const embed = new Discord.MessageEmbed()
                        .setAuthor({
                            name: servername + ' | Ticket Logs',
                            iconURL: serverlogo
                        })
                        .setColor(servercolor)
                        .setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true }))
                        .addFields(
                            {
                                name: 'Action',
                                value: 'Added User',
                                inline: true
                            },
                            {
                                name: 'Ticket Name',
                                value: `\`${interaction.channel.name}\``,
                                inline: true
                            },
                            {
                                name: 'Ticket Owner',
                                value: `<@${interaction.channel.topic}>`,
                                inline: true
                            },
                            {
                                name: 'Moderator',
                                value: `${interaction.member}`,
                                inline: true
                            },
                            {
                                name: 'User Added',
                                value: `${member}`,
                                inline: true
                            }
                        )
                        .setTimestamp();
                    channel.send({ embeds: [embed] });
                };
            };
        } else if (interaction.customId === 'removeuserModal') {
            const input = interaction.fields.getTextInputValue('removeuserInput');
            const member = await interaction.guild.members.fetch(input).catch((err) => { });
            if (!member) return interaction.reply({
                content: 'Invalid user ID provided.',
                ephemeral: true
            });
            interaction.channel.permissionOverwrites.delete(member);
            interaction.reply({
                content: `Removed ${member} from the ticket.`,
                ephemeral: true
            });
            if (logs) {
                const channel = interaction.guild.channels.cache.get(logs);
                if (channel) {
                    const embed = new Discord.MessageEmbed()
                        .setAuthor({
                            name: servername + ' | Ticket Logs',
                            iconURL: serverlogo
                        })
                        .setColor(servercolor)
                        .setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true }))
                        .addFields(
                            {
                                name: 'Action',
                                value: 'Removed User',
                                inline: true
                            },
                            {
                                name: 'Ticket Name',
                                value: `\`${interaction.channel.name}\``,
                                inline: true
                            },
                            {
                                name: 'Ticket Owner',
                                value: `<@${interaction.channel.topic}>`,
                                inline: true
                            },
                            {
                                name: 'Moderator',
                                value: `${interaction.member}`,
                                inline: true
                            },
                            {
                                name: 'User Removed',
                                value: `${member}`,
                                inline: true
                            }
                        )
                        .setTimestamp();
                    channel.send({ embeds: [embed] });
                };
            };
        } else if (interaction.customId === 'deleteModal') {
            const input = interaction.fields.getTextInputValue('deleteInput');
            interaction.channel.send({
                content: `Ticket deleted for reason: \`${input}\`\nThis channel will be deleted in 5 seconds.`,
            });
            setTimeout(() => {
                interaction.channel.delete();
            }, 5_000);
            if (logs) {
                const channel = interaction.guild.channels.cache.get(logs);
                if (channel) {
                    const messages = await interaction.channel.messages.fetch({ limit: 100 });
                    const content = messages.map((m) => `${m.author.tag} (${m.author.id}): ${m.content.length >= 1 ? m.content : 'EMBED OR FILE'}`).reverse().join('\n------------------\n');
                    const attachment = new Discord.MessageAttachment(Buffer.from(content), 'transcript.txt');
                    interaction.reply({
                        files: [attachment]
                    });
                    const embed = new Discord.MessageEmbed()
                        .setAuthor({
                            name: servername + ' | Ticket Logs',
                            iconURL: serverlogo
                        })
                        .setColor(servercolor)
                        .setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true }))
                        .addFields(
                            {
                                name: 'Action',
                                value: 'Deleted',
                                inline: true
                            },
                            {
                                name: 'Ticket Name',
                                value: `\`${interaction.channel.name}\``,
                                inline: true
                            },
                            {
                                name: 'Ticket Owner',
                                value: `<@${interaction.channel.topic}>`,
                                inline: true
                            },
                            {
                                name: 'Moderator',
                                value: `${interaction.member}`,
                                inline: true
                            },
                            {
                                name: 'Reason',
                                value: `${input}`,
                                inline: true
                            }
                        )
                        .setTimestamp();
                    channel.send({ embeds: [embed], files: [attachment] });
                };
            };
        } else if (interaction.customId.startsWith('needed')) {
            let type = interaction.customId.split(':')[1];
            if (type === 'searchwork') type = 'Search Work';
            if (type === 'need') type = 'Job Needed';
            const input = interaction.fields.getTextInputValue('neededInput');
            const channel = interaction.guild.channels.cache.get('1164162806397018152');

            const embed = new Discord.MessageEmbed()
                .setAuthor({
                    name: servername + ' | ' + type,
                    iconURL: serverlogo
                })
                .setColor(type === 'Search Work' ? 'BLUE' : 'GREEN')
                .setDescription(`${input}\nלפניות: ${interaction.member}`)
                .setTimestamp();
            channel.send({ embeds: [embed] });
            interaction.reply({ content: 'Your message has been sent!', ephemeral: true });
        } else if (interaction.customId.startsWith('blacklist')) {
            const type = interaction.customId.split(':')[1];
            const channel = interaction.guild.channels.cache.get('1164162444273393690');
            if (type === 'add') {
                const userId = interaction.fields.getTextInputValue('blacklistUserInput');
                const reason = interaction.fields.getTextInputValue('blacklistReasonInput');
                const proof = interaction.fields.getTextInputValue('blacklistProofInput');
                if (!isUrl(proof)) return interaction.reply({ content: 'Invalid proof URL provided.', ephemeral: true });
                const user = await bot.users.fetch(userId).catch((err) => { });
                if (!user) return interaction.reply({ content: 'Invalid user ID provided.', ephemeral: true });

                if (db.has(`blacklist.${userId}`)) return interaction.reply({ content: 'This user is already blacklisted!', ephemeral: true });

                const embed = new Discord.MessageEmbed()
                    .setAuthor({
                        name: servername + ' | Blacklist',
                        iconURL: serverlogo
                    })
                    .setColor('DARK_RED')
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: 'User', value: `(${user.tag} | ${user})`, inline: false },
                        { name: 'Proof', value: `[לחצו פה](${proof})`, inline: false },
                        { name: 'Reason', value: `${reason}`, inline: false },
                        { name: 'Moderator', value: `(${interaction.user.tag} | ${interaction.user})`, inline: false }
                    ).setTimestamp();
                channel.send({ embeds: [embed] }).then((m) => {
                    db.set(`blacklist.${userId}`, {
                        reason: reason,
                        messageId: m.id,
                        moderator: interaction.member.id
                    });
                });
                interaction.reply({ content: 'User has been blacklisted!', ephemeral: true });
            } else if (type === 'remove') {
                const userId = interaction.fields.getTextInputValue('blacklistUserInput');
                const user = await bot.users.fetch(userId).catch((err) => { });
                if (!user) return interaction.reply({ content: 'Invalid user ID provided.', ephemeral: true });
                const data = db.get(`blacklist.${userId}`);
                if (!data) return interaction.reply({ content: 'This user is not blacklisted!', ephemeral: true });
                db.delete(`blacklist.${userId}`);
                channel.messages.fetch(data.messageId).then((m) => {
                    m.delete().catch((err) => { });
                }).catch((err) => { });
                interaction.reply({
                    content: 'User has been unblacklisted!',
                    ephemeral: true
                });
            } else {
                interaction.reply({
                    content: 'have problem with the code, please contact the developer',
                    ephemeral: true
                });
            };
        } else if (interaction.customId.startsWith('modal:serverName')) {
            const input = interaction.fields.getTextInputValue('input:serverName');
            const channel = interaction.guild.channels.cache.get(interaction.customId.split(':')[2]);
    
            channel.setName(interaction.channel.name.split('-')[0] + '-' + input);
    
            db.set(`servers_${channel.parentId}.${channel.id}.name`, input);
            await updated(interaction);
            interaction.reply({ content: 'Server edited successfully.', ephemeral: true });
        } else if (interaction.customId.startsWith('modal:serverDescription')) {
            const input = interaction.fields.getTextInputValue('input:serverDescription');
            const channel = interaction.guild.channels.cache.get(interaction.customId.split(':')[2]);
    
            db.set(`servers_${channel.parentId}.${channel.id}.description`, input);
            await updated(interaction);
            interaction.reply({ content: 'Server edited successfully.', ephemeral: true });
        } else if (interaction.customId.startsWith('modal:serverIcon')) {
            const input = interaction.fields.getTextInputValue('input:serverIcon');
            const channel = interaction.guild.channels.cache.get(interaction.customId.split(':')[2]);
            if (!isUrl(input)) return interaction.reply({ content: 'Please provide a valid URL!', ephemeral: true })
            db.set(`servers_${channel.parentId}.${channel.id}.icon`, input);
            await updated(interaction);
            interaction.reply({ content: 'Server edited successfully.', ephemeral: true });
        } else if (interaction.customId.startsWith('modal:serverLink')) {
            const input = interaction.fields.getTextInputValue('input:serverLink');
            const channel = interaction.guild.channels.cache.get(interaction.customId.split(':')[2]);
            if (!isUrl(input)) return interaction.reply({ content: 'Please provide a valid URL!', ephemeral: true })
            db.set(`servers_${channel.parentId}.${channel.id}.link`, input);
            await updated(interaction);
            interaction.reply({ content: 'Server edited successfully.', ephemeral: true });
        } else if (interaction.customId.startsWith('modal:serverName')) {
            const input = interaction.fields.getTextInputValue('input:serverName');
            const channel = interaction.guild.channels.cache.get(interaction.customId.split(':')[2]);
    
            channel.setName(interaction.channel.name.split('-')[0] + '-' + input);
    
            db.set(`servers_${channel.parentId}.${channel.id}.name`, input);
            await updated(interaction);
            interaction.reply({ content: 'Server edited successfully.', ephemeral: true });
        } else if (interaction.customId.startsWith('modal:serverDescription')) {
            const input = interaction.fields.getTextInputValue('input:serverDescription');
            const channel = interaction.guild.channels.cache.get(interaction.customId.split(':')[2]);
    
            db.set(`servers_${channel.parentId}.${channel.id}.description`, input);
            await updated(interaction);
            interaction.reply({ content: 'Server edited successfully.', ephemeral: true });
        } else if (interaction.customId.startsWith('modal:serverIcon')) {
            const input = interaction.fields.getTextInputValue('input:serverIcon');
            const channel = interaction.guild.channels.cache.get(interaction.customId.split(':')[2]);
            if (!isUrl(input)) return interaction.reply({ content: 'Please provide a valid URL!', ephemeral: true })
            db.set(`servers_${channel.parentId}.${channel.id}.icon`, input);
            await updated(interaction);
            interaction.reply({ content: 'Server edited successfully.', ephemeral: true });
        } else if (interaction.customId.startsWith('modal:serverLink')) {
            const input = interaction.fields.getTextInputValue('input:serverLink');
            const channel = interaction.guild.channels.cache.get(interaction.customId.split(':')[2]);
            if (!isUrl(input)) return interaction.reply({ content: 'Please provide a valid URL!', ephemeral: true })
            db.set(`servers_${channel.parentId}.${channel.id}.link`, input);
            await updated(interaction);
            interaction.reply({ content: 'Server edited successfully.', ephemeral: true });
        };
    };
});













// All Right Reserved To Clapzy#8061

bot.login('MTE0Nzk2MzMwNTg3NzU2OTU5Ng.GhKF3H.0UJwPzMpCfv_3y5MzLcjfDfkbG3qqKeaYWf8hg');