const {Sonos} = require('sonos');
const device = new Sonos('172.22.87.47');
const qs = require('qs');

//Get the current track playing on the sonos
function getCurrentTrack(channel, user) {
    device.currentTrack()
    .then(track => {
        // console.log(track);


        var spotifyID = track.uri.substring(
            track.uri.lastIndexOf("track%3a") + 8, 
            track.uri.lastIndexOf("?sid=")
        );
        
        getToken().then(function(token) {
            axios({
                method: 'get',
                url: 'https://api.spotify.com/v1/tracks/' + spotifyID + '?market=GB',
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }).then(function(response) {

                // console.log(response.data.album.images[0].url);
                params = {
                    "attachments": [
                        {
                            "fallback": `${track.title} by ${track.artist}`,
                            "color": "#3E6A9F",
                            "author_name": track.album,
                            "author_link": response.data.album.external_urls.spotify,
                            "title": track.title,
                            "title_link": response.data.external_urls.spotify,
                            "text": track.artist,
                            "thumb_url": response.data.album.images[0].url,
                            "footer": "Node Sonos",
                            "footer_icon": "https://roaringapps.s3.amazonaws.com/assets/icons/1373932614109-sonos-desktop-controller.jpg",
                        }
                    ]
                };
                bot.postMessage(channel, `Currently playing:`, params);
            //Catch for the get request
            }).catch(function(error){
                console.log(error);
            });
        //Catch for the token request
        }).catch(function(error) {
            console.log(error);
        });


    }).catch(function(error) {

        console.log(error);

    });
}

//Constantly posts the next track to the music channel
// device.on('NextTrack', track => {
//     const params = {
//         icon_emoji: ':musical_note:' 
//     }

//     bot.postMessageToChannel('music', `The next track will be ${track.title} by ${track.artist}`, params);
// });

function getToken() {
    return new Promise ((resolve, reject )=> {
        const data = {
            'grant_type': 'client_credentials'
        }
        axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                "Authorization": "Basic " + spotifyAuthorisation
            },
            data: qs.stringify(data)


        }).then(function(response) {
            console.log(response.data.access_token);
            resolve(response.data.access_token);
        }).catch(function(error){   
            console.log(error);
            reject(error);
        });
    });
}   

