/* ============================================================
   CampusCare – Charts Module
   Pure CSS/JS donut and bar charts
   ============================================================ */

const Charts = {
    renderDonutChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const total = data.reduce((sum, d) => sum + d.count, 0);
        if (total === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-chart-pie"></i><p>No data available</p></div>';
            return;
        }

        const { size = 200, strokeWidth = 28, centerLabel = '' } = options;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const center = size / 2;

        let currentOffset = 0;
        const segments = data.map(d => {
            const percentage = d.count / total;
            const dashLength = percentage * circumference;
            const dashOffset = -currentOffset;
            currentOffset += dashLength;
            return {
                ...d,
                percentage,
                dashArray: `${dashLength} ${circumference - dashLength}`,
                dashOffset
            };
        });

        container.innerHTML = `
            <div class="donut-chart" style="width: ${size}px; height: ${size}px;">
                <svg viewBox="0 0 ${size} ${size}">
                    ${segments.map(seg => `
                        <circle
                            cx="${center}" cy="${center}" r="${radius}"
                            fill="none"
                            stroke="${seg.color}"
                            stroke-width="${strokeWidth}"
                            stroke-dasharray="${seg.dashArray}"
                            stroke-dashoffset="${seg.dashOffset}"
                            stroke-linecap="round"
                            style="transition: stroke-dasharray 1s ease, stroke-dashoffset 1s ease;"
                        />
                    `).join('')}
                </svg>
                <div class="center-label">
                    <span class="center-value">${total}</span>
                    <span class="center-text">${centerLabel || 'Total'}</span>
                </div>
            </div>
            <div class="chart-legend">
                ${data.map(d => `
                    <div class="chart-legend-item">
                        <span class="chart-legend-dot" style="background: ${d.color};"></span>
                        ${d.label} (${d.count})
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderBarChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const maxCount = Math.max(...data.map(d => d.count), 1);
        const { color = 'var(--primary-500)', gradient = true } = options;

        const colors = [
            'var(--primary-400)', 'var(--primary-500)', 'var(--secondary-500)',
            'var(--primary-600)', 'var(--secondary-400)', 'var(--primary-300)'
        ];

        container.innerHTML = `
            <div class="bar-chart">
                ${data.map((d, i) => {
                    const height = Math.max((d.count / maxCount) * 100, 4);
                    const barColor = gradient ? colors[i % colors.length] : color;
                    return `
                        <div class="bar-chart-col">
                            <span class="bar-chart-value">${d.count}</span>
                            <div class="bar-chart-bar" style="height: ${height}%; background: ${barColor};" title="${d.month || d.label}: ${d.count}"></div>
                            <span class="bar-chart-label">${d.month || d.label}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderMiniStat(value, total, color = 'var(--primary-500)') {
        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
        return `
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                <div style="flex: 1; height: 6px; background: var(--gray-200); border-radius: 3px; overflow: hidden;">
                    <div style="width: ${percentage}%; height: 100%; background: ${color}; border-radius: 3px; transition: width 0.8s ease;"></div>
                </div>
                <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary);">${percentage}%</span>
            </div>
        `;
    }
};
