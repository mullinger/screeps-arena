


//console.log(JSON.stringify(Creep.prototype, 0, 2));

export const LOGLEVEL = {
    TRACE : 9,
    DEBUG : 8,
    INFO : 7,
    WARN : 6,
    ERROR : 5
}

export const LOG = {
    level: LOGLEVEL.TRACE,
    trace: function(text) {
        if (LOGLEVEL.TRACE <= this.level) {
            console.log(text + " @ "+ new Error().stack.split("\n")[2])
        }
    },
    debug: function(text) {
        if (LOGLEVEL.DEBUG <= this.level) {
            console.log(text + " @ "+ new Error().stack.split("\n")[2])
        }
    },
    info: function(text) {
        if (LOGLEVEL.INFO <= this.level) {
            console.log(text + new Error().stack.split("\n")[2])
        }
    },
    warn: function(text) {
        if (LOGLEVEL.WARN <= this.level) {
            console.log(text + new Error().stack.split("\n")[2])
        }
    },
    error: function(text) {
        if (LOGLEVEL.ERROR <= this.level) {
            console.log(text + new Error().stack.split("\n")[2])
        }
    },
    logObject: function(object) {
        this.info(JSON.stringify(object, 0, 2));
    }

}