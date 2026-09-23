/**
 * Interactive Web3 Knowledge Check Quiz
 * Instant pedagogical feedback for beginners
 */

class Web3Quiz {
  constructor() {
    this.questions = [
      {
        question: "Smart contracts automatically execute predetermined logic on-chain. Which real-world analogy best captures their trustless nature?",
        options: [
          { text: "A legal courthouse requiring lawyers and judges", correct: false },
          { text: "A vending machine dispensing soda once exact payment is received", correct: true },
          { text: "A traditional bank teller approving wire transfers", correct: false },
          { text: "A cloud spreadsheet editable by a company administrator", correct: false }
        ],
        explanation: "Correct! Nick Szabo originally coined the vending machine analogy for smart contracts: deterministic rules execute automatically without any human gatekeeper once programmatic conditions are satisfied."
      },
      {
        question: "In a decentralized blockchain with thousands of validators, what happens if 25% of nodes suddenly go offline due to regional outages?",
        options: [
          { text: "The entire network crashes and all transaction history is erased", correct: false },
          { text: "The remaining 75% of nodes continue verifying transactions without interruption", correct: true },
          { text: "Users must request manual password resets from a central company", correct: false },
          { text: "Transactions revert back into fiat currency automatically", correct: false }
        ],
        explanation: "Correct! Decentralized networks have no single point of failure. As long as a supermajority of independent nodes remain active, the peer-to-peer network maintains Byzantine fault tolerance and finalizes blocks."
      },
      {
        question: "What fundamentally distinguishes Web3 ('Read-Write-Own') from Web2 ('Read-Write')?",
        options: [
          { text: "Web3 only works on smartphones with dedicated cryptocurrency chips", correct: false },
          { text: "Web3 guarantees that digital assets will always increase in financial value", correct: false },
          { text: "Users control sovereign digital property rights via private keys rather than corporate accounts", correct: true },
          { text: "Web3 eliminates all server code and uses zero internet bandwidth", correct: false }
        ],
        explanation: "Spot on! In Web2, platforms like Meta or Google hold custody of your profile and data. In Web3, you hold self-sovereign cryptographic keys, enabling true digital ownership and permissionless interoperability."
      }
    ];

    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;

    this.init();
  }

  init() {
    this.container = document.getElementById('quiz-box');
    if (!this.container) return;
    this.renderQuestion();
  }

  renderQuestion() {
    this.answered = false;
    const q = this.questions[this.currentIndex];

    this.container.innerHTML = `
      <div class="quiz-question-box">
        <div class="quiz-question-num">QUESTION ${this.currentIndex + 1} OF ${this.questions.length} • KNOWLEDGE CHECK</div>
        <h3 class="quiz-question-text">${q.question}</h3>
        <div class="quiz-options">
          ${q.options.map((opt, i) => `
            <button class="quiz-option" data-index="${i}">
              <span>${opt.text}</span>
              <span class="opt-indicator">→</span>
            </button>
          `).join('')}
        </div>
        <div class="quiz-feedback" id="quiz-feedback"></div>
      </div>
    `;

    const optionButtons = this.container.querySelectorAll('.quiz-option');
    optionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        this.handleSelect(idx, btn, optionButtons);
      });
    });
  }

  handleSelect(selectedIdx, btnElement, allButtons) {
    if (this.answered) return;
    this.answered = true;

    const q = this.questions[this.currentIndex];
    const isCorrect = q.options[selectedIdx].correct;
    const feedbackEl = document.getElementById('quiz-feedback');

    allButtons.forEach((btn, i) => {
      btn.disabled = true;
      if (q.options[i].correct) {
        btn.classList.add('correct');
      } else if (i === selectedIdx) {
        btn.classList.add('wrong');
      }
    });

    if (isCorrect) {
      this.score++;
      feedbackEl.className = 'quiz-feedback show';
      feedbackEl.style.background = 'rgba(16, 185, 129, 0.15)';
      feedbackEl.style.border = '1px solid var(--accent-emerald)';
      feedbackEl.style.color = '#34D399';
      feedbackEl.innerHTML = `<strong>✓ Excellent!</strong> ${q.explanation}`;
    } else {
      feedbackEl.className = 'quiz-feedback show';
      feedbackEl.style.background = 'rgba(251, 113, 133, 0.15)';
      feedbackEl.style.border = '1px solid var(--accent-rose)';
      feedbackEl.style.color = '#FB7185';
      feedbackEl.innerHTML = `<strong>✕ Not quite:</strong> ${q.explanation}`;
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary btn-sm';
    nextBtn.style.marginTop = '18px';
    nextBtn.textContent = this.currentIndex < this.questions.length - 1 ? 'Next Question →' : 'View Results';
    nextBtn.addEventListener('click', () => {
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++;
        this.renderQuestion();
      } else {
        this.renderResults();
      }
    });
    feedbackEl.appendChild(document.createElement('br'));
    feedbackEl.appendChild(nextBtn);
  }

  renderResults() {
    this.container.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <span class="badge badge-cyan" style="margin-bottom: 12px;">QUIZ COMPLETED</span>
        <h3 style="font-size: 1.8rem; margin-bottom: 10px;">Your Web3 IQ: ${this.score} / ${this.questions.length} Correct</h3>
        <p style="margin-bottom: 24px;">
          ${this.score === 3 
            ? 'Outstanding! You have a crystal-clear grasp of Web3 fundamentals, consensus, and decentralization.' 
            : 'Good effort! Review the Core Concepts and Blockchain Simulator above to solidify your technical foundations.'}
        </p>
        <button class="btn btn-secondary btn-sm" id="btn-restart-quiz">Retry Knowledge Check</button>
      </div>
    `;

    document.getElementById('btn-restart-quiz').addEventListener('click', () => {
      this.currentIndex = 0;
      this.score = 0;
      this.renderQuestion();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.web3Quiz = new Web3Quiz();
});
