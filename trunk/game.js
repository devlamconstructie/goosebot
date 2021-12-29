const main = document.querySelector('main')



/*
make 4 geese
each has color, place, flag
method check place 
method isstuck

make game

has board,
has methods
throwdie
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

