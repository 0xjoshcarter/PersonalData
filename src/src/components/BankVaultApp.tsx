import { useState } from 'react';
import { Header } from './Header';
import { BankCardForm } from './BankCardForm';
import { BankCardList } from './BankCardList';
import '../styles/BankVaultApp.css';

export function BankVaultApp() {
  const [activeTab, setActiveTab] = useState<'add' | 'cards'>('add');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey((value) => value + 1);

  return (
    <div className="vault-app">
      <Header />
      <main className="vault-main">
        <div className="vault-container">
          <div className="vault-tabs">
            <button
              onClick={() => setActiveTab('add')}
              className={`vault-tab ${activeTab === 'add' ? 'active' : ''}`}
            >
              Store Bank Card
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`vault-tab ${activeTab === 'cards' ? 'active' : ''}`}
            >
              My Wallet Vault
            </button>
          </div>

          {activeTab === 'add' ? (
            <BankCardForm
              onCardStored={() => {
                handleRefresh();
                setActiveTab('cards');
              }}
            />
          ) : (
            <BankCardList refreshKey={refreshKey} onActionComplete={handleRefresh} />
          )}
        </div>
      </main>
    </div>
  );
}
