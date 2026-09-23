/**
 * Interactive Blockchain Consensus & Block Simulator
 * Step-by-step cryptographic lifecycle simulation
 */

class BlockchainSimulator {
  constructor() {
    this.currentStep = 0;
    this.isSimulating = false;
    this.blockHeight = 1048;
    this.chainHistory = [
      {
        height: 1046,
        hash: '0x000a4f89d9e21...',
        prevHash: '0x00021c4b78ae0...',
        txCount: 42,
        validator: '0x71C...3A90'
      },
      {
        height: 1047,
        hash: '0x0003b7194f2ca...',
        prevHash: '0x000a4f89d9e21...',
        txCount: 68,
        validator: '0x4FE...98B2'
      }
    ];

    this.steps = [
      {
        num: 1,
        title: "1. Transaction Signed",
        badge: "Cryptographic Signature",
        desc: "Alice initiates a transaction sending 0.5 ETH to Bob. Her Web3 wallet signs the payload using her private key without exposing the key itself.",
        data: () => ({
          "Tx Hash": "0x" + this.randomHex(16),
          "Sender (Alice)": "0x3B9...82A1",
          "Recipient (Bob)": "0x9F1...44D8",
          "Payload Value": "0.500 ETH",
          "Signature (ECDSA)": "0x78ab...9c12 (Valid)"
        })
      },
      {
        num: 2,
        title: "2. Peer-to-Peer Verification",
        badge: "P2P Propagation",
        desc: "The signed transaction is broadcast across thousands of independent peer nodes. Nodes mathematically verify the cryptographic signature and verify Alice has sufficient balance.",
        data: () => ({
          "Propagated Nodes": "14,892 Nodes",
          "Signature Check": "VERIFIED (ecrecover = Alice)",
          "Nonce Check": "Valid (Nonce #14)",
          "Mempool Status": "Accepted / Pending Inclusion"
        })
      },
      {
        num: 3,
        title: "3. Block Bundling",
        badge: "Merkle Tree Assembly",
        desc: "A designated block proposer aggregates pending mempool transactions into a candidate block and calculates the Merkle Tree root hash.",
        data: () => ({
          "Candidate Block": `#${this.blockHeight}`,
          "Transactions Included": "158 Txns",
          "Gas Used": "11,842,910 (78.9%)",
          "Merkle Root": "0x" + this.randomHex(16)
        })
      },
      {
        num: 4,
        title: "4. Network Consensus",
        badge: "Proof-of-Stake Validation",
        desc: "A committee of staked validator nodes attests to the block validity. Over 2/3 of validator votes are required to reach cryptographic finality without a central authority.",
        data: () => ({
          "Consensus Protocol": "Proof-of-Stake (PoS)",
          "Validator Committee": "128 Attestations",
          "Consensus Status": "Supermajority Reached (99.8%)",
          "Energy Consumed": "< 0.001 kWh (Eco-Friendly)"
        })
      },
      {
        num: 5,
        title: "5. Cryptographically Chained",
        badge: "Immutable Ledger Finality",
        desc: "The verified block is permanently appended to the ledger. Its header includes the hash of the previous block, creating an unbreakable, tamper-evident cryptographic chain.",
        data: () => ({
          "Finalized Block": `#${this.blockHeight}`,
          "Previous Block Hash": this.chainHistory[this.chainHistory.length - 1].hash,
          "New Block Hash": "0x000" + this.randomHex(13),
          "Ledger Status": "IMMUTABLE & FINALIZED"
        })
      }
    ];

    this.currentTxData = null;
    this.init();
  }

  randomHex(len) {
    let s = '';
    const hex = '0123456789abcdef';
    for (let i = 0; i < len; i++) {
      s += hex[Math.floor(Math.random() * hex.length)];
    }
    return s;
  }

  init() {
    this.stepItems = document.querySelectorAll('.step-item');
    this.titleEl = document.getElementById('sim-step-title');
    this.badgeEl = document.getElementById('sim-step-badge');
    this.descEl = document.getElementById('sim-step-desc');
    this.dataBoxEl = document.getElementById('sim-data-box');
    this.chainScrollEl = document.getElementById('chain-blocks-container');

    const btnSimulate = document.getElementById('btn-simulate-tx');
    const btnNext = document.getElementById('btn-next-step');
    const btnAuto = document.getElementById('btn-auto-simulate');

    if (btnSimulate) btnSimulate.addEventListener('click', () => this.startNewSimulation());
    if (btnNext) btnNext.addEventListener('click', () => this.nextStep());
    if (btnAuto) btnAuto.addEventListener('click', () => this.toggleAutoSimulation());

    // Allow clicking specific step dots
    this.stepItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        this.goToStep(index);
      });
    });

    this.renderChain();
    this.goToStep(0);
  }

  startNewSimulation() {
    this.blockHeight++;
    this.currentTxData = null;
    this.goToStep(0);
  }

  toggleAutoSimulation() {
    if (this.isSimulating) {
      clearInterval(this.autoInterval);
      this.isSimulating = false;
      const btn = document.getElementById('btn-auto-simulate');
      if (btn) btn.textContent = 'Auto Play';
    } else {
      this.isSimulating = true;
      const btn = document.getElementById('btn-auto-simulate');
      if (btn) btn.textContent = 'Pause Auto';

      this.autoInterval = setInterval(() => {
        if (this.currentStep < this.steps.length - 1) {
          this.nextStep();
        } else {
          this.startNewSimulation();
        }
      }, 2200);
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.goToStep(this.currentStep + 1);
    } else {
      this.startNewSimulation();
    }
  }

  goToStep(index) {
    this.currentStep = index;
    const stepConfig = this.steps[index];

    // Update Step tracker UI
    this.stepItems.forEach((item, i) => {
      item.classList.remove('active', 'completed');
      if (i === index) {
        item.classList.add('active');
      } else if (i < index) {
        item.classList.add('completed');
      }
    });

    // Update Content
    if (this.titleEl) this.titleEl.textContent = stepConfig.title;
    if (this.badgeEl) this.badgeEl.textContent = stepConfig.badge;
    if (this.descEl) this.descEl.textContent = stepConfig.desc;

    // Update Data Box
    if (this.dataBoxEl) {
      const dataObj = stepConfig.data();
      this.dataBoxEl.innerHTML = '';
      for (const [key, val] of Object.entries(dataObj)) {
        const row = document.createElement('div');
        row.className = 'sim-data-row';
        row.innerHTML = `
          <span class="sim-data-label">${key}</span>
          <span class="sim-data-val">${val}</span>
        `;
        this.dataBoxEl.appendChild(row);
      }
    }

    // If reaching step 5 (Finalized), append new block to the visual chain ledger!
    if (index === 4) {
      const prevBlock = this.chainHistory[this.chainHistory.length - 1];
      const newBlock = {
        height: this.blockHeight,
        hash: '0x000' + this.randomHex(13),
        prevHash: prevBlock ? prevBlock.hash : '0x000000000000000...',
        txCount: Math.floor(40 + Math.random() * 120),
        validator: '0x' + this.randomHex(3).toUpperCase() + '...' + this.randomHex(4).toUpperCase()
      };
      this.chainHistory.push(newBlock);
      this.renderChain();
    }
  }

  renderChain() {
    if (!this.chainScrollEl) return;
    this.chainScrollEl.innerHTML = '';

    this.chainHistory.forEach((block, idx) => {
      const blockEl = document.createElement('div');
      blockEl.className = 'chain-block';
      if (idx === this.chainHistory.length - 1) {
        blockEl.classList.add('flash-mining');
      }

      blockEl.innerHTML = `
        <div class="chain-block-num">Block #${block.height}</div>
        <div><span style="color:var(--text-muted)">Hash:</span> ${block.hash}</div>
        <div><span style="color:var(--text-muted)">Prev:</span> ${block.prevHash}</div>
        <div><span style="color:var(--text-muted)">Txns:</span> ${block.txCount}</div>
        <div><span style="color:var(--text-muted)">Validator:</span> ${block.validator}</div>
      `;

      this.chainScrollEl.appendChild(blockEl);

      // Add linking arrow between blocks
      if (idx < this.chainHistory.length - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'chain-link-arrow';
        arrow.innerHTML = '⇄';
        arrow.title = 'Cryptographic Hash Link';
        this.chainScrollEl.appendChild(arrow);
      }
    });

    // Auto-scroll to latest block
    this.chainScrollEl.scrollLeft = this.chainScrollEl.scrollWidth;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.blockchainSimulator = new BlockchainSimulator();
});
