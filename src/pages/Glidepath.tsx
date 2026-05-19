import { useState, useMemo } from "react";
import { useQAMatrixDB } from "@/hooks/useQAMatrixDB";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const Glidepath = () => {
    const { data, loading } = useQAMatrixDB();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedCell, setSelectedCell] = useState<{
        matrixType: "MFG / Line" | "Work Station" | "Plant";
        controlLevel: 1 | 3 | 5;
        severityLevel: 1 | 3 | 5;
    } | null>(null);

    const filteredData = useMemo(() => {
        return data.filter(entry => {
            // Only include actual listed concerns (exclude placeholders)
            if (entry.sNo === -9999) return false;
            if (!entry.concern || entry.concern.trim() === "") return false;

            if (!startDate && !endDate) return true;
            
            // Parse DD/MM/YYYY
            const parts = entry.detectionDate.split('/');
            if (parts.length !== 3) return true; 
            
            const itemDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            
            if (startDate && itemDate < new Date(startDate)) return false;
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                if (itemDate > end) return false;
            }
            return true;
        });
    }, [data, startDate, endDate]);

    const matchingEntries = useMemo(() => {
        if (!selectedCell) return [];
        const { matrixType, controlLevel, severityLevel } = selectedCell;
        return filteredData.filter(entry => {
            if (entry.defectRating !== severityLevel) return false;
            
            let control = 0;
            if (matrixType === "MFG / Line") {
                control = entry.controlRating.Shop || 0;
            } else if (matrixType === "Work Station") {
                control = entry.controlRating.Workstation || 0;
            } else if (matrixType === "Plant") {
                control = entry.controlRating.Plant || 0;
            }

            let level: 1 | 3 | 5 = 1;
            if (control >= 5) level = 5;
            else if (control >= 3) level = 3;

            return level === controlLevel;
        });
    }, [filteredData, selectedCell]);

    const mfgMatrix = useMemo(() => {
        const matrix = {
            5: { 1: 0, 3: 0, 5: 0 },
            3: { 1: 0, 3: 0, 5: 0 },
            1: { 1: 0, 3: 0, 5: 0 }
        };

        filteredData.forEach(entry => {
            const severity = entry.defectRating;
            const control = entry.controlRating.Shop || 0;

            // Map control rating to levels 1, 3, 5
            let level: 1 | 3 | 5 = 1;
            if (control >= 5) level = 5;
            else if (control >= 3) level = 3;

            if (matrix[level] && (severity === 1 || severity === 3 || severity === 5)) {
                matrix[level][severity]++;
            }
        });

        return matrix;
    }, [filteredData]);

    const wsMatrix = useMemo(() => {
        const matrix = {
            5: { 1: 0, 3: 0, 5: 0 },
            3: { 1: 0, 3: 0, 5: 0 },
            1: { 1: 0, 3: 0, 5: 0 }
        };

        filteredData.forEach(entry => {
            const severity = entry.defectRating;
            const control = entry.controlRating.Workstation || 0;

            let level: 1 | 3 | 5 = 1;
            if (control >= 5) level = 5;
            else if (control >= 3) level = 3;

            if (matrix[level] && (severity === 1 || severity === 3 || severity === 5)) {
                matrix[level][severity]++;
            }
        });

        return matrix;
    }, [filteredData]);

    const plantMatrix = useMemo(() => {
        const matrix = {
            5: { 1: 0, 3: 0, 5: 0 },
            3: { 1: 0, 3: 0, 5: 0 },
            1: { 1: 0, 3: 0, 5: 0 }
        };

        filteredData.forEach(entry => {
            const severity = entry.defectRating;
            const control = entry.controlRating.Plant || 0;

            let level: 1 | 3 | 5 = 1;
            if (control >= 5) level = 5;
            else if (control >= 3) level = 3;

            if (matrix[level] && (severity === 1 || severity === 3 || severity === 5)) {
                matrix[level][severity]++;
            }
        });

        return matrix;
    }, [filteredData]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            {/* Header */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-sm sm:text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            Glidepath + Quick Overview on QAM
                        </h1>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1600px] mx-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* MFG / Line Section */}
                    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-black text-[#1e293b] mb-6 border-b pb-2 flex items-center gap-2">
                            MFG / Line
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-2 border-none"></th>
                                        <th className="p-2 border-none"></th>
                                        <th colSpan={3} className="p-2 border bg-slate-50 text-[10px] uppercase font-black text-slate-500 text-center">Severity Rating</th>
                                    </tr>
                                    <tr>
                                        <th className="p-2 border-none"></th>
                                        <th className="p-2 border-none"></th>
                                        <th className="p-2 border bg-slate-50 text-xs font-black text-slate-700 text-center w-24">Level 5</th>
                                        <th className="p-2 border bg-slate-50 text-xs font-black text-slate-700 text-center w-24">Level 3</th>
                                        <th className="p-2 border bg-slate-50 text-xs font-black text-slate-700 text-center w-24">Level 1</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 3, 5].reverse().map((control) => (
                                        <tr key={control}>
                                            {control === 5 && (
                                                <td rowSpan={3} className="border-none w-10 text-center">
                                                    <p className="[writing-mode:vertical-lr] rotate-180 text-[10px] uppercase font-black text-slate-500">Control Rating</p>
                                                </td>
                                            )}
                                            <td className="p-2 border bg-slate-50 text-xs font-black text-slate-700 text-center whitespace-nowrap">Level {control}</td>
                                            {[5, 3, 1].map((severity) => {
                                                const count = mfgMatrix[control][severity];
                                                let bgColor = "bg-green-500"; // Default Level 5 Control or Level 3 w/ low severity
                                                if (control === 1) bgColor = "bg-red-500";
                                                else if (control === 3 && severity === 5) bgColor = "bg-yellow-400";
                                                else if (control === 3) bgColor = "bg-green-500";

                                                return (
                                                    <td 
                                                        key={severity} 
                                                        onClick={() => {
                                                            if (count > 0) {
                                                                setSelectedCell({
                                                                    matrixType: "MFG / Line",
                                                                    controlLevel: control as 1 | 3 | 5,
                                                                    severityLevel: severity as 1 | 3 | 5
                                                                });
                                                            }
                                                        }}
                                                        className={`p-4 border text-center font-black text-lg ${count > 0 ? bgColor + " text-white cursor-pointer hover:opacity-90 transition-opacity" : "bg-white text-slate-200"}`}
                                                    >
                                                        {count || ""}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Work Station Section */}
                    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-black text-[#1e293b] mb-6 border-b pb-2 flex items-center gap-2">
                            Work Station
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-2 border-none"></th>
                                        <th className="p-2 border-none"></th>
                                        <th colSpan={3} className="p-2 border bg-slate-50 text-[10px] uppercase font-black text-slate-500 text-center">Severity Rating</th>
                                    </tr>
                                    <tr>
                                        <th className="p-2 border-none"></th>
                                        <th className="p-2 border-none"></th>
                                        <th className="p-2 border bg-slate-50 text-xs font-black text-slate-700 text-center w-24">Level 5</th>
                                        <th className="p-2 border bg-slate-50 text-xs font-black text-slate-700 text-center w-24">Level 3</th>
                                        <th className="p-2 border bg-slate-50 text-xs font-black text-slate-700 text-center w-24">Level 1</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 3, 5].reverse().map((control) => (
                                        <tr key={control}>
                                            {control === 5 && (
                                                <td rowSpan={3} className="border-none w-10 text-center">
                                                    <p className="[writing-mode:vertical-lr] rotate-180 text-[10px] uppercase font-black text-slate-500">Control Rating</p>
                                                </td>
                                            )}
                                            <td className="p-2 border bg-slate-50 text-xs font-black text-slate-700 text-center whitespace-nowrap">Level {control}</td>
                                            {[5, 3, 1].map((severity) => {
                                                const count = wsMatrix[control][severity];
                                                let bgColor = "bg-green-500";
                                                if (control === 1) bgColor = "bg-red-500";
                                                else if (control === 3 && severity === 5) bgColor = "bg-yellow-400";
                                                else if (control === 3) bgColor = "bg-green-500";

                                                return (
                                                    <td 
                                                        key={severity} 
                                                        onClick={() => {
                                                            if (count > 0) {
                                                                setSelectedCell({
                                                                    matrixType: "Work Station",
                                                                    controlLevel: control as 1 | 3 | 5,
                                                                    severityLevel: severity as 1 | 3 | 5
                                                                });
                                                            }
                                                        }}
                                                        className={`p-4 border text-center font-black text-lg ${count > 0 ? bgColor + " text-white cursor-pointer hover:opacity-90 transition-opacity" : "bg-white text-slate-200"}`}
                                                    >
                                                        {count || ""}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Plant Section */}
                    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-black text-[#1e293b] mb-6 border-b pb-2 flex items-center gap-2">
                            Plant
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-2 border-none"></th>
                                        <th className="p-2 border-none"></th>
                                        <th colSpan={3} className="p-2 border bg-slate-50 text-[10px] uppercase font-black text-slate-500 text-center">Severity Rating</th>
                                    </tr>
                                    <tr>
                                        <th className="p-2 border-none"></th>
                                        <th className="p-2 border-none"></th>
                                        <th className="p-2 border bg-slate-50 text-xs font-black text-slate-700 text-center w-24">Level 5</th>
                                        <th className="p-2 border bg-slate-50 text-xs font-black text-slate-700 text-center w-24">Level 3</th>
                                        <th className="p-2 border bg-slate-50 text-xs font-black text-slate-700 text-center w-24">Level 1</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 3, 5].reverse().map((control) => (
                                        <tr key={control}>
                                            {control === 5 && (
                                                <td rowSpan={3} className="border-none w-10 text-center">
                                                    <p className="[writing-mode:vertical-lr] rotate-180 text-[10px] uppercase font-black text-slate-500">Control Rating</p>
                                                </td>
                                            )}
                                            <td className="p-2 border bg-slate-50 text-xs font-black text-slate-700 text-center whitespace-nowrap">Level {control}</td>
                                            {[5, 3, 1].map((severity) => {
                                                const count = plantMatrix[control][severity];
                                                let bgColor = "bg-green-500";
                                                if (control === 1) bgColor = "bg-red-500";
                                                else if (control === 3 && severity === 5) bgColor = "bg-yellow-400";
                                                else if (control === 3) bgColor = "bg-green-500";

                                                return (
                                                    <td 
                                                        key={severity} 
                                                        onClick={() => {
                                                            if (count > 0) {
                                                                setSelectedCell({
                                                                    matrixType: "Plant",
                                                                    controlLevel: control as 1 | 3 | 5,
                                                                    severityLevel: severity as 1 | 3 | 5
                                                                });
                                                            }
                                                        }}
                                                        className={`p-4 border text-center font-black text-lg ${count > 0 ? bgColor + " text-white cursor-pointer hover:opacity-90 transition-opacity" : "bg-white text-slate-200"}`}
                                                    >
                                                        {count || ""}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                </div>
            </main>

            {/* Dialog modal for Extracted View */}
            <Dialog open={selectedCell !== null} onOpenChange={(open) => { if (!open) setSelectedCell(null); }}>
                <DialogContent className="max-w-6xl w-[95vw] max-h-[85vh] flex flex-col p-6 overflow-hidden bg-white">
                    <DialogHeader className="pb-3 border-b border-slate-100">
                        <DialogTitle className="text-slate-800 font-black text-lg flex items-center gap-2 flex-wrap">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Extracted View — {selectedCell?.matrixType} Concerns
                            <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                                Control Level {selectedCell?.controlLevel} · Severity Level {selectedCell?.severityLevel}
                            </span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto mt-4 pr-1">
                        <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
                            <table className="w-full text-xs text-left border-collapse bg-white">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-4 py-3 font-bold text-slate-700 w-12 text-center">S.No</th>
                                        <th className="px-4 py-3 font-bold text-slate-700">Concern Description</th>
                                        <th className="px-4 py-3 font-bold text-slate-700">Station</th>
                                        <th className="px-4 py-3 font-bold text-slate-700">Defect Code</th>
                                        <th className="px-4 py-3 font-bold text-slate-700">Responsibility</th>
                                        <th className="px-4 py-3 font-bold text-slate-700 text-center">Severity</th>
                                        <th className="px-4 py-3 font-bold text-slate-700 text-center">Control</th>
                                        <th className="px-4 py-3 font-bold text-slate-700 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matchingEntries.map((entry) => {
                                        let ratingVal = 0;
                                        let statusVal = "OK";
                                        if (selectedCell?.matrixType === "MFG / Line") {
                                            ratingVal = entry.controlRating.Shop || 0;
                                            statusVal = entry.mfgStatus || "OK";
                                        } else if (selectedCell?.matrixType === "Work Station") {
                                            ratingVal = entry.controlRating.Workstation || 0;
                                            statusVal = entry.workstationStatus || "OK";
                                        } else if (selectedCell?.matrixType === "Plant") {
                                            ratingVal = entry.controlRating.Plant || 0;
                                            statusVal = entry.plantStatus || "OK";
                                        }

                                        return (
                                            <tr key={entry.sNo} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-center font-bold text-slate-500">{entry.sNo}</td>
                                                <td className="px-4 py-3 font-semibold text-slate-800 max-w-sm" style={{ minWidth: 200 }}>
                                                    {entry.concern}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-slate-600">{entry.operationStation}</td>
                                                <td className="px-4 py-3 font-mono font-bold text-slate-700">{entry.defectCode}</td>
                                                <td className="px-4 py-3 text-slate-600">{entry.resp}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200">
                                                        L-{entry.defectRating}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-200 font-mono">
                                                        {ratingVal}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black border ${
                                                        statusVal === "OK" 
                                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                                                            : "bg-amber-100 text-amber-700 border-amber-200"
                                                    }`}>
                                                        {statusVal}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Glidepath;
