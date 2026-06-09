class YearScoreApp {
    constructor() {
        this.currentDate = new Date();
        this.currentYear = this.currentDate.getFullYear();
        this.currentMonth = this.currentDate.getMonth();
        this.plans = this.loadPlans();
        this.init();
    }

    init() {
        this.setupDOMReferences();
        this.setupEventListeners();
        this.initializeUI();
    }

    setupDOMReferences() {
        // 主要元素
        this.yearSelect = document.getElementById('yearSelect');
        this.yearlyScore = document.getElementById('yearlyScore');
        this.currentDateTitle = document.getElementById('currentDateTitle');
        this.planList = document.getElementById('planList');
        this.noPlansMessage = document.getElementById('noPlansMessage');
        
        // 日历元素
        this.prevMonthBtn = document.getElementById('prevMonthBtn');
        this.nextMonthBtn = document.getElementById('nextMonthBtn');
        this.currentMonthYear = document.getElementById('currentMonthYear');
        this.calendarDays = document.getElementById('calendarDays');
        
        // 标签页元素
        this.dailyTab = document.getElementById('dailyTab');
        this.yearlyTab = document.getElementById('yearlyTab');
        this.dailyPlanSection = document.getElementById('dailyPlanSection');
        this.yearlyPlanSection = document.getElementById('yearlyPlanSection');
        
        // 年度计划列表元素
        this.yearlyPlanTitle = document.getElementById('yearlyPlanTitle');
        this.yearlyPlanList = document.getElementById('yearlyPlanList');
        this.noYearlyPlansMessage = document.getElementById('noYearlyPlansMessage');
        
        // 模态框元素
        this.planModal = document.getElementById('planModal');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.planForm = document.getElementById('planForm');
        this.modalTitle = document.getElementById('modalTitle');
        this.planId = document.getElementById('planId');
        this.planDate = document.getElementById('planDate');
        this.planTitle = document.getElementById('planTitle');
        this.planDescription = document.getElementById('planDescription');
        this.planImportance = document.getElementById('planImportance');
        this.planStatus = document.getElementById('planStatus');
        this.statusGroup = document.getElementById('statusGroup');
        
        // 按钮
        this.addPlanBtn = document.getElementById('addPlanBtn');
    }

    setupEventListeners() {
        // 年份选择
        this.yearSelect.addEventListener('change', () => {
            this.currentYear = parseInt(this.yearSelect.value);
            this.updateYearlyScore();
            this.renderCalendar();
            this.renderYearlyPlanList();
        });

        // 日历导航
        this.prevMonthBtn.addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.renderCalendar();
        });

        this.nextMonthBtn.addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.renderCalendar();
        });

        // 标签页切换
        this.dailyTab.addEventListener('click', () => {
            this.switchToDailyTab();
        });

        this.yearlyTab.addEventListener('click', () => {
            this.switchToYearlyTab();
        });

        // 添加计划按钮
        this.addPlanBtn.addEventListener('click', () => {
            this.openAddPlanModal();
        });

        // 模态框关闭
        this.closeModalBtn.addEventListener('click', () => {
            this.closeModal();
        });

        this.cancelBtn.addEventListener('click', () => {
            this.closeModal();
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === this.planModal) {
                this.closeModal();
            }
        });

        // 表单提交
        this.planForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePlan();
        });
    }

    initializeUI() {
        // 生成年份选项（前后10年）
        this.populateYearOptions();
        
        // 渲染日历
        this.renderCalendar();
        
        // 渲染计划列表
        this.renderPlanList();
        
        // 渲染年度计划列表
        this.renderYearlyPlanList();
        
        // 更新当前日期标题
        this.updateCurrentDateTitle();
        
        // 更新年度评分
        this.updateYearlyScore();
    }

    populateYearOptions() {
        const currentYear = this.currentDate.getFullYear();
        this.yearSelect.innerHTML = '';
        
        for (let year = currentYear - 10; year <= currentYear + 10; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = `${year}年`;
            if (year === currentYear) {
                option.selected = true;
            }
            this.yearSelect.appendChild(option);
        }
    }

    formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDateForDisplay(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
    }

    updateCurrentDateTitle() {
        this.currentDateTitle.textContent = `${this.formatDateForDisplay(this.currentDate)} 计划`;
    }

    switchToDailyTab() {
        this.dailyTab.classList.add('active');
        this.yearlyTab.classList.remove('active');
        this.dailyPlanSection.classList.remove('hidden');
        this.yearlyPlanSection.classList.add('hidden');
    }

    switchToYearlyTab() {
        this.dailyTab.classList.remove('active');
        this.yearlyTab.classList.add('active');
        this.dailyPlanSection.classList.add('hidden');
        this.yearlyPlanSection.classList.remove('hidden');
        this.renderYearlyPlanList();
    }

    hasPlansOnDate(date) {
        const dateKey = this.formatDateForInput(date);
        return this.plans[dateKey] && this.plans[dateKey].length > 0;
    }

    renderCalendar() {
        const today = new Date();
        const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
        const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
        
        // 更新月份标题
        this.currentMonthYear.textContent = `${this.currentYear}年${this.currentMonth + 1}月`;
        
        // 清空日历
        this.calendarDays.innerHTML = '';
        
        // 计算上月剩余天数
        const firstDayWeekday = firstDayOfMonth.getDay();
        const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
        
        // 添加上月日期
        for (let i = firstDayWeekday - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            const date = new Date(this.currentYear, this.currentMonth - 1, day);
            this.createCalendarDay(day, date, true);
        }
        
        // 添加当月日期
        const daysInMonth = lastDayOfMonth.getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            this.createCalendarDay(day, date, false);
        }
        
        // 添加下月日期
        const lastDayWeekday = lastDayOfMonth.getDay();
        const remainingDays = 6 - lastDayWeekday;
        for (let day = 1; day <= remainingDays; day++) {
            const date = new Date(this.currentYear, this.currentMonth + 1, day);
            this.createCalendarDay(day, date, true);
        }
    }

    createCalendarDay(day, date, isOtherMonth) {
        const today = new Date();
        const calendarDay = document.createElement('div');
        calendarDay.className = 'calendar-day';
        
        if (isOtherMonth) {
            calendarDay.classList.add('other-month');
        }
        
        // 检查是否是今天
        const isToday = date.getDate() === today.getDate() &&
                       date.getMonth() === today.getMonth() &&
                       date.getFullYear() === today.getFullYear();
        
        if (isToday) {
            calendarDay.classList.add('today');
        }
        
        // 检查是否是选中的日期
        const isSelected = date.getDate() === this.currentDate.getDate() &&
                          date.getMonth() === this.currentDate.getMonth() &&
                          date.getFullYear() === this.currentDate.getFullYear();
        
        if (isSelected) {
            calendarDay.classList.add('selected');
        }
        
        // 检查是否有计划
        if (this.hasPlansOnDate(date)) {
            calendarDay.classList.add('has-plans');
        }
        
        // 创建日期数字
        const dayNumber = document.createElement('span');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        calendarDay.appendChild(dayNumber);
        
        // 添加点击事件
        calendarDay.addEventListener('click', () => {
            this.currentDate = new Date(date);
            this.currentMonth = date.getMonth();
            this.currentYear = date.getFullYear();
            
            // 重新渲染
            this.renderCalendar();
            this.renderPlanList();
            this.updateCurrentDateTitle();
            
            // 切换到当日计划标签
            this.switchToDailyTab();
        });
        
        this.calendarDays.appendChild(calendarDay);
    }

    renderYearlyPlanList() {
        this.yearlyPlanTitle.textContent = `${this.currentYear}年度计划列表`;
        
        // 收集当前年份的所有计划日期
        const yearlyPlans = {};
        for (const dateKey in this.plans) {
            const planYear = parseInt(dateKey.split('-')[0]);
            if (planYear === this.currentYear) {
                yearlyPlans[dateKey] = this.plans[dateKey];
            }
        }
        
        // 按日期排序
        const sortedDates = Object.keys(yearlyPlans).sort();
        
        if (sortedDates.length === 0) {
            this.yearlyPlanList.innerHTML = '';
            this.noYearlyPlansMessage.style.display = 'block';
            return;
        }
        
        this.noYearlyPlansMessage.style.display = 'none';
        this.yearlyPlanList.innerHTML = '';
        
        // 按日期分组显示计划
        sortedDates.forEach(dateKey => {
            const plans = yearlyPlans[dateKey];
            const date = new Date(dateKey);
            
            // 统计该日期的计划状态
            let completed = 0;
            let pending = 0;
            let overdue = 0;
            
            plans.forEach(plan => {
                if (plan.status === 'completed') completed++;
                else if (plan.status === 'pending') pending++;
                else if (plan.status === 'overdue') overdue++;
            });
            
            // 创建日期组
            const dateGroup = document.createElement('div');
            dateGroup.className = 'date-group';
            
            // 创建日期组头部
            const dateGroupHeader = document.createElement('div');
            dateGroupHeader.className = 'date-group-header';
            
            const dateGroupTitle = document.createElement('div');
            dateGroupTitle.className = 'date-group-title';
            dateGroupTitle.textContent = this.formatDateForDisplay(date);
            
            const dateGroupMeta = document.createElement('div');
            dateGroupMeta.className = 'date-group-meta';
            
            if (completed > 0) {
                const completedSpan = document.createElement('span');
                completedSpan.className = 'completed';
                completedSpan.textContent = `已完成: ${completed}`;
                dateGroupMeta.appendChild(completedSpan);
            }
            
            if (pending > 0) {
                const pendingSpan = document.createElement('span');
                pendingSpan.className = 'pending';
                pendingSpan.textContent = `待完成: ${pending}`;
                dateGroupMeta.appendChild(pendingSpan);
            }
            
            if (overdue > 0) {
                const overdueSpan = document.createElement('span');
                overdueSpan.className = 'overdue';
                overdueSpan.textContent = `逾期: ${overdue}`;
                dateGroupMeta.appendChild(overdueSpan);
            }
            
            dateGroupHeader.appendChild(dateGroupTitle);
            dateGroupHeader.appendChild(dateGroupMeta);
            
            // 创建计划列表容器
            const dateGroupPlans = document.createElement('div');
            dateGroupPlans.className = 'date-group-plans';
            
            // 添加计划
            plans.forEach(plan => {
                const planItem = this.createPlanItem(plan);
                dateGroupPlans.appendChild(planItem);
            });
            
            dateGroup.appendChild(dateGroupHeader);
            dateGroup.appendChild(dateGroupPlans);
            this.yearlyPlanList.appendChild(dateGroup);
        });
    }

    loadPlans() {
        const plans = localStorage.getItem('yearScorePlans');
        return plans ? JSON.parse(plans) : {};
    }

    savePlansToStorage() {
        localStorage.setItem('yearScorePlans', JSON.stringify(this.plans));
    }

    getPlansByDate(date) {
        const dateKey = this.formatDateForInput(date);
        return this.plans[dateKey] || [];
    }

    setPlansByDate(date, plans) {
        const dateKey = this.formatDateForInput(date);
        this.plans[dateKey] = plans;
        this.savePlansToStorage();
    }

    addPlan(plan) {
        const date = new Date(plan.date);
        const plans = this.getPlansByDate(date);
        
        plan.id = this.generatePlanId();
        plans.push(plan);
        
        this.setPlansByDate(date, plans);
        this.updateYearlyScore();
    }

    updatePlan(updatedPlan) {
        const date = new Date(updatedPlan.date);
        let plans = this.getPlansByDate(date);
        
        // 检查日期是否改变
        const originalPlan = this.findPlanById(updatedPlan.id);
        if (originalPlan && originalPlan.date !== updatedPlan.date) {
            // 从原日期中移除
            const originalDate = new Date(originalPlan.date);
            let originalPlans = this.getPlansByDate(originalDate);
            originalPlans = originalPlans.filter(p => p.id !== updatedPlan.id);
            this.setPlansByDate(originalDate, originalPlans);
            
            // 添加到新日期
            plans.push(updatedPlan);
        } else {
            // 在同一天更新
            const index = plans.findIndex(p => p.id === updatedPlan.id);
            if (index !== -1) {
                plans[index] = updatedPlan;
            }
        }
        
        this.setPlansByDate(date, plans);
        this.updateYearlyScore();
    }

    deletePlan(planId) {
        const plan = this.findPlanById(planId);
        if (plan) {
            const date = new Date(plan.date);
            let plans = this.getPlansByDate(date);
            plans = plans.filter(p => p.id !== planId);
            this.setPlansByDate(date, plans);
            this.updateYearlyScore();
            
            // 刷新日历
            this.renderCalendar();
            
            // 刷新年度计划列表
            this.renderYearlyPlanList();
        }
    }

    findPlanById(planId) {
        for (const dateKey in this.plans) {
            const plans = this.plans[dateKey];
            const plan = plans.find(p => p.id === planId);
            if (plan) {
                return plan;
            }
        }
        return null;
    }

    generatePlanId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    renderPlanList() {
        const plans = this.getPlansByDate(this.currentDate);
        
        if (plans.length === 0) {
            this.planList.innerHTML = '';
            this.noPlansMessage.style.display = 'block';
            return;
        }
        
        this.noPlansMessage.style.display = 'none';
        this.planList.innerHTML = '';
        
        plans.forEach(plan => {
            const planItem = this.createPlanItem(plan);
            this.planList.appendChild(planItem);
        });
    }

    createPlanItem(plan) {
        const planItem = document.createElement('div');
        planItem.className = `plan-item ${plan.status}`;
        
        const statusText = {
            'pending': '待完成',
            'completed': '已完成',
            'overdue': '逾期未完成'
        };
        
        const importanceText = {
            'high': '高',
            'medium': '中',
            'low': '低'
        };
        
        const importanceScore = {
            'high': '5分',
            'medium': '3分',
            'low': '1分'
        };
        
        planItem.innerHTML = `
            <div class="plan-item-header">
                <div>
                    <div class="plan-title ${plan.status}">${plan.title}</div>
                    <span class="plan-status ${plan.status}">${statusText[plan.status]}</span>
                </div>
                <div class="plan-actions">
                    <button class="edit-btn" data-id="${plan.id}">编辑</button>
                    <button class="delete-btn" data-id="${plan.id}">删除</button>
                </div>
            </div>
            ${plan.description ? `<div class="plan-description">${plan.description}</div>` : ''}
            <div class="plan-meta">
                <span class="plan-importance ${plan.importance}">${importanceText[plan.importance]} (${importanceScore[plan.importance]})</span>
                <span>日期: ${this.formatDateForDisplay(new Date(plan.date))}</span>
            </div>
        `;
        
        // 添加编辑和删除按钮事件
        const editBtn = planItem.querySelector('.edit-btn');
        const deleteBtn = planItem.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', () => {
            this.openEditPlanModal(plan);
        });
        
        deleteBtn.addEventListener('click', () => {
            if (confirm('确定要删除这个计划吗？')) {
                this.deletePlan(plan.id);
                this.renderPlanList();
            }
        });
        
        return planItem;
    }

    openAddPlanModal() {
        this.modalTitle.textContent = '添加计划';
        this.planId.value = '';
        this.planDate.value = this.formatDateForInput(this.currentDate);
        this.planTitle.value = '';
        this.planDescription.value = '';
        this.planImportance.value = 'medium';
        this.planStatus.value = 'pending';
        
        // 添加计划时隐藏状态选择
        this.statusGroup.style.display = 'none';
        
        this.planModal.classList.add('show');
    }

    openEditPlanModal(plan) {
        this.modalTitle.textContent = '编辑计划';
        this.planId.value = plan.id;
        this.planDate.value = plan.date;
        this.planTitle.value = plan.title;
        this.planDescription.value = plan.description || '';
        this.planImportance.value = plan.importance;
        this.planStatus.value = plan.status;
        
        // 编辑计划时显示状态选择
        this.statusGroup.style.display = 'block';
        
        this.planModal.classList.add('show');
    }

    closeModal() {
        this.planModal.classList.remove('show');
    }

    savePlan() {
        const planId = this.planId.value;
        const plan = {
            id: planId,
            date: this.planDate.value,
            title: this.planTitle.value,
            description: this.planDescription.value,
            importance: this.planImportance.value,
            status: this.planStatus.value
        };
        
        if (planId) {
            // 编辑现有计划
            this.updatePlan(plan);
        } else {
            // 添加新计划
            this.addPlan(plan);
        }
        
        this.closeModal();
        
        // 刷新日历
        this.renderCalendar();
        
        // 刷新年度计划列表
        this.renderYearlyPlanList();
        
        // 如果当前显示的日期与计划日期相同，刷新列表
        const planDate = new Date(plan.date);
        if (this.formatDateForInput(planDate) === this.formatDateForInput(this.currentDate)) {
            this.renderPlanList();
        }
    }

    getImportanceScore(importance) {
        const scores = {
            'high': 5,
            'medium': 3,
            'low': 1
        };
        return scores[importance] || 0;
    }

    calculateYearlyScore() {
        let totalPossiblePoints = 0;
        let earnedPoints = 0;
        
        for (const dateKey in this.plans) {
            // 只计算当前年份的计划
            const planYear = parseInt(dateKey.split('-')[0]);
            if (planYear !== this.currentYear) {
                continue;
            }
            
            const plans = this.plans[dateKey];
            plans.forEach(plan => {
                const importanceScore = this.getImportanceScore(plan.importance);
                totalPossiblePoints += importanceScore;
                
                if (plan.status === 'completed') {
                    earnedPoints += importanceScore;
                } else if (plan.status === 'overdue') {
                    // 逾期未完成，扣2倍分数
                    earnedPoints -= importanceScore * 2;
                }
                // 待完成的计划不影响分数
            });
        }
        
        // 如果没有计划，默认100分
        if (totalPossiblePoints === 0) {
            return 100;
        }
        
        // 计算百分比，确保不低于0
        let score = (earnedPoints / totalPossiblePoints) * 100;
        score = Math.max(0, Math.min(100, score));
        
        // 四舍五入到整数
        return Math.round(score);
    }

    updateYearlyScore() {
        const score = this.calculateYearlyScore();
        this.yearlyScore.textContent = score;
        
        // 根据分数改变颜色
        if (score >= 80) {
            this.yearlyScore.style.color = '#28a745';
        } else if (score >= 60) {
            this.yearlyScore.style.color = '#ffc107';
        } else {
            this.yearlyScore.style.color = '#dc3545';
        }
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new YearScoreApp();
});
