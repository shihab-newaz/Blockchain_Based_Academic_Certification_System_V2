import { ForbiddenException, HttpException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

// Fabric Gateway errors carry the chaincode's error message (see
// infra/fabric/chaincode/certcc) inside a longer gRPC status string. Map the
// common, expected failure modes to HTTP responses; anything else falls back
// to a 500 rather than leaking raw gRPC internals to the client.
export function mapFabricError(error: unknown): HttpException {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('is not authorized')) {
    return new ForbiddenException('Not authorized to perform this operation');
  }
  if (message.includes('no certificate found')) {
    return new NotFoundException('No certificate found for this recipient');
  }
  if (message.includes('has been revoked') || message.includes('already revoked')) {
    return new NotFoundException('This certificate has been revoked');
  }
  if (message.includes('already issued and not revoked')) {
    return new ForbiddenException('Certificate already issued and not revoked for this recipient');
  }

  return new InternalServerErrorException(message);
}
