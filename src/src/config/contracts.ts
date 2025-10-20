export const CONTRACT_ADDRESS = "0x59F2F947D888Af864cAb4b78352502D6475D93D7";

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "CardIndexOutOfBounds",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidBankName",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "cardIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "bankName",
        "type": "string"
      }
    ],
    "name": "BankCardAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "previousIndex",
        "type": "uint256"
      }
    ],
    "name": "BankCardRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "cardIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "bankName",
        "type": "string"
      }
    ],
    "name": "BankCardUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "bankName",
        "type": "string"
      },
      {
        "internalType": "externalEuint64",
        "name": "cardNumber",
        "type": "bytes32"
      },
      {
        "internalType": "externalEuint32",
        "name": "cardPassword",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "addBankCard",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getAllBankCards",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "names",
        "type": "string[]"
      },
      {
        "internalType": "euint64[]",
        "name": "cardNumbers",
        "type": "bytes32[]"
      },
      {
        "internalType": "euint32[]",
        "name": "passwords",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getBankCard",
    "outputs": [
      {
        "internalType": "string",
        "name": "bankName",
        "type": "string"
      },
      {
        "internalType": "euint64",
        "name": "cardNumber",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "password",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getBankCardCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "protocolId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "removeBankCard",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "bankName",
        "type": "string"
      },
      {
        "internalType": "externalEuint64",
        "name": "cardNumber",
        "type": "bytes32"
      },
      {
        "internalType": "externalEuint32",
        "name": "cardPassword",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "updateBankCard",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
