function sayHello(channelID, userID) {
    bot.postMessage( channelID, `Hello right back at you <@${userID}>!`);
}

///////Write a message every day at 9am 
var j = schedule.scheduleJob({hour: 9, minute: 0, dayOfWeek: new schedule.Range(1, 5)}, function(){
    dailyGreeting();
  });

  function dailyGreeting() {
 
    let message = `Good Morning Beautiful People!\n`;

    getInspiringQuote().then(response => {
        const quote = response.quote;
        const author = response.author;
        const tags = response.tags;

        let quoteMessage = `\n>"${quote}"`
        quoteMessage+= `\n>- ${author} \n\n`

        message+= quoteMessage;
        message+= `Have a lovely day!`;

        let params = {
        
        }
        

        bot.postMessage(channelRestriction, message, params);
    });


  }

  function getInspiringQuote() {
        return new Promise ((resolve, reject )=> {
            axios.get('http://quotes.rest/qod.json?category=inspire')
                .then(response => {
                    // console.log(response.data.contents.quotes);
                    if(response.data.success.total == 1) {
                        resolve(response.data.contents.quotes[0]);
                    }
                })
                .catch( function(error){
                    reject(error);
                });
        });
  }
  