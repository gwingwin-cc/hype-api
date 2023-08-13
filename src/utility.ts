import { Logger } from '@nestjs/common';

export const exclude = (ob: any, keyToDelete: Array<string>) => {
  for (const kd of keyToDelete) {
    delete ob[kd];
  }
  return ob;
};

export const excludeFromArray = (obArray: any, keyToDelete: Array<string>) => {
  for (const obIndex in obArray) {
    for (const kd of keyToDelete) {
      delete obArray[obIndex][kd];
    }
  }
  return obArray;
};

export const parseFromArray = (
  rows: any,
  keyToExecFunc: Array<string>,
  func,
) => {
  for (const rowIndex in rows) {
    for (const kd of keyToExecFunc) {
      try {
        rows[rowIndex][kd] = func(rows[rowIndex][kd]);
      } catch (e) {
        Logger.error(rows[rowIndex][kd], 'parseFromArray');
        Logger.error(e.message, 'parseFromArray');
        Logger.error(`at key ${kd}`, 'parseFromArray');
        Logger.error(`at index ${rowIndex}`, 'parseFromArray');
        rows[rowIndex][kd] = 'fail to parse';
      }
    }
  }
  return rows;
};
