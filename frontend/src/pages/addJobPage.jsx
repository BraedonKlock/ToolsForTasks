import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/addJobPage.css";
import "../styles/addToolKitPage.css";
import "../styles/toolsPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function AddJob() {
    const { accessToken, logout } = useContext(AuthContext);
    const [employees, setEmployees] = useState([]);
    const [toolKits, setToolKits] = useState([]);
    const [tools, setTools] = useState([]);
    const [error, setError] = useState("");
    const [addedEmployees, setAddedEmployees] = useState([]);
    const [selectedToolKits, setSelectedToolKits] = useState([]);
    const [selectedTools, setSelectedTools] = useState([]);
    const [tabState, setTabState] = useState("employees");
    const toolKitToolsCache = useRef({});
    const navigate = useNavigate();

    const isEmployees = tabState === "employees";
    const isToolKits = tabState === "toolKits";
    const isTools = tabState === "tools";

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/loggedIn/employees", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (res.status === 401) {
                    logout();
                    return;
                }

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error("Failed to load employees, try again later.");
                }

                const data = await res.json();
                setEmployees(data.employees);
            } catch (err) {
                setError(err.message);
                setEmployees([]); // optional: reset state
            }
        })();
    }, [accessToken, logout]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/loggedIn/tool-kits", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (res.status === 401) {
                    logout();
                    return;
                }

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    throw new Error(data.error || "Failed to load tool kits, try again later.");
                }

                setToolKits(data.toolKits ?? []);
            } catch (err) {
                setError(err.message);
                setToolKits([]);
            }
        })();
    }, [accessToken, logout]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/loggedIn/tools", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (res.status === 401) {
                    logout();
                    return;
                }

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    throw new Error(data.error || "Failed to load tools, try again later.");
                }

                setTools(data.tools ?? []);
            } catch (err) {
                setError(err.message);
                setTools([]);
            }
        })();
    }, [accessToken, logout]);

    function toggleEmployee(employee) {
        setAddedEmployees((prev) => {
            const exists = prev.some((emp) => emp.id === employee.id);
            if (exists) return prev.filter((emp) => emp.id !== employee.id);
            return [...prev, employee];
        });
    }

    function isEmployeeSelected(employeeId) {
        return addedEmployees.some((emp) => emp.id === employeeId);
    }

    function toggleToolKit(toolKit) {
        const exists = selectedToolKits.some((kit) => kit.id === toolKit.id);

        setSelectedToolKits((prev) => {
            if (exists) return prev.filter((kit) => kit.id !== toolKit.id);
            return [...prev, toolKit];
        });

        if (exists) {
            setSelectedTools((prev) =>
                prev.reduce((acc, tool) => {
                    if (!tool.toolKitIds?.includes(toolKit.id)) {
                        acc.push(tool);
                        return acc;
                    }

                    const remainingToolKitIds = tool.toolKitIds.filter((id) => id !== toolKit.id);
                    if (tool.manual || remainingToolKitIds.length > 0) {
                        acc.push({ ...tool, toolKitIds: remainingToolKitIds });
                    }
                    return acc;
                }, [])
            );
            return;
        }

        (async () => {
            try {
                if (!toolKitToolsCache.current[toolKit.id]) {
                    const res = await fetch(`/api/loggedIn/tool-kits/${toolKit.id}/tools`, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });

                    if (res.status === 401) {
                        logout();
                        return;
                    }

                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                        throw new Error(data.error || "Failed to load tool kit tools.");
                    }

                    toolKitToolsCache.current[toolKit.id] = data.tools ?? [];
                }

                const kitTools = toolKitToolsCache.current[toolKit.id] ?? [];
                setSelectedTools((prev) => {
                    const next = [...prev];
                    kitTools.forEach((kitTool) => {
                        const toolId = kitTool.tool_id ?? kitTool.id;
                        if (!toolId) return;
                    const existing = next.find((tool) => tool.id === toolId);
                    if (existing) {
                        const toolKitIds = existing.toolKitIds ?? [];
                        if (!toolKitIds.includes(toolKit.id)) {
                            existing.toolKitIds = [...toolKitIds, toolKit.id];
                        }
                        if (!existing.manual && existing.selectedQuantity == null) {
                            existing.selectedQuantity = kitTool.quantity ?? 1;
                        }
                    } else {
                        next.push({
                            id: toolId,
                            name: kitTool.tool_name ?? kitTool.name ?? "Unnamed tool",
                            selectedQuantity: kitTool.quantity ?? 1,
                            manual: false,
                            toolKitIds: [toolKit.id],
                        });
                    }
                    });
                    return next;
                });
            } catch (err) {
                setError(err.message);
            }
        })();
    }

    function isToolKitSelected(toolKitId) {
        return selectedToolKits.some((kit) => kit.id === toolKitId);
    }

    function toggleTool(tool) {
        setSelectedTools((prev) => {
            const exists = prev.some((t) => t.id === tool.id);
            if (!exists) {
                return [...prev, { ...tool, manual: true, toolKitIds: [], selectedQuantity: 1 }];
            }

            return prev.reduce((acc, t) => {
                if (t.id !== tool.id) {
                    acc.push(t);
                    return acc;
                }

                const toolKitIds = t.toolKitIds ?? [];
                if (t.manual) {
                    if (toolKitIds.length > 0) {
                        acc.push({ ...t, manual: false });
                    }
                    return acc;
                }

                acc.push({ ...t, manual: true });
                return acc;
            }, []);
        });
    }

    function isToolSelected(toolId) {
        return selectedTools.some((tool) => tool.id === toolId);
    }

    function setToolQuantity(toolId, qty) {
        const n = Math.max(1, Math.min(10, Number(qty) || 1));
        setSelectedTools((prev) =>
            prev.map((tool) =>
                tool.id === toolId ? { ...tool, selectedQuantity: n } : tool
            )
        );
    }

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        // build payload from the form
        const form = new FormData(e.currentTarget);
        const payload = Object.fromEntries(form.entries());
        payload.employeeIds = form.getAll("employeeIds[]").map(Number);
        payload.toolKitIds = form.getAll("toolKitIds[]").map(Number);
        payload.toolIds = form.getAll("toolIds[]").map(Number);
        payload.toolSelections = selectedTools.map((tool) => ({
            tool_id: tool.id,
            quantity: tool.selectedQuantity ?? 1
        }));

        // remove junk keys the server doesn’t want
        delete payload["employeeIds[]"];
        delete payload["toolKitIds[]"];
        delete payload["toolIds[]"];
        delete payload.addEmployee;
        
        try {

            const res = await fetch("/api/loggedIn/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload),
            });

            if (res.status === 401) {
            logout();
            return;
            }
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "failed");
            }
            navigate("/loggedIn/jobs");
        } catch(err) {
            setError(err.message);

        }
    }

    return (
        <main className="addJob-page">
        <section id="addJob-form">
            <Link id="addJob-form-closeBtn" className="addJob-page-backBtn" to="/loggedIn/jobs">
            <FontAwesomeIcon icon={faArrowLeft} className="icon" />
            </Link>

            <div id="addJob-container">
            <h1>Add Job</h1>

            <form className="forms" onSubmit={onSubmit}>
                <div className="form-control">
                    <label htmlFor="jobType">Job Type:</label>
                    <select name="jobType" id="addJobForm-jobType" required defaultValue="">
                        <option value="" disabled hidden>Select a job type</option>
                        <option value="roofing">Roofing</option>
                        <option value="carpentry">Carpentry</option>
                        <option value="siding">Siding</option>
                    </select>
                </div>

                <div className="form-control">
                    <label htmlFor="jobid">Job ID:</label>
                    <input type="text" name="jobid" />
                </div>

                <div className="form-control">
                    <label htmlFor="title">Title:</label>
                    <input type="text" name="title" />
                </div>

                <div className="form-control">
                    <label htmlFor="date">Date:</label>
                    <input id="addJobForm-date" type="date" name="date" />
                </div>

                <div className="form-control">
                    <label htmlFor="address">Address:</label>
                    <input type="text" name="address" />
                </div>

                <div className="form-control">
                    <label htmlFor="phoneNumber">Phone #:</label>
                    <input type="text" name="phoneNumber" />
                </div>

                <div className="form-control">
                    <label htmlFor="notes">Notes:</label>
                    <textarea id="addJob-notes" name="notes"></textarea>
                </div>

                {error && <p id="error" className="error">{error}</p>}

                {(employees || toolKits || tools) && (
                <>
                    <section className="tools-tabs addJob-tabs">
                        <div className="tools-tabs__group">
                            <button
                                className={`pill ${isEmployees ? "pill--active" : ""}`}
                                type="button"
                                onClick={() => setTabState("employees")}
                            >
                                Employees
                            </button>
                            <button
                                className={`pill ${isToolKits ? "pill--active" : ""}`}
                                type="button"
                                onClick={() => setTabState("toolKits")}
                            >
                                Tool Kits
                            </button>
                            <button
                                className={`pill ${isTools ? "pill--active" : ""}`}
                                type="button"
                                onClick={() => setTabState("tools")}
                            >
                                Tools
                            </button>
                        </div>
                    </section>

                    {isEmployees && (
                        <section className="addJob-employeeSection">
                            <div className="addJob-selectionHeader">
                                <p>Select Employees:</p>
                            </div>

                            <div className="tools-section__cards addJob-selectionCards">
                                {employees.length === 0 ? (
                                    <h6>No employees to display</h6>
                                ) : (
                                    employees.map((employee) => {
                                        const name = employee?.name ?? "";
                                        const firstLetter = name ? name.charAt(0).toUpperCase() : "?";
                                        const selected = isEmployeeSelected(employee.id);
                                        return (
                                            <article key={employee.id ?? employee.employeeid} className="tool-card tool-card--compact addJob-selectionCard addJob-employeeCard">
                                                <div className="tool-card__avatar">{firstLetter}</div>
                                                <div className="tool-card__body">
                                                    <h4 className="tool-card__title">{name || "Unnamed employee"}</h4>
                                                    <p className="addJob-selectionMeta">#{employee.employeeid} • {employee.role}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={`addJob-selectionSelectBtn ${selected ? "selected" : ""}`}
                                                    onClick={() => toggleEmployee(employee)}
                                                >
                                                    {selected ? "Selected" : "Select"}
                                                </button>
                                            </article>
                                        );
                                    })
                                )}
                            </div>
                        </section>
                    )}

                    {isToolKits && (
                        <section className="addJob-employeeSection">
                            <div className="addJob-selectionHeader">
                                <p>Select Tool Kits:</p>
                            </div>

                            <div className="tools-section__cards addJob-selectionCards">
                                {toolKits.length === 0 ? (
                                    <h6>No tool kits to display</h6>
                                ) : (
                                    toolKits.map((toolKit) => {
                                        const name = toolKit?.name ?? "";
                                        const firstLetter = name ? name.charAt(0).toUpperCase() : "?";
                                        const selected = isToolKitSelected(toolKit.id);
                                        return (
                                            <article key={toolKit.id ?? name} className="tool-card tool-card--compact addJob-selectionCard">
                                                <div className="tool-card__avatar">{firstLetter}</div>
                                                <div className="tool-card__body">
                                                    <h4 className="tool-card__title">{name || "Unnamed tool kit"}</h4>
                                                    <p className="addJob-selectionMeta">Tool Kit</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={`addJob-selectionSelectBtn ${selected ? "selected" : ""}`}
                                                    onClick={() => toggleToolKit(toolKit)}
                                                >
                                                    {selected ? "Selected" : "Select"}
                                                </button>
                                            </article>
                                        );
                                    })
                                )}
                            </div>
                        </section>
                    )}

                    {isTools && (
                        <section className="addJob-employeeSection">
                            <div className="addJob-selectionHeader">
                                <p>Select Tools:</p>
                            </div>

                            <div className="addToolKitPage-toolsList">
                                {tools.length === 0 ? (
                                    <h6>No tools to display</h6>
                                ) : (
                                    tools.map((tool) => {
                                        const name = tool?.name ?? "";
                                        const firstLetter = name ? name.charAt(0).toUpperCase() : "?";
                                        const selectedTool = selectedTools.find((selectedItem) => selectedItem.id === tool.id);
                                        const selected = !!selectedTool;
                                        return (
                                            <div key={tool.id ?? name} className="addToolKitPage-toolRow">
                                                <div className="addToolKitPage-toolInfo">
                                                    <span className="addToolKitPage-toolInitial">{firstLetter}</span>
                                                    <span className="addToolKitPage-toolName">{name || "Unnamed tool"}</span>
                                                </div>

                                                {selected && (
                                                    <select
                                                        className="addToolKitPage-qtySelect"
                                                        value={selectedTool?.selectedQuantity ?? 1}
                                                        onChange={(e) => setToolQuantity(tool.id, e.target.value)}
                                                    >
                                                        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                                                            <option key={n} value={n}>x{n}</option>
                                                        ))}
                                                    </select>
                                                )}

                                                <button
                                                    type="button"
                                                    className={`addToolKitPage-selectBtn ${selected ? "selected" : ""}`}
                                                    onClick={() => toggleTool(tool)}
                                                >
                                                    {selected ? "Selected" : "Select"}
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>
                    )}

                    {/* HIDDEN INPUTS FOR FORM SUBMIT */}
                    <div id="addJob-hiddenEmployees">
                        {addedEmployees.map((emp) => (
                            <input
                                key={`hidden-${emp.id}`}
                                type="hidden"
                                name="employeeIds[]"
                                value={emp.id}
                            />
                        ))}
                        {selectedToolKits.map((kit) => (
                            <input
                                key={`hidden-kit-${kit.id}`}
                                type="hidden"
                                name="toolKitIds[]"
                                value={kit.id}
                            />
                        ))}
                        {selectedTools.map((tool) => (
                            <input
                                key={`hidden-tool-${tool.id}`}
                                type="hidden"
                                name="toolIds[]"
                                value={tool.id}
                            />
                        ))}
                    </div>
                </>
                )}

                <hr id="addJobForm-hr" />
                <button id="addJob-addJobBtn" type="submit">Add Job</button>
            </form>
            </div>
        </section>
        </main>
    );
}
