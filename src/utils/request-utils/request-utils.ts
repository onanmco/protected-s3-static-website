import {CloudFrontRequestEvent} from "aws-lambda";
import {parse as parseCookie} from "cookie";
import {Cookies, QueryStringParameters, State} from "../../common/types";
import {IRequestUtils} from "./interface/request-utils";
import {MalformedCallbackInputError} from "../../error/MalformedCallbackInputError";
import {autoBindSingleton} from "../../lib/inversify";

@autoBindSingleton()
export class RequestUtils implements IRequestUtils {
  extractCookies(event: CloudFrontRequestEvent): Cookies {
    const { cookie: cookies } = event.Records[0].cf.request.headers;

    if (!cookies) {
      return {};
    }

    return cookies.reduce((_cookies, { value: nextCookie }) => {
      return Object.assign(_cookies, parseCookie(nextCookie))
    }, {} as Cookies)
  }

  getBaseURL(event: CloudFrontRequestEvent): string {
    const domainName = event.Records[0]
      .cf
      .request
      .headers
      .host[0]
      .value;

    return `https://${domainName}`;
  }

  getRequestedURL(event: CloudFrontRequestEvent): string {
    let {
      uri: path,
      querystring
    } = event.Records[0].cf.request

    if (querystring) {
      querystring = `?${querystring}`
    } else {
      querystring = ""
    }

    return this.getBaseURL(event) + path + querystring;
  }

  base64Encode(input: string): string {
    return Buffer.from(input)
      .toString("base64");
  }

  base64Decode(input: string): string {
    return Buffer.from(input, "base64")
      .toString();
  }

  getQueryStringParams(event: CloudFrontRequestEvent): QueryStringParameters {
    const queryString = event.Records[0].cf.request.querystring;

    if (!queryString) {
      return {};
    }

    return Object.fromEntries(
      new URLSearchParams(queryString)
    );
  }

  parseRequestedURLFromState(event: CloudFrontRequestEvent): string {
    const queryStringParams = this.getQueryStringParams(event);

    if (!queryStringParams.state) {
      throw new MalformedCallbackInputError("state is a required query string parameter.");
    }

    let state: State;

    try {
      const decodedState = this.base64Decode(queryStringParams.state);
      state = JSON.parse(decodedState);
    } catch (e) {
      throw new MalformedCallbackInputError("Cannot parse state.");
    }

    if (!state.requestedURL) {
      throw new MalformedCallbackInputError("querystring.state.requestedURL is a required field.");
    }

    return state.requestedURL;
  }

  parseCode(event: CloudFrontRequestEvent): string {
    this.parseRequestedURLFromState(event);
    const queryStringParameters = this.getQueryStringParams(event);
    if (!queryStringParameters.code) {
      throw new MalformedCallbackInputError("querystring.code is required.");
    }
    return queryStringParameters.code;
  }

}
