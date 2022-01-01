// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});


const main = document.querySelector('main')

class goose{
    constructor(color, session){
        this.color = color;
        this.session = session;

    }

    static stragglers =[]
    static place = 0;
    static flag = '';
    static turns = 0;

    start_turn(){
        this.turns++;
        switch (this.flag) {
            case 'skip':
                this.flag = '';
                break;
            case 'stuck':
                if( ! this.isLast()){
                    // 
                } else {
                    //same as skip
                    this.flag = '';
                }
                break;
            default:
                this.do_turn();
                break;
        }

    }

    do_turn(){
        this.turnRoll = this.roll();
        this.move(this.turnRoll) ;
        this.end_turn()
    }

    end_turn(){
        //if place is not special gtfo
        if (! this.session.board[this.place])
            return;
        
        //if place is special get action
        switch(this.session.board[this.place]){
            case 'repeat':
                this.move(this.turnRoll)
                break;
            case 'skip':       
                this.flag = 'skip'
                break;
            case 'roll': 
                this.do_turn();
                break;
            case 'stuck':
                this.flag = 'stuck'
                this.isLast() ;
                break;
            case 'goto37':
                this.goToPlace(37) 
                break;
            case 'goto12'    :
                this.goToPlace(12) 
                break;    
            case 'goto0':
                this.goToPlace(0); 
                break;
            case 'win':
                this.win();  
                break;                                     
            default:
                console.log(this.session.board[this.place])
        } 

    }

    roll(){
        return Math.round(6 * Math.random()) 
    }

    move(steps){
        this.place = this.place + steps;
        if (this.place > 63){
            //overshot 63; 
            this.turnRoll = -this.turnRoll; //turnroll is negative
            this.place = 126 - this.place 
        }
        this.end_turn();
        //update view
    }

    goToPlace(p){
        this.place = p;
    }

    isLast(){
        //loop through other geese
        this.session.geese.forEach(bird => {
            if (bird.place < this.place){
                stragglers.push(bird);
            };
            if(stragglers.length == 0 ){
                this.flag = 'skip'
                return true;
            }
            return false;    
        })
    }
    
    isOvertaken(){
        //remember kids: array names are references so if 
        // we want to actually retain a version of the array 
        // we need to create a new reference. 
        let lastTurnStragglers = this.stragglers.slice();
        let last = this.isLast();
        if(last){
            this.flag = '';
            return true;
        }
        lastTurnStragglers = lastTurnStragglers.sort();
        let samestragglers = lastTurnStragglers.equals(this.stragglers.sort());
        if(!samestragglers)
            return true;

        return false;    
    }
   
    win(){
        this.flag = 'win';
    }

}

class game {

    constructor(players, dice){
        this.geese = [];
        this.winner = null;
        this.colors = ['blue', 'red', 'yellow', 'green', 'white', 'black'];
        this.board = setup_board();
        this.dice = dice || 1;
        for (let i = 0; i < players;  i++) {
                geese.push(new goose(this.colors[i], this))
        }

    }
    
    play(){
        while (!this.winner) {
            geese.forEach(goose => {
                goose.start_turn();
                if (goose.flag == 'win') {
                    this.winner = goose.color;
                }            
            });
        }
    }

    setup_board(){
        const board = [];
        for(i=0; i<=63; i++){
            if (i % 9 == 0 || ( i+4 ) % 9 == 0 ){
                board.places.push('repeat')
                continue;
            }
            switch(i){
                case 6: 
                    board.places.push('goto12')
                    break;
                case 19: 
                    board.places.push('skip')
                    break; 
                case 26:
                case 53:    
                    board.places.push('roll') 
                    break;              
                case 31:
                case 52: 
                    board.places.push('stuck')
                    break;
                case 42:
                    board.places.push('goto37') 
                    break;     
                case 58:
                    board.places.push('goto0')    
                    break;
                case 63:
                    board.places.push('win')  
                    break;    
                default:
                    board.places.push('')
                    break;
            }
        }
        return board;
    }

}
//data
const board = {

}


const pointless_game_of_goose = new game(4);
const winner = pointless_game_of_goose.play();





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

