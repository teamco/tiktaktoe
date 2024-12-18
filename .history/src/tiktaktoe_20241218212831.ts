export class TicTacToe {
  size: number;
  minSize: number;
  currentPlayer: string;
  players: any;
  winMap: any;
  uls: any;
  debug: boolean;
  winner: any;

  /**
   * @param {number} size The size of the Tic Tac Toe board to be generated.
   * @param {number} minSize The minimum number of squares in a line to win.
   * @param {HTMLElement} root The root element to render the board to.
   * @param {boolean} [debug=false] Whether or not to log debug information.
   * @throws {Error} If the board size or minSize are invalid.
   */
  constructor(size: number, minSize: number, root: HTMLElement, debug: boolean = false) {
    this.winMap = [];
    this.players = {
      '0': [],
      'X': []
    };

    this.debug = debug;
    this.currentPlayer = 'X';
    this.winner = null;

    this.size = size;
    this.minSize = minSize;

    if (size < minSize || minSize <= 0) {
      document.querySelector('.error')?.classList.add('show');

      throw new Error('Config error');
    }


    this.renderDOM(root, { margin: 2, width: 50 });
    this.uls = document.querySelectorAll('ul');
    this.initMatrix();

    window.addEventListener('click', e => {
      if (e?.target && 'tagName' in e?.target && e.target.tagName === 'LI') {
        e.preventDefault();
        this.handleClick(e.target);
      }
    });
  }

  /**
   * Renders the game board to the given root element.
   * @param {HTMLElement} root The root element to render the board to.
   * @param {Object} opts Options for rendering the board.
   * @param {number} opts.margin The margin between cells in pixels.
   * @param {number} opts.width The width of each cell in pixels.
   */
  renderDOM(root: HTMLElement, opts: { margin: number, width: number }): void {
    const dims = this.size * opts.width + (this.size - 1) * opts.margin;
    root.setAttribute('style', 'width:' + dims + 'px;');
    for (let i = 0; i < this.size; i++) {
      const ul = document.createElement('ul');
      ul.setAttribute('style', 'margin-bottom:' + opts.margin + 'px;height:' + opts.width + 'px');
      root.appendChild(ul);
      for (let y = 0; y < this.size; y++) {
        const li = document.createElement('li');
        li.setAttribute('style', 'margin-right:' + opts.margin + 'px;width:' + opts.width + 'px');
        ul.appendChild(li);
      }
    }
  }

  /**
   * Recursive function to generate combinations of numbers from colMap of length
   * minSize or larger, starting from startAt index. The result is an array of
   * arrays, where each subarray is a combination of numbers that can be part of
   * a winning combination.
   * @param {number[]} colMap The array of numbers to generate combinations from.
   * @param {number} startAt The starting index in colMap to generate combinations
   * from.
   * @param {number[][]} result The array of arrays to store the generated
   * combinations in.
   * @returns {number[][]} The array of arrays of combinations.
   */
  getCombinations(colMap: string[], startAt: number, result: string[][] = []): string[][] {
    if (startAt >= colMap.length) {
      return result;
    }

    const res: string[] = [];
    for (let i = startAt; i < colMap.length; i++) {
      if (res.length < this.minSize) {
        res.push(colMap[i]);
      }
    }

    if (res.length === this.minSize) {
      result.push(res);
    }

    return this.getCombinations(colMap, startAt + 1, result);
  }

  /**
   * Populates the horizontal map (HMap) with index values of list items (li) 
   * from each unordered list (ul) and updates the winMap with combinations of 
   * indices that can form a winning configuration. Each list item is assigned 
   * a unique data-index attribute based on its position within the ul. Optionally 
   * displays indices in the list items for debugging.
   *
   * @param {string[][]} [HMap=[]] - The initial horizontal map to populate with indices.
   * @returns {string[][]} The updated horizontal map with indices.
   */
  handleH(HMap: string[][] = []): string[][] {
    this.uls.forEach((ul: HTMLUListElement, ul_idx: number) => {
      const lis = ul.querySelectorAll('li');
      let colMap: string[] = [];
      lis.forEach((li, li_idx) => {
        const idx = ul_idx + '' + li_idx;
        li.setAttribute('data-index', idx);
        this.debug && (li.innerHTML = '<span>' + idx + '</span>');
        colMap.push(idx);
      });

      const res = this.getCombinations(colMap, 0, []);

      HMap.push(colMap);

      this.winMap = [...this.winMap, ...res];
    });

    return HMap;
  }

  /**
   * Transforms a horizontal map (HMap) into a vertical map (VMap) and a 90-degree
   * rotated map (HMap_90). The function generates combinations of elements from
   * each column in the 90-degree rotated map and appends them to the vertical map.
   *
   * @param {string[][]} HMap The horizontal map to transform, a 2D array of strings.
   * @param {string[][]} [VMap=[]] The initial vertical map to append combinations to.
   * @returns {Object} An object containing the vertical map (VMap) and the 90-degree
   * rotated map (HMap_90).
   */
  handleV(HMap: string[][], VMap: string[][] = []): object {
    const HMap_90 = HMap[0].map((_val, index) => HMap.map(row => row[index]).reverse());
    HMap_90.forEach(val => {
      const res = this.getCombinations(val, 0, []);
      VMap = [...VMap, ...res];
    });

    return { VMap, HMap_90 };
  }

  handleDiagonals(list, index = 0, up = 1, diagonals = []) {
    if (list.length < index + 1) {
      return diagonals;
    }

    const diagonal = list.map((val, idx) => val[idx + up * index]).filter(d => d);
    const combinations = this.getCombinations(diagonal, 0, []);

    if (diagonal.length >= this.minSize) {
      diagonals = [...diagonals, ...combinations];
    }

    return this.handleDiagonals(list, index + 1, up, diagonals);
  }

  initMatrix() {
    const HMap = this.handleH([]);

    const dHUp = this.handleDiagonals(HMap, 0, 1, []);
    const dHDown = this.handleDiagonals(HMap, 0, -1, []);

    const diagonalsH = [...dHUp, ...dHDown];

    const { VMap, HMap_90 } = this.handleV(HMap, []);

    const dVUp = this.handleDiagonals(HMap_90, 0, 1, []);
    const dVDown = this.handleDiagonals(HMap_90, 0, -1, []);

    const diagonalsV = [...dVUp, ...dVDown];

    this.winMap = Array.from(new Set([
      ...this.winMap,
      ...VMap,
      ...diagonalsH,
      ...diagonalsV
    ].map(JSON.stringify)), JSON.parse);

    this.debug && console.log('Win map', this.winMap);
  }

  handlePlayers(player) {
    this.currentPlayer = player === 'X' ? '0' : 'X';
    this.debug && console.log('Current player', this.currentPlayer);
  }

  handleClick(handler) {
    if (handler.className.match(/selected/) || this.winner) {
      return false;
    }
    handler.classList.add('selected', 'selected' + this.currentPlayer);
    this.players[this.currentPlayer].push(handler.getAttribute('data-index'));
    this.handleWinners();
    this.handlePlayers(this.currentPlayer);
  }

  getHadnler(idx) {
    return document.querySelector('li[data-index="' + idx + '"]');
  }

  handleWinners() {
    const playerMap = this.players[this.currentPlayer];
    const res = this.players[this.currentPlayer].map(x => parseInt(x, 10));
    playerMap.length >= this.minSize && this.winMap.forEach(nums => {
      let winner = true;
      nums.forEach(n => {
        winner = winner && res.indexOf(parseInt(n, 10)) > -1;
      });

      if (winner) {
        nums.forEach(n => {
          const handler = this.getHadnler(n);
          handler.classList.add('winner');
        });
        this.winner = this.currentPlayer;
      }
    });
  }
}