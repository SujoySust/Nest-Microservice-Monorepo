import { BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { __ } from '../common/common.functions';
import { ResponseModel } from './graphql.types';

export function processException(e) {
  checkPrismaError(e);
  if (
    (e.hasOwnProperty('response') &&
      !e.response.hasOwnProperty('success') &&
      !e.response.hasOwnProperty('data')) ||
    !e.hasOwnProperty('response')
  ) {
    console.error(e.stack);
  }
  throw e;
}

function checkPrismaError(e) {
  /* if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const field = e.meta['target'][0];
      if (field === 'email')
        throw new ConflictException(__(`Email already used.`));
      if (field === 'phone')
        throw new ConflictException(__(`Phone number already used.`));
      else {
        console.error(e.stack);
        throw new Error(__('Something went wrong. Please try again after some time.'));
      }
    } else */

  if (
    e.message?.includes('SqlState(E22003)') ||
    e.message?.includes(
      'A number used in the query does not fit into a 64 bit signed integer',
    )
  ) {
    // console.log(e.stack, LOG_LEVEL_ERROR, undefined, undefined, 5);
    throw new BadRequestException(
      errorResponse(__('Number field maximum limit exceeded')),
    );
  } else if (
    String(e.message)?.search(/Unknown argument.*? Did you mean/) >= 0
  ) {
    //
    let msg = __('Invalid sort or orderBy column name');
    const parseCol = e.message.match(/Unknown argument \`.*?\`/);
    if (parseCol?.length) {
      const wrongColName = String(parseCol[0]).replace('Unknown argument ', '');
      msg += `: ${wrongColName}`;
    }
    throw new BadRequestException(errorResponse(msg));
    //
  } else if (
    e instanceof PrismaClient.PrismaClientKnownRequestError ||
    e instanceof PrismaClient.PrismaClientUnknownRequestError ||
    e instanceof PrismaClient.PrismaClientValidationError ||
    e instanceof PrismaClient.PrismaClientInitializationError ||
    e instanceof PrismaClient.PrismaClientRustPanicError
  ) {
    // console.log(e.stack, LOG_LEVEL_ERROR, undefined, undefined, 5);
    throw new Error(
      __('Something went wrong. Please try again after some time.'),
    );
  }
}

export function successResponse(
  msg?: string,
  data?: object,
  code?: number,
): ResponseModel {
  return {
    success: true,
    message: msg ?? '',
    data: data || null,
    code: code || 200,
  };
}

export function errorResponse(
  msg?: string,
  data?: object,
  code?: number,
  messages?: string[],
): ResponseModel {
  return {
    success: false,
    message:
      msg || __('Something went wrong. Please try again after some time.'),
    messages: messages ?? [],
    data: data || null,
    code: code || 500,
  };
}
