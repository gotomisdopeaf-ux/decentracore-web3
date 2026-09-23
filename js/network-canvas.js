/**
 * Interactive P2P Node Network Visualizer
 * HTML5 Canvas rendering decentralized peer-to-peer topology
 */

class P2PNetworkVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.packets = [];
    this.maxConnections = 4;
    this.connectionDistance = 140;
    this.activeNodeCount = 18;
    this.hoveredNode = null;
    this.selectedNode = null;
    this.animationId = null;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Generate initial peer nodes
    this.nodes = [];
    for (let i = 0; i < this.activeNodeCount; i++) {
      this.addNode();
    }

    // Set first node as validator
    if (this.nodes.length > 0) {
      this.nodes[0].isValidator = true;
    }

    // Canvas Mouse Events
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => { this.hoveredNode = null; });
    this.canvas.addEventListener('click', (e) => this.onClick(e));

    // Bind Controls
    const btnBroadcast = document.getElementById('btn-broadcast-tx');
    const btnAddNode = document.getElementById('btn-add-node');
    const btnSimulateFailure = document.getElementById('btn-simulate-failure');
    const btnResetNetwork = document.getElementById('btn-reset-network');

    if (btnBroadcast) btnBroadcast.addEventListener('click', () => this.broadcastTransaction());
    if (btnAddNode) btnAddNode.addEventListener('click', () => this.addNodeInteractive());
    if (btnSimulateFailure) btnSimulateFailure.addEventListener('click', () => this.toggleNodeFailure());
    if (btnResetNetwork) btnResetNetwork.addEventListener('click', () => this.resetNetwork());

    // Start render loop
    this.render();
    this.updateMetricsUI();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height || 480;
  }

  addNode(x, y) {
    const margin = 40;
    const posX = x !== undefined ? x : margin + Math.random() * (this.canvas.width - margin * 2);
    const posY = y !== undefined ? y : margin + Math.random() * (this.canvas.height - margin * 2);

    const roles = ['Validator', 'Full Node', 'Relay', 'Archive'];
    const role = this.nodes.length % 4 === 0 ? 'Validator' : roles[Math.floor(Math.random() * roles.length)];

    const node = {
      id: '0x' + Math.random().toString(16).substr(2, 6),
      x: posX,
      y: posY,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: role === 'Validator' ? 7 : 5,
      role: role,
      isValidator: role === 'Validator',
      status: 'online', // 'online' | 'offline' | 'broadcasting'
      latency: Math.floor(12 + Math.random() * 28),
      peers: [],
      pulse: 0
    };

    this.nodes.push(node);
    this.updateMetricsUI();
    return node;
  }

  addNodeInteractive() {
    const x = this.canvas.width / 2 + (Math.random() - 0.5) * 100;
    const y = this.canvas.height / 2 + (Math.random() - 0.5) * 100;
    const newNode = this.addNode(x, y);
    newNode.pulse = 1;
    this.broadcastTransaction(newNode);
  }

  toggleNodeFailure() {
    const onlineNodes = this.nodes.filter(n => n.status === 'online' && !n.isValidator);
    if (onlineNodes.length === 0) return;
    const target = onlineNodes[Math.floor(Math.random() * onlineNodes.length)];
    target.status = 'offline';
    this.updateMetricsUI();

    // Auto-revive after 4 seconds to show self-healing
    setTimeout(() => {
      target.status = 'online';
      this.updateMetricsUI();
    }, 4500);
  }

  resetNetwork() {
    this.nodes = [];
    this.packets = [];
    for (let i = 0; i < this.activeNodeCount; i++) {
      this.addNode();
    }
    if (this.nodes[0]) this.nodes[0].isValidator = true;
    this.updateMetricsUI();
  }

  broadcastTransaction(sourceNode) {
    const onlineNodes = this.nodes.filter(n => n.status === 'online');
    if (onlineNodes.length < 2) return;

    const origin = sourceNode || onlineNodes[Math.floor(Math.random() * onlineNodes.length)];
    origin.pulse = 1.2;

    // Send packets to all its neighbors
    this.nodes.forEach(target => {
      if (target !== origin && target.status === 'online') {
        const dist = Math.hypot(target.x - origin.x, target.y - origin.y);
        if (dist < this.connectionDistance * 1.5) {
          this.packets.push({
            from: origin,
            to: target,
            progress: 0,
            speed: 0.03 + Math.random() * 0.02,
            hash: '0x' + Math.random().toString(16).substr(2, 4)
          });
        }
      }
    });

    const txCounterEl = document.getElementById('canvas-tx-count');
    if (txCounterEl) {
      const current = parseInt(txCounterEl.textContent, 10) || 0;
      txCounterEl.textContent = current + 1;
    }
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    this.hoveredNode = null;
    for (const node of this.nodes) {
      const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
      if (dist < node.radius + 8) {
        this.hoveredNode = node;
        break;
      }
    }
  }

  onClick(e) {
    if (this.hoveredNode) {
      this.selectedNode = this.hoveredNode;
      this.broadcastTransaction(this.hoveredNode);
    } else {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      this.addNode(mouseX, mouseY);
    }
  }

  updateMetricsUI() {
    const onlineCount = this.nodes.filter(n => n.status === 'online').length;
    const nodeCountEl = document.getElementById('canvas-node-count');
    const statusEl = document.getElementById('canvas-network-health');

    if (nodeCountEl) nodeCountEl.textContent = onlineCount;
    if (statusEl) {
      if (onlineCount >= 10) {
        statusEl.textContent = 'Decentralized & Healthy';
        statusEl.style.color = 'var(--accent-emerald)';
      } else {
        statusEl.textContent = 'Degraded';
        statusEl.style.color = 'var(--accent-amber)';
      }
    }
  }

  update() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Move nodes gently
    for (const node of this.nodes) {
      if (node.status === 'offline') continue;

      node.x += node.vx;
      node.y += node.vy;

      // Bounce against edges
      if (node.x < node.radius + 10 || node.x > w - node.radius - 10) node.vx *= -1;
      if (node.y < node.radius + 10 || node.y > h - node.radius - 10) node.vy *= -1;

      // Fade pulses
      if (node.pulse > 0) {
        node.pulse -= 0.02;
        if (node.pulse < 0) node.pulse = 0;
      }
    }

    // Update packets
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const p = this.packets[i];
      p.progress += p.speed;
      if (p.progress >= 1) {
        // Node reached
        if (p.to.status === 'online') {
          p.to.pulse = 0.8;
        }
        this.packets.splice(i, 1);
      }
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.update();

    // 1. Draw Connection Lines
    const onlineNodes = this.nodes.filter(n => n.status === 'online');
    for (let i = 0; i < onlineNodes.length; i++) {
      for (let j = i + 1; j < onlineNodes.length; j++) {
        const n1 = onlineNodes[i];
        const n2 = onlineNodes[j];
        const dist = Math.hypot(n2.x - n1.x, n2.y - n1.y);

        if (dist < this.connectionDistance) {
          const alpha = (1 - dist / this.connectionDistance) * 0.28;
          this.ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(n1.x, n1.y);
          this.ctx.lineTo(n2.x, n2.y);
          this.ctx.stroke();
        }
      }
    }

    // 2. Draw Transmitting Packets
    for (const p of this.packets) {
      const curX = p.from.x + (p.to.x - p.from.x) * p.progress;
      const curY = p.from.y + (p.to.y - p.from.y) * p.progress;

      this.ctx.fillStyle = '#00F2FE';
      this.ctx.shadowColor = '#00F2FE';
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(curX, curY, 3.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0; // reset
    }

    // 3. Draw Nodes
    for (const node of this.nodes) {
      const isOnline = node.status === 'online';

      // Pulse ring
      if (node.pulse > 0 && isOnline) {
        this.ctx.strokeStyle = `rgba(0, 242, 254, ${node.pulse})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.radius + (1 - node.pulse) * 18, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      // Outer glow
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius + 3, 0, Math.PI * 2);
      this.ctx.fillStyle = !isOnline 
        ? 'rgba(251, 113, 133, 0.15)' 
        : (node.isValidator ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 242, 254, 0.15)');
      this.ctx.fill();

      // Node Body
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      if (!isOnline) {
        this.ctx.fillStyle = '#FB7185';
      } else if (node.isValidator) {
        this.ctx.fillStyle = '#10B981';
      } else {
        this.ctx.fillStyle = '#38BDF8';
      }
      this.ctx.fill();

      // Border
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    }

    // 4. Hover Tooltip
    if (this.hoveredNode) {
      const n = this.hoveredNode;
      const tipText = `${n.role} (${n.id}) - ${n.status === 'online' ? `${n.latency}ms` : 'OFFLINE'}`;
      this.ctx.font = '12px "JetBrains Mono", monospace';
      const textWidth = this.ctx.measureText(tipText).width;

      const pad = 8;
      const boxX = Math.min(Math.max(n.x - textWidth / 2 - pad, 10), this.canvas.width - textWidth - pad * 2 - 10);
      const boxY = n.y - n.radius - 32;

      this.ctx.fillStyle = 'rgba(10, 15, 29, 0.9)';
      this.ctx.strokeStyle = n.status === 'online' ? 'rgba(0, 242, 254, 0.5)' : 'rgba(251, 113, 133, 0.5)';
      this.ctx.lineWidth = 1;
      this.ctx.fillRect(boxX, boxY, textWidth + pad * 2, 24);
      this.ctx.strokeRect(boxX, boxY, textWidth + pad * 2, 24);

      this.ctx.fillStyle = '#F8FAFC';
      this.ctx.fillText(tipText, boxX + pad, boxY + 16);
    }

    this.animationId = requestAnimationFrame(() => this.render());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.p2pVisualizer = new P2PNetworkVisualizer('p2p-canvas');
});
