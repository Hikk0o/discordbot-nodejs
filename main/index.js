const fs = require('fs');
const config = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Require the necessary discord.js classes
const { Client, Intents, Collection, MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');
const Rcon = require("rcon");

// Create a new client instance
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
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

client.on('interactionCreate', interaction => {
    if (!interaction.isButton()) return;
/*    console.log(interaction)
    console.log(interaction.customId)*/
    try {
        if (interaction.customId === 'accept_rules') {
            console.log(interaction.message.embeds[0].title);

            client.channels.cache.get(interaction.channel.id).messages.fetch(interaction.message.id).then(message => message.delete());

            const info = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel('Сайт сервера')
                        .setURL('https://litweins.space/server/')
                        .setStyle('LINK'),
                );

            let embed = new MessageEmbed()
                .setColor('GREEN')
                .setDescription(`Готово! Ник **\`${interaction.message.embeds[0].title}\`** добавлен в Whitelist!\nПриятной игры!`)
            let channel = client.channels.cache.get(config.WHITELIST_CHANNEL)

            let rcon = new Rcon('141.95.53.180', 25575, 'R8IMStPXBxJv5Gy')
            rcon.on('auth', function() {
                console.log("Authenticated");
                rcon.send(`list`)
                console.log(`list ${interaction.message.embeds[0].title} ${interaction.user.id}`)

            }).on('response', function(str) {
                console.log("Response: " + str);
                channel.send("`*Тип добавил, допилить надо*`")
            }).on('error', function(err) {
                console.log("Error: " + err);
            }).on('end', function() {
                console.log("Connection closed");
                process.exit();
            });

            rcon.connect();



            let member = client.users.cache.get(interaction.user.id);
            member.send({ embeds: [embed], components: [info], ephemeral: true });
        }
        if (interaction.customId === 'deny_rules') {
            client.channels.cache.get(interaction.channel.id).messages.fetch(interaction.message.id).then(message => message.delete());
        }
    } catch (e) {
        let embed = new MessageEmbed()
            .setColor('DARK_RED')
            .setDescription(`Произошла ошибка. Попробуйте ещё раз.`)
        let member = client.users.cache.get(interaction.user.id);
        member.send({ embeds: [embed], ephemeral: true });
        console.log(interaction)
        console.log(e)
    }
});

client.on("guildMemberAdd", (member) => { // EventEmitter, nothing new
    console.log(member.user.username);

});

client.login(config.BOT_TOKEN);