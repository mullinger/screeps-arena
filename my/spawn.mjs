  
class CreepToSpawn {
    energyForParts = 0
    bodyParts = []
    energyAvailable= 0;

    tryAdd(bodyPart) {
        var remainingEnergy = this.energyAvailable - this.energyForParts;
        if (remainingEnergy >= BODYPART_COST[bodyPart]) {
            this.bodyParts.push(bodyPart);
            this.energyForParts += BODYPART_COST[bodyPart];
            return true;
        } else {
            return false;
        }
    }

    sortBodyParts(bodyPartsSortOrder) {
        var result = []

        for (const part of bodyPartsSortOrder) {
            var num = this.bodyParts.filter(x => x === part).length;

            LOG.trace("Creep has "+num+" of part "+part)

            result = result.concat(Array(num).fill(part))
        }

        this.bodyParts = result
    }
};


export var doSpawnHarvester = function(spawn) {

    var creep = new CreepToSpawn();
    creep.energyAvailable = spawn.store.getUsedCapacity(RESOURCE_ENERGY);

    var isSuccesful = true;
    isSuccesful &= creep.tryAdd(CARRY)
    isSuccesful &= creep.tryAdd(MOVE)
    do {
        isSuccesful &= creep.tryAdd(WORK)
    } while(isSuccesful)
    
    return spawn.spawnCreep(creep.bodyParts).object;
}

export var doSpawnHauler = function(spawn) {

    var creep = new CreepToSpawn();
    creep.energyAvailable = spawn.store.getUsedCapacity(RESOURCE_ENERGY);

    var isSuccesful = true;
    do {
        isSuccesful &= creep.tryAdd(MOVE)
        isSuccesful &= creep.tryAdd(CARRY)
    } while(isSuccesful)
    
    return spawn.spawnCreep(creep.bodyParts).object;
}


export var doSpawnBrawler = function(spawn) {

    var creep = new CreepToSpawn();
    creep.energyAvailable = spawn.store.getUsedCapacity(RESOURCE_ENERGY);

    var isSuccesful = true;
    isSuccesful &= creep.tryAdd(MOVE)
    do {
        isSuccesful &= creep.tryAdd(ATTACK)
        isSuccesful &= creep.tryAdd(TOUGH)
    } while(isSuccesful)
    
    var result = spawn.spawnCreep(creep.bodyParts);

    if (result.error) {
        LOG.warn("Error spawning creep: " + result)
        return null
    } else {
        return result.object
    }

    
    
}

export var doSpawnRanged = function(spawn) {

    var creep = new CreepToSpawn();
    creep.energyAvailable = spawn.store.getUsedCapacity(RESOURCE_ENERGY);

    var isSuccesful = true;

    do {
        isSuccesful &= creep.tryAdd(MOVE)
        isSuccesful &= creep.tryAdd(RANGED_ATTACK)
    } while(isSuccesful)

    creep.sortBodyParts([RANGED_ATTACK, MOVE])
    
    console.log(creep)

    var result = spawn.spawnCreep(creep.bodyParts);

    if (result.error) {
        LOG.warn("Error spawning creep: " + result.error)
        return null
    } else {
        return result.object
    }

}
