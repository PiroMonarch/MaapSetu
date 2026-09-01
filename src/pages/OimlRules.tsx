import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, CheckCircle2, Calculator, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Rule {
    _id: string;
    testCode: string;
    testName: string;
    description: string;
    applicableClasses: string[];
    mpeFormula: string;
    version: string;
    required: boolean;
}

export function OimlRules() {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/oiml-rules')
            .then(r => r.json())
            .then(data => { setRules(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="flex-1 flex flex-col max-w-screen-lg mx-auto w-full px-5 py-8 lg:px-10 page-enter">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-near-black tracking-tight">OIML Compliance Rules</h1>
                    <p className="text-sm text-near-black/45 mt-0.5">
                        Rule library for OIML R 76-1 (2006) — Non-Automatic Weighing Instruments
                    </p>
                </div>
                <Badge variant="info" className="shrink-0">R 76-1:2006</Badge>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-industrial-blue/6 border border-industrial-blue/15 mb-6">
                <BookOpen className="h-4 w-4 text-industrial-blue shrink-0 mt-0.5" />
                <p className="text-xs text-industrial-blue/80 leading-relaxed">
                    These rules define the pass/fail logic used by the MaapSetu OIML Engine. All calculations are derived from the
                    authoritative OIML R 76-1 text. When the standard is revised, only this rule library needs to be updated.
                </p>
            </div>

            {/* Rules list */}
            <div className="glass-surface rounded-2xl overflow-hidden">
                {loading && (
                    <div className="py-16 text-center text-near-black/30 text-sm animate-pulse">Loading rules…</div>
                )}
                <div className="divide-y divide-near-black/6">
                    {rules.map(rule => (
                        <div key={rule._id}>
                            <button
                                onClick={() => setExpanded(expanded === rule._id ? null : rule._id)}
                                className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-near-black/3 transition-colors"
                            >
                                {/* Code chip */}
                                <div className="h-10 w-16 rounded-lg bg-industrial-blue/8 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-mono font-bold text-industrial-blue">{rule.testCode}</span>
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-semibold text-near-black">{rule.testName}</p>
                                        {rule.required
                                            ? <Badge variant="info">Required</Badge>
                                            : <Badge variant="default">Optional</Badge>
                                        }
                                    </div>
                                    <p className="text-xs text-near-black/45 mt-0.5 truncate">{rule.description}</p>
                                </div>
                                {/* Applicable classes */}
                                <div className="hidden sm:flex items-center gap-1 shrink-0">
                                    {rule.applicableClasses.map(c => (
                                        <span key={c} className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-near-black/6 text-near-black/50">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                                {expanded === rule._id
                                    ? <ChevronDown className="h-4 w-4 text-near-black/30 shrink-0" />
                                    : <ChevronRight className="h-4 w-4 text-near-black/20 shrink-0" />
                                }
                            </button>

                            <AnimatePresence>
                                {expanded === rule._id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.18 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-5 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-near-black/2">
                                            <div>
                                                <p className="text-xs font-semibold text-near-black/40 uppercase tracking-wider mb-1">Description</p>
                                                <p className="text-sm text-near-black/70 leading-relaxed">{rule.description}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-near-black/40 uppercase tracking-wider mb-1">
                                                    <Calculator className="h-3 w-3 inline mr-1" />MPE Formula
                                                </p>
                                                <p className="text-sm font-mono text-industrial-blue bg-industrial-blue/6 px-3 py-2 rounded-lg">
                                                    {rule.mpeFormula}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-near-black/40 uppercase tracking-wider mb-1">Applicable Classes</p>
                                                <div className="flex gap-2">
                                                    {rule.applicableClasses.map(c => (
                                                        <Badge key={c} variant="info">Class {c}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-near-black/40 uppercase tracking-wider mb-1">Standard Version</p>
                                                <Badge variant="default">{rule.version}</Badge>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
