export class MalformedCallbackInputError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "MalformedCallbackInputError";
  }
}
