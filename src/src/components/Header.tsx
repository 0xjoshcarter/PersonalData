import { ConnectButton } from '@rainbow-me/rainbowkit';
import '../styles/Header.css';

export function Header() {
  return (
    <header className="vault-header">
      <div className="vault-header-container">
        <div>
          <h1 className="vault-header-title">Private Bank Vault</h1>
          <p className="vault-header-subtitle">
            Manage encrypted bank cards directly from your browser. Only you control the decryption keys.
          </p>
        </div>
        <ConnectButton />
      </div>
    </header>
  );
}
