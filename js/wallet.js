/**
 * Safe, Non-Intrusive Web3 Wallet Connector (EIP-1193)
 * Provides safe MetaMask detection with graceful educational fallback modal.
 * ZERO hardcoded keys or backend secrets.
 */

class Web3WalletConnector {
  constructor() {
    this.account = null;
    this.chainId = null;
    this.isConnecting = false;

    this.init();
  }

  init() {
    this.walletButtons = document.querySelectorAll('.wallet-connect-btn');
    this.statusBadges = document.querySelectorAll('.wallet-status-badge');
    this.modal = document.getElementById('wallet-modal');
    this.modalClose = document.getElementById('modal-close-btn');

    this.walletButtons.forEach(btn => {
      btn.addEventListener('click', () => this.handleConnectClick());
    });

    if (this.modalClose) {
      this.modalClose.addEventListener('click', () => this.closeModal());
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }

    // Check if Ethereum provider exists and handle events
    if (this.hasEthereum()) {
      window.ethereum.on('accountsChanged', (accounts) => this.onAccountsChanged(accounts));
      window.ethereum.on('chainChanged', (chainId) => this.onChainChanged(chainId));
      this.checkAlreadyConnected();
    }
  }

  hasEthereum() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  async checkAlreadyConnected() {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        this.account = accounts[0];
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        this.chainId = chainId;
        this.updateUI(true);
      }
    } catch (err) {
      console.warn('Silent wallet check notice:', err);
    }
  }

  async handleConnectClick() {
    if (!this.hasEthereum()) {
      this.openModal();
      return;
    }

    if (this.account) {
      // If already connected, clicking toggles disconnect or shows account details
      const confirmDisconnect = confirm(`Connected as ${this.formatAddress(this.account)}.\nWould you like to disconnect?`);
      if (confirmDisconnect) {
        this.account = null;
        this.updateUI(false);
      }
      return;
    }

    try {
      this.isConnecting = true;
      this.updateButtonLoading(true);

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        this.account = accounts[0];
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        this.chainId = chainId;
        this.updateUI(true);
      }
    } catch (err) {
      if (err.code === 4001) {
        alert('Wallet connection was cancelled by the user.');
      } else {
        console.error('Wallet connection error:', err);
        alert('Could not complete connection. Please check your browser extension.');
      }
    } finally {
      this.isConnecting = false;
      this.updateButtonLoading(false);
    }
  }

  onAccountsChanged(accounts) {
    if (accounts.length === 0) {
      this.account = null;
      this.updateUI(false);
    } else {
      this.account = accounts[0];
      this.updateUI(true);
    }
  }

  onChainChanged(chainId) {
    this.chainId = chainId;
    this.updateUI(true);
  }

  getNetworkName(hexChainId) {
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0xaa36a7': 'Sepolia Testnet',
      '0x89': 'Polygon PoS',
      '0xa4b1': 'Arbitrum One',
      '0xa': 'Optimism',
      '0x2105': 'Base',
      '0x5': 'Goerli (Deprecated)'
    };
    return networks[hexChainId] || 'EVM Network';
  }

  formatAddress(addr) {
    if (!addr) return '';
    return addr.substring(0, 6) + '...' + addr.substring(addr.length - 4);
  }

  updateButtonLoading(isLoading) {
    this.walletButtons.forEach(btn => {
      if (isLoading) {
        btn.textContent = 'Connecting...';
        btn.disabled = true;
      } else {
        btn.disabled = false;
      }
    });
  }

  updateUI(isConnected) {
    this.walletButtons.forEach(btn => {
      if (isConnected && this.account) {
        btn.innerHTML = `
          <span class="pulse-dot"></span>
          <span>${this.formatAddress(this.account)}</span>
        `;
        btn.classList.add('connected');
        btn.title = `Connected: ${this.account} (${this.getNetworkName(this.chainId)}) - Click to Disconnect`;
      } else {
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="4" />
            <path d="M18 12h.01" />
          </svg>
          <span>Connect Wallet</span>
        `;
        btn.classList.remove('connected');
        btn.title = 'Connect with MetaMask or compatible browser wallet';
      }
    });
  }

  openModal() {
    if (this.modal) {
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.web3Wallet = new Web3WalletConnector();
});
