import "reflect-metadata";
import { CloudFrontRequestHandler } from "aws-lambda";
import { container } from "../../config/container";
import { AuthService } from "../../service/auth-service/auth-service";
import { IAuthService } from "../../service/auth-service/interface/auth-service";
import { IRequestUtils } from "../../utils/request-utils/interface/request-utils";
import { RequestUtils } from "../../utils/request-utils/request-utils";
import { ResponseBuilder } from "../../utils/response-utils/response-builder";
import { State } from "../../common/types";

export const lambdaHandler: CloudFrontRequestHandler = async (event, context) => {
  const authService: IAuthService = await container.getAsync(AuthService);
  try {
    await authService.authenticate(event, context);
    return event.Records[0].cf.request;
  } catch (e) {
    console.log(e);
    const requestUtils: IRequestUtils = await container.getAsync(RequestUtils);
    const state: State = {
      requestedURL: requestUtils.getRequestedURL(event)
    };
    const loginPageURL = new URL(await authService.getLoginPageURL(context));
    loginPageURL.searchParams.append("state", requestUtils.base64Encode(JSON.stringify(state)));
    return ResponseBuilder.create()
      .redirectTo(loginPageURL.toString())
      .build();
  }
}