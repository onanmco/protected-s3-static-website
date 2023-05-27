import {CognitoJwtVerifier} from "aws-jwt-verify";
import {CloudFrontRequestEvent, Context} from "aws-lambda";
import {inject} from "inversify";
import {UnauthorizedError} from "../../error/UnauthorizedError";
import {autoBindSingleton} from "../../lib/inversify";
import {LambdaUtils} from "../../utils/lambda-utils/lambda-utils";
import {IRequestUtils} from "../../utils/request-utils/interface/request-utils";
import {RequestUtils} from "../../utils/request-utils/request-utils";
import {ISsmService} from "../ssm-service/interface/ssm-service";
import {SsmService} from "../ssm-service/ssm-service";
import {IAuthService} from "./interface/auth-service";
import {JwtVerifier, TokenExchangeResponse} from "./types";
import axios from "axios";
import {CognitoUserPoolClientSecrets} from "../../../common/types";
import {URLSearchParams} from "url";

@autoBindSingleton()
export class AuthService implements IAuthService {
  private static jwtVerifier: JwtVerifier;

  @inject(RequestUtils)
  private requestUtils: IRequestUtils;
  @inject(SsmService)
  private ssmService: ISsmService;
  @inject(LambdaUtils)
  private lambdaUtils: LambdaUtils;

  private async getJwtVerifier(context: Context) {
    if (!AuthService.jwtVerifier) {
      const env = this.lambdaUtils.getEnvironmentNameFromContext(context);
      const app = this.lambdaUtils.getApplicationNameFromContext(context);
      const userPoolId = await this.ssmService.getParameterValue(`/${env}/${app}/cognito/user-pool-id`);
      const clientId = await this.ssmService.getParameterValue(`/${env}/${app}/cognito/client-id`);

      AuthService.jwtVerifier = CognitoJwtVerifier.create({
        userPoolId,
        clientId,
        tokenUse: "id"
      });
    }

    return AuthService.jwtVerifier;
  }

  public async authenticate(event: CloudFrontRequestEvent, context: Context): Promise<void> {
    const cookies = this.requestUtils.extractCookies(event);

    if (!cookies.idToken) {
      throw new UnauthorizedError("cookies.idToken is missing.");
    }

    const jwtVerifier = await this.getJwtVerifier(context);

    try {
      await jwtVerifier.verify(cookies.idToken);
    } catch (e) {
      console.log(e);
      throw new UnauthorizedError("invalid idToken provided.");
    }
  }

  public async getLoginPageURL(context: Context): Promise<string> {
    const env = this.lambdaUtils.getEnvironmentNameFromContext(context);
    const app = this.lambdaUtils.getApplicationNameFromContext(context);
    return await this.ssmService.getParameterValue(`/${env}/${app}/cognito/login-url`);
  }

  public async exchangeCodeForToken(code: string, context: Context): Promise<string> {
    const envName = this.lambdaUtils.getEnvironmentNameFromContext(context);
    const appName = this.lambdaUtils.getApplicationNameFromContext(context);

    const secretString = await this.ssmService.getParameterValue(`/aws/reference/secretsmanager/${envName}/${appName}/cognito/user-pool/client`);
    const {
      clientId,
      clientSecret
    } = JSON.parse(secretString) as CognitoUserPoolClientSecrets;

    const userPoolDomain = await this.ssmService.getParameterValue(`/${envName}/${appName}/cognito/user-pool/domain`);
    const redirectURI = await this.ssmService.getParameterValue(`/${envName}/${appName}/cognito/user-pool/client/redirect-uri`);

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", clientId);
    params.append("code", code);
    params.append("redirect_uri", redirectURI);

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`
    };

    const url = `${userPoolDomain}/oauth2/token`;

    const response = await axios.post(
      url,
      params,
      {
        headers
      }
    );

    const {
      id_token
    } = response.data as TokenExchangeResponse;

    return id_token;
  }

}