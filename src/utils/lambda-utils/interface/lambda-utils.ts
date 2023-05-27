import { Context } from "aws-lambda";

export interface ILambdaUtils {
  getEnvironmentNameFromContext(context: Context): string;
  getApplicationNameFromContext(context: Context): string;
}
