import { AxiosError, AxiosResponse } from 'axios';
import { HttpErrorHandler } from './http-error-handler';
import { HttpExceptionPayload } from './interfaces/http-exception-payload.interface';

describe('HttpErrorHandler', () => {
  const errorHandler: HttpErrorHandler = new HttpErrorHandler();

  it('should throw an HttpException when a controlled http error is catch', async () => {
    const errMessage = 'testMessage';
    const errStatusCode = 400;
    const errArguments = ['arg1', 'arg2'];

    const httpError: AxiosError = new AxiosError(
      'Request failed with status code 400',
      'ERR_BAD_REQUEST',
      null,
      null,
      <AxiosResponse<HttpExceptionPayload>>{
        data: { message: errMessage, arguments: errArguments },
        status: errStatusCode,
      },
    );

    try {
      errorHandler.handle(httpError);
    } catch (err) {
      expect(err.message).toBe(errMessage);
      expect(err.status).toBe(errStatusCode);
      expect(err.response.code).toBe(errStatusCode);
      expect(err.response.message).toBe(errMessage);
      expect(err.response.arguments).toBe(errArguments);
    }
  });

  it('should throw an HttpException with 503 status when no response is received', async () => {
    const expectedErrorMessage = 'Service unavailable';
    const httpError: AxiosError = new AxiosError(
      'someMessage',
      'ERR_BAD_REQUEST',
    );

    try {
      errorHandler.handle(httpError);
    } catch (err) {
      expect(err.message).toBe(expectedErrorMessage);
      expect(err.status).toBe(503);
      expect(err.response.code).toBe(503);
      expect(err.response.message).toBe(expectedErrorMessage);
    }
  });

  it('should throw an HttpException with 503 status when an arbitrary error happens', async () => {
    const expectedErrorMessage = 'Service unavailable';
    const randomError = new Error();

    try {
      errorHandler.handle(randomError);
    } catch (err) {
      expect(err.message).toBe(expectedErrorMessage);
      expect(err.status).toBe(503);
      expect(err.response.code).toBe(503);
      expect(err.response.message).toBe(expectedErrorMessage);
    }
  });
});
