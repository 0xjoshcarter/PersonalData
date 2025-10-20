import * as dotenv from "dotenv";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

dotenv.config();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedVault = await deploy("PrivateBankVault", {
    from: deployer,
    log: true,
  });

  if (!process.env.INFURA_API_KEY) {
    console.warn("INFURA_API_KEY is not set in environment variables");
  }

  console.log(`PrivateBankVault contract: `, deployedVault.address);
};
export default func;
func.id = "deploy_private_bank_vault"; // id required to prevent reexecution
func.tags = ["PrivateBankVault"];
