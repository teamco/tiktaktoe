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
      if (e?.target && 'tagName' in e?.target && (e.target as HTMLElement).tagName === 'LI') {
        e.preventDefault();
        this.handleClick(e.target as HTMLElement);
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

  /**
   * Populates the diagonal map (DMap) with combinations of elements from 
   * diagonals of the given list. The function iterates through the list, 
   * mapping elements at the same index plus an offset to form a diagonal. 
   * The diagonal is then filtered for empty strings and any combinations 
   * of elements that are at least minSize in length are added to the 
   * diagonal map. The function is called recursively with an incremented 
   * offset until the end of the list is reached.
   * 
   * @param {string[]} list The list to generate diagonals from.
   * @param {number} [index=0] The index to start at for the diagonal.
   * @param {number} [up=1] The offset to add to the index for each diagonal.
   * @param {string[][]} [diagonals=[]] The initial diagonal map to append to.
   * @returns {string[][]} The updated diagonal map.
   */
  handleDiagonals(list: string[], index: number = 0, up: number = 1, diagonals: string[][] = []): string[][] {
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
    ].map(item => JSON.stringify(item))), JSON.parse);

    this.debug && console.log('Win map', this.winMap);
  }

  /**
   * Switches the current player to the opposite player ('X' or '0') and optionally logs the current player.
   *
   * @param {string} player The player whose turn just ended, either 'X' or '0'.
   */
  handlePlayers(player: string) {
    this.currentPlayer = player === 'X' ? '0' : 'X';
    this.debug && console.log('Current player', this.currentPlayer);
  }

  /**
   * Handles a click event on a game board cell. Marks the cell as selected 
   * and assigns it to the current player if it is not already selected and 
   * there is no winner yet. Updates the player's move list, checks for a 
   * winner, and switches the current player.
   *
   * @param {HTMLElement} handler The list item element that was clicked.
   * @returns {boolean|void} Returns false if the cell is already selected or 
   * if there is a winner, otherwise void.
   */
  handleClick(handler: HTMLElement): boolean | void {
    if (handler.className.match(/selected/) || this.winner) {
      return false;
    }
    handler.classList.add('selected', 'selected' + this.currentPlayer);
    this.players[this.currentPlayer].push(handler.getAttribute('data-index'));
    this.handleWinners();
    this.handlePlayers(this.currentPlayer);
  }

  /**
   * Retrieves a list item element (li) from the document based on its data-index
   * attribute, which matches the provided index.
   *
   * @param {string} idx The data-index of the list item to retrieve.
   * @returns {HTMLElement | null} The list item element with the specified data-index,
   * or null if no such element exists.
   */
  getHadnler(idx: string): HTMLElement | null {
    return document.querySelector('li[data-index="' + idx + '"]');
  }

  /**
   * Checks if the current player has won the game by comparing their moves 
   * with each winning combination in the win map. If the current player has 
   * made at least minSize moves and any of the winning combinations matches 
   * their moves, marks the winning cells with the class `winner` and sets 
   * the winner to the current player.
   */
  handleWinners() {
    const playerMap = this.players[this.currentPlayer];
    const res = this.players[this.currentPlayer].map((x: string) => parseInt(x, 10));
    playerMap.length >= this.minSize && this.winMap.forEach((nums: string[]) => {
      let winner = true;
      nums.forEach((n: string) => {
        winner = winner && res.indexOf(parseInt(n, 10)) > -1;
      });

      if (winner) {
        nums.forEach((n: string) => {
          const handler = this.getHadnler(n);
          handler?.classList.add('winner');
        });
        this.winner = this.currentPlayer;
      }
    });
  }
}