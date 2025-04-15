document.addEventListener('DOMContentLoaded', () => {
    // Global variables
    let currentPage = 1;
    let selectedPlatform = null;
    let selectedCampaignType = null;
    let selectedCurrency = 'USD';
    let budgetValue = 50;
    let chart = null;
    let currentLanguage = 'en';
    
    // Time period multipliers
    const periodMultipliers = {
        daily: 1,
        weekly: 7,
        monthly: 30.4
    };
    
    // Region multipliers (for different markets)
    const regionMultipliers = {
        us: { reach: 1.2, clicks: 1.1, conversions: 1.0 },
        eu: { reach: 1.0, clicks: 0.9, conversions: 0.8 },
        uk: { reach: 1.1, clicks: 1.0, conversions: 0.9 },
        bg: { reach: 0.7, clicks: 0.6, conversions: 0.5 },
        other: { reach: 0.8, clicks: 0.7, conversions: 0.6 }
    };

    // Currency conversion rates
    const conversionRates = {
        USD: 1.0,
        EUR: 0.85,
        BGN: 1.67
    };

    // Platform-specific multipliers for different campaign types
    const platformMultipliers = {
        meta: {
            awareness: { reach: 1.5, clicks: 0.8, conversions: 0.4 },
            traffic: { reach: 1.2, clicks: 1.5, conversions: 0.6 },
            engagement: { reach: 1.3, clicks: 1.2, conversions: 0.5 },
            leads: { reach: 0.9, clicks: 1.0, conversions: 1.2 },
            sales: { reach: 0.8, clicks: 0.9, conversions: 1.5 }
        },
        google: {
            search: { reach: 0.6, clicks: 1.2, conversions: 1.4 },
            display: { reach: 1.4, clicks: 0.7, conversions: 0.5 },
            shopping: { reach: 0.8, clicks: 1.1, conversions: 1.3 },
            video: { reach: 1.3, clicks: 0.8, conversions: 0.6 }
        },
        tiktok: {
            awareness: { reach: 1.6, clicks: 0.7, conversions: 0.3 },
            traffic: { reach: 1.3, clicks: 1.4, conversions: 0.5 },
            conversions: { reach: 0.9, clicks: 1.0, conversions: 1.1 },
            app_install: { reach: 1.0, clicks: 1.2, conversions: 1.0 }
        }
    };
    
    // DOM Elements
    const pages = document.querySelectorAll('.page');
    const progressSteps = document.querySelectorAll('.progress-step');
    const languageSelector = document.getElementById('languageSelect');
    const nextButtons = document.querySelectorAll('.next-btn');
    const backButtons = document.querySelectorAll('.back-btn');
    const platformOptions = document.querySelectorAll('.platform-option');
    const budgetInput = document.getElementById('budgetInput');
    const budgetSlider = document.getElementById('budgetSlider');
    const budgetCurrency = document.getElementById('budgetCurrency');
    const resetButton = document.querySelector('.reset-btn');
    const timePeriodButtons = document.querySelectorAll('.time-btn');
    
    // Initialize calculator
    function initializeCalculator() {
        // Remove any inline handlers
        document.querySelectorAll('[onclick]').forEach(el => {
            el.removeAttribute('onclick');
        });
        
        // Initialize with page 1
        showPage(1);
        
        // Setup event listeners
        setupEventListeners();
        
        // Set default values
        if (budgetInput) budgetInput.value = 50;
        if (budgetSlider) budgetSlider.value = 50;
        updateBudgetDisplay();
        
        // Initialize chart
        initializeChart();
        
        // Set default language
        updateLanguage(currentLanguage);
    }
    
    // Show page and update progress bar
    function showPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > pages.length) return;
        
        // Update pages visibility
        pages.forEach((page, index) => {
            if (index + 1 === pageNumber) {
                page.classList.add('active');
                page.style.display = 'block';
                // Use setTimeout to ensure display change happens before opacity change
                setTimeout(() => {
                    page.style.opacity = '1';
                }, 10);
            } else {
                page.classList.remove('active');
                page.style.opacity = '0';
                // Use setTimeout to hide after transition completes
                setTimeout(() => {
                    page.style.display = 'none';
                }, 300); // Match transition time in CSS
            }
        });
        
        // Update progress steps
        progressSteps.forEach((step, index) => {
            if (index + 1 < pageNumber) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (index + 1 === pageNumber) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
        
        currentPage = pageNumber;
        updateNavigationButtons();
        
        // Calculate results when reaching the results page
        if (pageNumber === 3) {
            calculateResults();
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Language selector
        if (languageSelector) {
            languageSelector.addEventListener('change', (e) => {
                updateLanguage(e.target.value);
            });
        }
        
        // Navigation buttons - Explicitly log for debugging
        console.log('Next buttons found:', nextButtons.length);
        nextButtons.forEach((button, index) => {
            console.log('Setting up next button', index);
            button.addEventListener('click', () => {
                console.log('Next button clicked on page', currentPage);
                if (validateCurrentPage()) {
                    showPage(currentPage + 1);
                }
            });
        });
        
        backButtons.forEach(button => {
            button.addEventListener('click', () => {
                showPage(currentPage - 1);
            });
        });
        
        // Reset button
        if (resetButton) {
            resetButton.addEventListener('click', resetCalculator);
        }
        
        // Platform selection
        platformOptions.forEach(option => {
            // Platform click handler
            option.addEventListener('click', (e) => {
                // Don't handle click if it was on the select dropdown
                if (e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') {
                    return;
                }
                
                platformOptions.forEach(p => p.classList.remove('selected'));
                option.classList.add('selected');
                selectedPlatform = option.dataset.platform;
                console.log('Selected platform:', selectedPlatform);
                
                // Ensure campaign type select is visible
                const campaignSelect = option.querySelector('.campaign-type-select');
                if (campaignSelect) {
                    // Only reset if clicking a different platform
                    if (selectedCampaignType === null || option.dataset.platform !== selectedPlatform) {
                        selectedCampaignType = null;
                        campaignSelect.selectedIndex = 0;
                    }
                    
                    // Ensure the dropdown is clickable
                    campaignSelect.style.pointerEvents = 'auto';
                    campaignSelect.style.opacity = '1';
                    
                    // Focus on the dropdown to make it more obvious
                    setTimeout(() => {
                        campaignSelect.focus();
                    }, 100);
                }
            });
            
            // Campaign type selection
            const campaignSelect = option.querySelector('.campaign-type-select');
            if (campaignSelect) {
                campaignSelect.addEventListener('click', (e) => {
                    // Prevent the platform click handler from firing
                    e.stopPropagation();
                    
                    // Select the platform when clicking on its dropdown
                    if (!option.classList.contains('selected')) {
                        platformOptions.forEach(p => p.classList.remove('selected'));
                        option.classList.add('selected');
                        selectedPlatform = option.dataset.platform;
                    }
                });
                
                campaignSelect.addEventListener('change', (e) => {
                    // Prevent the platform click handler from firing
                    e.stopPropagation();
                    
                    // Ensure the platform is selected
                    if (!option.classList.contains('selected')) {
                        platformOptions.forEach(p => p.classList.remove('selected'));
                        option.classList.add('selected');
                        selectedPlatform = option.dataset.platform;
                    }
                    
                    // Update selected campaign type
                    selectedCampaignType = e.target.value;
                    console.log('Selected campaign type:', selectedCampaignType);
                });
            }
        });
        
        // Budget slider and input synchronization
        if (budgetSlider && budgetInput) {
            budgetSlider.addEventListener('input', () => {
                budgetInput.value = budgetSlider.value;
                budgetValue = parseInt(budgetSlider.value);
                updateBudgetDisplay();
                updateSliderBackground(budgetSlider);
                
                // Update results if on page 3
                if (currentPage === 3) {
                    calculateResults();
                }
            });
            
            budgetInput.addEventListener('input', () => {
                const value = parseInt(budgetInput.value);
                if (value >= 5 && value <= 1000) {
                    budgetSlider.value = value;
                    budgetValue = value;
                    updateSliderBackground(budgetSlider);
                    
                    // Update results if on page 3
                    if (currentPage === 3) {
                        calculateResults();
                    }
                }
            });
        }
        
        // Currency selector
        const currencySelect = document.getElementById('budgetCurrency');
        if (currencySelect) {
            currencySelect.addEventListener('change', (e) => {
                selectedCurrency = e.target.value;
                
                // Update min/max values display
                const minValueEl = document.querySelector('.min-value');
                const maxValueEl = document.querySelector('.max-value');
                
                if (minValueEl && maxValueEl) {
                    const currencySymbol = getCurrencySymbol(selectedCurrency);
                    minValueEl.textContent = `${currencySymbol}5`;
                    maxValueEl.textContent = `${currencySymbol}1000`;
                }
                
                // Update results
                if (currentPage === 3) {
                    calculateResults();
                }
            });
        }
        
        // Time period buttons
        timePeriodButtons.forEach(button => {
            button.addEventListener('click', () => {
                timePeriodButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                
                const period = button.dataset.period;
                updateMetricLabels(period);
                calculateResults(period);
            });
        });
    }
    
    // Validate current page before proceeding
    function validateCurrentPage() {
        switch (currentPage) {
            case 1:
                // Check if industry, business type, and location are selected
                const industrySelect = document.getElementById('industrySelect');
                const businessTypeSelect = document.getElementById('businessTypeSelect');
                const locationSelect = document.getElementById('locationSelect');
                
                // Ensure elements exist before checking
                if (!industrySelect || !businessTypeSelect || !locationSelect) {
                    console.error('Form elements not found:', {
                        industrySelect, 
                        businessTypeSelect, 
                        locationSelect
                    });
                    return false;
                }
                
                // Get values
                const industry = industrySelect.value;
                const businessType = businessTypeSelect.value;
                const location = locationSelect.value;
                
                console.log('Validating page 1 values:', {industry, businessType, location});
                
                // Validate industry
                if (!industry) {
                    alert(translations[currentLanguage].validation_industry || 'Please select your industry.');
                    industrySelect.focus();
                    return false;
                }
                
                // Validate business type
                if (!businessType) {
                    alert(translations[currentLanguage].validation_business || 'Please select your business type.');
                    businessTypeSelect.focus();
                    return false;
                }
                
                // Validate location
                if (!location) {
                    alert(translations[currentLanguage].validation_location || 'Please select your location.');
                    locationSelect.focus();
                    return false;
                }
                
                // All validations passed
                return true;
                
            case 2:
                // Check if platform and campaign type are selected
                if (!selectedPlatform) {
                    alert(translations[currentLanguage].validation_platform || 'Please select an advertising platform.');
                    return false;
                }
                
                if (!selectedCampaignType) {
                    alert(translations[currentLanguage].validation_campaign || 'Please select a campaign type.');
                    return false;
                }
                
                return true;
                
            default:
                return true;
        }
    }
    
    // Update navigation buttons visibility based on current page
    function updateNavigationButtons() {
        // Hide back button on first page
        backButtons.forEach(button => {
            button.style.display = currentPage === 1 ? 'none' : 'inline-block';
        });
        
        // Hide next button on last page
        nextButtons.forEach(button => {
            button.style.display = currentPage === pages.length ? 'none' : 'inline-block';
        });
    }
    
    // Update budget display
    function updateBudgetDisplay() {
        if (budgetInput) {
            budgetValue = parseInt(budgetInput.value);
        }
    }
    
    // Update slider background based on its value
    function updateSliderBackground(slider) {
        const min = parseInt(slider.min);
        const max = parseInt(slider.max);
        const value = parseInt(slider.value);
        const percentage = ((value - min) / (max - min)) * 100;
        
        slider.style.background = `linear-gradient(to right, var(--caribbean-current) 0%, var(--caribbean-current) ${percentage}%, var(--light-teal) ${percentage}%, var(--light-teal) 100%)`;
    }
    
    // Calculate and display results
    function calculateResults(period = 'weekly') {
        if (!selectedPlatform || !selectedCampaignType) return;
        
        // Get the location value from the select element
        const locationSelect = document.getElementById('locationSelect');
        const location = locationSelect.value || 'us';
        
        // Get multipliers
        const platformMultiplier = platformMultipliers[selectedPlatform][selectedCampaignType];
        const regionMultiplier = regionMultipliers[location];
        const periodMultiplier = period === 'weekly' ? periodMultipliers.weekly : periodMultipliers.monthly;
        
        // Convert budget to USD for calculations
        const budgetInUsd = selectedCurrency === 'USD' 
            ? budgetValue 
            : budgetValue / conversionRates[selectedCurrency];
        
        // Calculate base metrics
        const baseReach = budgetInUsd * 100;
        const baseClicks = budgetInUsd * 5;
        const baseConversions = budgetInUsd * 0.2;
        
        // Apply multipliers
        const reach = Math.round(baseReach * platformMultiplier.reach * regionMultiplier.reach * periodMultiplier);
        const clicks = Math.round(baseClicks * platformMultiplier.clicks * regionMultiplier.clicks * periodMultiplier);
        const conversions = Math.round(baseConversions * platformMultiplier.conversions * regionMultiplier.conversions * periodMultiplier);
        
        // Display results
        document.getElementById('reachValue').textContent = formatNumber(reach);
        document.getElementById('clicksValue').textContent = formatNumber(clicks);
        document.getElementById('conversionsValue').textContent = formatNumber(conversions);
        
        // Update chart
        updateChart(reach, clicks, conversions, period);
    }
    
    // Initialize Chart.js chart
    function initializeChart() {
        const ctx = document.getElementById('resultsChart');
        
        if (!ctx) return;
        
        // Set initial empty data
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    translations[currentLanguage].estimated_reach || 'Estimated Reach',
                    translations[currentLanguage].expected_clicks || 'Expected Clicks',
                    translations[currentLanguage].potential_conversions || 'Potential Conversions'
                ],
                datasets: [
                    {
                        label: translations[currentLanguage].reach_clicks || 'Reach & Clicks',
                        data: [0, 0, null], // Reach and clicks on left axis
                        backgroundColor: [
                            'rgba(7, 57, 66, 0.7)',
                            'rgba(7, 57, 66, 0.5)',
                        ],
                        borderColor: [
                            'rgba(7, 57, 66, 1)',
                            'rgba(7, 57, 66, 0.8)',
                        ],
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: translations[currentLanguage].conversions || 'Conversions', 
                        data: [null, null, 0], // Conversions on right axis
                        backgroundColor: 'rgba(144, 221, 240, 0.7)',
                        borderColor: 'rgba(144, 221, 240, 1)',
                        borderWidth: 1,
                        yAxisID: 'y1',
                        // Different bar type for conversions
                        type: 'bar',
                        // Add bar border radius for nicer look
                        borderRadius: 4
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: translations[currentLanguage].reach_clicks || 'Reach & Clicks',
                            color: 'rgba(7, 57, 66, 1)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: translations[currentLanguage].conversions || 'Conversions',
                            color: 'rgba(144, 221, 240, 1)'
                        },
                        grid: {
                            display: false  // Don't show grid lines for second axis
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 15,
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${formatNumber(context.raw || 0)}`;
                            }
                        }
                    }
                },
                onClick: function(e, activeElements) {
                    if (activeElements.length > 0) {
                        // Increase budget when clicking on chart bars
                        increaseMetric(activeElements[0].index);
                    }
                }
            }
        });
        
        // Give the chart its initial height
        ctx.parentElement.style.height = '300px';
    }
    
    // Update chart with new data
    function updateChart(reach, clicks, conversions, period = 'weekly') {
        if (!chart) return;
        
        // Period labels for axis titles
        const periodText = period === 'weekly' ? 
            (translations[currentLanguage].weekly || 'Weekly') : 
            (translations[currentLanguage].monthly || 'Monthly');
        
        // Update axis titles with period
        chart.options.scales.y.title.text = `${periodText} ${translations[currentLanguage].reach_clicks || 'Reach & Clicks'}`;
        chart.options.scales.y1.title.text = `${periodText} ${translations[currentLanguage].conversions || 'Conversions'}`;
        
        // Update labels based on language and period
        chart.data.labels = [
            translations[currentLanguage][period === 'weekly' ? 'weekly_reach' : 'monthly_reach'] || 'Estimated Reach',
            translations[currentLanguage][period === 'weekly' ? 'weekly_clicks' : 'monthly_clicks'] || 'Expected Clicks',
            translations[currentLanguage][period === 'weekly' ? 'weekly_conversions' : 'monthly_conversions'] || 'Potential Conversions'
        ];
        
        // Update datasets
        chart.data.datasets[0].data = [reach, clicks, null];
        chart.data.datasets[1].data = [null, null, conversions];
        
        // Update chart
        chart.update();
    }
    
    // Function to increase a specific metric by increasing budget
    function increaseMetric(metricIndex) {
        if (!budgetSlider || !budgetInput) return;
        
        // Increase budget by 10%
        let newBudget = Math.min(1000, Math.round(budgetValue * 1.1));
        
        // Make sure new budget is at least 5 more than current
        newBudget = Math.max(newBudget, budgetValue + 5);
        
        // Update budget
        budgetValue = newBudget;
        budgetSlider.value = newBudget;
        budgetInput.value = newBudget;
        
        // Update slider background
        updateSliderBackground(budgetSlider);
        
        // Recalculate results
        calculateResults(document.querySelector('.time-btn.selected').dataset.period);
    }
    
    // Format numbers with commas for thousands
    function formatNumber(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // Get currency symbol
    function getCurrencySymbol(currency) {
        switch(currency) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'BGN': return 'лв';
            default: return '$';
        }
    }
    
    // Update language across the UI
    function updateLanguage(language) {
        if (!translations[language]) {
            console.error(`Translation for ${language} not found`);
            return;
        }
        
        currentLanguage = language;
        
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            
            if (translations[language][key]) {
                element.textContent = translations[language][key];
            }
        });
        
        // Specifically update option elements inside select dropdowns
        document.querySelectorAll('option[data-i18n]').forEach(option => {
            const key = option.getAttribute('data-i18n');
            
            if (translations[language][key]) {
                option.textContent = translations[language][key];
            }
        });
        
        // Update placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            
            if (translations[language][key]) {
                element.placeholder = translations[language][key];
            }
        });
        
        // Update platform info tooltips
        document.querySelectorAll('.platform-option').forEach(platform => {
            const platformId = platform.getAttribute('data-platform');
            if (platformId && translations[language].platform_info && translations[language].platform_info[platformId]) {
                const infoTooltip = platform.querySelector('.campaign-info');
                if (infoTooltip) {
                    infoTooltip.textContent = translations[language].platform_info[platformId];
                }
            }
        });
        
        // Update chart labels if chart exists
        if (chart) {
            const period = document.querySelector('.time-btn.selected')?.dataset.period || 'weekly';
            updateMetricLabels(period);
            chart.update();
        }
        
        // Update chart hint
        const chartHint = document.querySelector('.chart-hint');
        if (chartHint && translations[language].chart_hint) {
            chartHint.textContent = translations[language].chart_hint;
        }
        
        // Update currency symbols
        updateCurrencySymbols();
    }
    
    // Update currency symbols based on selected currency
    function updateCurrencySymbols() {
        const currencySymbol = getCurrencySymbol(selectedCurrency);
        const minValueEl = document.querySelector('.min-value');
        const maxValueEl = document.querySelector('.max-value');
        
        if (minValueEl && maxValueEl) {
            minValueEl.textContent = `${currencySymbol}5`;
            maxValueEl.textContent = `${currencySymbol}1000`;
        }
    }
    
    // Update metric labels based on selected period
    function updateMetricLabels(period = 'weekly') {
        const labels = document.querySelectorAll('.metric-label');
        
        if (labels.length >= 3) {
            if (period === 'weekly') {
                labels[0].textContent = translations[currentLanguage].weekly_reach || 'Est. Weekly Reach';
                labels[1].textContent = translations[currentLanguage].weekly_clicks || 'Est. Weekly Clicks';
                labels[2].textContent = translations[currentLanguage].weekly_conversions || 'Est. Weekly Conversions';
            } else {
                labels[0].textContent = translations[currentLanguage].monthly_reach || 'Est. Monthly Reach';
                labels[1].textContent = translations[currentLanguage].monthly_clicks || 'Est. Monthly Clicks';
                labels[2].textContent = translations[currentLanguage].monthly_conversions || 'Est. Monthly Conversions';
            }
        }
    }
    
    // Reset calculator to initial state
    function resetCalculator() {
        // Reset selections
        selectedPlatform = null;
        selectedCampaignType = null;
        budgetValue = 50;
        
        // Reset platform selections
        platformOptions.forEach(option => {
            option.classList.remove('selected');
            
            const campaignSelect = option.querySelector('.campaign-type-select');
            if (campaignSelect) {
                campaignSelect.selectedIndex = 0;
            }
        });
        
        // Reset form elements
        const industrySelect = document.getElementById('industrySelect');
        const businessTypeSelect = document.getElementById('businessTypeSelect');
        const locationSelect = document.getElementById('locationSelect');
        
        if (industrySelect) industrySelect.selectedIndex = 0;
        if (businessTypeSelect) businessTypeSelect.selectedIndex = 0;
        if (locationSelect) locationSelect.selectedIndex = 0;
        
        // Reset budget
        if (budgetInput) budgetInput.value = 50;
        if (budgetSlider) {
            budgetSlider.value = 50;
            updateSliderBackground(budgetSlider);
        }
        
        // Reset to page 1
        showPage(1);
        
        // Reset chart with empty data
        if (chart) {
            chart.data.datasets[0].data = [0, 0, null];
            chart.data.datasets[1].data = [null, null, 0];
            chart.update();
        }
    }
    
    // Initialize when DOM is loaded
    initializeCalculator();
    
    // Initialize slider background
    if (budgetSlider) {
        updateSliderBackground(budgetSlider);
    }
}); 