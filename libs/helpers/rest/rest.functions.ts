/* eslint-disable @typescript-eslint/no-var-requires */

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { ResponseModel } from './rest.types';
import { CODE } from '../common/common.constant';
import { __ } from '../common/common.functions';

export function successResponse(
  msg?: string,
  data?: object,
  code: number = CODE.STATUS_OK,
  messages?: string[],
  res?: Response,
): ResponseModel {
  msg = msg ?? '';
  code = code ?? CODE.STATUS_OK;
  const obj: ResponseModel = {
    success: true,
    message: msg,
    messages: messages ?? [msg],
    data: data || null,
    code: code,
  };
  if (res) {
    res.json(obj);
  }
  return obj;
}

export function errorResponse(
  msg?: string,
  data?: object,
  code: number = CODE.INTERNAL_SERVER_ERROR,
  messages?: string[],
  res?: Response,
): ResponseModel {
  msg = msg || __('Something went wrong. Please try again after some time.');
  code = code ?? CODE.INTERNAL_SERVER_ERROR;
  const obj: ResponseModel = {
    success: false,
    message: msg,
    messages: messages ?? [msg],
    data: data || null,
    code: code,
  };
  if (res) {
    res.json(obj);
  }
  return obj;
}

export function sendBadRequestException(
  msg: string,
  messages?: string[],
  data?: object,
) {
  throw new BadRequestException(
    errorResponse(msg, data, CODE.BAD_REQUEST, messages),
  );
}

export function sendNotFoundException(
  msg: string,
  messages?: string[],
  data?: object,
) {
  throw new NotFoundException(
    errorResponse(msg, data, CODE.NOT_FOUND, messages),
  );
}

export function processException(e) {
  checkPrismaError(e);
  if (
    (e.hasOwnProperty('response') &&
      !e.response.hasOwnProperty('success') &&
      !e.response.hasOwnProperty('data')) ||
    !e.hasOwnProperty('response')
  ) {
    // console.log(e.stack, LOG_LEVEL.ERROR);
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
    // console.log(e.stack, LOG_LEVEL.ERROR, undefined, undefined, 5);
    sendBadRequestException(__('Number field maximum limit exceeded'));
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
    sendBadRequestException(msg);
    //
  } else if (
    e instanceof PrismaClient.PrismaClientKnownRequestError ||
    e instanceof PrismaClient.PrismaClientUnknownRequestError ||
    e instanceof PrismaClient.PrismaClientValidationError ||
    e instanceof PrismaClient.PrismaClientInitializationError ||
    e instanceof PrismaClient.PrismaClientRustPanicError
  ) {
    throw new Error(
      __('Something went wrong. Please try again after some time.'),
    );
  }
}

export function syncArrayModel<TModel, TData>(
  Model: any,
  data: TData[],
): TModel[] {
  const data_len = data.length;
  const res: TModel[] = [];
  for (let i = 0; i < data_len; i++) {
    res.push(new Model(data[i]));
  }
  return res;
}

export function syncSingleModel<TModel, TData>(
  Model: any,
  data: TData,
): TModel {
  return new Model(data);
}
