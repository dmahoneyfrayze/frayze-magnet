import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Zap,
    Bot,
    TrendingUp,
    Users,
    DollarSign,
    BarChart3,
    ArrowRight,
    CheckCircle2,
    Lock,
    Download,
    Terminal,
    RefreshCw,
    Cpu,
    Activity,
    Maximize2,
    Gauge,
    Signal,
    Target,
    Sparkles,
    FileText,
    HelpCircle
} from 'lucide-react';

const GrowthSimulator = ({ isEmbed = false }) => {
    // --- State ---
    const [inputs, setInputs] = useState({
        monthlyTraffic: 1000,
        conversionRate: 2.0,     // Traffic to Lead
        leadToSaleRate: 20.0,    // Lead to Sale
        avgDealValue: 500,       // Revenue per Sale
    });

    const [toggles, setToggles] = useState({
        chatbot: false,
        crm: false,
        seo: false,
    });

    const [showLeadForm, setShowLeadForm] = useState(false);
    const [formStep, setFormStep] = useState(0); // 0: input, 1: processing, 2: success
    const [formData, setFormData] = useState({ url: '', email: '', phone: '' });
    const [aiSummary, setAiSummary] = useState(""); // Store the summary to use in the manual download

    const [terminalLogs, setTerminalLogs] = useState([
        { id: 'init-1', text: "System initialized...", type: "info" },
        { id: 'init-2', text: "Waiting for user configuration...", type: "info" }
    ]);

    // --- Calculations ---

    // Base Metrics (Current State)
    const baseLeads = Math.round(inputs.monthlyTraffic * (inputs.conversionRate / 100));
    const baseSales = Math.round(baseLeads * (inputs.leadToSaleRate / 100));
    const baseRevenue = baseSales * inputs.avgDealValue;

    // Impact Multipliers (Hypothetical Frayze Impact)
    const chatbotImpact = toggles.chatbot ? 1.25 : 1; // +25% Traffic-to-Lead conversion
    const crmImpact = toggles.crm ? 1.30 : 1;         // +30% Lead-to-Sale closure
    const seoImpact = toggles.seo ? 1.50 : 1;         // +50% Traffic

    // New Metrics (Future State)
    const newTraffic = Math.round(inputs.monthlyTraffic * seoImpact);
    const newConversionRate = inputs.conversionRate * chatbotImpact;
    const newLeads = Math.round(newTraffic * (newConversionRate / 100));
    const newLeadToSaleRate = Math.min(100, inputs.leadToSaleRate * crmImpact);
    const newSales = Math.round(newLeads * (newLeadToSaleRate / 100));
    const newRevenue = Math.round(newSales * inputs.avgDealValue);

    const revenueGrowth = newRevenue - baseRevenue;
    const annualGrowth = revenueGrowth * 12;

    // --- Gemini API Integration ---

    const callGeminiGrowthAnalysis = async (metrics, url, activeMods) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; // Injected by environment
        const systemPrompt = "You are a Senior Growth Engineer at Frayze.ca. Your job is to analyze business metrics and write a concise, high-impact Executive Summary for a PDF report. Focus on the 'Opportunity Cost' and how Frayze's automation (Chatbots, CRM, SEO) solves specific bottlenecks. Tone: Professional, Technical, Persuasive.";

        const userPrompt = `
      Analyze this business:
      Website: ${url || 'Not provided'}
      Current Traffic: ${metrics.traffic}/mo
      Current Conversion: ${metrics.conversion}%
      Avg Deal Value: $${metrics.dealValue}
      
      Simulated Growth with Frayze:
      Active Modules: ${activeMods}
      Projected Annual Revenue Increase: $${metrics.annualGrowth.toLocaleString()}
      
      Write a 3-4 sentence Executive Summary explaining specifically why this business needs to implement these systems immediately to capture that revenue. Use "We" to refer to Frayze.
    `;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userPrompt }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] }
                })
            });

            if (!response.ok) throw new Error('Gemini API failed');

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis generation failed. Standard boilerplate used.";
        } catch (error) {
            console.error("AI Error:", error);
            return "Our automated analysis indicates significant revenue leakage in your current funnel. Implementing the selected Frayze modules is projected to close the gap between your current baseline and your market potential.";
        }
    };

    // --- Effects & Actions ---

    // Add logs when toggles change
    const addLog = (text, type = "success") => {
        setTerminalLogs(prev => [...prev.slice(-4), { text, type, id: Date.now() }]);
    };

    const handleToggle = (key) => {
        const isActive = !toggles[key];
        setToggles({ ...toggles, [key]: isActive });

        if (isActive) {
            const messages = {
                chatbot: "Deploying AI Conversationalist agent...",
                crm: "Syncing CRM automation workflows...",
                seo: "Indexing content engine parameters..."
            };
            addLog(messages[key], "success");
        } else {
            addLog(`Disabling ${key.toUpperCase()} module...`, "warning");
        }
    };

    // Generate and Download the HTML Report
    const triggerDownload = () => {
        // Determine active modules string
        const activeModules = Object.keys(toggles)
            .filter(k => toggles[k])
            .map(k => k === 'chatbot' ? 'AI Agent' : k === 'crm' ? 'Smart CRM' : 'SEO Engine')
            .join(', ') || 'None Selected';

        // LIGHT THEME HTML TEMPLATE
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frayze Growth Blueprint</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #fff; min-height: 100vh; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
        .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
        .logo { font-size: 24px; font-weight: 800; color: #0f172a; }
        .logo span { color: #0891b2; }
        .badge { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 5px 10px; font-size: 12px; color: #64748b; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        h1 { color: #0f172a; font-size: 32px; margin-bottom: 10px; letter-spacing: -1px; }
        h2 { color: #0891b2; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; margin-top: 40px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .card { background: #fff; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .metric-label { font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; font-weight: 700; }
        .metric-value { font-size: 28px; font-weight: 800; color: #0f172a; margin-top: 5px; }
        .metric-highlight { color: #0891b2; }
        .metric-sub { font-size: 12px; color: #059669; margin-top: 5px; font-weight: 500; }
        .growth-box { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 30px; text-align: center; border-radius: 16px; margin: 40px 0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .growth-title { font-size: 14px; text-transform: uppercase; color: #94a3b8; letter-spacing: 2px; margin-bottom: 10px; font-weight: 600; }
        .growth-value { font-size: 48px; font-weight: 800; color: #fff; }
        .ai-box { background: #ecfeff; border: 1px dashed #06b6d4; padding: 25px; border-radius: 12px; margin-bottom: 30px; position: relative; }
        .ai-label { position: absolute; top: -12px; left: 20px; background: #fff; padding: 2px 10px; color: #0891b2; font-size: 11px; font-weight: 800; border: 1px solid #06b6d4; border-radius: 20px; text-transform: uppercase; }
        .audit-list { list-style: none; padding: 0; }
        .audit-item { background: #fff; border: 1px solid #e2e8f0; border-left: 4px solid #94a3b8; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border-radius: 6px; }
        .audit-item.active { border-left-color: #06b6d4; background: #f0f9ff; border-color: #bae6fd; }
        .audit-name { font-weight: 700; color: #334155; }
        .audit-status { font-size: 11px; padding: 4px 8px; border-radius: 4px; background: #f1f5f9; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .audit-item.active .audit-status { background: #06b6d4; color: #fff; }
        .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        .cta-btn { display: inline-block; background: #0891b2; color: #fff; padding: 15px 35px; text-decoration: none; font-weight: 700; border-radius: 8px; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px; transition: background 0.2s; }
        .cta-btn:hover { background: #0e7490; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">frayze<span>.ca</span></div>
            <div class="badge">Growth Architecture Report</div>
        </div>

        <h1>System Blueprint</h1>
        <p style="color: #64748b;">Prepared for: <span style="color:#0f172a; font-weight:bold;">${formData.url}</span> | Date: ${new Date().toLocaleDateString()}</p>

        <div class="growth-box">
            <div class="growth-title">Total Revenue Opportunity</div>
            <div class="growth-value">$${annualGrowth.toLocaleString()} <span style="font-size:16px; color:#94a3b8; vertical-align:middle;">/ yr</span></div>
            <p style="color: #cbd5e1; font-size: 14px; margin-top: 10px;">Identified via Compound Growth Analysis</p>
        </div>

        <div class="ai-box">
            <div class="ai-label">✨ GENERATED EXECUTIVE SUMMARY</div>
            <p style="font-style: italic; color: #334155; font-size: 15px;">"${aiSummary}"</p>
        </div>

        <div class="grid">
            <div class="card">
                <div class="metric-label">Current Monthly Revenue</div>
                <div class="metric-value">$${baseRevenue.toLocaleString()}</div>
                <div class="metric-sub">Based on user input</div>
            </div>
            <div class="card" style="border-color: #06b6d4;">
                <div class="metric-label">Optimized Monthly Revenue</div>
                <div class="metric-value metric-highlight">$${newRevenue.toLocaleString()}</div>
                <div class="metric-sub">With Frayze Stack: ${activeModules}</div>
            </div>
        </div>

        <h2>Technical Gap Analysis</h2>
        <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">We've identified the following critical infrastructure components missing from your current growth model:</p>
        
        <ul class="audit-list">
            <li class="audit-item ${toggles.chatbot ? 'active' : ''}">
                <div>
                    <div class="audit-name">Speed to Lead (Instant Response)</div>
                    <div style="font-size:12px; color:#64748b;">Eliminate the 5-minute drop-off window.</div>
                </div>
                <div class="audit-status">${toggles.chatbot ? 'INCLUDED' : 'MISSING'}</div>
            </li>
            <li class="audit-item active">
                <div>
                    <div class="audit-name">AI Omnichannel Unification</div>
                    <div style="font-size:12px; color:#64748b;">SMS, Email, IG, FB - One inbox, zero leaks.</div>
                </div>
                <div class="audit-status">CORE</div>
            </li>
             <li class="audit-item ${toggles.seo ? 'active' : ''}">
                <div>
                    <div class="audit-name">Reputation Management</div>
                    <div style="font-size:12px; color:#64748b;">Automated review requests to dominate local SEO.</div>
                </div>
                <div class="audit-status">${toggles.seo ? 'INCLUDED' : 'RECOMMENDED'}</div>
            </li>
            <li class="audit-item ${toggles.crm ? 'active' : ''}">
                <div>
                    <div class="audit-name">Autonomous Follow-Up</div>
                    <div style="font-size:12px; color:#64748b;">System nurtures leads for 12 months without human input.</div>
                </div>
                <div class="audit-status">${toggles.crm ? 'INCLUDED' : 'MISSING'}</div>
            </li>
            <li class="audit-item active">
                <div>
                    <div class="audit-name">Activity Stats & Accountability</div>
                    <div style="font-size:12px; color:#64748b;">Transparent dashboards for employee performance.</div>
                </div>
                <div class="audit-status">CORE</div>
            </li>
            <li class="audit-item active">
                <div>
                    <div class="audit-name">24/7 AI Receptionist</div>
                    <div style="font-size:12px; color:#64748b;">Capture leads while you sleep.</div>
                </div>
                <div class="audit-status">CORE</div>
            </li>
        </ul>

        <div style="text-align: center; margin-top: 50px;">
            <p style="color:#334155;">Our engineering team has received this snapshot.</p>
            <p style="color:#334155;">We will contact you at <strong>${formData.phone}</strong> to verify these numbers.</p>
            <a href="https://frayze.ca/book-consultation/" class="cta-btn">Book Deployment Call</a>
        </div>

        <div class="footer">
            &copy; ${new Date().getFullYear()} Frayze Technologies Inc. | Engineered for Growth
        </div>
    </div>
</body>
</html>
    `;

        // Create a Blob and trigger download
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Frayze_Growth_Blueprint.html'; // Name of the downloaded file
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormStep(1); // Loading state

        // Call Gemini API
        const activeModules = Object.keys(toggles)
            .filter(k => toggles[k])
            .map(k => k === 'chatbot' ? 'AI Agent' : k === 'crm' ? 'Smart CRM' : 'SEO Engine')
            .join(', ') || 'None Selected';

        const metrics = {
            traffic: inputs.monthlyTraffic,
            conversion: inputs.conversionRate,
            dealValue: inputs.avgDealValue,
            annualGrowth: annualGrowth
        };

        const summary = await callGeminiGrowthAnalysis(metrics, formData.url, activeModules);
        setAiSummary(summary);

        // Move to Success state, but DO NOT auto-download.
        // User must click the button in Step 2.
        setFormStep(2);
    };

    // --- Components ---

    const ToggleCard = ({ icon: Icon, title, description, active, onClick, impactText, colorClass = "cyan" }) => (
        <div
            onClick={onClick}
            className={`relative cursor-pointer group rounded-xl border p-4 transition-all duration-300 ease-out overflow-hidden backdrop-blur-sm
        ${active
                    ? `bg-${colorClass}-50 border-${colorClass}-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]`
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
        >
            <div className="flex items-start gap-4 relative z-10">
                <div className={`p-3 rounded-lg transition-colors duration-300 ${active ? `bg-${colorClass}-100 text-${colorClass}-700` : 'bg-slate-100 text-slate-500'}`}>
                    <Icon size={22} strokeWidth={2} />
                </div>
                <div>
                    <h3 className={`font-bold text-base ${active ? 'text-slate-900' : 'text-slate-600'}`}>{title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[200px]">{description}</p>
                </div>
            </div>

            {/* Impact Badge */}
            <div className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded border transition-all duration-500
        ${active
                    ? `bg-${colorClass}-100 text-${colorClass}-700 border-${colorClass}-200 translate-y-0 opacity-100`
                    : 'opacity-0 -translate-y-2'}`}>
                {impactText}
            </div>

            {/* Animated Gradient Border */}
            {active && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-slate-400/10 to-transparent skew-x-12 animate-shimmer pointer-events-none" />
            )}
        </div>
    );

    const StatDisplay = ({ label, value, subValue, type = "neutral" }) => {
        const isPositive = type === "positive";
        return (
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{label}</span>
                <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold tracking-tighter ${isPositive ? 'text-slate-900' : 'text-slate-500'}`}>
                        {value}
                    </span>
                </div>
                {subValue && (
                    <div className={`flex items-center gap-1 text-xs font-bold mt-1 ${isPositive ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {isPositive && <TrendingUp size={12} />}
                        {subValue}
                    </div>
                )}
            </div>
        );
    };

    // --- Visuals: The Comparison Graph ---
    const ComparisonGraph = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // COMPOUND/EXPONENTIAL LOGIC
        const dataPoints = months.map((_, i) => {
            // Normalized time from 0 to 1
            const t = (i + 1) / 12;

            // Compound growth factor (Exponential curve)
            const growthCurve = Math.pow(t, 2);

            return {
                base: baseRevenue,
                // Optimized = Base + (TargetDifference * Curve)
                optimized: baseRevenue + (revenueGrowth * growthCurve)
            };
        });

        // Scale calculations
        const maxVal = Math.max(...dataPoints.map(d => Math.max(d.base, d.optimized))) * 1.2;
        const height = 160;

        const getY = (val) => height - ((val / maxVal) * height);

        // Generate path strings
        const basePath = `M0,${getY(baseRevenue)} ` + dataPoints.map((d, i) => `L${(i / 11) * 100 * 4},${getY(baseRevenue)}`).join(' ');
        const optPath = `M0,${getY(baseRevenue)} ` + dataPoints.map((d, i) => `L${(i / 11) * 100 * 4},${getY(d.optimized)}`).join(' ');

        return (
            <div className="w-full h-48 relative mt-6 select-none overflow-hidden">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400 pointer-events-none">
                    {[100, 75, 50, 25, 0].map((p) => (
                        <div key={p} className="w-full border-t border-dashed border-slate-200 h-0 relative">
                            <span className="absolute -top-3 right-0 bg-white px-1 font-mono text-slate-400">${Math.round(maxVal * (p / 100) / 1000)}k</span>
                        </div>
                    ))}
                </div>

                <svg className="w-full h-full overflow-visible preserve-3d" viewBox={`0 0 400 ${height}`}>
                    <defs>
                        <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0891b2" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area under curve */}
                    {revenueGrowth > 0 && (
                        <path
                            d={`${optPath} L400,${height} L0,${height} Z`}
                            fill="url(#glowGradient)"
                            className="transition-all duration-1000 ease-out"
                        />
                    )}

                    {/* Baseline Line */}
                    <path
                        d={basePath}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="transition-all duration-500"
                    />

                    {/* Optimized Line */}
                    <path
                        d={optPath}
                        fill="none"
                        stroke="#0891b2"
                        strokeWidth="3"
                        className="transition-all duration-1000 ease-out drop-shadow-md"
                    />

                    {/* End Point Dot */}
                    <circle
                        cx="400"
                        cy={getY(dataPoints[11].optimized)}
                        r="4"
                        className="fill-cyan-600 animate-pulse"
                    />
                </svg>

                {/* Labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-slate-400 pt-2 uppercase tracking-wider font-bold">
                    <span>Month 1</span>
                    <span>Month 6</span>
                    <span>Month 12</span>
                </div>
            </div>
        );
    };

    const EfficiencyMonitor = ({ toggles }) => {
        // Helper to render bars
        const renderBar = (label, icon, active, color, baseValue, optValue) => {
            const percentage = Math.round((optValue / baseValue) * 100) - 100;

            return (
                <div className="mb-4 last:mb-0">
                    <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                            {icon}
                            {label}
                        </div>
                        {active && (
                            <div className={`text-[10px] font-bold text-${color}-600 animate-pulse bg-${color}-50 px-1.5 rounded border border-${color}-200`}>
                                +{percentage}% EFFICIENCY
                            </div>
                        )}
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex items-center">
                        {/* Background Bar (Baseline) */}
                        <div className="h-full bg-slate-300 w-[60%] relative"></div>

                        {/* Active Bar (Optimization) */}
                        {active && (
                            <div className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400 animate-slide-in relative`} style={{ width: '40%' }}>
                                <div className="absolute inset-0 bg-white/30 skew-x-12 w-2 animate-shimmer-fast"></div>
                            </div>
                        )}
                    </div>
                </div>
            )
        };

        return (
            <div className="mt-6 px-1 py-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Gauge size={14} className="text-cyan-600" />
                        System Efficiency Diagnostics
                    </h4>
                </div>

                {/* Traffic Engine */}
                {renderBar("Acquisition Engine", <Signal size={12} />, toggles.seo, "emerald", 100, 150)}

                {/* Capture Engine */}
                {renderBar("Engagement Core", <Bot size={12} />, toggles.chatbot, "cyan", 100, 125)}

                {/* Revenue Engine */}
                {renderBar("Revenue Pipeline", <Target size={12} />, toggles.crm, "purple", 100, 130)}

                <style>{`
                @keyframes shimmer-fast {
                    0% { transform: translateX(-100%) skewX(-12deg); }
                    100% { transform: translateX(500%) skewX(-12deg); }
                }
                .animate-shimmer-fast {
                    animation: shimmer-fast 1.5s infinite linear;
                }
                @keyframes slide-in {
                    0% { width: 0%; }
                    100% { width: 40%; }
                }
                .animate-slide-in {
                    animation: slide-in 0.8s ease-out forwards;
                }
             `}</style>
            </div>
        );
    };

    // --- NEW: Wow Factor Components ---

    const LostRevenueTicker = ({ annualGrowth }) => {
        const [lost, setLost] = useState(0);

        useEffect(() => {
            // Reset when growth changes significantly or just keep ticking?
            // Let's just keep ticking from 0 to show "current session loss"
            setLost(0);
        }, [annualGrowth]);

        useEffect(() => {
            if (annualGrowth <= 0) return;

            // Calculate dollars per second
            const perSecond = annualGrowth / (365 * 24 * 60 * 60);
            const interval = setInterval(() => {
                setLost(prev => prev + (perSecond / 10)); // Update every 100ms
            }, 100);

            return () => clearInterval(interval);
        }, [annualGrowth]);

        if (annualGrowth <= 0) return null;

        return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <DollarSign size={64} className="text-amber-500 rotate-12" />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg animate-pulse">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wide flex items-center gap-2">
                            Revenue Leaking
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-100 text-amber-800">
                                LIVE
                            </span>
                        </h4>
                        <p className="text-xs text-amber-700 font-medium">Money left on the table during this session.</p>
                    </div>
                </div>
                <div className="text-2xl font-mono font-black text-amber-600 tracking-tight relative z-10">
                    ${lost.toFixed(4)}
                </div>
            </div>
        );
    };

    const GrowthScoreGauge = ({ toggles }) => {
        const activeCount = Object.values(toggles).filter(Boolean).length;
        const score = Math.round((activeCount / 3) * 100);

        // Color logic
        let colorClass = 'text-red-500';
        let borderClass = 'border-red-100';
        if (score >= 40) { colorClass = 'text-amber-500'; borderClass = 'border-amber-100'; }
        if (score >= 70) { colorClass = 'text-emerald-500'; borderClass = 'border-emerald-100'; }

        return (
            <div className="absolute top-6 right-6 flex flex-col items-center z-20 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-100 shadow-sm">
                <div className={`relative w-14 h-14 flex items-center justify-center rounded-full border-4 ${borderClass}`}>
                    <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                        <path
                            className={`${colorClass} transition-all duration-1000 ease-out`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${score}, 100`}
                        />
                    </svg>
                    <span className={`text-xs font-black ${colorClass}`}>{score}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-wider">Score</span>
            </div>
        );
    };

    return (
        <div className={`min-h-screen font-sans selection:bg-cyan-100 overflow-x-hidden relative ${isEmbed ? 'bg-transparent' : 'bg-slate-50'}`}>

            {/* --- Ambient Background Effects (Hidden in Embed) --- */}
            {!isEmbed && (
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-100/50 rounded-full blur-[120px] mix-blend-multiply" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-100/50 rounded-full blur-[120px] mix-blend-multiply" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
                </div>
            )}

            <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-12deg); }
          100% { transform: translateX(150%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
      `}</style>

            {/* --- Header (Hidden in Embed) --- */}
            {!isEmbed && (
                <header className="border-b border-slate-200 bg-white/80 sticky top-0 z-50 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded flex items-center justify-center text-white font-bold shadow-md">
                                F
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900 font-mono">frayze<span className="text-cyan-600">.ca</span></span>
                        </div>
                        <div className="hidden sm:flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] text-slate-500 uppercase tracking-widest font-bold shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                System Online
                            </div>
                        </div>
                    </div>
                </header>
            )}

            <main className={`max-w-7xl mx-auto relative z-10 ${isEmbed ? 'p-4' : 'px-4 sm:px-6 py-12'}`}>

                {/* Hero Section (Hidden in Embed) */}
                {!isEmbed && (
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-cyan-600 text-xs font-bold mb-6 shadow-sm">
                            <Cpu size={14} />
                            <span className="tracking-wide">ENGINEERING GROWTH SYSTEMS</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                            Simulate Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600">
                                Revenue Potential
                            </span>
                        </h1>
                        <p className="text-base md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                            Don't guess. Engineer it. Configure your automation stack below and visualize the mathematical impact of Frayze systems on your bottom line.
                        </p>
                    </div>
                )}

                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* --- Left Column: Input Matrix --- */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* 1. Metric Sliders */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 relative overflow-hidden group shadow-sm">
                            <h2 className="text-slate-900 font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-8 text-slate-400">
                                <Activity size={16} className="text-cyan-600" />
                                Baseline Configuration
                            </h2>

                            <div className="space-y-8">
                                {[
                                    { label: "Monthly Traffic", val: inputs.monthlyTraffic, set: (v) => setInputs({ ...inputs, monthlyTraffic: parseInt(v) }), min: 100, max: 50000, step: 100, fmt: v => v.toLocaleString() },
                                    { label: "Traffic-to-Lead %", val: inputs.conversionRate, set: (v) => setInputs({ ...inputs, conversionRate: parseFloat(v) }), min: 0.1, max: 10, step: 0.1, fmt: v => v + '%' },
                                    { label: "Lead-to-Sale %", val: inputs.leadToSaleRate, set: (v) => setInputs({ ...inputs, leadToSaleRate: parseFloat(v) }), min: 1, max: 50, step: 1, fmt: v => v + '%' },
                                    { label: "Avg. Deal Value", val: inputs.avgDealValue, set: (v) => setInputs({ ...inputs, avgDealValue: parseInt(v) }), min: 50, max: 5000, step: 50, fmt: v => '$' + v }
                                ].map((item, i) => (
                                    <div key={i} className="relative">
                                        <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wide">
                                            <span className="text-slate-500">{item.label}</span>
                                            <span className="text-cyan-600 font-mono font-bold">{item.fmt(item.val)}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={item.min} max={item.max} step={item.step}
                                            value={item.val}
                                            onChange={(e) => item.set(e.target.value)}
                                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 hover:accent-cyan-500 transition-all"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. System Modules (Toggles) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-slate-900 font-bold text-sm uppercase tracking-widest flex items-center gap-2 text-slate-400">
                                    <Zap size={16} className="text-purple-600" />
                                    Activate Modules
                                </h2>
                            </div>

                            <ToggleCard
                                icon={Bot}
                                title="AI Conversationalist"
                                description="24/7 Intelligent agent to capture & qualify traffic."
                                active={toggles.chatbot}
                                onClick={() => handleToggle('chatbot')}
                                impactText="+25% Leads"
                                colorClass="cyan"
                            />

                            <ToggleCard
                                icon={RefreshCw}
                                title="CRM Auto-Pilot"
                                description="Algorithmic follow-up sequences to close deals."
                                active={toggles.crm}
                                onClick={() => handleToggle('crm')}
                                impactText="+30% Closing"
                                colorClass="purple"
                            />

                            <ToggleCard
                                icon={TrendingUp}
                                title="SEO Content Engine"
                                description="Deep topical authority to drive organic reach."
                                active={toggles.seo}
                                onClick={() => handleToggle('seo')}
                                impactText="+50% Traffic"
                                colorClass="emerald"
                            />
                        </div>

                        {/* 3. Terminal Log (Hidden in Embed to save space) */}
                        {!isEmbed && (
                            <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 font-mono text-[10px] h-32 overflow-hidden flex flex-col relative shadow-inner">
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                                </div>
                                <div className="text-slate-500 mb-2 border-b border-slate-800 pb-1">user@frayze-sim:~/config$ tail -f system.log</div>
                                <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                                    {terminalLogs.map((log) => (
                                        <div key={log.id} className={`${log.type === 'success' ? 'text-emerald-400' : log.type === 'warning' ? 'text-amber-400' : 'text-slate-400'}`}>
                                            <span className="opacity-50 mr-2">[{new Date(log.id.toString().includes('init') ? Date.now() : log.id).toLocaleTimeString().split(' ')[0]}]</span>
                                            {log.text}
                                        </div>
                                    ))}
                                    <div className="w-2 h-4 bg-slate-500 animate-pulse mt-1"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- Right Column: Visualizer --- */}
                    <div className="lg:col-span-8 flex flex-col h-full gap-6">

                        {/* NEW: Lost Revenue Ticker */}
                        <LostRevenueTicker annualGrowth={annualGrowth} />

                        {/* Main Dashboard Card */}
                        <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-4 md:p-8 shadow-xl relative overflow-hidden flex flex-col">

                            {/* NEW: Growth Score Gauge */}
                            <GrowthScoreGauge toggles={toggles} />

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-100 pb-6">
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">Projected Annual Impact</h3>
                                    <p className="text-sm text-slate-500">Based on system configuration</p>
                                </div>
                                <div className="mt-4 md:mt-0 text-right">
                                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Additional Annual Revenue</p>
                                    <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">
                                        +${Math.max(0, annualGrowth).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* The Graph */}
                            <div className="flex-1 min-h-[200px] md:min-h-[250px] relative">
                                <ComparisonGraph />

                                {/* Floating Badges on Graph */}
                                {annualGrowth > 0 && (
                                    <div className="absolute top-1/4 right-[10%] bg-white/90 border border-emerald-200 p-2 rounded-lg backdrop-blur text-xs shadow-lg animate-fade-in-up">
                                        <div className="text-emerald-600 font-bold">New Trajectory</div>
                                        <div className="text-slate-500">Optimized by Frayze</div>
                                    </div>
                                )}
                            </div>

                            {/* NEW: System Efficiency Monitor (Fills the blank space) */}
                            <EfficiencyMonitor toggles={toggles} />

                            {/* Bottom Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-slate-100">
                                <StatDisplay label="Sales / Mo" value={newSales} subValue={newSales - baseSales > 0 ? `+${newSales - baseSales}` : null} type="positive" />
                                <StatDisplay label="Revenue / Mo" value={`$${(newRevenue / 1000).toFixed(1)}k`} type="neutral" />
                                <StatDisplay label="Traffic" value={newTraffic.toLocaleString()} type="neutral" />
                                <StatDisplay label="Conversion" value={`${newConversionRate.toFixed(1)}%`} type="neutral" />
                            </div>

                        </div>

                        {/* CTA Bar */}
                        <div className="bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-2xl">
                            <div className="bg-slate-900 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-cyan-900/30 rounded-lg text-cyan-400 border border-cyan-500/20">
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Claim AI Growth Blueprint</h3>
                                        <p className="text-slate-400 text-sm">Generate custom Frayze growth strategy.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowLeadForm(true)}
                                    className="w-full md:w-auto px-8 py-4 bg-white hover:bg-cyan-50 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Generate Blueprint <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* --- Lead Magnet Modal (Overlay) --- */}
            {showLeadForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setShowLeadForm(false)} />

                    <div className="relative bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Ambient Light */}
                        <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-cyan-100/50 blur-[80px] pointer-events-none" />

                        <button
                            onClick={() => setShowLeadForm(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            ×
                        </button>

                        {formStep === 0 && (
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-6 text-cyan-600 border border-cyan-100 shadow-sm">
                                    <Download size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Export Growth Blueprint</h3>
                                <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                                    We'll use our AI engine to analyze your provided URL and metrics to generate a custom growth strategy.
                                </p>

                                <form onSubmit={handleFormSubmit}>
                                    <div className="space-y-4 mb-6">
                                        <div className="group">
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider group-focus-within:text-cyan-600 transition-colors">Website URL</label>
                                            <input
                                                required
                                                type="url"
                                                placeholder="https://yourbusiness.ca"
                                                value={formData.url}
                                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider group-focus-within:text-cyan-600 transition-colors">Business Email</label>
                                            <input
                                                required
                                                type="email"
                                                placeholder="name@company.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                        {/* NEW: Phone Number Input */}
                                        <div className="group">
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider group-focus-within:text-cyan-600 transition-colors">Phone Number</label>
                                            <input
                                                required
                                                type="tel"
                                                placeholder="(555) 123-4567"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                        <Sparkles size={18} className="text-yellow-200" />
                                        Generate AI Blueprint
                                    </button>
                                </form>
                                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 mt-4">
                                    <Lock size={10} />
                                    <span>256-bit Secure Transmission</span>
                                </div>
                            </div>
                        )}

                        {formStep === 1 && (
                            <div className="text-center py-12 relative z-10">
                                <div className="relative w-20 h-20 mx-auto mb-6">
                                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
                                    <div className="absolute inset-4 bg-cyan-50 rounded-full animate-pulse"></div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Analyzing with Gemini AI...</h3>
                                <div className="text-slate-500 text-xs font-mono space-y-1">
                                    <p>Connecting to Neural Engine...</p>
                                    <p className="animate-pulse delay-75">Scanning metric configuration...</p>
                                    <p className="animate-pulse delay-150">Writing Executive Summary...</p>
                                </div>
                            </div>
                        )}

                        {formStep === 2 && (
                            <div className="text-center py-8 relative z-10 animate-fadeIn">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Blueprint Ready!</h3>
                                <p className="text-slate-500 mb-6 text-sm">
                                    Analysis complete. Download your personalized report.
                                </p>

                                <button
                                    onClick={triggerDownload}
                                    className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-4"
                                >
                                    <FileText size={18} className="text-cyan-300" />
                                    Download Your Blueprint
                                </button>

                                {/* Helper message for blocked downloads */}
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-left text-xs text-amber-800 flex gap-2">
                                    <HelpCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                                    <div>
                                        <p className="font-bold mb-1">Can't open the file?</p>
                                        If the file downloads with a random name (e.g. <code className="bg-amber-100 px-1 rounded">4bb4...</code>), simply rename it to end in <b>.html</b> and double-click to open.
                                    </div>
                                </div>

                                <button onClick={() => setShowLeadForm(false)} className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">
                                    Return to Simulator
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
};

export default GrowthSimulator;
