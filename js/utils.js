/* ============================================================
   CampusCare – Utilities
   Toast notifications, modals, date formatting, validation
   ============================================================ */

const Utils = {
    // ── Toast Notification System ───────────────────────
    showToast(message, type = 'info', title = '', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            success: 'fa-circle-check',
            error: 'fa-circle-xmark',
            warning: 'fa-triangle-exclamation',
            info: 'fa-circle-info'
        };

        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fa-solid ${icons[type] || icons.info} toast-icon"></i>
            <div class="toast-content">
                <div class="toast-title">${title || titles[type] || 'Notification'}</div>
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="toast-close" aria-label="Close notification"><i class="fa-solid fa-xmark"></i></button>
        `;

        container.appendChild(toast);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this._removeToast(toast);
        });

        // Auto remove
        setTimeout(() => {
            this._removeToast(toast);
        }, duration);
    },

    _removeToast(toast) {
        if (toast.classList.contains('removing')) return;
        toast.classList.add('removing');
        setTimeout(() => {
            toast.remove();
        }, 250);
    },

    // ── Modal System ────────────────────────────────────
    showModal(options = {}) {
        const overlay = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        if (!overlay || !content) return;

        const { title = '', body = '', footer = '', size = '', onClose } = options;

        content.className = 'modal-content' + (size ? ` modal-${size}` : '');
        content.innerHTML = `
            ${title ? `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" aria-label="Close modal"><i class="fa-solid fa-xmark"></i></button>
            </div>` : ''}
            <div class="modal-body">${body}</div>
            ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
        `;

        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Close handlers
        const closeModal = () => {
            this.closeModal();
            if (onClose) onClose();
        };

        const closeBtn = content.querySelector('.modal-close');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Escape key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    },

    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    },

    showConfirm(message, onConfirm, title = 'Confirm Action') {
        this.showModal({
            title: title,
            body: `<p style="font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.6;">${message}</p>`,
            footer: `
                <button class="btn btn-outline" id="modal-cancel-btn">Cancel</button>
                <button class="btn btn-primary" id="modal-confirm-btn">Confirm</button>
            `
        });

        setTimeout(() => {
            const cancelBtn = document.getElementById('modal-cancel-btn');
            const confirmBtn = document.getElementById('modal-confirm-btn');
            if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal());
            if (confirmBtn) confirmBtn.addEventListener('click', () => {
                this.closeModal();
                if (onConfirm) onConfirm();
            });
        }, 50);
    },

    // ── Date Formatting ─────────────────────────────────
    formatDate(dateStr) {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    },

    formatDateTime(dateStr) {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    },

    timeAgo(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return this.formatDate(dateStr);
    },

    // ── Validation ──────────────────────────────────────
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    validatePhone(phone) {
        return /^[\+]?[\d\s\-]{10,15}$/.test(phone.replace(/\s/g, ''));
    },

    validateRequired(value) {
        return value && value.toString().trim().length > 0;
    },

    validateMinLength(value, min) {
        return value && value.toString().trim().length >= min;
    },

    validateForm(rules) {
        let valid = true;
        const errors = {};

        for (const [field, fieldRules] of Object.entries(rules)) {
            const input = document.getElementById(field);
            if (!input) continue;

            const value = input.value.trim();
            let fieldError = null;

            for (const rule of fieldRules) {
                if (rule.required && !value) {
                    fieldError = rule.message || 'This field is required';
                    break;
                }
                if (rule.email && value && !this.validateEmail(value)) {
                    fieldError = rule.message || 'Please enter a valid email';
                    break;
                }
                if (rule.phone && value && !this.validatePhone(value)) {
                    fieldError = rule.message || 'Please enter a valid phone number';
                    break;
                }
                if (rule.minLength && value && value.length < rule.minLength) {
                    fieldError = rule.message || `Minimum ${rule.minLength} characters required`;
                    break;
                }
                if (rule.match) {
                    const matchInput = document.getElementById(rule.match);
                    if (matchInput && value !== matchInput.value.trim()) {
                        fieldError = rule.message || 'Values do not match';
                        break;
                    }
                }
            }

            // Update UI
            const errorEl = document.getElementById(`${field}-error`);
            if (fieldError) {
                valid = false;
                errors[field] = fieldError;
                if (input) input.classList.add('error');
                if (errorEl) {
                    errorEl.textContent = fieldError;
                    errorEl.style.display = 'block';
                }
            } else {
                if (input) input.classList.remove('error');
                if (errorEl) {
                    errorEl.textContent = '';
                    errorEl.style.display = 'none';
                }
            }
        }

        return { valid, errors };
    },

    // ── Debounce ────────────────────────────────────────
    debounce(fn, delay = 300) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    // ── HTML Escape ─────────────────────────────────────
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // ── Status helpers ──────────────────────────────────
    getStatusBadge(status) {
        const map = {
            'Pending': { class: 'badge-pending', icon: '🟡' },
            'In Progress': { class: 'badge-inprogress', icon: '🔵' },
            'Resolved': { class: 'badge-resolved', icon: '🟢' },
            'Urgent': { class: 'badge-urgent', icon: '🔴' }
        };
        const s = map[status] || map['Pending'];
        return `<span class="badge-status ${s.class}">${s.icon} ${status}</span>`;
    },

    getPriorityBadge(priority) {
        const map = {
            'Low': 'low',
            'Medium': 'medium',
            'High': 'high',
            'Urgent': 'urgent-p'
        };
        return `<span class="badge-priority ${map[priority] || 'medium'}">${priority}</span>`;
    },

    getCategoryIcon(category) {
        const icons = {
            'Hostel': 'fa-building',
            'Water Supply': 'fa-droplet',
            'Electricity': 'fa-bolt',
            'Wi-Fi/Internet': 'fa-wifi',
            'Classroom': 'fa-chalkboard-user',
            'Cleaning': 'fa-broom',
            'Food/Canteen': 'fa-utensils',
            'Transportation': 'fa-bus',
            'Security': 'fa-shield-halved',
            'Academic': 'fa-graduation-cap',
            'Other': 'fa-circle-question'
        };
        return icons[category] || 'fa-circle-question';
    },

    getCategoryColor(category) {
        const colors = {
            'Hostel': '#6366f1',
            'Water Supply': '#0ea5e9',
            'Electricity': '#f59e0b',
            'Wi-Fi/Internet': '#8b5cf6',
            'Classroom': '#ec4899',
            'Cleaning': '#10b981',
            'Food/Canteen': '#f97316',
            'Transportation': '#06b6d4',
            'Security': '#ef4444',
            'Academic': '#3b82f6',
            'Other': '#64748b'
        };
        return colors[category] || '#64748b';
    }
};
