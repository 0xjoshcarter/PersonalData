import { useState } from 'react';
import { Contract } from 'ethers';
import { useAccount } from 'wagmi';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import '../styles/BankCardForm.css';

type FormState = {
  bankName: string;
  cardNumber: string;
  password: string;
};

type BankCardFormProps = {
  onCardStored: () => void;
};

export function BankCardForm({ onCardStored }: BankCardFormProps) {
  const { address } = useAccount();
  const { instance, isLoading: zamaLoading, error: zamaError } = useZamaInstance();
  const signerPromise = useEthersSigner();

  const [formState, setFormState] = useState<FormState>({
    bankName: '',
    cardNumber: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const resetMessages = () => {
    setStatusMessage('');
    setErrorMessage('');
  };

  const handleChange = (key: keyof FormState, value: string) => {
    resetMessages();
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const validateInputs = () => {
    if (!formState.bankName.trim()) {
      setErrorMessage('Bank name is required.');
      return false;
    }

    if (!/^\d{8,19}$/.test(formState.cardNumber.replaceAll(' ', ''))) {
      setErrorMessage('Card number must contain 8-19 digits.');
      return false;
    }

    if (!/^\d{4,8}$/.test(formState.password)) {
      setErrorMessage('Password must contain 4-8 digits.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    if (!address) {
      setErrorMessage('Connect your wallet to store a bank card.');
      return;
    }

    if (!instance || zamaLoading) {
      setErrorMessage('Encryption service is still loading.');
      return;
    }

    if (!validateInputs()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const signer = await signerPromise;
      if (!signer) {
        throw new Error('Wallet signer is unavailable.');
      }

      const normalizedNumber = formState.cardNumber.replaceAll(' ', '');
      const cardNumberValue = BigInt(normalizedNumber);
      const passwordValue = Number(formState.password);

      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.add64(cardNumberValue);
      input.add32(passwordValue);

      const encryptedInput = await input.encrypt();

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.addBankCard(
        formState.bankName.trim(),
        encryptedInput.handles[0],
        encryptedInput.handles[1],
        encryptedInput.inputProof,
      );

      setStatusMessage('Submitting transaction...');
      await tx.wait();

      setStatusMessage('Bank card stored securely on-chain.');
      setFormState({ bankName: '', cardNumber: '', password: '' });
      onCardStored();
    } catch (error) {
      console.error('Failed to store bank card', error);
      const message = error instanceof Error ? error.message : 'Unknown error storing bank card.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vault-form-card">
      <h2 className="vault-form-title">Secure Bank Card Storage</h2>
      <p className="vault-form-description">
        Encrypt your card number and password locally with Zama FHE and store them safely on-chain.
      </p>

      <form className="vault-form" onSubmit={handleSubmit}>
        <label className="vault-label">
          Bank Name
          <input
            type="text"
            value={formState.bankName}
            onChange={(event) => handleChange('bankName', event.target.value)}
            placeholder="e.g. City Credit Premier"
            className="vault-input"
            disabled={isSubmitting}
            required
          />
        </label>

        <label className="vault-label">
          Card Number
          <input
            type="text"
            value={formState.cardNumber}
            onChange={(event) => handleChange('cardNumber', event.target.value.replace(/[^\d\s]/g, ''))}
            placeholder="16 digit number"
            className="vault-input"
            disabled={isSubmitting}
            required
          />
        </label>

        <label className="vault-label">
          Password
          <input
            type="password"
            value={formState.password}
            onChange={(event) => handleChange('password', event.target.value.replace(/[^\d]/g, ''))}
            placeholder="4-8 digits"
            className="vault-input"
            disabled={isSubmitting}
            required
          />
        </label>

        <button
          type="submit"
          className="vault-submit"
          disabled={isSubmitting || zamaLoading || !address}
        >
          {zamaLoading ? 'Initializing encryption...' : isSubmitting ? 'Storing...' : 'Store Bank Card'}
        </button>
      </form>

      {zamaError ? <p className="vault-error">{zamaError}</p> : null}
      {errorMessage ? <p className="vault-error">{errorMessage}</p> : null}
      {statusMessage ? <p className="vault-success">{statusMessage}</p> : null}

      <div className="vault-hint">
        <h3>How it works</h3>
        <ul>
          <li>Your card information is encrypted locally with Zama FHE.</li>
          <li>The blockchain only stores encrypted card number and password.</li>
          <li>You can decrypt the values later through the vault below.</li>
        </ul>
      </div>
    </div>
  );
}
