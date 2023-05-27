import { CloudFrontRequestEvent } from "aws-lambda";
import { Cookies, QueryStringParameters } from "../../../common/types";

export interface IRequestUtils {
  extractCookies(event: CloudFrontRequestEvent): Cookies;
  getBaseURL(event: CloudFrontRequestEvent): string;
  getRequestedURL(event: CloudFrontRequestEvent): string;
  base64Encode(input: string): string;
  base64Decode(input: string): string;
  getQueryStringParams(event: CloudFrontRequestEvent): QueryStringParameters;
  parseRequestedURLFromState(event: CloudFrontRequestEvent): string;
  parseCode(event: CloudFrontRequestEvent): string;
}
