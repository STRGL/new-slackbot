// Post current weather
function postWeather(channelID, userID, witResponse) {
  // If the response has a date entity in it, use that date when searching for the forecast
  if (witResponse.entities.hasOwnProperty('datetime')) {
    console.log('datetime:', witResponse.entities.datetime);

    getForecast()
      .then(function(weatherForecast) {
        const requestedDate = new Date(witResponse.entities.datetime[0].value);
        const formattedRequestedDate = `${requestedDate.getDay()}/${requestedDate.getMonth()}/${requestedDate.getFullYear()}`;
        if (witResponse.entities.datetime[0].grain == 'day') {
          const requestedForecast = weatherForecast.filter(function(forecast) {
            const currentDate = new Date(forecast.dt_txt);
            const formattedCurrentDate = `${currentDate.getDay()}/${currentDate.getMonth()}/${currentDate.getFullYear()}`;

            if (formattedRequestedDate == formattedCurrentDate) {
              return true;
            }
            // console.log(new Date(currentDate).toDateString == requestedDate.toDateString);
          });

          console.log('requestedForecast:', requestedForecast);
          if (requestedForecast.length != 0) {
            // initialise empty arrays for storing of forecast values
            maxTemp = [];
            currentTemp = [];
            weatherID = [];
            let message = '';
            rain = [];

            // loop through the forecast
            requestedForecast.forEach(function(element) {
              // turn UTC date into pretty date
              const day = new Date(element.dt_txt);
              const hour = day.getHours();
              maxTemp.push(element.main.temp_max);
              currentTemp.push(element.main.temp_min);
              weatherID.push(element.weather[0].id);

              // if rain element isn't empty, push the hour of the date (since we only are returning one day) and the amount of rainfall for those 3hrs
              if (element.rain != undefined) {
                rain.push({ [hour]: element.rain['3h'] });
              }
            });

            const highestMaxTemp = Math.floor(Math.max(...maxTemp));
            const averageCurrentTemp = Math.floor(
              currentTemp.reduce((a, b) => a + b, 0) / currentTemp.length
            );
            const dayIndex = requestedDate.getDay();

            const params = {};

            const midPoint = returnMode(weatherID);

            params.icon_emoji = setWeatherParams(midPoint);

            message += `On ${
              daysOfTheWeek[dayIndex]
            } the ${requestedDate.getDate()}${nth(
              requestedDate.getDate()
            )}, the temperature will be a maximum of ${highestMaxTemp} degrees and an average of ${averageCurrentTemp} degrees. `;

            // Figure out the average amount of rainfall
            if (rain.length > 1) {
              times = [];
              rainfall = [];
              rain.forEach(function(element) {
                Object.entries(element).forEach(([key, value]) => {
                  console.log(`Value: ${value} Key: ${key}`);
                  if (value != undefined) {
                    times.push(key);
                    rainfall.push(value);
                  }
                });
              });

              console.log(rainfall);

              const rainStartTime = Math.min(...times);
              let rainFinishTime = Math.max(...times) - 3;
              const averageRainfall =
                Math.floor(
                  (rainfall.reduce((a, b) => a + b, 0) / rainfall.length) * 100
                ) / 100;

              if (rainStartTime == rainFinishTime) {
                rainFinishTime += 3;
              }

              message += `Between ${rainStartTime}:00 and ${rainFinishTime}:00 expect an average of ${averageRainfall}mm of rain. Maybe bring an umbrella? :umbrella_with_rain_drops:`;
            } else if (rain.length == 1) {
              times = [];
              rainfall = [];
              rain.forEach(function(element) {
                Object.entries(element).forEach(([key, value]) => {
                  console.log(`Value: ${value}Key: ${key}`);
                  times.push(key);
                  if (value != undefined) {
                    rainfall.push(value);
                  } else {
                    rainfall.push(0);
                  }
                });
              });

              const rainStartTime = Math.min(...times) - 3;
              const rainFinishTime = Math.max(...times) - 2;

              message += `Between ${rainStartTime}:00 and ${rainFinishTime}:00 expect around ${
                rainfall[0]
              }mm of rain.`;
            } else {
              message += `No rain expected at the moment, but then again, it is England!`;
            }

            console.log(`Weather ID: ${weatherID}`);
            console.log(setWeatherParams(weatherID[5]));
            bot.postMessage(channelID, message, params);
          } else {
            bot.postMessage(
              channelID,
              `Sorry <@${userID}>, I can't see that far into the future! 5 days is my current maximum :disappointed:`
            );
          }
        } else if (witResponse.entities.datetime[0].grain == 'week') {
        } else {
        }
      })
      .catch(function(error) {
        const params = {
          icon_emoji: ':robot_face:',
        };
        bot.postMessage(
          channelID,
          `Sorry something went wrong.  :disappointed:`,
          params
        );
        console.error(error);
      });
    // if there is no date entity then just run the GetCurrentWeather Function
  } else {
    getCurrentWeather().then(function(values) {
      temp = values.temperature;
      forecast = values.forecast;

      const params = {};

      params.icon_emoji = setWeatherParams(values.weatherID);

      bot.postMessage(
        channelID,
        `Hey <@${userID}>! Looks like ${forecast} at the moment. Current temperature of ${temp}` +
          ' degrees :smile:',
        params
      );
    });
  }
}

// Get the Current Weather
function getCurrentWeather() {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `http://api.openweathermap.org/data/2.5/weather?id=2643743&units=metric&APPID=${weatherToken}`
      )
      .then(response => {
        const temperature = Math.round(response.data.main.temp);
        const forecast = response.data.weather[0].description;
        const weatherID = response.data.weather[0].id;

        const values = {};
        values.temperature = temperature;
        values.forecast = forecast;
        values.weatherID = weatherID;

        resolve(values);
      })
      .catch(function(error) {
        console.log(error);
        reject(error);
      });
  });
}

// Get the five day forecast
function getForecast() {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `http://api.openweathermap.org/data/2.5/forecast?id=2643743&units=metric&APPID=${weatherToken}`
      )
      .then(response => {
        // console.log(response.data.list);
        resolve(response.data.list);
      })
      .catch(function(error) {
        console.log(error);
        reject(error);
      });
  });
}

// translate the returned weatherID into an appropriate emoji for the message
function setWeatherParams(average) {
  const weatherID = Number(average);
  console.log('Average', average);
  switch (true) {
    case weatherID >= 200 && weatherID < 300:
      return ':thunder_cloud_and_rain:';
    case weatherID >= 300 && weatherID < 400:
      return ':partly_sunny_rain:';
    case weatherID >= 500 && weatherID < 600:
      return ':rain_cloud:';
    case weatherID >= 600 && weatherID < 700:
      return ':snow_cloud:';
    case weatherID >= 700 && weatherID < 800:
      return ':fog:';
    case weatherID === 800:
      return ':sunny:';
    case weatherID === 801:
      return ':sun_small_cloud:';
    case weatherID === 80:
      return ':cloud:';
    default:
      return ':thermometer:';
  }
}
