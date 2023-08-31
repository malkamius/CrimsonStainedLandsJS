class Game {
    static get PULSE_PER_SECOND() { return 4; };	
    static get PULSE_PER_VIOLENCE() { return Game.PULSE_PER_SECOND * 3; }
    static get PULSE_PER_TICK() { return Game.PULSE_PER_SECOND * 30; }

    static GameStarted = new Date();
}

module.exports = Game;