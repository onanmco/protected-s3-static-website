export interface ISsmService {
  getParameterValue(name: string): Promise<string>;
}
