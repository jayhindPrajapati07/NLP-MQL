"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import {
    Database, Plus, MessageSquare, Loader2, PlaySquare, Settings, LogOut, Table2, BarChart3, TrendingUp, PieChart, Edit2, Trash2, Save, Download
} from "lucide-react";

import * as XLSX from "xlsx";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, PieChart as RechartsPie, Pie, Cell
} from 'recharts';

export default function DashboardClient() {
    const router = useRouter();

    // Connections State
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [connections, setConnections] = useState<any[]>([]);
    const [activeConnection, setActiveConnection] = useState<string | null>(null);

    // New Connection Form State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newConnName, setNewConnName] = useState("");
    const [newConnUri, setNewConnUri] = useState("");
    const [newConnDb, setNewConnDb] = useState("");
    const [addingConn, setAddingConn] = useState(false);
    const [editingConnId, setEditingConnId] = useState<string | null>(null);

    const [savedQueries, setSavedQueries] = useState<any[]>([]);

    // Query State
    const [queryInput, setQueryInput] = useState("");
    const [isQuerying, setIsQuerying] = useState(false);
    const [queryResult, setQueryResult] = useState<any>(null);
    const [errorDetails, setErrorDetails] = useState("");

    // Save Query State
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveQueryName, setSaveQueryName] = useState("");
    const [isSavingQuery, setIsSavingQuery] = useState(false);

    const [viewMode, setViewMode] = useState<'table' | 'bar' | 'line' | 'pie'>('table');

    // Interactive Controls State
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [groupConfig, setGroupConfig] = useState<{ groupBy: string, aggregateBy: string, aggregateType: 'sum' | 'count' } | null>(null);

    useEffect(() => {
        // Initial fetch
        loadCurrentUser();
        loadConnections();
        loadSavedQueries();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const data = await fetchWithAuth("/users/me");
            setCurrentUser(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadSavedQueries = async () => {
        try {
            const data = await fetchWithAuth("/saved-queries/");
            setSavedQueries(data);
        } catch (err) {
            console.error("Failed to load saved queries", err);
        }
    };

    const loadConnections = async () => {
        try {
            const data = await fetchWithAuth("/connections/");
            setConnections(data);
            if (data.length > 0 && !activeConnection) {
                setActiveConnection(data[0]._id || data[0].id);
            }
        } catch (err) {
            router.push("/login"); // Token likely expired
        }
    };

    const handleAddConnection = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddingConn(true);
        setErrorDetails("");
        try {
            if (editingConnId) {
                const resp = await fetchWithAuth(`/connections/${editingConnId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        name: newConnName,
                        database_name: newConnDb,
                        uri: newConnUri
                    })
                });
                setConnections(connections.map(c => (c._id || c.id) === editingConnId ? resp : c));
            } else {
                const resp = await fetchWithAuth("/connections/", {
                    method: "POST",
                    body: JSON.stringify({
                        name: newConnName,
                        database_name: newConnDb,
                        uri: newConnUri
                    })
                });
                setConnections([...connections, resp]);
                setActiveConnection(resp._id || resp.id);
            }
            setShowAddModal(false);
            setEditingConnId(null);
            setNewConnName("");
            setNewConnDb("");
            setNewConnUri("");
        } catch (err: any) {
            setErrorDetails(err.message || "Failed to add connection");
        } finally {
            setAddingConn(false);
        }
    };

    const handleDeleteConnection = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this connection?")) return;
        try {
            await fetchWithAuth(`/connections/${id}`, { method: "DELETE" });
            setConnections(connections.filter(c => (c._id || c.id) !== id));
            if (activeConnection === id) setActiveConnection(null);
        } catch (err: any) {
            setErrorDetails(err.message || "Failed to delete connection");
        }
    };

    const handleEditClick = (conn: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingConnId(conn._id || conn.id);
        setNewConnName(conn.name);
        setNewConnDb(conn.database_name);
        setNewConnUri(""); // Intentional: require re-entry of security string
        setShowAddModal(true);
    };

    const handleQuery = async () => {
        if (!queryInput.trim() || !activeConnection) return;
        setIsQuerying(true);
        setErrorDetails("");

        try {
            const data = await fetchWithAuth("/query/", {
                method: "POST",
                body: JSON.stringify({
                    natural_language: queryInput,
                    connection_id: activeConnection
                })
            });
            setQueryResult(data);
        } catch (err: any) {
            setErrorDetails(err.message || "Query failed");
        } finally {
            setIsQuerying(false);
        }
    };

    const handleSaveQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!queryResult || !activeConnection || !saveQueryName.trim()) return;
        setIsSavingQuery(true);
        try {
            const resp = await fetchWithAuth("/saved-queries/", {
                method: "POST",
                body: JSON.stringify({
                    name: saveQueryName,
                    connection_id: activeConnection,
                    collection_name: queryResult.collection,
                    mql: JSON.stringify(queryResult.mql),
                    visualization_type: viewMode,
                    assigned_users: []
                })
            });
            setSavedQueries([...savedQueries, resp]);
            setShowSaveModal(false);
            setSaveQueryName("");
        } catch (err: any) {
            setErrorDetails(err.message || "Failed to save query");
        } finally {
            setIsSavingQuery(false);
        }
    };

    const handleExecuteSavedQuery = async (id: string, connId: string) => {
        setIsQuerying(true);
        setErrorDetails("");
        if (connId) {
            setActiveConnection(connId);
        }
        try {
            const data = await fetchWithAuth(`/saved-queries/${id}/execute`);
            setQueryResult({
                mql: data.mql,
                results: data.results,
                collection: data.collection || "unknown"
            });
            if (data.visualization_type) {
                setViewMode(data.visualization_type);
            }
        } catch (err: any) {
            setErrorDetails(err.message || "Failed to execute saved query");
        } finally {
            setIsQuerying(false);
        }
    };

    const getProcessedData = () => {
        if (!queryResult || !queryResult.results) return [];
        let data = [...queryResult.results];

        // Grouping
        if (groupConfig) {
            const { groupBy, aggregateBy, aggregateType } = groupConfig;
            const aggregateField = aggregateType === 'count' ? 'count' : `sum_${aggregateBy}`;

            const grouped = data.reduce((acc: any, row: any) => {
                const key = String(row[groupBy] || 'Unknown');
                const originalVal = row[groupBy] !== undefined ? row[groupBy] : 'Unknown';

                if (!acc[key]) acc[key] = { [groupBy]: originalVal, [aggregateField]: 0 };

                if (aggregateType === 'count') {
                    acc[key][aggregateField] += 1;
                } else if (aggregateType === 'sum') {
                    const val = Number(row[aggregateBy]);
                    if (!isNaN(val)) acc[key][aggregateField] += val;
                }
                return acc;
            }, {});
            data = Object.values(grouped);
        }

        // Sorting
        if (sortConfig) {
            data.sort((a: any, b: any) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    };

    const handleExportExcel = () => {
        const data = getProcessedData();
        if (!data || data.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Results");
        XLSX.writeFile(wb, `export_${Date.now()}.xlsx`);
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        router.push("/login");
    };

    // Utility to determine chart data shape
    const getChartDataKey = (results: any[]) => {
        if (!results || results.length === 0) return null;
        const keys = Object.keys(results[0]).filter(k => k !== '_id');
        // Simple heuristic: look for number fields for Y axis, and string for X axis
        const numKeys = keys.filter(k => typeof results[0][k] === 'number');
        const strKeys = keys.filter(k => typeof results[0][k] === 'string' || typeof results[0][k] === 'boolean');

        const xKey = strKeys.length > 0 ? strKeys[0] : keys[0];
        const possibleYKeys = numKeys.filter(k => k !== xKey);
        const yKey = possibleYKeys.length > 0 ? possibleYKeys[0] : (keys.find(k => k !== xKey) || null);

        return { xKey, yKey };
    };

    return (
        <div className="flex h-screen overflow-hidden text-foreground">
            {/* Sidebar - Connection Manager */}
            <aside className="w-72 bg-secondary border-r border-border flex flex-col shadow-xl z-10">
                <div className="p-5 flex items-center gap-3 border-b border-border bg-secondary/80 backdrop-blur-md">
                    <Database className="text-primary w-6 h-6" />
                    <h2 className="font-bold text-lg tracking-tight">Data Sources</h2>
                </div>

                {currentUser?.is_admin && (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {connections.map((conn) => (
                                <div key={conn._id || conn.id} className="group relative">
                                    <button
                                        onClick={() => setActiveConnection(conn._id || conn.id)}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all pr-16 ${activeConnection === (conn._id || conn.id)
                                            ? "bg-primary text-primary-foreground shadow-md font-medium"
                                            : "hover:bg-card text-secondary-foreground"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 truncate">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                                            <span className="truncate">{conn.name}</span>
                                        </div>
                                    </button>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => handleEditClick(conn, e)} className="p-1.5 bg-secondary/80 rounded-md hover:bg-secondary text-secondary-foreground hover:text-white transition-colors" title="Edit Connection">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={(e) => handleDeleteConnection(conn._id || conn.id, e)} className="p-1.5 bg-destructive/10 rounded-md hover:bg-destructive text-destructive transition-colors hover:text-white" title="Delete Connection">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => {
                                    setEditingConnId(null);
                                    setNewConnName("");
                                    setNewConnDb("");
                                    setNewConnUri("");
                                    setShowAddModal(true);
                                }}
                                className="w-full mt-4 flex items-center justify-center gap-2 py-3 border border-dashed border-border text-secondary-foreground rounded-lg hover:border-primary hover:text-primary transition-colors"
                            >
                                <Plus className="w-5 h-5" /> Add Connection
                            </button>
                        </div>
                    </>
                )}

                <div className={`p-4 space-y-2 ${currentUser?.is_admin ? "" : "flex-1 overflow-y-auto"}`}>

                    {savedQueries.length > 0 && (
                        <div className="mt-8 mb-2">
                            <div className="px-4 text-xs font-semibold text-secondary-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" /> Saved Dashboards
                            </div>
                            <div className="space-y-1">
                                {savedQueries.map((sq) => (
                                    <button
                                        key={sq._id || sq.id}
                                        onClick={() => handleExecuteSavedQuery(sq._id || sq.id, sq.connection_id)}
                                        className="w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors hover:bg-card text-secondary-foreground hover:text-white"
                                    >
                                        <PlaySquare className="w-4 h-4 text-primary shrink-0 opacity-70" />
                                        <span className="truncate text-sm font-medium">{sq.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border space-y-2">
                    {currentUser?.is_admin && (
                        <button onClick={() => router.push('/settings')} className="flex items-center gap-2 text-secondary-foreground hover:text-primary transition-colors w-full px-2 py-2">
                            <Settings className="w-5 h-5" /> Settings
                        </button>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-2 text-secondary-foreground hover:text-destructive transition-colors w-full px-2 py-2">
                        <LogOut className="w-5 h-5" /> Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col bg-[#0b1120] relative max-h-screen">

                {/* Top Header / View Toggles */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-secondary/20 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-xl font-semibold opacity-90">
                        {activeConnection ? connections.find(c => (c._id || c.id) === activeConnection)?.name : "Select a Source"}
                    </h1>
                    {queryResult && queryResult.results?.length > 0 && (
                        <div className="flex items-center gap-4">
                            <div className="flex bg-secondary p-1 rounded-lg shadow-sm border border-border">
                                <button onClick={() => setViewMode('table')} className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`} title="Table View"><Table2 className="w-4 h-4" /></button>
                                <button onClick={() => setViewMode('bar')} className={`p-2 rounded-md transition-all ${viewMode === 'bar' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`} title="Bar Chart"><BarChart3 className="w-4 h-4" /></button>
                                <button onClick={() => setViewMode('line')} className={`p-2 rounded-md transition-all ${viewMode === 'line' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`} title="Line Chart"><TrendingUp className="w-4 h-4" /></button>
                                <button onClick={() => setViewMode('pie')} className={`p-2 rounded-md transition-all ${viewMode === 'pie' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`} title="Pie Chart"><PieChart className="w-4 h-4" /></button>
                            </div>

                            <button onClick={handleExportExcel} className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:text-white px-4 py-2 rounded-md hover:bg-secondary/80 transition-all shadow-sm active:scale-95 text-sm font-semibold border border-border">
                                <Download className="w-4 h-4" /> Export
                            </button>

                            {currentUser?.is_admin && (
                                <button onClick={() => setShowSaveModal(true)} className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-md hover:bg-primary transition-all shadow-md active:scale-95 text-sm font-semibold">
                                    <Save className="w-4 h-4" /> Save
                                </button>
                            )}
                        </div>
                    )}
                </header>

                {/* Results Area */}
                <div className="flex-1 overflow-auto p-6 relative">

                    {errorDetails && (
                        <div className="bg-destructive/20 border-l-4 border-destructive p-4 rounded-md mb-6">
                            <p className="text-destructive font-medium">Error Occurred</p>
                            <p className="text-sm opacity-90 mt-1">{errorDetails}</p>
                        </div>
                    )}

                    {!activeConnection ? (
                        <div className="flex flex-col items-center justify-center h-full text-secondary-foreground opacity-60">
                            <Database className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg">Select or add a database connection to begin.</p>
                        </div>
                    ) : queryResult ? (
                        <div className="space-y-6 h-full flex flex-col pb-24">

                            {/* Controls Bar */}
                            <div className="flex flex-wrap gap-4 mt-2">
                                <div className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border text-sm shadow-sm">
                                    <span className="text-secondary-foreground font-medium pl-1">Sort:</span>
                                    <select
                                        className="bg-secondary/50 border border-border rounded px-2 py-1 outline-none text-foreground"
                                        value={sortConfig?.key || ""}
                                        onChange={e => setSortConfig(e.target.value ? { key: e.target.value, direction: sortConfig?.direction || 'desc' } : null)}
                                    >
                                        <option value="">None</option>
                                        {Object.keys(queryResult.results[0] || {}).map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                    {sortConfig && (
                                        <button
                                            onClick={() => setSortConfig({ ...sortConfig, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                                            className="px-2 py-1 bg-secondary rounded hover:text-white transition-colors"
                                        >
                                            {sortConfig.direction.toUpperCase()}
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border text-sm shadow-sm">
                                    <span className="text-secondary-foreground font-medium pl-1">Group By:</span>
                                    <select
                                        className="bg-secondary/50 border border-border rounded px-2 py-1 outline-none text-foreground"
                                        value={groupConfig?.groupBy || ""}
                                        onChange={e => setGroupConfig(e.target.value ? { groupBy: e.target.value, aggregateBy: groupConfig?.aggregateBy || Object.keys(queryResult.results[0] || {})[0], aggregateType: groupConfig?.aggregateType || 'count' } : null)}
                                    >
                                        <option value="">None</option>
                                        {Object.keys(queryResult.results[0] || {}).map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                    {groupConfig && (
                                        <>
                                            <span className="text-secondary-foreground mx-1">aggregate</span>
                                            <select
                                                className="bg-secondary/50 border border-border rounded px-2 py-1 outline-none text-foreground"
                                                value={groupConfig.aggregateType}
                                                onChange={e => setGroupConfig({ ...groupConfig, aggregateType: e.target.value as 'count' | 'sum' })}
                                            >
                                                <option value="count">COUNT</option>
                                                <option value="sum">SUM</option>
                                            </select>
                                            {groupConfig.aggregateType !== 'count' && (
                                                <select
                                                    className="bg-secondary/50 border border-border rounded px-2 py-1 outline-none text-foreground max-w-[120px] truncate"
                                                    value={groupConfig.aggregateBy}
                                                    onChange={e => setGroupConfig({ ...groupConfig, aggregateBy: e.target.value })}
                                                >
                                                    {Object.keys(queryResult.results[0] || {}).map(k => <option key={k} value={k}>{k}</option>)}
                                                </select>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-primary">Generated MQL Query</h3>
                                    <span className="text-xs text-secondary-foreground bg-secondary/50 px-2 py-1 rounded-full uppercase font-mono tracking-widest">{queryResult.collection}</span>
                                </div>
                                <pre className="text-sm bg-[#050B14] p-4 rounded-lg overflow-x-auto text-green-400/90 font-mono shadow-inner border border-white/5">
                                    {JSON.stringify(queryResult.mql, null, 2)}
                                </pre>
                            </div>

                            <div className="flex-1 min-h-[400px] bg-card border border-border rounded-xl p-1 shadow-sm overflow-hidden flex flex-col">
                                {/* Visualizations Logic */}
                                {(() => {
                                    const data = getProcessedData();
                                    if (!data || data.length === 0) return <div className="p-8 text-center text-gray-400">No results found for this query.</div>;

                                    const { xKey, yKey } = getChartDataKey(data) || {};

                                    if (viewMode === 'table') {
                                        const columns = Object.keys(data[0]);
                                        return (
                                            <div className="overflow-x-auto h-full rounded-lg">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="text-xs text-secondary-foreground bg-secondary/40 uppercase sticky top-0 z-10 backdrop-blur-md">
                                                        <tr>
                                                            {columns.map(col => (
                                                                <th key={col} className="px-6 py-4 font-semibold tracking-wider">{col}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.map((row: any, i: number) => (
                                                            <tr key={i} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                                                                {columns.map(col => (
                                                                    <td key={col} className="px-6 py-4">{typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    }

                                    // Charts
                                    if (!xKey || !yKey) return <div className="p-8 text-center text-yellow-500/80">Data shape is not suitable for charting. Use the table view.</div>;

                                    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

                                    return (
                                        <div className="h-full w-full p-6 pt-10">
                                            <ResponsiveContainer width="100%" height="100%">
                                                {viewMode === 'bar' ? (
                                                    <BarChart data={data}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                                        <XAxis dataKey={xKey} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                                                        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                                                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} />
                                                        <Bar dataKey={yKey} fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                ) : viewMode === 'line' ? (
                                                    <LineChart data={data}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                                        <XAxis dataKey={xKey} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                                                        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                                                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} />
                                                        <Line type="monotone" dataKey={yKey} stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                                    </LineChart>
                                                ) : (
                                                    <RechartsPie>
                                                        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={2} dataKey={yKey} nameKey={xKey} label>
                                                            {data.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                        </Pie>
                                                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} />
                                                    </RechartsPie>
                                                )}
                                            </ResponsiveContainer>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center opacity-40">
                            <span className="text-xl">Ask a question to explore your data.</span>
                        </div>
                    )}

                </div>

                {currentUser?.is_admin && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-4xl">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-card border border-border rounded-xl shadow-2xl flex items-center p-2 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                                <MessageSquare className="w-6 h-6 text-secondary-foreground ml-3" />
                                <input
                                    type="text"
                                    disabled={isQuerying || !activeConnection}
                                    placeholder={activeConnection ? "Ask a question about your data... (e.g. Show top 5 products by revenue)" : "Select a connection first"}
                                    className="flex-1 bg-transparent px-4 py-3 outline-none text-foreground placeholder-gray-500 disabled:opacity-50"
                                    value={queryInput}
                                    onChange={(e) => setQueryInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleQuery() }}
                                />
                                <button
                                    disabled={isQuerying || !activeConnection || !queryInput.trim()}
                                    onClick={handleQuery}
                                    className="btn-primary rounded-lg py-3 px-5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed m-1"
                                >
                                    {isQuerying ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlaySquare className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Add Connection Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border p-6 transform transition-all">
                        <h2 className="text-xl font-bold mb-4">{editingConnId ? "Edit MongoDB Connection" : "Add MongoDB Connection"}</h2>
                        <form onSubmit={handleAddConnection} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Friendly Name</label>
                                <input required type="text" className="input-field" placeholder="Production Analytics" value={newConnName} onChange={e => setNewConnName(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Database Name</label>
                                <input required type="text" className="input-field" placeholder="sample_mflix" value={newConnDb} onChange={e => setNewConnDb(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Connection String (URI)</label>
                                <input required type="password" className="input-field" placeholder="mongodb+srv://..." value={newConnUri} onChange={e => setNewConnUri(e.target.value)} />
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 hover:bg-secondary rounded-md text-secondary-foreground transition-colors">Cancel</button>
                                <button type="submit" disabled={addingConn} className="btn-primary flex items-center gap-2">
                                    {addingConn ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Connection"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Save Query Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border p-6 transform transition-all">
                        <h2 className="text-xl font-bold mb-4">Save Query to Dashboard</h2>
                        <form onSubmit={handleSaveQuery} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Metric/Dashboard Name</label>
                                <input autoFocus required type="text" className="input-field" placeholder="e.g. Monthly Revenue" value={saveQueryName} onChange={e => setSaveQueryName(e.target.value)} />
                                <p className="text-xs text-secondary-foreground mt-2 opacity-80">This will save your current {viewMode} visualization configuration.</p>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                                <button type="button" onClick={() => setShowSaveModal(false)} className="px-4 py-2 hover:bg-secondary rounded-md text-secondary-foreground transition-colors">Cancel</button>
                                <button type="submit" disabled={isSavingQuery} className="btn-primary flex items-center gap-2">
                                    {isSavingQuery ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
