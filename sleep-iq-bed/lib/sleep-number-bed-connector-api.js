const SleepNumberAPI = require('./sleep-number-api')
const SleepNumberBed = require('./sleep-number-bed')

class SleepNumberBedConnectorAPI {
  constructor(username, password) {
    this.api = new SleepNumberAPI(username, password)
    this.beds = [new SleepNumberBed(), new SleepNumberBed()] 
    this.bedSide = 0
    this.username = null;
    this.name = null;
  }
    
  getBed() {
    return this.beds[this.bedSide];
  }
    
  async setup(oauth, accessToken) {
    await this.api.login();
    await this.api.bedStatus(function (bed) {
                                      this.beds[0].isInBed = bed['leftSide']['isInBed']
                                      this.beds[0].sleepNumber = bed['leftSide']['sleepNumber']

                                      this.beds[1].isInBed = bed['rightSide']['isInBed']
                                      this.beds[1].sleepNumber = bed['rightSide']['sleepNumber']
    }.bind(this));
    await this.api.sleeper(function (sleepers) {
                                      this.beds[0].username = sleepers[0]['username']
                                      this.beds[1].username = sleepers[1]['username']
    }.bind(this));
    return oauth.getUserInfo(accessToken, function (data) {
                                      this.username = this.beds[0].username
                                      this.name = data.name
                                      this.bedSide = data.email === this.beds[0].username ? 0 : 1
                                      this.api.setBedSide(this.bedSide == 0 ? 'L' : 'R')
    }.bind(this));
  }
  
  async refresh() {
      await this.api.footWarmingStatus(function (status) {
                                      this.beds[0].footWarmingStatus = status['footWarmingStatusLeft']
                                      this.beds[0].footWarmingTimer = status['footWarmingTimerLeft']
                  
                                      this.beds[1].footWarmingStatus = status['footWarmingStatusRight']
                                      this.beds[1].footWarmingTimer = status['footWarmingTimerRight'] 
      }.bind(this));
      return this.api.foundationStatus(function (status) {
                                      this.beds[0].setPreset(status['fsCurrentPositionPresetLeft'])
                                      this.beds[0].headPosition = parseInt(status['fsLeftHeadPosition'])
                                      this.beds[0].footPosition = parseInt(status['fsLeftFootPosition'])

                                      this.beds[1].setPreset(status['fsCurrentPositionPresetRight'])
                                      this.beds[1].headPosition = parseInt(status['fsRightHeadPosition'])
                                      this.beds[1].footPosition = parseInt(status['fsRightFootPosition'])
      }.bind(this));
  }

  async preset(value) {
    if (value < 0 || value > 6) {
      console.log('Invalid preset ', value);
      return false
    }

    await this.api.preset(value)
    return true
  }

  async footwarming(temp, timer) {
    if (temp < 0 || temp > 100) {
      console.log('Invalid temperature ', temp);
      return false
    }
    if (timer < 0 || timer > 600) {
      console.log('Invalid timer ', timer)
      return false
    }

    await this.api.footwarming(temp, timer)
    return true
  }

  async adjust(actuator, value) {
    if (value < 0 || value > 100) {
      console.log('Invalid actuator value ', value)
      return false
    }
    await this.api.adjust(actuator, value)
    return true
  }
}
module.exports = SleepNumberBedConnectorAPI