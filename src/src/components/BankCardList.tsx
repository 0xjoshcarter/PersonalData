import { useEffect, useMemo, useState } from 'react';
import { Contract } from 'ethers';
import type { Address } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import '../styles/BankCardList.css';

type BankCardListProps = {
  refreshKey: number;
  onActionComplete: () => void;
};

type DecryptedCard = {
  number: string;
  password: string;
};

export function BankCardList({ refreshKey, onActionComplete }: BankCardListProps) {
  const { address } = useAccount();
  const signerPromise = useEthersSigner();
  const { instance } = useZamaInstance();

  const contractAddress = CONTRACT_ADDRESS as Address;

  const [decryptingIndex, setDecryptingIndex] = useState<number | null>(null);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [decrypted, setDecrypted] = useState<Record<number, DecryptedCard>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { data, refetch, isLoading } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'getAllBankCards',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  useEffect(() => {
    if (address) {
      refetch();
    }
  }, [address, refreshKey, refetch]);

  const cards = useMemo(() => {
    if (!data) {
      return [] as Array<{ name: string; numberHandle: string; passwordHandle: string }>;
    }

    const names = data[0] as string[];
    const numbers = data[1] as string[];
    const passwords = data[2] as string[];

    return names.map((name, index) => ({
      name,
      numberHandle: numbers[index],
      passwordHandle: passwords[index],
    }));
  }, [data]);

  const resetMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const decryptCard = async (index: number) => {
    resetMessages();

    if (!instance) {
      setErrorMessage('Encryption instance is not ready.');
      return;
    }

    if (!address) {
      setErrorMessage('Connect your wallet to decrypt a card.');
      return;
    }

    try {
      setDecryptingIndex(index);

      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Wallet signer is unavailable.');
      }

      const card = cards[index];
      const keypair = instance.generateKeypair();
      const handleContractPairs = [
        { handle: card.numberHandle, contractAddress: CONTRACT_ADDRESS },
        { handle: card.passwordHandle, contractAddress: CONTRACT_ADDRESS },
      ];

      const startTimestamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimestamp,
        durationDays,
      );

      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message,
      );

      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimestamp,
        durationDays,
      );

      const decryptedMap = result as Record<string, string | number | bigint>;
      const numberValue = decryptedMap[card.numberHandle] ?? '';
      const passwordValue = decryptedMap[card.passwordHandle] ?? '';

      setDecrypted((prev) => ({
        ...prev,
        [index]: {
          number: numberValue.toString(),
          password: passwordValue.toString(),
        },
      }));
      setSuccessMessage('Bank card decrypted locally.');
    } catch (error) {
      console.error('Unable to decrypt bank card', error);
      const message = error instanceof Error ? error.message : 'Unknown error decrypting bank card.';
      setErrorMessage(message);
    } finally {
      setDecryptingIndex(null);
    }
  };

  const removeCard = async (index: number) => {
    resetMessages();

    if (!address) {
      setErrorMessage('Connect your wallet to remove a card.');
      return;
    }

    try {
      setRemovingIndex(index);
      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Wallet signer is unavailable.');
      }

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.removeBankCard(index);
      await tx.wait();

      setSuccessMessage('Bank card removed.');
      setDecrypted((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });

      onActionComplete();
      await refetch();
    } catch (error) {
      console.error('Failed to remove bank card', error);
      const message = error instanceof Error ? error.message : 'Unknown error removing bank card.';
      setErrorMessage(message);
    } finally {
      setRemovingIndex(null);
    }
  };

  if (!address) {
    return (
      <div className="vault-empty-card">
        <p>Please connect your wallet to view stored bank cards.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="vault-empty-card">
        <p>Loading encrypted bank cards...</p>
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="vault-empty-card">
        <p>You have not stored any bank cards yet.</p>
        <button className="vault-refresh" onClick={() => refetch()}>
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="vault-list-card">
      <div className="vault-list-header">
        <h2>Encrypted Bank Cards</h2>
        <button className="vault-refresh" onClick={() => refetch()}>
          Refresh
        </button>
      </div>

      {errorMessage ? <p className="vault-error">{errorMessage}</p> : null}
      {successMessage ? <p className="vault-success">{successMessage}</p> : null}

      <ul className="vault-card-list">
        {cards.map((card, index) => {
          const decryptedCard = decrypted[index];
          const isDecrypting = decryptingIndex === index;
          const isRemoving = removingIndex === index;

          return (
            <li key={`${card.numberHandle}-${index}`} className="vault-card-item">
              <div className="vault-card-header">
                <h3>{card.name}</h3>
                <div className="vault-card-actions">
                  <button
                    className="vault-secondary"
                    onClick={() => (decryptedCard ? setDecrypted((prev) => {
                      const next = { ...prev };
                      delete next[index];
                      return next;
                    }) : decryptCard(index))}
                    disabled={isDecrypting}
                  >
                    {isDecrypting ? 'Decrypting...' : decryptedCard ? 'Hide secrets' : 'Decrypt secrets'}
                  </button>
                  <button
                    className="vault-danger"
                    onClick={() => removeCard(index)}
                    disabled={isRemoving}
                  >
                    {isRemoving ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>

              <div className="vault-card-content">
                <div>
                  <span className="vault-badge">Encrypted</span>
                  <p className="vault-handle">Card number handle: {card.numberHandle.slice(0, 18)}...</p>
                  <p className="vault-handle">Password handle: {card.passwordHandle.slice(0, 18)}...</p>
                </div>

                {decryptedCard ? (
                  <div className="vault-decrypted">
                    <p>
                      <strong>Card number:</strong> {decryptedCard.number}
                    </p>
                    <p>
                      <strong>Password:</strong> {decryptedCard.password}
                    </p>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
