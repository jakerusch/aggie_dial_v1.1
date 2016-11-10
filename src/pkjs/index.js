var Clay = require('pebble-clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig);

var myAPIKey = '';
var startDate = '';
var startTime = '';
var teamName = '';
// var stadium = '';

var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url, false);
  xhr.send();
};

function locationSuccess(pos) {
  // Construct URL
  var weatherUrl = 'https://api.darksky.net/forecast/' + myAPIKey + '/' + pos.coords.latitude + ',' + pos.coords.longitude;
  
//   // to limit runs for Aggie games
//   // Import.io is only free up to 500 hits a month
//   var d = new Date();
//   var h = d.getHours();
  
  // construct football schedule URL
  var scheduleUrl = "";
  
//   if(h>9 && h<11) {
    xhrRequest(scheduleUrl, 'GET',
      function(responseText) {
        var data = JSON.parse(responseText);
        var quantity = data.result.extractorData.data[0].group.length;
        
        for(var i=0; i<quantity; i++) {
          if(data.result.extractorData.data[0].group[i].start_date[0].text) {
            startDate = data.result.extractorData.data[0].group[i].start_date[0].text;
            startDate = shortenDate(startDate);
          }    
          
          if(checkDate(startDate)===true) {
            if(data.result.extractorData.data[0].group[i].start_time[0].text) {
              startTime = data.result.extractorData.data[0].group[i].start_time[0].text;
              
            }    
            if(data.result.extractorData.data[0].group[i].team_name[0].text) {
              teamName = data.result.extractorData.data[0].group[i].team_name[0].text;
            }
//             if(data.result.extractorData.data[0].group[i].stadium[0].text) {
//               stadium = data.result.extractorData.data[0].group[i].stadium[0].text;
//               if(stadium=='Kyle Field') {
//                 stadium = '@Home';
//               }           
//             }
            console.log('startDate = ' + startDate);
            console.log('startTime = ' + startTime);
            console.log('teamName = ' + teamName);
//             console.log('stadium = ' + stadium);
            break;
         }
       }    
    });
//   }
  
  // get forecast through dark sky
  xhrRequest(weatherUrl, 'GET', 
    function(responseText) {
      var json = JSON.parse(responseText);
      
      // round temperature
      var curTemp = Math.round(json.currently.temperature);
      console.log("Temperature in Fahrenheit is " + curTemp);
      
      // icon for weather condition
      var icon = json.currently.icon;
      console.log("Current icon is " + icon);
      
      // assemble dictionary using keys
      var dictionary = {
        "KEY_TEMP": curTemp,
        "KEY_ICON": icon,
        "KEY_START_DATE_TIME": startDate + ' ' + startTime,
        "KEY_TEAM_STADIUM": teamName,
      };
      
      // Send to Pebble
      Pebble.sendAppMessage(dictionary,
        function(e) {
          console.log("Weather info sent to Pebble successfully!");
        },
        function(e) {
          console.log("Error sending weather info to Pebble!");
        }
      );
    }      
  );
}

function locationError(err) {
  console.log("Error requesting location!");
}

function getWeather() {
  navigator.geolocation.getCurrentPosition(
    locationSuccess,
    locationError,
    {timeout: 15000, maximumAge: 60000}
  );
}

// Listen for when the watchface is opened
Pebble.addEventListener('ready', 
  function(e) {
    console.log("PebbleKit JS ready!");

    // Get the initial weather
    getWeather();
  }
);

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
  function(e) {
    console.log("AppMessage received!");
    getWeather();
  }                     
);

// returns true if today or later
function checkDate(date) {
//   console.log('checkDate started with ' + date);
  var today = new Date();
  var dt = new Date(date);
  dt.setFullYear(today.getFullYear());
//   console.log('today = ' + today);
//   console.log('dt = ' + dt);
  if(dt>=today) {
//     console.log('checkDate = TRUE');
    return true;
  }
//   console.log('checkDate = FALSE');
}

function shortenDate(date) {
  var month = date.split(" ")[1];
  var day = date.split(" ")[2];
  var temp;
  switch(month) {
    case "January":
      temp = 1;
      break;
    case "February":
      temp = 2;
      break;
    case "March":
      temp = 3;
      break;
    case "April":
      temp = 4;
      break;
    case "May":
      temp = 5;
      break;
    case "June":
      temp = 6;
      break;
    case "July":
      temp = 7;
      break;
    case "August":
      temp = 8;
      break;
    case "September":
      temp = 9;
      break;
    case "October":
      temp = 10;
      break;
    case "November":
      temp = 11;
      break;
    case "December":
      temp = 12;
      break;
  }
  return temp + '-' + day;
}