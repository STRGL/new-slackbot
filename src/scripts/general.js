const SlackBot = require('slackbots');
const axios = require('axios');
const schedule = require('node-schedule');
const {Wit, log} = require('node-wit');

//Slackbot setup
const bot = new SlackBot({
    //STRGL
    token: botToken,
    
    //Production Environment
    // token: productionBotToken,
    name: 'racbot'


});

//Wit AI setup
const witService = new Wit({
    accessToken: witToken,
    logger: new log.Logger(log.DEBUG)
});

let channelRestriction = 'development';
let botID = undefined;
let channels = [];

// Start Handler
bot.on('start', () => {
    const params = {
        icon_emoji: ':smiley:'
    };
    //function gets all the users and looks up the name of the bot in order to get the bot's ID
    function getBotID() {
        const users = bot.getUsers();
        users._value.members.forEach(user => {
            if(user.real_name == 'Racbot') {
                botID = user.id;
            }
        })
    }

    //gets all channels and stores them in an array alongside their id
    function getChannels() {
        const channel = bot.getChannels();
        channel._value.channels.forEach(channel => {
            channels.push({[channel.name]: channel.id});
        });

        console.log(channels);
    }

    getBotID();
    getChannels();

    //gets the restricted channel if it exists and replaces the string name of the channel with the ID
    if(channelRestriction != undefined) {
        channels.forEach(function(element) {
            if(element[channelRestriction] != undefined) {
                Object.entries(element).forEach(([key, value]) => {
                    channelRestriction = value;
                });
            }
        })
    }

    bot.postMessageToChannel('development', 'Ready to Rac and Roll!', params);

});

//Error Handler
bot.on('error', (err) => console.log(err));


//Message Handler
bot.on('message', (data) => {
    if(channelRestriction != undefined) {
        if(data.channel == channelRestriction) {   
            if(data.type != 'message'){
                return;
            } else if (botID != undefined) {
                handleMessage(data);
            }
        }
    } else {
        if(data.type != 'message'){
            return;
        } else if (botID != undefined) {
            handleMessage(data);
        }
    }
});

//

//This should be a foreach loop in case a message contains multiple requests. But how to differentiate between asking for several different things and asking for the weather today? :thinking_face:
//Responds to message sent in channel
function handleMessage(data) {
    if((data.bot_id == undefined) && (data.text.includes(`<@${botID}>`))) {
        witService.message(data.text, {})
        .then((witResponse) =>{ 
           
            //  THIS ONLY WORKS IF EVERYTHING IS AN INTENT. USING WIT.AI BUILT IN METHODS WON'T REGISTER
            if((witResponse.entities.intent !== undefined) && (witResponse.entities.intent[0].confidence > 0.7)) {
                console.log(witResponse.entities.intent[0].value);
                switch(witResponse.entities.intent[0].value) {
                    case "greeting":
                        sayHello(data.channel, data.user);
                    break;

                    case "weather":
                        postWeather(data.channel, data.user, witResponse);
                        // console.log(witResponse);
                    break;

                    case "music":
                        getCurrentTrack(data.channel, data.user);
                    break;

                    case "travel":
                        console.log("This a travel event");
                    break;

                    case "wifi":
                        wifiCode(data.channel, data.user);
                    break;

                    case "pitch":
                        elevatorPitch(data.channel);
                    break;

                    default:
                        const options = {
                            channelID: data.channel,
                            userID: data.user,
                        }
    
                        unknownRequest(options);
                }

            } else {
                const options = {
                    channelID: data.channel,
                    userID: data.user,
                }

                unknownRequest(options);
            }

        }).catch(console.error);

    }
}

//Deal with unknown intent
function unknownRequest(options) {
    const params = {
        icon_emoji: ':disappointed:'
    }
    bot.postMessage(options.channelID, `Sorry <@${options.userID}> I don't know how to help you just yet. Give me a few days and I'll learn how to better respond to your query! Thanks for understanding`, params);
    if(options.confidenceLevel){
        console.log(options.confidenceLevel);
    }
}

