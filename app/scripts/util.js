'use strict';

function nextSquare(n) {
  var square = false;
  while (!square) {
    if (Number.isInteger(Math.sqrt(n))) {
      square = true;
    }
    else {
      n++;
    }
  }
  return n;
}

exports.nextSquare = nextSquare;
