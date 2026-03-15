document.addEventListener('DOMContentLoaded', async () => {
    const totalCountEl = document.getElementById('total-predictions-count');
    
    // Theme integration wrapper
    let currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    let chartTextColor = currentTheme === 'dark' ? '#cbd5e1' : '#64748b';
    let chartGridColor = currentTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: chartTextColor,
                    font: { family: "'Outfit', sans-serif", size: 12 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { family: "'Outfit', sans-serif" },
                bodyFont: { family: "'Outfit', sans-serif" },
                padding: 12,
                cornerRadius: 8,
                displayColors: true
            }
        }
    };

    const cartesianOptions = {
        ...baseOptions,
        scales: {
            x: {
                ticks: { color: chartTextColor, font: { family: "'Outfit', sans-serif" } },
                grid: { color: chartGridColor }
            },
            y: {
                beginAtZero: true,
                ticks: { color: chartTextColor, font: { family: "'Outfit', sans-serif" } },
                grid: { color: chartGridColor }
            }
        }
    };

    let catChart, popChart, trendChart;

    try {
        const response = await fetch(`${API_BASE}/analytics_v2`);
        const data = await response.json();

        // Update Total Count
        if (totalCountEl) {
            animateValue(totalCountEl, 0, data.total, 1500);
        }

        // 1. Predictions by Category (Bar Chart)
        const ctx1 = document.getElementById('categoryDistributionChart').getContext('2d');
        catChart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: data.categories.labels,
                datasets: [{
                    label: 'Predictions',
                    data: data.categories.data,
                    backgroundColor: 'rgba(139, 92, 246, 0.6)',
                    borderColor: '#8b5cf6',
                    borderWidth: 2,
                    borderRadius: 10,
                    hoverBackgroundColor: '#8b5cf6'
                }]
            },
            options: cartesianOptions
        });

        // 2. Popularity Distribution (Pie Chart)
        const ctx2 = document.getElementById('popularityPieChart').getContext('2d');
        popChart = new Chart(ctx2, {
            type: 'pie',
            data: {
                labels: data.popularity.labels,
                datasets: [{
                    data: data.popularity.data,
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.6)',  // High - Green
                        'rgba(234, 179, 8, 0.6)',   // Medium - Yellow
                        'rgba(239, 68, 68, 0.6)'    // Low - Red
                    ],
                    borderColor: [
                        '#22c55e',
                        '#eab308',
                        '#ef4444'
                    ],
                    borderWidth: 2,
                    hoverOffset: 20
                }]
            },
            options: {
                ...baseOptions,
                plugins: {
                    ...baseOptions.plugins,
                    legend: {
                        position: 'bottom',
                        labels: baseOptions.plugins.legend.labels
                    }
                }
            }
        });

        // 3. Predicted Views Trend (Line Chart)
        const ctx3 = document.getElementById('viewsTrendChart').getContext('2d');
        
        // Format trend labels to be more readable (dates)
        const trendLabels = data.trend.labels.map(ts => new Date(ts).toLocaleDateString());

        trendChart = new Chart(ctx3, {
            type: 'line',
            data: {
                labels: trendLabels,
                datasets: [{
                    label: 'Predicted Views',
                    data: data.trend.data,
                    fill: true,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: '#3b82f6',
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6,
                    tension: 0.4,
                    borderWidth: 3
                }]
            },
            options: cartesianOptions
        });

    } catch (err) {
        console.error("Error loading analytics data:", err);
    }

    // Dynamic Theme Updating for Charts
    window.addEventListener('themeChanged', () => {
        let theme = document.documentElement.getAttribute('data-theme') || 'light';
        let txtColor = theme === 'dark' ? '#cbd5e1' : '#64748b';
        let grdColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        
        [catChart, popChart, trendChart].forEach(chart => {
            if (chart) {
                chart.options.plugins.legend.labels.color = txtColor;
                if (chart.options.scales) {
                    chart.options.scales.x.ticks.color = txtColor;
                    chart.options.scales.x.grid.color = grdColor;
                    chart.options.scales.y.ticks.color = txtColor;
                    chart.options.scales.y.grid.color = grdColor;
                }
                chart.update();
            }
        });
    });

    /**
     * Counter Animation Function
     */
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
