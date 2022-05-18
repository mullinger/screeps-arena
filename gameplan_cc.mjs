import { Task, TaskKill } from './my/tasks'
import { doSpawnRanged, doSpawnHarvester, doSpawnBrawler, doSpawnHauler } from './my/spawn.mjs';
import { TaskHaul, TaskCollectScore, TaskProtectAndSkirmish, TaskHarvest } from './my/tasks.mjs';

var harvester = null
var hauler = null
var protector = null

export function gameplanCC() {
    var mySpawns = getObjectsByPrototype(StructureSpawn).filter(spawn => spawn.my);

    if (!harvester) {
        harvester = doSpawnHarvester(mySpawns[0]);
    }

    if (harvester) {
        tasks(harvester).addTaskIfIdle(new TaskHarvest())
    }
    

    if (harvester && harvester.my && !hauler && mySpawns[0].store.getUsedCapacity(RESOURCE_ENERGY) > 900) {
        hauler = doSpawnHauler(mySpawns[0])
    }

     if (hauler && tasks(hauler).isIdle()) {
        tasks(hauler).addTaskIfIdle(new TaskCollectScore())
    }


    if (hauler && hauler.my && !protector && mySpawns[0].store.getUsedCapacity(RESOURCE_ENERGY) > 900) {
        protector = doSpawnRanged(mySpawns[0])
    }

    if (protector && protector.my) {
        tasks(protector).addTaskIfIdle(new TaskProtectAndSkirmish(hauler))
    }


    var harvesters = creepsForTasksFilter(f => {
        return f.getCurrent() instanceof TaskHarvest
    })

    console.log("Harvesters: "+harvesters.length)
}