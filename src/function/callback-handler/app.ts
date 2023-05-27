import {CloudFrontRequestHandler} from "aws-lambda";
import "reflect-metadata";
import {container} from "../../config/container";
import {IRequestUtils} from "../../utils/request-utils/interface/request-utils";
import {RequestUtils} from "../../utils/request-utils/request-utils";
import {ResponseBuilder} from "../../utils/response-utils/response-builder";
import {IAuthService} from "../../service/auth-service/interface/auth-service";
import {AuthService} from "../../service/auth-service/auth-service";

export const lambdaHandler: CloudFrontRequestHandler = async (event, context) => {
  const requestUtils: IRequestUtils = await container.getAsync(RequestUtils);
  const authService: IAuthService = await container.getAsync(AuthService);
  try {
    const code = requestUtils.parseCode(event);
    const requestedUrl = requestUtils.parseRequestedURLFromState(event);
    const idToken = await authService.exchangeCodeForToken(code, context);
    return ResponseBuilder.create()
      .setCookie("idToken", idToken)
      .redirectTo(requestedUrl)
      .build();
  } catch (e) {
    console.log(e);
    return ResponseBuilder.create()
      .redirectTo(requestUtils.getRequestedURL(event))
      .build();
  }
}