import { Wallet } from 'ethers';

// Ported from frontend/src/utils/GenerateCredentials.js. Client-side wallet
// generation is the one sanctioned use of ethers in this app — it just
// produces a demo recipient identity label, unrelated to Fabric auth.
export function generateStudentAddress(existingAddresses: string[]): string {
  let address: string;
  do {
    address = Wallet.createRandom().address;
  } while (existingAddresses.includes(address));
  return address;
}
