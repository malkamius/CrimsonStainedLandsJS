class Game {
    static get PULSE_PER_SECOND() { return 4; };	
    static get PULSE_PER_VIOLENCE() { return Game.PULSE_PER_SECOND * 3; }
    static get PULSE_PER_TICK() { return Game.PULSE_PER_SECOND * 30; }
    static get PULSE_TRACK() { return Game.PULSE_PER_SECOND * 20; }

    static GameStarted = new Date();
    static LEVEL_IMMORTAL = 52;
}

module.exports = Game;