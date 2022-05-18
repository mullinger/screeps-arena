
const tasksForCreep = new Map()

global.tasks = function(creep) {

    LOG.trace("looking for entry for "+creep.id)
    var entry = tasksForCreep.get(creep)

    if (!entry) {
        LOG.debug("ADD ENTRY to "+creep.id)
        tasksForCreep.set(creep, new Tasks(creep))
        entry  = tasksForCreep.get(creep)
    }

    return entry
}

global.activeTasks = function() {
    tasksForCreep.ma
}

global.creepsForTasksFilter = function(filter) {
    var creeps = []

    try {
        for (const entry of tasksForCreep.entries()) {
            if (entry[1] && entry[0] && entry[0].my && true === filter(entry[1])) {
                creeps.push(entry[0])
            }
        }
    } catch (e) {
        LOG.error("Error getting creeps for filter: "+e)
    }


    return creeps
}

class Tasks {
    
    taskQueue = []; 

    constructor(creep) {
        this.creep = creep
    }

    addTask(task) {

        this.taskQueue.push(task);
    };

    addTaskIfIdle(task) {

        if (this.isIdle()) {
            this.taskQueue.push(task);
            LOG.trace("added task for "+ this.creep.id)
        } else {
            LOG.trace("Not idle, failed to add task for "+ this.creep.id+ " queue.l="+this.taskQueue.length)
        }
    };

    isIdle() {
        return this.taskQueue.length == 0
    }

    clear() {
        this.taskQueue.splice(0, this.taskQueue.length)
    }

    getCurrent() {
        if (this.isIdle()) {
            return null
        } else {
            return this.taskQueue[0]
        }
    }


    run() {

        if (!this.creep.my) {
            //Not mine, error
            return
        }
        if (this.taskQueue.length == 0) {
            LOG.trace("idle!")
            return;
        }

        var task = this.taskQueue[0];
        var isFinished = task.run(this.creep);

        if (isFinished) {
            this.taskQueue.shift();
        }
    };
}

export class Task {
    constructor() {
        this.taskData = {}
        this.taskName = ""
    }
    
    run(creep) {
        return true
    }
}


export class TaskHarvest extends Task {
    constructor() {
        super()
        super.taskName = "Harvest"
    }

    run(creep) {
        LOG.info(creep.id+":"+this.taskName)
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            var source = creep.findClosestByPath(getObjectsByPrototype(Source));
    
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        } else {
            var spawn = creep.findClosestByPath(getObjectsByPrototype(StructureSpawn));
            
            if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
            }
        }

        return false
    }
   
}

export class TaskKill extends Task {
    constructor(target) {
        super()
        super.taskName = "Kill"
        this.target = target
    }

    run(creep) {
        if (this.target) {

            this.target = getObjectById(this.target.id)
            creep.moveTo(this.target);
            creep.rangedAttack(this.target);
            return false
        } else {
            return true
        }
    }
   
}


export class TaskHaul extends Task {
    constructor(source, target, resource) {
        super()
        super.taskName = "Haul"
        this.source = source
        this.target = target
        this.resource = resource
    }

    run(creep) {
        LOG.info(creep.id+":"+this.taskName)

        if (!getObjectById(this.target.id)) {
            LOG.warn("Haul finished, target can no longer be found")
            return true
        }

        var isSourceAvailable = getObjectById(this.source.id)

        // If source is available, get resources
        if (creep.store.getFreeCapacity(this.resource) > 0 && isSourceAvailable) {
            if (creep.withdraw(this.source, this.resource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(this.source);
            }
            return false
        } 
        
        // if creep is full, transfer
        if (creep.store.getUsedCapacity(this.resource) > 0) {
            if (creep.transfer(this.target, this.resource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(this.target);
            }
            return false
        } 

        if (!isSourceAvailable) {
            return true
        }

        return false
    }
   
}

export class TaskCollectScore extends Task {
    constructor() {
        super()
        super.taskName = "CollectScore"
    }

    run(creep) {
        LOG.info(creep.id+":"+this.taskName)

        var containers = getObjectsByPrototype(StructureContainer)

        var scoreFreeCapacity = creep.store.getFreeCapacity(RESOURCE_SCORE)
        var scoreUsedCapacity = creep.store.getUsedCapacity(RESOURCE_SCORE)
        var containerNum = containers.length

        
        if (containerNum > 0 && scoreFreeCapacity >= 200) {
            this.collectScore(creep)
            return false
        }

        if (scoreUsedCapacity > 0 && containerNum == 0) {
            this.deliverScore(creep)
            return false
        }
        
        if (scoreFreeCapacity < 200) {
            this.deliverScore(creep)
            return false
        }

        LOG.warn("No option found trying to collect score")

        return false
    }

    collectScore(creep) {
        var containers = getObjectsByPrototype(StructureContainer)
        var closestContainer = creep.findClosestByPath(containers)

        if (closestContainer) {
            if (creep.withdraw(closestContainer, RESOURCE_SCORE) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestContainer);
            }
        }
    }

    deliverScore(creep) {
        var collectors = getObjectsByPrototype(ScoreCollector)
        var collector = creep.findClosestByPath(collectors)

        if (creep.transfer(collector, RESOURCE_SCORE) == ERR_NOT_IN_RANGE) {
            creep.moveTo(collector);
        }
    }

   
}



export class TaskProtectAndSkirmish extends Task {
    constructor(objectToProtect) {
        super()
        super.taskName = "Protect and Skirmish"
        this.objectToProtect = objectToProtect
    }

    run(creep) {
        LOG.info(creep.id+":"+this.taskName)
        this.objectToProtect = getObjectById(this.objectToProtect.id)
        if (!this.objectToProtect) {
            return true
        }

        var enemyCreeps = getObjectsByPrototype(Creep).filter(o => !o.my);

        var enemiesInRange = creep.findInRange(enemyCreeps, 3);
        if (enemiesInRange && enemiesInRange.length > 0) {
            var path = searchPath(creep, enemiesInRange, {"flee": true})

            creep.moveTo(path.path[0])
        } else {
            creep.moveTo(this.objectToProtect)
        }

        var enemiesClosest = creep.findClosestByRange(enemyCreeps)
        if (enemiesClosest) {
            var result = creep.rangedAttack(enemiesClosest)
            LOG.trace("REsult for ranged attack: "+result)
        }


        return false
    }
}