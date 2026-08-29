/**
 * English Mastery Hub - Main Application & Protection Engine
 * Handles live search, category filtering, and Teacher Access Locker for Expert IELTS Lessons.
 */

(function () {
    'use strict';

    // =========================================================================
    // 1. CONFIGURATION & STATE
    // =========================================================================
    const CONFIG = {
        // Teacher passwords that unlock Expert IELTS Lessons
        validPasswords: [
            "neo-teacher-access",
            "teacher",
            "expert-teacher",
            "neoteacher"
        ],
        sessionKey: "neo_expert_lessons_unlocked",
        targetProtectedPath: "https://neotetsuya.github.io/Expert-IELTS-lessons/"
    };

    let currentFilter = 'all';
    let searchQuery = '';
    let pendingRedirectUrl = null;

    // =========================================================================
    // 2. DOM INITIALIZATION
    // =========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        initSearchAndFilter();
        initTeacherLocker();
        if (window.lucide) {
            window.lucide.createIcons();
        }
    });

    // =========================================================================
    // 3. SEARCH & CATEGORY FILTERING
    // =========================================================================
    function initSearchAndFilter() {
        const searchInput = document.getElementById('searchInput');
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        const resetSearchBtn = document.getElementById('resetSearchBtn');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.repo-card');
        const noResults = document.getElementById('noResults');
        const reposGrid = document.getElementById('reposGrid');
        const currentVisibleCount = document.getElementById('currentVisibleCount');

        function updateCards() {
            let visibleCount = 0;
            const query = searchQuery.trim().toLowerCase();

            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
                const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
                const desc = (card.querySelector('p')?.textContent || '').toLowerCase();

                const matchesCategory = currentFilter === 'all' || category === currentFilter;
                const matchesSearch = !query ||
                    title.includes(query) ||
                    keywords.includes(query) ||
                    desc.includes(query);

                if (matchesCategory && matchesSearch) {
                    card.classList.remove('hidden');
                    visibleCount++;
                } else {
                    card.classList.add('hidden');
                }
            });

            if (currentVisibleCount) {
                currentVisibleCount.textContent = visibleCount;
            }

            if (visibleCount === 0) {
                if (noResults) noResults.classList.remove('hidden');
                if (reposGrid) reposGrid.classList.add('hidden');
            } else {
                if (noResults) noResults.classList.add('hidden');
                if (reposGrid) reposGrid.classList.remove('hidden');
            }
        }

        // Category buttons
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => {
                    b.classList.remove('active', 'bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-600/20', 'border-indigo-500');
                    b.classList.add('bg-slate-900/80', 'text-slate-400', 'border-slate-800');
                });

                btn.classList.add('active', 'bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-600/20', 'border-indigo-500');
                btn.classList.remove('bg-slate-900/80', 'text-slate-400', 'border-slate-800');

                currentFilter = btn.getAttribute('data-filter') || 'all';
                updateCards();
            });
        });

        // Search Input
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                if (clearSearchBtn) {
                    if (searchQuery.length > 0) {
                        clearSearchBtn.classList.remove('hidden');
                    } else {
                        clearSearchBtn.classList.add('hidden');
                    }
                }
                updateCards();
            });
        }

        // Clear button
        if (clearSearchBtn && searchInput) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchQuery = '';
                clearSearchBtn.classList.add('hidden');
                searchInput.focus();
                updateCards();
            });
        }

        // Reset button in empty state
        if (resetSearchBtn) {
            resetSearchBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                searchQuery = '';
                if (clearSearchBtn) clearSearchBtn.classList.add('hidden');

                const allBtn = document.querySelector('[data-filter="all"]');
                if (allBtn) allBtn.click();
            });
        }

        // Keyboard shortcut: '/' focuses search input
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && searchInput && document.activeElement !== searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    // =========================================================================
    // 4. TEACHER ACCESS LOCKER (For Expert IELTS Lessons)
    // =========================================================================
    function initTeacherLocker() {
        // Find all protected triggers (e.g. elements with [data-protected="true"] or link to Expert-IELTS-lessons-main)
        const protectedElements = document.querySelectorAll('[data-protected="true"], a[href*="Expert-IELTS-lessons-main"]');

        protectedElements.forEach(elem => {
            elem.addEventListener('click', (e) => {
                const isUnlocked = isLessonsUnlocked();
                if (!isUnlocked) {
                    e.preventDefault();
                    e.stopPropagation();
                    pendingRedirectUrl = elem.getAttribute('href') || CONFIG.targetProtectedPath;
                    openLockModal();
                }
            });
        });

        // Inject modal container if not already in HTML
        if (!document.getElementById('teacher-lock-modal')) {
            createLockModalElement();
        }
    }

    function isLessonsUnlocked() {
        try {
            return sessionStorage.getItem(CONFIG.sessionKey) === 'true';
        } catch (e) {
            return false;
        }
    }

    function setLessonsUnlocked(unlocked) {
        try {
            if (unlocked) {
                sessionStorage.setItem(CONFIG.sessionKey, 'true');
            } else {
                sessionStorage.removeItem(CONFIG.sessionKey);
            }
        } catch (e) {}
    }

    function openLockModal() {
        const modal = document.getElementById('teacher-lock-modal');
        if (!modal) return;

        const pwdInput = document.getElementById('lockPasswordInput');
        const errorMsg = document.getElementById('lockErrorMessage');
        const modalContainer = document.getElementById('lockModalContainer');

        if (pwdInput) {
            pwdInput.value = '';
            pwdInput.classList.remove('border-rose-500', 'focus:border-rose-500');
        }
        if (errorMsg) {
            errorMsg.classList.add('hidden');
            errorMsg.textContent = '';
        }
        if (modalContainer) {
            modalContainer.classList.remove('shake-animation');
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.classList.add('overflow-hidden');

        setTimeout(() => {
            if (pwdInput) pwdInput.focus();
        }, 100);

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    function closeLockModal() {
        const modal = document.getElementById('teacher-lock-modal');
        if (!modal) return;

        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.classList.remove('overflow-hidden');
        pendingRedirectUrl = null;
    }

    function verifyPassword() {
        const pwdInput = document.getElementById('lockPasswordInput');
        const errorMsg = document.getElementById('lockErrorMessage');
        const modalContainer = document.getElementById('lockModalContainer');
        const submitBtn = document.getElementById('lockSubmitBtn');

        if (!pwdInput) return;
        const entered = pwdInput.value.trim();

        if (!entered) {
            showError('Vui lòng nhập mật mã truy cập.');
            return;
        }

        const isValid = CONFIG.validPasswords.some(pwd => pwd.toLowerCase() === entered.toLowerCase());

        if (isValid) {
            // Unlock session
            setLessonsUnlocked(true);

            // Success feedback
            if (submitBtn) {
                submitBtn.innerHTML = `
                    <i data-lucide="check-circle" class="w-4 h-4 text-emerald-300 animate-bounce"></i>
                    <span>Mở khóa thành công...</span>
                `;
                submitBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-500');
                submitBtn.classList.add('bg-emerald-600');
                if (window.lucide) window.lucide.createIcons();
            }

            setTimeout(() => {
                const targetUrl = pendingRedirectUrl || CONFIG.targetProtectedPath;
                window.location.href = targetUrl;
            }, 500);
        } else {
            showError('Mật mã không chính xác. Vui lòng kiểm tra lại!');
            if (modalContainer) {
                modalContainer.classList.remove('shake-animation');
                void modalContainer.offsetWidth; // Trigger reflow
                modalContainer.classList.add('shake-animation');
            }
            if (pwdInput) {
                pwdInput.classList.add('border-rose-500');
                pwdInput.select();
            }
        }
    }

    function showError(message) {
        const errorMsg = document.getElementById('lockErrorMessage');
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.classList.remove('hidden');
        }
    }

    function createLockModalElement() {
        const modalEl = document.createElement('div');
        modalEl.id = 'teacher-lock-modal';
        modalEl.className = 'fixed inset-0 z-[99999] hidden items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4 transition-all duration-300';
        modalEl.innerHTML = `
            <div id="lockModalContainer" class="relative w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 transition-all transform scale-100">
                <!-- Glowing Ambient Accent -->
                <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-pink-500/15 rounded-3xl -z-10 blur-xl pointer-events-none"></div>

                <!-- Modal Header -->
                <div class="flex items-center justify-between mb-6">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                        <i data-lucide="lock" class="w-3.5 h-3.5"></i>
                        <span>TEACHER ACCESS LOCK</span>
                    </div>
                    <button id="lockCloseBtn" class="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors" title="Đóng">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>

                <!-- Icon & Title -->
                <div class="text-center mb-6">
                    <div class="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 text-indigo-400 mb-4 shadow-inner">
                        <i data-lucide="shield-alert" class="w-8 h-8"></i>
                    </div>
                    <h3 class="text-xl sm:text-2xl font-bold font-display text-white mb-2">
                        Bảo Mật Bài Giảng Giảng Viên
                    </h3>
                    <p class="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                        Tài liệu slide tương tác và bài giảng dành riêng cho giáo viên đứng lớp. Vui lòng nhập mật mã giảng viên để mở khóa.
                    </p>
                </div>

                <!-- Form -->
                <form id="teacherLockForm" onsubmit="return false;" class="space-y-4">
                    <div class="relative">
                        <i data-lucide="key-round" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"></i>
                        <input type="password" id="lockPasswordInput" placeholder="Nhập mật mã giáo viên..." 
                               class="w-full pl-11 pr-12 py-3.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all">
                        <button type="button" id="togglePasswordVisibilityBtn" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1" title="Hiện/ẩn mật mã">
                            <i data-lucide="eye" id="passwordEyeIcon" class="w-4 h-4"></i>
                        </button>
                    </div>

                    <!-- Error Alert -->
                    <div id="lockErrorMessage" class="hidden text-xs text-rose-400 bg-rose-950/50 border border-rose-800/60 rounded-xl p-3 flex items-center gap-2"></div>

                    <!-- Actions -->
                    <div class="flex gap-3 pt-2">
                        <button type="button" id="lockCancelBtn" class="flex-1 py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium text-sm transition-colors">
                            Hủy bỏ
                        </button>
                        <button type="submit" id="lockSubmitBtn" class="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2">
                            <i data-lucide="unlock" class="w-4 h-4"></i>
                            <span>Mở khóa</span>
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Shake keyframe animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes lockShake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-8px); }
                40%, 80% { transform: translateX(8px); }
            }
            .shake-animation {
                animation: lockShake 0.4s ease-in-out;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(modalEl);

        // Attach event listeners
        const form = document.getElementById('teacherLockForm');
        const closeBtn = document.getElementById('lockCloseBtn');
        const cancelBtn = document.getElementById('lockCancelBtn');
        const togglePwdBtn = document.getElementById('togglePasswordVisibilityBtn');
        const pwdInput = document.getElementById('lockPasswordInput');
        const eyeIcon = document.getElementById('passwordEyeIcon');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                verifyPassword();
            });
        }

        if (closeBtn) closeBtn.addEventListener('click', closeLockModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeLockModal);

        // Toggle Password Visibility
        if (togglePwdBtn && pwdInput) {
            togglePwdBtn.addEventListener('click', () => {
                const isPassword = pwdInput.getAttribute('type') === 'password';
                pwdInput.setAttribute('type', isPassword ? 'text' : 'password');
                if (eyeIcon) {
                    eyeIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
                    if (window.lucide) window.lucide.createIcons();
                }
            });
        }

        // Close on clicking backdrop
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) {
                closeLockModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modalEl.classList.contains('hidden')) {
                closeLockModal();
            }
        });
    }

})();
