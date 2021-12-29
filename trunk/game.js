const main = document.querySelector('main')

class goose{
    constructor(color){
        this.color = color;
        this.place = 0;
        this.flag = '';
        this.turns = 0;
    }

    static stragglers


    start_turn(){
        this.turns++;
        switch (this.flag) {
            case 'skip':
                this.flag = '';
                break;
            case 'stuck':
                //record other players
                break;
            default:
                this.do_turn();
                break;
        }

    }

    do_turn(){
        let steps = this.roll();
        this.move(steps) ;
        this.end_turn()
    }

    end_turn(){
        //if place is special do special action and set flags

        
    }

    roll(){
        return Math.round(6 * Math.random()) 
    }

    move(steps){
        this.place = this.place + steps;
    }

    lookback(){
        //loop through other geese
        //if one or more geese has place < this.place return geese.colors array.
    }
    
    is_overtaken(){
        //    
    }
   

}

class game {
    static geese = [];
    constructor(players){
        this.colors = ['blue', 'red', 'yellow', 'green', 'white', 'black'];
        for (let i = 0; i < players;  i++) {
                geese.push(new goose(this.colors[i]))
        }
    }
    
}



/*
make 4 geese
each has color, place, flag
method check place 
method isstuck

make game

has board,
has methods
roll
movetoplace
repeatsteps
throwagain
skipturn
getstuck
reverse
win

goose starts at 0
check flag.
if flag reverse, unset flag
check flag stuck
if flag stuck check lagging players.  if any remembered goose now has place > p.place set unstuck, forget lagging geese and throw else re-check lagging geese.
if flag skipturn unset flag 
else
throws dice
add dice value to place
if place is special perform special action
goose: 
if not flag reverse add dice value to place again else subtract diece val from place.
bridge/thorns/death: moveto(12/3x/0)
dice:throw again/reset turn
inn: skipturn
(set flag skip turn.)
jail/well: wait for later player to pass or skip turn
(if no goose exists with lower value place, set flag skipturn. else set flag stuck + remember any geese behind this goose.
overshoot 63: reverse dir.
if place + dieval > 63, newplace = 63+(63-place+dieval) set flag reverse.


if place = 63 win
else pass turn to next player.




 */

