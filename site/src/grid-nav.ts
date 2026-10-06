/**
 * Index of the tile to focus after pressing an arrow key (or Home/End) in a
 * grid of `count` tiles laid out in `columns` columns. Returns undefined for
 * other keys. Moves stop at the edges instead of wrapping.
 */
export function nextIndex(index: number, key: string, count: number, columns: number): number | undefined {
  const last = count - 1;
  switch (key) {
    case "ArrowRight":
      return Math.min(index + 1, last);
    case "ArrowLeft":
      return Math.max(index - 1, 0);
    case "ArrowDown":
      return index + columns <= last ? index + columns : index;
    case "ArrowUp":
      return index - columns >= 0 ? index - columns : index;
    case "Home":
      return 0;
    case "End":
      return last;
    default:
      return undefined;
  }
}

/**
 * Number of tiles in the first row, measured from their position on the page.
 * (offsetTop would not work: each tile is positioned inside its own cell.)
 */
export function columnCount(tiles: ArrayLike<Element>): number {
  if (tiles.length === 0) return 1;
  const top = tiles[0].getBoundingClientRect().top;
  let columns = 0;
  while (columns < tiles.length && Math.abs(tiles[columns].getBoundingClientRect().top - top) < 1) columns++;
  return Math.max(columns, 1);
}
