// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, euint64, externalEuint32, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title PrivateBankVault
/// @notice Stores encrypted bank card credentials for individual users using Zama FHE
contract PrivateBankVault is SepoliaConfig {
    struct BankCard {
        string bankName;
        euint64 cardNumber;
        euint32 password;
    }

    mapping(address => BankCard[]) private _userCards;

    error InvalidBankName();
    error CardIndexOutOfBounds();

    event BankCardAdded(address indexed user, uint256 indexed cardIndex, string bankName);
    event BankCardUpdated(address indexed user, uint256 indexed cardIndex, string bankName);
    event BankCardRemoved(address indexed user, uint256 indexed previousIndex);

    /// @notice Adds a new encrypted bank card for the caller
    /// @param bankName The name of the bank card
    /// @param cardNumber The encrypted card number handle
    /// @param cardPassword The encrypted card password handle
    /// @param inputProof The proof associated with the encrypted inputs
    function addBankCard(
        string calldata bankName,
        externalEuint64 cardNumber,
        externalEuint32 cardPassword,
        bytes calldata inputProof
    ) external {
        if (bytes(bankName).length == 0) {
            revert InvalidBankName();
        }

        euint64 encryptedCardNumber = FHE.fromExternal(cardNumber, inputProof);
        euint32 encryptedPassword = FHE.fromExternal(cardPassword, inputProof);

        BankCard memory card = BankCard({bankName: bankName, cardNumber: encryptedCardNumber, password: encryptedPassword});
        _userCards[msg.sender].push(card);

        _refreshPermissions(msg.sender, encryptedCardNumber, encryptedPassword);

        emit BankCardAdded(msg.sender, _userCards[msg.sender].length - 1, bankName);
    }

    /// @notice Updates an existing encrypted bank card for the caller
    /// @param index The index of the card to update
    /// @param bankName The updated bank name
    /// @param cardNumber The new encrypted card number handle
    /// @param cardPassword The new encrypted card password handle
    /// @param inputProof The proof associated with the encrypted inputs
    function updateBankCard(
        uint256 index,
        string calldata bankName,
        externalEuint64 cardNumber,
        externalEuint32 cardPassword,
        bytes calldata inputProof
    ) external {
        if (bytes(bankName).length == 0) {
            revert InvalidBankName();
        }

        BankCard[] storage cards = _userCards[msg.sender];
        if (index >= cards.length) {
            revert CardIndexOutOfBounds();
        }

        euint64 encryptedCardNumber = FHE.fromExternal(cardNumber, inputProof);
        euint32 encryptedPassword = FHE.fromExternal(cardPassword, inputProof);

        cards[index].bankName = bankName;
        cards[index].cardNumber = encryptedCardNumber;
        cards[index].password = encryptedPassword;

        _refreshPermissions(msg.sender, encryptedCardNumber, encryptedPassword);

        emit BankCardUpdated(msg.sender, index, bankName);
    }

    /// @notice Removes an existing bank card for the caller
    /// @param index The index of the card to remove
    function removeBankCard(uint256 index) external {
        BankCard[] storage cards = _userCards[msg.sender];
        uint256 cardsLength = cards.length;

        if (index >= cardsLength) {
            revert CardIndexOutOfBounds();
        }

        uint256 lastIndex = cardsLength - 1;
        if (index != lastIndex) {
            cards[index] = cards[lastIndex];
        }

        cards.pop();

        emit BankCardRemoved(msg.sender, index);
    }

    /// @notice Returns the number of stored bank cards for a user
    /// @param user The address whose cards are being queried
    /// @return The number of stored bank cards
    function getBankCardCount(address user) external view returns (uint256) {
        return _userCards[user].length;
    }

    /// @notice Returns a specific bank card for a user
    /// @param user The address whose card is being queried
    /// @param index The index of the requested card
    /// @return bankName The stored bank name
    /// @return cardNumber The encrypted card number
    /// @return password The encrypted card password
    function getBankCard(
        address user,
        uint256 index
    ) external view returns (string memory bankName, euint64 cardNumber, euint32 password) {
        BankCard[] storage cards = _userCards[user];
        if (index >= cards.length) {
            revert CardIndexOutOfBounds();
        }

        BankCard storage card = cards[index];
        return (card.bankName, card.cardNumber, card.password);
    }

    /// @notice Returns all stored bank cards for a user
    /// @param user The address whose cards are being queried
    /// @return names The list of bank names
    /// @return cardNumbers The list of encrypted card numbers
    /// @return passwords The list of encrypted card passwords
    function getAllBankCards(
        address user
    )
        external
        view
        returns (string[] memory names, euint64[] memory cardNumbers, euint32[] memory passwords)
    {
        BankCard[] storage cards = _userCards[user];
        uint256 length = cards.length;

        names = new string[](length);
        cardNumbers = new euint64[](length);
        passwords = new euint32[](length);

        for (uint256 i = 0; i < length; i++) {
            BankCard storage card = cards[i];
            names[i] = card.bankName;
            cardNumbers[i] = card.cardNumber;
            passwords[i] = card.password;
        }
    }

    function _refreshPermissions(address user, euint64 cardNumber, euint32 password) private {
        FHE.allowThis(cardNumber);
        FHE.allow(cardNumber, user);

        FHE.allowThis(password);
        FHE.allow(password, user);
    }
}
