const fs = require('fs');
const config = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Require the necessary discord.js classes
const { Client, Intents, Collection, MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');
const Rcon = require('rcon');

// Create a new client instance
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES]
});
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];
// Creating a collection for commands in client
client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

// When the client is ready, this only runs once
client.once('ready', () => {
    console.log(client.user.username + ' ready!');
    // Registering the commands in the client
    const CLIENT_ID = client.user.id;
    const rest = new REST({
        version: '9'
    }).setToken(config.BOT_TOKEN);
    (async () => {
        try {
            if (!config.GUILD_ID) {
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID), {
                        body: commands
                    },
                );
                console.log('Successfully registered application commands globally');
            } else {
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, config.GUILD_ID), {
                        body: commands
                    },
                );
                console.log('Successfully registered application commands for development guild');
            }
        } catch (error) {
            if (error) console.error(error);
        }
    })();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction, client);
    } catch (error) {
        if (error) console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
/*    console.log(interaction)
    console.log(interaction.customId)*/
    try {
        if (interaction.customId === 'accept_rules') {
            console.log(interaction.message.embeds[0].title);

            client.channels.cache.get(interaction.channel.id).messages.fetch(interaction.message.id).then(message => message.delete());

            let loading_embed = new MessageEmbed()
                .setColor('BLUE')
                .setDescription(`Загрузка... :arrows_counterclockwise:`)

            let member = client.users.cache.get(interaction.user.id);
            let loading_message_id = (await member.send({embeds: [loading_embed], ephemeral: true})).id
            let options = {
                tcp: true       // false for UDP, true for TCP (default true)
            };
            ;
            let rcon = new Rcon(config.SERVER_IP, config.SERVER_PORT, config.SERVER_PASSWORD, options).on('auth', function() {
                console.log("Connection established");
                rcon.send(`bwl add ${interaction.message.embeds[0].title} ${interaction.user.id}`)
            }).on('response', function(str) {
                console.log("response: " + str);
                client.channels.cache.get(interaction.channel.id).messages.fetch(loading_message_id).then(message => message.delete());

                if (str === `**\`${interaction.message.embeds[0].title}\`** уже находится в Whitelist.`) {
                    let embed = new MessageEmbed()
                        .setColor('ORANGE')
                        .setDescription('Никнейм '+str)
                        .setFooter("Это сообщение исчезнет через 15 секунд")
                    let member = client.users.cache.get(interaction.user.id);
                    member.send({ embeds: [embed], ephemeral: true })
                        .then((message)=>setTimeout(()=>message.delete(),15000));

                } else if (str === 'error') {
                    let embed = new MessageEmbed()
                        .setColor('RED')
                        .setDescription(':interrobang: Что-то пошло не так...')
                        .setFooter('-1')
                    let member = client.users.cache.get(interaction.user.id);
                    member.send({ embeds: [embed], ephemeral: true })
                        .then((message)=>setTimeout(()=>message.delete(),15000));
                } else {
                    let embed = new MessageEmbed()
                        .setColor('GREEN')
                        .setDescription(str)
                        .setFooter("Это сообщение исчезнет через 15 секунд")
                    let member = client.users.cache.get(interaction.user.id);
                    member.send({ embeds: [embed], ephemeral: true })
                        .then((message)=>setTimeout(()=>message.delete(),15000));
                    let channel_embed = new MessageEmbed()
                        .addFields(
                            { name: 'Discord Name', value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'ID', value: `${interaction.user.id}`, inline: true },
                        )
                        .setColor('GREEN')
                        .setDescription(str)
                    let channel = client.channels.cache.get(config.WHITELIST_CHANNEL)
                    channel.send({embeds: [channel_embed]})
                }
                rcon.disconnect();

            }).on('error', function(err) {
                console.log("Error: " + err);
                client.channels.cache.get(interaction.channel.id).messages.fetch(loading_message_id).then(message => message.delete());

                let embed = new MessageEmbed()
                    .setColor('RED')
                    .setDescription(`Произошла ошибка. Попробуйте ещё раз.`)
                    .setFooter('0')
                let member = client.users.cache.get(interaction.user.id);
                member.send({ embeds: [embed], ephemeral: true })
                    .then((message)=>setTimeout(()=>message.delete(),15000));
            }).on('end', function() {
                console.log("Connection closed");
            });
            await rcon.connect();

        }
        if (interaction.customId === 'deny_rules') {
            client.channels.cache.get(interaction.channel.id).messages.fetch(interaction.message.id).then(message => message.delete());
        }
    } catch (e) {
        let embed = new MessageEmbed()
            .setColor('DARK_RED')
            .setDescription(`Произошла ошибка. Попробуйте ещё раз.`)
            .setFooter('1')
        let member = client.users.cache.get(interaction.user.id);
        await member.send({embeds: [embed], ephemeral: true})
            .then((message)=>setTimeout(()=>message.delete(),15000));

        console.log(interaction)
        console.log(e)
    }
});

client.on("guildMemberAdd", async member => {
    let role_id = config.BASIC_ROLE_ID;
    let role = member.guild.roles.cache.find(r => r.id === role_id);
    await member.roles.add(role);
    let channel = client.channels.cache.get(config.WHITELIST_CHANNEL)
    channel.send({content: `Привет, <@${member.user.id}>, добро пожаловать! :partying_face:`})

});

client.login(config.BOT_TOKEN);