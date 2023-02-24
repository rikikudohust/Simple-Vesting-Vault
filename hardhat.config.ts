import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import  * as dotenv from "dotenv"
dotenv.config()

const PRIVATE_KEY = process.env.KEY_1 || "5dbc12be0c66284d02655cdca2670543277aa00072555fdad9a504d04e83835f"
const KEY_2 = "c4831fdddc4fd6294f521007d56199b3a23013aecfceaea5b3a8b88f41a696d1"
console.log(PRIVATE_KEY)

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
        forking: {
            url: "https://bsc-dataseed.binance.org/",
            blockNumber: 25881507
        },
        // chainId: 31337,
        // gasPrice: 20000000000,
        // allowUnlimitedContractSize: true,
    },
    testnetbsc: {
        url: "https://data-seed-prebsc-2-s1.binance.org:8545",
        chainId: 97,
        gasPrice: 20000000000,
        gasMultiplier: 2,
        accounts: [PRIVATE_KEY, KEY_2]
    },
    mainnetbsc: {
        url: "https://bsc-dataseed.binance.org/",
        chainId: 56,
        gasPrice: 20000000000,
        accounts: [PRIVATE_KEY]
    }
},
};

export default config;
