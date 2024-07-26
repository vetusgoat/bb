const { Permissions, MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

const settingsFilePath = path.join(__dirname, '../data/jail_settings.json'); // Ścieżka do pliku jail_settings.json
let settings = {};

// Funkcja do ładowania ustawień z pliku JSON
function loadSettings() {
    if (fs.existsSync(settingsFilePath)) {
        const data = fs.readFileSync(settingsFilePath);
        settings = JSON.parse(data);
    } else {
        settings = {};
    }
}

// Funkcja do zapisywania ustawień do pliku JSON
function saveSettings() {
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
}

// Ładowanie ustawień przy starcie bota
loadSettings();

module.exports = {
    name: 'jail',
    description: 'Creates or deletes a jail channel and jailed role based on the command.',
    async execute(message, args) {
        // Sprawdzenie uprawnień administratora
        if (!message.member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
            const noPermissionEmbed = new MessageEmbed()
                .setColor('#ff8080')
                .setAuthor({
                    name: 'Permission denied!',
                    iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                })
                .setDescription('You **must** have `MODERATE_MEMBERS` permission to use this command!');

            message.channel.send({ embeds: [noPermissionEmbed] });
            return;
        }

        // Sprawdzenie czy komenda zawiera argument 'delete'
        if (args.includes('delete')) {
            const guildId = message.guild.id;
            const guildSettings = settings[guildId];

            if (!guildSettings || !guildSettings.roleId || !guildSettings.channelId) {
                const notSetupEmbed = new MessageEmbed()
                    .setColor('#ff8080')
                    .setAuthor({
                        name: 'Jail module',
                        iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                    })
                    .setDescription('Jail module is **not** set up!\n> -# You can setup it with `.jail setup` command.');

                message.channel.send({ embeds: [notSetupEmbed] });
                return;
            }

            try {
                // Usunięcie roli "jailed"
                const jailedRole = message.guild.roles.cache.get(guildSettings.roleId);
                if (jailedRole) {
                    await jailedRole.delete();
                }

                // Usunięcie kanału "jail"
                const jailChannel = message.guild.channels.cache.get(guildSettings.channelId);
                if (jailChannel) {
                    await jailChannel.delete();
                }

                // Usunięcie ustawień z pliku jail_settings.json
                delete settings[guildId];
                saveSettings();

                const successEmbed = new MessageEmbed()
                    .setColor('#80ffb6')
                    .setAuthor({
                        name: 'Jail module',
                        iconURL: 'https://cdn.discordapp.com/attachments/1263256844139233380/1263259695343472671/round-check-mark-symbol-with-transparent-background-free-png.png?ex=669995c5&is=66984445&hm=aad4059d5113ce41e5defff704c3d48cb5ede0d6d6f7d01bc1b0b067035b4819&',
                    })
                    .setDescription('Jail module **reseted**, jail channel and role deleted.');

                message.channel.send({ embeds: [successEmbed] });

            } catch (err) {
                console.error('[0x000001] Error deleting jail:', err);
                const noPermissionEmbed = new MessageEmbed()
                    .setColor('#ff8080')
                    .setAuthor({
                        name: 'Error [0x000001]',
                        iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                    })
                    .setDescription('-# Contact the bot developer for more informations!');

                message.channel.send({ embeds: [noPermissionEmbed] });
            }

        } else if (args.includes('setup')) {
            // Prośba o potwierdzenie
            const confirmationEmbed = new MessageEmbed()
                .setColor('#fffbb6')
                .setAuthor({
                    name: 'Setting up jail module',
                    iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273681614929983/Bez_eeee3.png?ex=6699a2cc&is=6698514c&hm=f824085f6913c40dcaf027c2b4926afb056c9d29ab0f2ef8371021ee4fe75e70&',
                })
                .setDescription('This command will create a channel called `jail` and role called `jailed`\n-# > Type "yes" if you want to complete the jail module configuration');

            const msg = await message.channel.send({ embeds: [confirmationEmbed] });

            try {
                const filter = m => m.author.id === message.author.id && m.content.toLowerCase() === 'yes';
                const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });

                if (collected.size === 0) {
                    msg.delete();
                    return;
                }

                // Utworzenie roli jailed, jeśli nie istnieje
                let jailedRole = message.guild.roles.cache.find(role => role.name === 'jailed');
                if (!jailedRole) {
                    jailedRole = await message.guild.roles.create({
                        name: 'jailed',
                        color: '#000001', // Czarny kolor
                        permissions: [],
                    });
                }

                // Utworzenie kanału jail, jeśli nie istnieje
                let jailChannel = message.guild.channels.cache.find(channel => channel.name === 'jail');
                if (!jailChannel) {
                    jailChannel = await message.guild.channels.create('jail', {
                        type: 'text',
                        permissionOverwrites: [
                            {
                                id: message.guild.id,
                                deny: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                            {
                                id: jailedRole.id,
                                allow: [Permissions.FLAGS.VIEW_CHANNEL],
                            },
                        ],
                    });

                    // Ustawienie uprawnień dla wszystkich kanałów na serwerze
                    await Promise.all(message.guild.channels.cache.map(async (channel) => {
                        try {
                            if (channel.id !== jailChannel.id) {
                                await channel.permissionOverwrites.edit(jailedRole, {
                                    VIEW_CHANNEL: false,
                                });
                            }
                        } catch (error) {
                            console.error(`[0x000002] Error updating permissions for channel ${channel.name}:`, error);
                            const noPermissionEmbed = new MessageEmbed()
                                .setColor('#ff8080')
                                .setAuthor({
                                    name: 'Error [0x000002]',
                                    iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                                })
                                .setDescription(`-# Error updating permissions for channel ${channel.name}\n\`\`\`${error}\`\`\``);

                            message.channel.send({ embeds: [noPermissionEmbed] });
                        }
                    }));

                    // Zapisanie ustawień do jail_settings.json
                    settings[message.guild.id] = {
                        channelId: jailChannel.id,
                        roleId: jailedRole.id,
                    };
                    saveSettings();

                    const successEmbed = new MessageEmbed()
                        .setColor('#80ffb6')
                        .setAuthor({
                            name: 'Jail module',
                            iconURL: 'https://cdn.discordapp.com/attachments/1263256844139233380/1263259695343472671/round-check-mark-symbol-with-transparent-background-free-png.png?ex=669995c5&is=66984445&hm=aad4059d5113ce41e5defff704c3d48cb5ede0d6d6f7d01bc1b0b067035b4819&',
                        })
                        .setDescription('Jail module setup successfully!\n> -# You can now jail users with `.jail <mention>` command.');

                    message.channel.send({ embeds: [successEmbed] });

                } else {
                    const noPermissionEmbed = new MessageEmbed()
                        .setColor('#ff8080')
                        .setAuthor({
                            name: 'Ooooops',
                            iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                        })
                        .setDescription(`The jail module is already configured!\n-# Contact the bot developer if you think it's a mistake!`);

                    message.channel.send({ embeds: [noPermissionEmbed] });
                    return;
                }

            } catch (err) {
                console.error('[0x000003] Error setting up jail:', err);
                const noPermissionEmbed = new MessageEmbed()
                    .setColor('#ff8080')
                    .setAuthor({
                        name: 'Error [0x000003]',
                        iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                    })
                    .setDescription(`\`\`\`${err}\`\`\`\n-# Contact the bot developer for more informations!`);

                message.channel.send({ embeds: [noPermissionEmbed] });
            }

        } else {
            // Sprawdzenie czy użytkownik oznaczył kogoś
            if (message.mentions.users.size > 0) {
                const mentionedUser = message.mentions.members.first();

                try {
                    // Sprawdzenie czy moduł jail jest skonfigurowany
                    const guildId = message.guild.id;
                    const guildSettings = settings[guildId];

                    if (!guildSettings || !guildSettings.roleId || !guildSettings.channelId) {
                        const notSetupEmbed = new MessageEmbed()
                            .setColor('#ff8080')
                            .setAuthor({
                                name: 'Jail module',
                                iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                            })
                            .setDescription('Jail module is **not** set up!\n> -# You can setup it with `.jail setup` command.');

                        message.channel.send({ embeds: [notSetupEmbed] });
                        return;
                    }

                    // Sprawdzenie czy użytkownik już ma rolę "jailed"
                    const jailedRole = message.guild.roles.cache.find(role => role.name === 'jailed');
                    if (jailedRole && mentionedUser.roles.cache.has(jailedRole.id)) {
                        const notSetupEmbed = new MessageEmbed()
                            .setColor('#ff8080')
                            .setAuthor({
                                name: 'Jail module',
                                iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                            })
                            .setDescription('The mentioned user is already jailed.');

                        message.channel.send({ embeds: [notSetupEmbed] });
                        return;
                    }

                    // Sprawdzenie czy użytkownik ma wyższą rangę niż wykonujący komendę
                    if (mentionedUser.roles.highest.comparePositionTo(message.member.roles.highest) >= 0) {
                        const noPermissionEmbed = new MessageEmbed()
                            .setColor('#ff8080')
                            .setAuthor({
                                name: 'Permission denied!',
                                iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                            })
                            .setDescription('You cannot jail a user with a higher or equal role compared to you.');

                        message.channel.send({ embeds: [noPermissionEmbed] });
                        return;
                    }

                    // Nadanie roli "jailed" użytkownikowi
                    if (jailedRole && mentionedUser) {
                        await mentionedUser.roles.add(jailedRole);

                        // Wysłanie wiadomości do kanału jail
                        const jailChannel = message.guild.channels.cache.get(guildSettings.channelId);
                        if (jailChannel) {
                            await jailChannel.send(`${mentionedUser.user} has been jailed by ${message.author}! ⛓️\n-# If you think this is a mistake or you think it is unfair, please contact the staff on this channel.`);

                            const successEmbed = new MessageEmbed()
                                .setColor('#80ffb6')
                                .setAuthor({
                                    name: 'Jailed!',
                                    iconURL: 'https://cdn.discordapp.com/attachments/1263256844139233380/1263259695343472671/round-check-mark-symbol-with-transparent-background-free-png.png?ex=669995c5&is=66984445&hm=aad4059d5113ce41e5defff704c3d48cb5ede0d6d6f7d01bc1b0b067035b4819&',
                                })
                                .setDescription(`-# > User ${mentionedUser.user.tag} has been jailed.`);

                            message.channel.send({ embeds: [successEmbed] });
                        } else {
                            const notSetupEmbed = new MessageEmbed()
                                .setColor('#ff8080')
                                .setAuthor({
                                    name: 'Jail module',
                                    iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                                })
                                .setDescription('-# Jail channel is deleted, reset the module and set it again.');

                            message.channel.send({ embeds: [notSetupEmbed] });
                        }

                    } else {
                        const noPermissionEmbed = new MessageEmbed()
                            .setColor('#ff8080')
                            .setAuthor({
                                name: 'Error [0x000004]',
                                iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                            })
                            .setDescription('-# Contact the bot developer for more informations!');

                        message.channel.send({ embeds: [noPermissionEmbed] });
                    }

                } catch (err) {
                    const noPermissionEmbed = new MessageEmbed()
                        .setColor('#ff8080')
                        .setAuthor({
                            name: 'Error [0x000005]',
                            iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                        })
                        .setDescription(`-# Error jailing user!\n\`\`\`${err}\`\`\``);

                    message.channel.send({ embeds: [noPermissionEmbed] });
                }

            } else {
                // Komunikat jeśli nie podano żadnego argumentu 'set', 'delete' ani oznaczenia użytkownika
                const commandEmbed = new MessageEmbed()
                    .setColor('#fffbb6')
                    .setAuthor({
                        name: 'Help with jail module',
                        iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273681614929983/Bez_eeee3.png?ex=6699a2cc&is=6698514c&hm=f824085f6913c40dcaf027c2b4926afb056c9d29ab0f2ef8371021ee4fe75e70&',
                    })
                    .addFields(
                        { name: '.jail setup', value: '```Explanation: configures the jail module, this is the first command you need to enter.```', inline: false },
                        { name: '.jail delete', value: '```Explanation: Resets the configuration, namely removes the "jail" channel and role, also unjails everyone.```', inline: false },
                        { name: '.jail', value: '```Syntax: jail <mention>\nExample: jail @clyde```', inline: false },
                        { name: '.unjail ', value: '```Syntax: unjail <mention>\nExample: unjail @clyde```', inline: false },
                    );

                message.channel.send({ embeds: [commandEmbed] });
            }
        }
    },
};
