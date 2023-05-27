import { Context } from "aws-lambda";
import { ILambdaUtils } from "./interface/lambda-utils";
import { autoBindSingleton } from "../../lib/inversify";
import {ParseContextResponse} from "./types";

@autoBindSingleton()
export class LambdaUtils implements ILambdaUtils {

  private parseContext(context: Context): ParseContextResponse {
    const pattern = /^((?<region>[^\.]+)\.)?(?<env>[^\-]+)\-(?<app>[^\-]+)\-.*$/;
    const {groups} = context.functionName.match(pattern) as unknown as {groups: ParseContextResponse};
    return groups;
  }

  getEnvironmentNameFromContext(context: Context): string {
    return this.parseContext(context)
      .env;
  }

  getApplicationNameFromContext(context: Context): string {
    return this.parseContext(context)
      .app;
  }

}
