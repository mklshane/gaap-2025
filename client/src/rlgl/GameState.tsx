

export enum GameState {
    // waiting for game to start
    idle,

    // unused, but could be used to show a countdown later
    countdown,

    // red light, clients will be listening for motion and orientation
    redLight,

    // green light, client's will not be listening for motion and orientation
    greenLight,

    // this client is eliminated and should not be listening for motion and orientation
    eliminated
}
