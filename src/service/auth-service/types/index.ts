import { CognitoJwtVerifierSingleUserPool } from "aws-jwt-verify/cognito-verifier";

type JetVerifierProperties = {
  userPoolId: string;
  clientId: string;
  tokenUse: "id";
}

export type JwtVerifier = CognitoJwtVerifierSingleUserPool<JetVerifierProperties>

export interface TokenExchangeResponse {
  "access_token": string;
  "id_token": string;
  "refresh_token": string;
  "token_type": string;
  "expires_in": number;
}