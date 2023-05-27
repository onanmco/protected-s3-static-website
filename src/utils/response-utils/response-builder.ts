import { CloudFrontResultResponse } from "aws-lambda";
import { serialize } from "cookie";

export class ResponseBuilder {

  private response: CloudFrontResultResponse;

  private constructor() {
    this.response = {
      status: "",
    };
  }

  public static create(): ResponseBuilder {
    return new ResponseBuilder();
  }

  private initHeaders(specificHeader?: string) {
    if (this.response.headers === undefined) {
      this.response.headers = {};
    }

    if(specificHeader === undefined) {
      return;
    }

    if (this.response.headers[specificHeader] === undefined) {
      this.response.headers[specificHeader] = [];
    }
  }

  public setStatus(statusCode: number) {
    this.response.status = `${statusCode}`;
    return this;
  }


  public setHeader(key: string, value: string) {
    this.initHeaders(key);
    this.response.headers![key].push({
      key,
      value
    });
    return this;
  }

  public setHeaders(headers: Array<{ name: string, value: string }>) {
    headers.forEach(header => {
      this.setHeader(header.name, header.value);
    });
    return this;
  }

  public setCookie(name: string, value: string) {
    this.initHeaders("set-cookie");
    this.response.headers!["set-cookie"].push({
      key: "set-cookie",
      value: serialize(name, value)
    });
    return this;
  }

  public setCookies(cookies: Array<{ name: string, value: string }>) {
    cookies.forEach(cookie => {
      this.setCookie(cookie.name, cookie.value);
    });
    return this;
  }

  public redirectTo(location: string) {
    this.setStatus(301);
    this.setHeader("location", location);
    return this;
  }

  public build(): CloudFrontResultResponse {
    return this.response;
  }

}