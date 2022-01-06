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
var btn;
document.addEventListener('DOMContentLoaded', ()=>{
    console.log('load event happened')
    const main = document.querySelector('main')
    btn = document.getElementById('btn_gamestart')
    btn.addEventListener('click', () => { 
        
        const input = document.getElementById('input_geese')
        gg(input.value);
    })
})

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
        
        if(this.session.winner != null )
            return;

        this.turns = turn;
        
        if (this.hasFlag()) {
            console.log(`Turn ${this.turns}: ${this.color} begins turn on place ${this.place} and with flag '${this.flag}'`)
        } else {
            console.log(`Turn ${this.turns}: ${this.color} begins turn on place ${this.place}`)
        }
       
        flagswitch:
        switch (this.flag) {
            case 'skip':
                this.flag = '';
                break;
            case 'stuck':       
                if( this.isOvertaken() ){
                    this.flag = '';
                    this.doTurn();
                    break flagswitch;
                }
                if ( this.isLast() ){
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

    extraTurn(){
        this.doTurn();
    }

    doTurn(){
        this.turnRoll = this.roll();
        console.log(`${this.color} rolls a ${this.turnRoll}`)
        this.move(this.turnRoll) ;
        this.endTurn()
    }

    endTurn(){
        if (this.hasFlag()) {
            this.session.view.logEvents(this.color, `${this.color} threw a ${this.turnRoll} and ends turn on place ${this.place} and ${this.session.board[this.place].d}`);
            console.log(`Turn ${this.turns}: ${this.color} ends turn on place ${this.place} and ${this.session.board[this.place].d}`)
        } else {
            this.session.view.logEvents(this.color,  `${this.color} threw a ${this.turnRoll} and ends turn on place ${this.place}`);
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
        this.session.view.logEvents(this.color, `${this.color} landed on a goose on place ${this.place} and gets to move ${this.turnRoll} steps further.`);
        this.move(this.turnRoll);
    }

    getStuck(){
        this.flag = 'stuck';
    }

    skipTurn(){
        this.flag = 'skip';
    }

    goToPlace(p){
        this.session.view.logEvents(this.color, `Turn ${this.turns}: ${this.color} landed on place ${this.place} and ${this.session.board[this.place].d}`);
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
        })
        if(this.stragglers.length == 0 ){
            this.session.view.logEvents(this.color, `${this.color} is lucky; there are no stragglers so they only have to skip a turn.`);
            this.flag = 'skip'
            return true;
        }
        let eventmsg = `${this.color} is stuck and has ${this.stragglers.length} stragglers behind it:`;
        this.stragglers.forEach(fowl => eventmsg += fowl.color)
        this.session.view.logEvents(this.color, eventmsg );
        console.log(`${this.color} has ${this.stragglers.length} stragglers behind it`);
        return false;    

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
        if(!samestragglers){
            this.session.view.logEvents(this.color, `${this.color} was rescued by a passerby and can now move again.`);
            return true;
        }
        return false;    
    }
   
    win(){
        this.flag = 'win';
        this.session.winner = this.color;
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

        this.view = new display(this, '#gameview')

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
                    this.view.logEvents(this.winner, `the winner is ${this.winner}`);
                   
                }            
            });
            if(this.turn > 100){
                break;
            }
        }
        
    }

    setup_board(){
        const board = [{a:'', d: ''}];
        for(let i=1; i<63; i++){
            if (i % 9 == 0 || ( i+4 ) % 9 == 0 ){
                board.push({a:'goose', f: 'repeatSteps', p: null, d: 'gets to move again.'})
                continue;
            }
            switch(i){
                case 6: 
                    board.push({a:'bridge', f: 'goToPlace', p: 12, d: 'hops on the bridge'})
                    break;
                case 19: 
                    board.push({a:'inn', f: 'skipTurn', p: null, d: 'is way too comfy in the tavern and skips a turn'})
                    break; 
                case 26:
                case 53:    
                    board.push({a:'dice', f: 'extraTurn', p: null, d: 'gets to roll again'}) 
                    break;              
                case 31:
                    board.push({a:'well', f: 'getStuck', p: null, d: 'falls into the Well'})
                    break;                    
                case 42:
                    board.push({a:'maze', f: 'goToPlace', p: 37, d: 'gets lost in The Maze'}) 
                    break; 
                case 52: 
                    board.push({a:'prison', f: 'getStuck', p: null, d: 'lands in prison'})
                    break;                        
                case 58:
                    board.push({a:'death', f: 'goToPlace', p: 0, d: 'dies... and is reborn.'})    
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

class display{
    constructor(game, element){
        this.game = game;

        if(typeof element == 'string'){
            element = document.querySelector(element)
        }

        if (!element)
            console.log('no valid DOM element or Element Selector provided');
        else    
            this.viewer = element;

        this.viewer.innerHTML = '';    
        this.displayBoard(this.game, this.viewer)
    }

    displayBoard(g, v){
        let d = document
        let ce = e => d.createElement(e);
        let b = g.board
        const boardwrapper = ce('div')
        boardwrapper.setAttribute('id', 'boardwrapper')
        b.forEach((fld, idx ) => {
            let div = ce('div');
            div.textContent = idx;
            div.setAttribute('id', 'fld_' + idx)
            div.setAttribute('data-special', fld.a)
            div.classList.add('field')
            if (fld.a)
                div.classList.add(fld.a)

            boardwrapper.append(div)
        })
        v.append(boardwrapper);
    }

    logEvents(color, event){
        let p = document.createElement('p');
        p.classList.add(`eventlog_${color}`)
        p.classList.add('eventlog')
        p.innerText = event
        this.viewer.append(p)
    }

}
