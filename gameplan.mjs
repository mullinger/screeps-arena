import { Task, TaskKill, TaskHarvest} from './my/tasks'
import { doSpawnRanged, doSpawnHarvester, doSpawnBrawler } from './my/spawn.mjs';

var harvester = null
var attacker = null

var target = null

export function gameplan() {
    var mySpawns = getObjectsByPrototype(StructureSpawn).filter(spawn => spawn.my);

    if (!harvester) {
        harvester = doSpawnHarvester(mySpawns[0]);
    }

    if (harvester) {
        LOG.trace("Adding task if idle to :"+harvester.id)
        tasks(harvester).addTaskIfIdle(new TaskHarvest())
    }
    

    if (harvester && !attacker && mySpawns[0].store.getUsedCapacity(RESOURCE_ENERGY) > 500) {
        attacker = doSpawnRanged(mySpawns[0])
    }

     if (attacker) {
        var hostileCreeps = getObjectsByPrototype(Creep).filter(i => !i.my);

        target = findInRange(attacker, hostileCreeps, 3);

        if (target.length > 0) {
            console.log(target[0])
            tasks(attacker).addTaskIfIdle(new TaskKill(target[0]))
        }
    }
}