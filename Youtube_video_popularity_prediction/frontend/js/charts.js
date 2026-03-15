document.addEventListener('DOMContentLoaded', async () => {
    // Check if we are on dashboard page
    if (!document.getElementById('categoryChart')) return;

    // Theme integration wrapper
    let currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    let chartTextColor = currentTheme === 'dark' ? '#cbd5e1' : '#64748b';
    let chartGridColor = currentTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: chartTextColor }
            }
        },
        scales: {
            x: { ticks: { color: chartTextColor }, grid: { color: chartGridColor } },
            y: { ticks: { color: chartTextColor }, grid: { color: chartGridColor } }
        }
    };

    // Keep instances to update them later
    let catChartIns, uploadChartIns, likesChartIns;

    try {
        const res = await fetch(`${API_BASE}/charts_data`);
        const data = await res.json();
        
        // Category vs Views (Bar)
        const ctx1 = document.getElementById('categoryChart').getContext('2d');
        catChartIns = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: data.category_views.labels,
                datasets: [{
                    label: 'Global Views by Category',
                    data: data.category_views.data,
                    backgroundColor: 'rgba(139, 92, 246, 0.7)',
                    borderColor: '#8b5cf6',
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: chartOptions
        });

        // Upload Time Distribution (Line)
        const ctx2 = document.getElementById('uploadChart').getContext('2d');
        uploadChartIns = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: data.upload_time_popularity.labels,
                datasets: [{
                    label: 'Popularity Score Focus',
                    data: data.upload_time_popularity.data,
                    backgroundColor: 'rgba(236, 72, 153, 0.2)',
                    borderColor: '#ec4899',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: chartOptions
        });

        // Likes vs Views (Doughnut / Pie alternative, let's use bubble or scatter, or just bar again)
        const ctx3 = document.getElementById('likesChart').getContext('2d');
        likesChartIns = new Chart(ctx3, {
            type: 'bar', // Using bar for better visualization
            data: {
                labels: data.likes_vs_views.labels,
                datasets: [{
                    label: 'Average Likes per Milestone',
                    data: data.likes_vs_views.data,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: chartOptions
        });

    } catch (err) {
        console.error("Failed to load chart data:", err);
    }

    // Dynamic Theme Updating for Charts
    window.addEventListener('themeChanged', () => {
        let theme = document.documentElement.getAttribute('data-theme') || 'light';
        let txtColor = theme === 'dark' ? '#cbd5e1' : '#64748b';
        let grdColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        
        [catChartIns, uploadChartIns, likesChartIns].forEach(chart => {
            if (chart) {
                chart.options.plugins.legend.labels.color = txtColor;
                chart.options.scales.x.ticks.color = txtColor;
                chart.options.scales.x.grid.color = grdColor;
                chart.options.scales.y.ticks.color = txtColor;
                chart.options.scales.y.grid.color = grdColor;
                chart.update();
            }
        });
    });
});
