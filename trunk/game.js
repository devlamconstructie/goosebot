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

function gg(geese){
    const g = new game(geese)
    g.play();
}
class goose{
    constructor(color, session){
        this.color = color;
        this.session = session;
        this.stragglers =[]
        this.place = 0;
        this.flag = '';
        this.turns = 0;
    }

    start_turn(turn){
        this.turns = turn;
        if (this.hasFlag()) {
            console.log(`Turn ${this.turns}: ${this.color} begins turn on place ${this.place} and with flag '${this.flag}'`)
        } else {
            console.log(`Turn ${this.turns}: ${this.color} begins turn on place ${this.place}`)
        }
       
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
                this.doTurn();
        }

    }

    hasFlag(){
        return this.flag != '' ; 
    }

    doTurn(){
        this.turnRoll = this.roll();
        console.log(`${this.color} rolls a ${this.turnRoll}`)
        this.move(this.turnRoll) ;
        this.endTurn()
    }

    endTurn(){
        if (this.hasFlag()) {
            console.log(`Turn ${this.turns}: ${this.color} ends turn on place ${this.place} and ${this.session.board[this.place].d}`)
        } else {
            console.log(`Turn ${this.turns}: ${this.color} ends turn on place ${this.place}`)
        }

    }

    roll(){
       return Math.round(Math.random() * 5) + 1;
    }

    move(steps){
        this.place = this.place + steps;
        if (this.place > 63){
            //overshot 63; 
            this.turnRoll = -this.turnRoll; //turnroll is negative
            this.place = 126 - this.place 
        }
        this.evaluateSelf(this.place);
    }

    repeatSteps(){
        this.move(this.turnRoll);
    }

    getStuck(){
        this.flag = 'stuck';
    }

    skipTurn(){
        this.flag = 'skip';
    }

    goToPlace(p){
        this.place = p;
        this.evaluateSelf(this.place);    
    }

    evaluateSelf(p){
        const special = this.checkIsSpecial(p);
        if (special) {
            special(this);
        }           
    }

    isLast(){
        //loop through other geese
        this.stragglers = []; //reset list.
        this.session.geese.forEach(bird => {
            if (bird.place < this.place){
                this.stragglers.push(bird);
            };
            if(this.stragglers.length == 0 ){
                this.flag = 'skip'
                return true;
            }
            console.log(`${this.color} has ${this.stragglers.length} stragglers behind it`);
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

    checkIsSpecial(p){
        let field = this.session.board[p]
        if (field.a == ''){          
            return false;
        }
        console.log(`${this.color} ${this.session.board[p].d}`)
        let action = new Function('fowl', `return fowl.${field.f}(${field.p})`);

        return action;
        
    }

}

class game {

    constructor(players, dice){

        this.players = players || 2;
        this.geese = [];
        this.winner = null;
        this.colors = ['blue', 'red', 'yellow', 'green', 'white', 'black'];
        this.board = this.setup_board();
        this.dice = dice || 1;
        this.turn = 0;
        for (let i = 0; i < this.players;  i++) {
                this.geese.push(new goose(this.colors[i], this))
        }

    }
    
    play(){
        while (!this.winner) {
            ++this.turn;
            this.geese.forEach(g => {
                g.start_turn(this.turn);
                if (g.flag == 'win') {
                    this.winner = g.color;
                }            
            });
            if(this.turn > 100){
                break;
            }
        }
        console.log(`the winner is ${this.winner}`)
    }

    setup_board(){
        const board = [{a:'', d: ''}];
        for(let i=1; i<63; i++){
            if (i % 9 == 0 || ( i+4 ) % 9 == 0 ){
                board.push({a:'repeat', f: 'repeatSteps', p: null, d: 'gets to move again.'})
                continue;
            }
            switch(i){
                case 6: 
                    board.push({a:'goto12', f: 'goToPlace', p: 12, d: 'hops on the bridge'})
                    break;
                case 19: 
                    board.push({a:'skip', f: 'skipTurn', p: null, d: 'is way too comfy in the tavern'})
                    break; 
                case 26:
                case 53:    
                    board.push({a:'roll', f: 'doTurn', p: null, d: 'gets to roll again'}) 
                    break;              
                case 31:
                    board.push({a:'stuck', f: 'getStuck', p: null, d: 'falls into the Well'})
                    break;                    
                case 42:
                    board.push({a:'goto37', f: 'goToPlace', p: 37, d: 'gets lost in The Maze'}) 
                    break; 
                case 52: 
                    board.push({a:'stuck', f: 'getStuck', p: null, d: 'lands in prison'})
                    break;                        
                case 58:
                    board.push({a:'goto0', f: 'goToPlace', p: 0, d: 'dies... and is reborn.'})    
                    break; 
                default:
                    board.push({a:'', f: '', p: null, d: ''})
                    break;
            }
        }
        board.push({a:'win', f: 'win', p: null, d: ''} );
        return board;
    }

}
//data
const board = {

}


//const pointless_game_of_goose = new game(4);
//const winner = pointless_game_of_goose.play();





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

