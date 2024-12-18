import { TicTacToe } from './tiktaktoe.ts'

import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="root"></div>
  <div class="error">Config error</div>

`;

const _root = document.querySelector<HTMLDivElement>('#root');
_root && new TicTacToe(7, 4, _root);