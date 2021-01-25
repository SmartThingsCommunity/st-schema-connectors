class SleepNumberBed {
  constuctor() {
    this.isInBed = false
    this.sleepNumber = 0
    this.sleeping = false 
    this.footWarmingStatus = 0 
    this.footWarmingTimer = 0 
    this.headPosition = 0
    this.footPosition = 0 
    this.preset = 0 // Not in preset
    this.username = null
  }
  
  preset2Number(preset) {
    const PRESET_MAP = {
      "Not at preset": 0,
      "Favorite": 1, 
      "Read": 2, 
      "Watch TV": 3, 
      "Flat": 4, 
      "Zero G": 5, 
      "Snore": 6
    }
    return PRESET_MAP[preset];      
  }
  
  setPreset(preset) {
    this.preset = this.preset2Number(preset)
  }
    
}

module.exports = SleepNumberBed