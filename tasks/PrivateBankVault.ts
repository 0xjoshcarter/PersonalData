import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("vault:address", "Prints the deployed PrivateBankVault address").setAction(async (_args, hre) => {
  const { deployments } = hre;
  const vault = await deployments.get("PrivateBankVault");
  console.log(`PrivateBankVault address: ${vault.address}`);
});

task("vault:add-card", "Adds an encrypted bank card")
  .addParam("bank", "Bank card name")
  .addParam("number", "Bank card number as an integer string")
  .addParam("password", "Bank card password as an integer string")
  .addOptionalParam("address", "PrivateBankVault address override")
  .setAction(async (taskArguments: TaskArguments, hre) => {
    const { ethers, deployments, fhevm } = hre;

    const vaultDeployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("PrivateBankVault");

    const vaultContract = await ethers.getContractAt("PrivateBankVault", vaultDeployment.address);
    const [signer] = await ethers.getSigners();

    const cardNumber = BigInt(taskArguments.number);
    const cardPassword = BigInt(taskArguments.password);

    await fhevm.initializeCLIApi();

    const encryptedInput = await fhevm
      .createEncryptedInput(vaultDeployment.address, signer.address)
      .add64(cardNumber)
      .add32(Number(cardPassword))
      .encrypt();

    const tx = await vaultContract
      .connect(signer)
      .addBankCard(
        taskArguments.bank,
        encryptedInput.handles[0],
        encryptedInput.handles[1],
        encryptedInput.inputProof,
      );

    console.log(`Submitted addBankCard transaction: ${tx.hash}`);
    await tx.wait();
    console.log(`Bank card stored for ${signer.address}`);
  });

task("vault:decrypt-card", "Decrypts a stored card for the first signer")
  .addParam("index", "Index of the card to decrypt")
  .addOptionalParam("address", "PrivateBankVault address override")
  .setAction(async (taskArguments: TaskArguments, hre) => {
    const { ethers, deployments, fhevm } = hre;

    const vaultDeployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("PrivateBankVault");

    const vaultContract = await ethers.getContractAt("PrivateBankVault", vaultDeployment.address);
    const [signer] = await ethers.getSigners();

    const index = Number(taskArguments.index);

    const card = await vaultContract.getBankCard(signer.address, index);

    await fhevm.initializeCLIApi();

    const decryptedNumber = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      card.cardNumber,
      vaultDeployment.address,
      signer,
    );

    const decryptedPassword = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      card.password,
      vaultDeployment.address,
      signer,
    );

    console.log(`Bank: ${card.bankName}`);
    console.log(`Card number: ${decryptedNumber}`);
    console.log(`Password: ${decryptedPassword}`);
  });
