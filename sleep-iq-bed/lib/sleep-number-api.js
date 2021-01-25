/*
 * The following is an API implementation srated from 
 * https://github.com/DeeeeLAN/homebridge-sleepiq/blob/HEAD/API.js (tons of thanks)
 * I also have added footwarmer API 
 */

const axios = require('axios')

const SLEEP_NUMBER_API_ENDPOINT = 'https://api.sleepiq.sleepnumber.com/rest/'

class SleepNumberAPI {
    constructor (username, password) {
	    this.username = username
	    this.password = password

	    this.bedID = ''
		this.userID = ''
	    this.key = ''
		this.cookie = null
      
	    this.json = ''
      
	    this.bedSide = 'L'
	    this.defaultBed = 0 // change if you want the class methods to default to a different bed in your datasets.
    }
  
      // 'L' or 'R'
    setBedSide(side) {
      this.bedSide = side;
      console.log('Bed side is set to ', side)
    }

    genURL (url, method, body=null, callback=null, additional_qs={}) {
      var params = additional_qs; additional_qs['_k'] = this.key;
	    return axios(
	      {
	        method: method,
	        url: url,
          baseURL: SLEEP_NUMBER_API_ENDPOINT,
          headers: {cookie: this.cookie },
          params: params,
		      data: JSON.stringify(body),
	      })
        .then(response => {
          this.json = response.data;
          if (this.cookie == null) {
            this.cookie = response.headers['set-cookie']
          }

 //         console.log('CONFIG: ', response.config)
          console.log('DATA: ',  response.data)        
  
          if (callback) {
            callback(response.data)
          }
        })
        .catch(error => {
          console.log('ERROR: ', error.message)
          console.log('CONFIG: ', error.config)
          console.log('CONFIG: ', error.stack)
        }
      )
    }     

    genBedURL(url, method='PUT', body=null, callback=null) {
  	  return this.genURL('bed/'+this.bedID+url, method, body, callback);
    }
    
    /*
     * Sample response
	  {
	    "userId":"",
	    "key":"",
	    "registrationState":13, // not sure what registrationState is used for
	    "edpLoginStatus":200,
	    "edpLoginMessage":"not used"
	  }
	  */
    login (callback=null) {
        this.cookie = null
        return this.genURL('login', 
                        'PUT', 
                        {'login': this.username, 'password': this.password}, 
                        function (data) {
		                      this.key = this.json.key
                          this.userID = this.json.userID
                          if (callback) {
                            callback(data);
                          }
                        }.bind(this));
    }

   /*
     * Sample response
	  {
    sleepers: [
      {
        firstName: 'John',
        active: true,
        emailValidated: true,
        gender: 1,
        isChild: false,
        bedId: '-12345678901234567',
        birthYear: '1972',
        zipCode: '11111',
        timezone: 'US/Pacific',
        privacyPolicyVersion: 1,
        duration: 0,
        weight: 250,
        sleeperId: '12345623456778',
        firstSessionRecorded: '2019-08-07T18:50:50Z',
        height: 72,
        licenseVersion: 8,
        username: 'john.doe@gmail.com',
        birthMonth: 12,
        sleepGoal: 480,
        accountId: '-345678900222',
        isAccountOwner: true,
        email: 'john.doe@gmail.com',
        lastLogin: '2021-01-13T21:38:27Z',
        side: 0
      },
      {
        firstName: 'Jane',
        active: true,
        emailValidated: true,
        gender: 0,
        isChild: false,
        bedId: '-12345678901234567',
        birthYear: '1972',
        zipCode: '12345',
        timezone: 'US/Pacific',
        privacyPolicyVersion: 1,
        duration: 0,
        weight: 162,
        sleeperId: '-1234567891234567',
        firstSessionRecorded: '2019-08-08T05:16:09Z',
        height: 66,
        licenseVersion: 8,
        username: 'jane.doe@gmail.com',
        birthMonth: 1,
        sleepGoal: 480,
        accountId: '-345678990',
        isAccountOwner: false,
        email: 'jane.doe@gmail.com',
        lastLogin: '2020-08-12T21:55:15Z',
        side: 1
      }
    ]
    */
  sleeper(callback=null) {
      return this.genURL('/sleeper', 
                        'GET',
                        null,
                        function (data) {
                          if (callback) {
                            callback(data.sleepers);
                          }
                        }.bind(this));
    }
  
	/*
	 * Has to be called after login and before anything else
	 * Sample response
	 
	  {
	    "beds":[ // array of beds
	        {"status":1,
	          "bedId":"", // used to identify each bed
	           "leftSide": {
	             "isInBed":false, // used in homebridge plugin
	             "alertDetailedMessage":"No Alert",
	             "sleepNumber":30, // used in homebridge plugin
	             "alertId":0,
	             "lastLink":"00:00:00",
	              "pressure":1088
	           },
	           "rightSide": {
	              "isInBed":false,
	              "alertDetailedMessage":"No Alert",
	              "sleepNumber":40,
	              "alertId":0,
	              "lastLink":"00:00:00",
	              "pressure":1298
	           }
	        }
	     ]
	  }
	*/
    bedStatus (callback=null) {
        return this.genURL('bed/familyStatus', 
                        'GET', 
			                  null,
                        function (data) {
                          if (this.json.beds) {
                            var bed = this.json.beds[this.defaultBed]
    			                  this.bedID = bed.bedId

                            if (callback) {
                              callback(bed);
   		                      }
                          }
                        }.bind(this));
    }

    /*
		{ 
          "footWarmingStatusLeft": 0,
          "footWarmingStatusRight": 0,
          "footWarmingTimerLeft": 0,
          "footWarmingTimerRight":0
        }
    */
  	footWarmingStatus (callback=null) {
		  return this.genBedURL('/foundation/footwarming', 
                        'GET',
                        null,
                        function (data) {
                          if (callback) {
                            callback(this.json)
                          }
                        }.bind(this));
    }

    /*
     * Sample Response
      {
        "fsCurrentPositionPresetRight": "Flat",
        "fsNeedsHoming": false,
        "fsRightFootPosition": "00",
        "fsLeftPositionTimerLSB": "00",
        "fsTimerPositionPresetLeft": "No timer running, thus no preset to active",
        "fsCurrentPositionPresetLeft": "Zero G",
        "fsLeftPositionTimerMSB": "00",
        "fsRightFootActuatorMotorStatus": "00",
        "fsCurrentPositionPreset": "54",
        "fsTimerPositionPresetRight": "No timer running, thus no preset to active",
        "fsType": "Split King",
        "fsOutletsOn": false,
        "fsLeftHeadPosition": "00",
        "fsIsMoving": true,
        "fsRightHeadActuatorMotorStatus": "00",
        "fsStatusSummary": "45",
        "fsTimerPositionPreset": "00",
        "fsLeftFootPosition": "00",
        "fsRightPositionTimerLSB": "00",
        "fsTimedOutletsOn": false,
        "fsRightHeadPosition": "00",
        "fsConfigured": true,
        "fsRightPositionTimerMSB": "00",
        "fsLeftHeadActuatorMotorStatus": "01",
        "fsLeftFootActuatorMotorStatus": "00"
      }
    */
  
    foundationStatus (callback=null) {
		  return this.genBedURL('/foundation/status', 
                        'GET',
                        null,
                        function (data) {
                          if (callback) {
                            callback(this.json)
                          }
                        }.bind(this));
    }

	// date format: 'YYYY-MM-DD'
	// interval format: 'D1' (1 day), 'M1' (1 month), etc.
    sleepData (date, interval, callback=null) {
      return this.genURL('/sleepData', 
                        'GET', 
			                  null,
                        function (data) {
                            if (callback) {
                              callback(data);
                            console.log(JSON.stringify(data, null, 3))
   		                      }
                        }.bind(this), 
                        {date: date, interval:interval, sleeper: this.userID});
    }
  
  	/*
     * Sample response
      {"sleepers":[
        {"days":[
          {"date":"2018-08-01",
          "sliceList":[
          {"outOfBedTime":0,
          "restfulTime":0,
          "restlessTime":0,
          "type":0},
          {"outOfBedTime":0,
          "restfulTime":0,
          "restlessTime":0
          "type": 0}],
       "sleeperId":"",
       "sliceSize":600}]}
     */

    // date format: 'YYYY-MM-DD'
    // can optionally add a format:'csv' argument to get back a csv version of the data

    sleepSliceData (date, callback=null) {
      return this.genURL('/sleepSliceData', 
                        'GET', 
			                  null,
                        function (data) {
                            if (callback) {
                              callback(data);
   		                      }
                        }.bind(this), 
                        {date: date, sleeper: this.userID});
    }
 
    // num is any num in FAVORITE = 1, READ = 2, WATCH_TV = 3, FLAT = 4, ZERO_G = 5, SNORE = 6
    preset (num, callback=null) {
	    return this.genBedURL('/foundation/preset', 
                            'PUT',
                            {speed: 0, side: this.bedSide, preset: num}, 
                            callback)
    }

    // num is any number in the range [0-100]. Actuator is either 'F' or 'H' (foot or head).
    adjust (actuator, num, callback=null) {
	    return this.genBedURL('/foundation/adjustment/micro', 
                            'PUT',
                            {speed: 0, side: this.bedSide, position: num, actuator: actuator}, 
                            callback);
    }

    // temp [0-100], timer [1-600]
    footwarming (temp, timer, callback=null) {
	    return this.genBedURL('/foundation/footwarming', 
                            'PUT',
                            this.bedSide === 'L' ? 
                                { footWarmingTempLeft: temp, footWarmingTimerLeft: timer } : 
                                { footWarmingTempRight: temp, footWarmingTimerRight: timer }, 
                            callback);
    }
}

module.exports = SleepNumberAPI
