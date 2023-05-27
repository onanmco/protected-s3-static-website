import { CloudFrontRequestEvent, Context } from "aws-lambda";

export interface IAuthService {
  authenticate(event: CloudFrontRequestEvent, context: Context): Promise<void>;
  getLoginPageURL(context: Context): Promise<string>;
  exchangeCodeForToken(code: string, context: Context): Promise<string>;
}
