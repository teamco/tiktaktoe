import { TicTacToe } from './tiktaktoe.ts'

import './style.css'

const _root = document.querySelector<HTMLDivElement>('#root');
_root && new TicTacToe(7, 4, _root);