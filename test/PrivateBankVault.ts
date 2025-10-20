import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { PrivateBankVault, PrivateBankVault__factory } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("PrivateBankVault")) as PrivateBankVault__factory;
  const vault = (await factory.deploy()) as PrivateBankVault;
  const address = await vault.getAddress();

  return { vault, address };
}

describe("PrivateBankVault", function () {
  let signers: Signers;
  let vault: PrivateBankVault;
  let vaultAddress: string;

  before(async function () {
    const ethSigners = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }

    ({ vault, address: vaultAddress } = await deployFixture());
  });

  async function encryptCardData(owner: HardhatEthersSigner, number: bigint, password: number) {
    return fhevm
      .createEncryptedInput(vaultAddress, owner.address)
      .add64(number)
      .add32(password)
      .encrypt();
  }

  it("stores encrypted cards and allows user decryption", async function () {
    const cardNumber = 1234567890123456n;
    const pin = 1234;
    const encrypted = await encryptCardData(signers.alice, cardNumber, pin);

    await vault
      .connect(signers.alice)
      .addBankCard("Example Bank", encrypted.handles[0], encrypted.handles[1], encrypted.inputProof);

    const count = await vault.getBankCardCount(signers.alice.address);
    expect(count).to.equal(1);

    const card = await vault.getBankCard(signers.alice.address, 0);
    expect(card.bankName).to.equal("Example Bank");

    const decryptedNumber = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      card.cardNumber,
      vaultAddress,
      signers.alice,
    );
    const decryptedPassword = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      card.password,
      vaultAddress,
      signers.alice,
    );

    expect(decryptedNumber).to.equal(cardNumber);
    expect(decryptedPassword).to.equal(pin);
  });

  it("returns all cards for a user", async function () {
    const first = await encryptCardData(signers.alice, 1111111111111111n, 1111);
    const second = await encryptCardData(signers.alice, 2222222222222222n, 2222);

    await vault
      .connect(signers.alice)
      .addBankCard("Alpha", first.handles[0], first.handles[1], first.inputProof);
    await vault
      .connect(signers.alice)
      .addBankCard("Beta", second.handles[0], second.handles[1], second.inputProof);

    const allCards = await vault.getAllBankCards(signers.alice.address);
    expect(allCards.names.length).to.equal(2);
    expect(allCards.names[0]).to.equal("Alpha");
    expect(allCards.names[1]).to.equal("Beta");

    const firstNumber = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      allCards.cardNumbers[0],
      vaultAddress,
      signers.alice,
    );
    const secondNumber = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      allCards.cardNumbers[1],
      vaultAddress,
      signers.alice,
    );

    expect(firstNumber).to.equal(1111111111111111n);
    expect(secondNumber).to.equal(2222222222222222n);
  });

  it("allows updating stored cards", async function () {
    const original = await encryptCardData(signers.alice, 3333333333333333n, 3333);

    await vault
      .connect(signers.alice)
      .addBankCard("Gamma", original.handles[0], original.handles[1], original.inputProof);

    const updated = await encryptCardData(signers.alice, 9999999999999999n, 9999);

    await vault
      .connect(signers.alice)
      .updateBankCard(0, "Gamma Prime", updated.handles[0], updated.handles[1], updated.inputProof);

    const card = await vault.getBankCard(signers.alice.address, 0);
    expect(card.bankName).to.equal("Gamma Prime");

    const decryptedNumber = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      card.cardNumber,
      vaultAddress,
      signers.alice,
    );
    expect(decryptedNumber).to.equal(9999999999999999n);
  });

  it("supports removing cards", async function () {
    const first = await encryptCardData(signers.alice, 1111111111111111n, 1111);
    const second = await encryptCardData(signers.alice, 2222222222222222n, 2222);

    await vault
      .connect(signers.alice)
      .addBankCard("Alpha", first.handles[0], first.handles[1], first.inputProof);
    await vault
      .connect(signers.alice)
      .addBankCard("Beta", second.handles[0], second.handles[1], second.inputProof);

    await vault.connect(signers.alice).removeBankCard(0);

    const count = await vault.getBankCardCount(signers.alice.address);
    expect(count).to.equal(1);

    const card = await vault.getBankCard(signers.alice.address, 0);
    expect(card.bankName).to.be.oneOf(["Alpha", "Beta"]);
  });
});
