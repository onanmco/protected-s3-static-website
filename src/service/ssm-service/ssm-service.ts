import {GetParameterCommand} from "@aws-sdk/client-ssm";
import {ssmClient} from "../../client/ssm";
import {autoBindSingleton} from "../../lib/inversify";
import {ISsmService} from "./interface/ssm-service";

@autoBindSingleton()
export class SsmService implements ISsmService {
  async getParameterValue(name: string): Promise<string> {
    const {
      Parameter
    } = await ssmClient.send(new GetParameterCommand({
      Name: name,
      WithDecryption: true
    }));

    return Parameter?.Value!;
  }

}
