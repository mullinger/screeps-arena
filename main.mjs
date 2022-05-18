import * as prototypes from 'game/prototypes';
for (let globalKey in prototypes) { global[globalKey] = prototypes[globalKey];}

import * as constants from 'game/constants';
for (let globalKey in constants) { global[globalKey] = constants[globalKey];}

import * as specConstants from 'arena/constants';
for (let globalKey in specConstants) { global[globalKey] = specConstants[globalKey];}

import * as utils from 'game/utils';
for (let globalKey in utils) { global[globalKey] = utils[globalKey];}

import * as pathing from 'game/path-finder';
for (let globalKey in pathing) { global[globalKey] = pathing[globalKey];}

import * as arenaConstants from 'arena';
for (let globalKey in arenaConstants) { global[globalKey] = arenaConstants[globalKey];}    

///////////////////////////
//  Import mine
///////////////////////////
import * as logModule from './my/log';
for (let globalKey in logModule) { global[globalKey] = logModule[globalKey];}    

import { gameplan } from './gameplan'
import { gameplanCC } from './gameplan_cc.mjs';


/////////////////////////////
// SETUP
////////////////////////////

LOG.level = LOGLEVEL.TRACE;


export function loop() {
    console.log("=== Running Tick "+getTicks()+"===")
    
    if (getTicks() == 1) {
        LOG.trace("Running one time setup")
    }

    try {
        gameplanCC()
    } catch(e) {
        LOG.error("Error log: "+ e)
    }
    
    var myCreeps = getObjectsByPrototype(Creep).filter(it => it.my);
    LOG.debug("Running " + myCreeps.length + " creeps  in Tick "+ getTicks())
    for (let myCreep of myCreeps) {
        tasks(myCreep).run()
    }
}