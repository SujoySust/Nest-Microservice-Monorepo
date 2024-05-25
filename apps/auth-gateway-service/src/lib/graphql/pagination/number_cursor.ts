import { BadRequestException } from '@nestjs/common';
import { __, errorResponse } from '../../../app/helpers/core_function';

export const pOptionsBigInt = {
  getCursor: (record) => ({ id: record.id }),
  encodeCursor: <Cursor>(prismaCursor: Cursor) => {
    const res = Buffer.from(JSON.stringify(prismaCursor)).toString('base64');
    return res;
  },
  decodeCursor: (cursor: string) => {
    try {
      const res = JSON.parse(Buffer.from(cursor, 'base64').toString('ascii'));
      res['id'] = BigInt(res['id']);
      return res;
    } catch (e) {
      if (e?.message?.search(/JSON at position/) < 0) {
        console.error(e.stack);
      }
      throw new BadRequestException(errorResponse(__('Invalid cursor value.')));
    }
  },
};

export const pOptionsInt = {
  getCursor: (record) => ({ id: record.id }),
  encodeCursor: <Cursor>(prismaCursor: Cursor) => {
    const res = Buffer.from(JSON.stringify(prismaCursor)).toString('base64');
    return res;
  },
  decodeCursor: (cursor: string) => {
    try {
      const res = JSON.parse(Buffer.from(cursor, 'base64').toString('ascii'));
      return res;
    } catch (e) {
      if (e?.message?.search(/JSON at position/) < 0) {
        console.error(e.stack);
      }
      throw new BadRequestException(errorResponse(__('Invalid cursor value.')));
    }
  },
};
