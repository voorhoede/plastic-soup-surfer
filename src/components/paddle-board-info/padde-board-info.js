import scrollPastPoint from '../../scrollPastPoint';

const PADDLE_BOARD = '[data-paddle-board]';

const paddleBoard = document.querySelector(PADDLE_BOARD);

if (paddleBoard)
    scrollPastPoint(paddleBoard, 'open', .5)
