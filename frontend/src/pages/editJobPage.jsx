import { Link, useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState, useRef } from "react";;
import { AuthContext } from "../context/AuthContext";
import "../styles/editJobPage.css";
import "../styles/addToolKitPage.css";
import "../styles/toolsPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "../components/LoadingSpinner";

export default function EditJobPage() {
    const {accessToken, logout} = useContext(AuthContext);
    const [error, setError] = useState("");
    const [currentEmployees, setCurrentEmployees] = useState([]);
    const [addedEmployees, setAddedEmployees] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [toolKits, setToolKits] = useState([]);
    const [tools, setTools] = useState([]);
    const [selectedToolKits, setSelectedToolKits] = useState([]);
    const [selectedTools, setSelectedTools] = useState([]);
    const excludedToolIds = useRef(new Set());
    const initialToolKitIds = useRef(new Set());
    const [tabState, setTabState] = useState("employees");
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    const [isLoadingToolKits, setIsLoadingToolKits] = useState(true);
    const [isLoadingTools, setIsLoadingTools] = useState(true);
    const toolKitToolsCache = useRef({});
    const [job, setJob] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const isEmployees = tabState === "employees";
    const isToolKits = tabState === "toolKits";
    const isTools = tabState === "tools";

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/loggedIn/jobs/${encodeURIComponent(id)}/employees`, {
                    headers: {Authorization: `Bearer ${accessToken}`}
                });

                if (res.status === 401) {
                    logout();
                    return;
                }

                if (!res.ok) {
                    throw new Error("Failed to load employees for the job.");
                }

                const data = await res.json();
                setCurrentEmployees(data.employees);
            } catch(err) {
                setError(err.message);
            }
        })();


        (async () => {
            try {
            setIsLoadingEmployees(true);
            const res = await fetch("/api/loggedIn/employees", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (res.status === 401) {
                logout();
                return;
            }

            if (!res.ok) {
                throw new Error("Failed to load employees, try again later.");
            }

            const data = await res.json();
            setEmployees(data.employees);
            } catch (err) {
            setError(err.message);
            } finally {
                setIsLoadingEmployees(false);
            }
        })();

        (async () => {
            try {
            const res = await fetch(`/api/loggedIn/jobs/${encodeURIComponent(id)}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (res.status === 401) {
                logout();
                return;
            }

            if (!res.ok) {

                throw new Error("Failed to fetch job details, try again later.");
            }

            if (res.ok) {
                const data = await res.json();
                setJob(data.job);
            }
            } catch (err) {
            setError(err.message);
            }
        })();
    }, [accessToken, logout]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/loggedIn/jobs/${encodeURIComponent(id)}/tool-kits`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (res.status === 401) {
                    logout();
                    return;
                }

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    throw new Error(data.error || "Failed to load job tool kits.");
                }

                const loadedToolKits = data.toolKits ?? [];
                initialToolKitIds.current = new Set(loadedToolKits.map((tk) => tk.id));
                setSelectedToolKits(loadedToolKits);
            } catch (err) {
                setError(err.message);
                setSelectedToolKits([]);
            }
        })();
    }, [accessToken, logout, id]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/loggedIn/jobs/${encodeURIComponent(id)}/tools`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (res.status === 401) {
                    logout();
                    return;
                }

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    throw new Error(data.error || "Failed to load job tools.");
                }

                const jobTools = (data.tools ?? []).map((tool) => ({
                    ...tool,
                    manual: true,
                    toolKitIds: [],
                    selectedQuantity: tool.selected_quantity ?? 1,
                    quantityLocked: true
                }));

                setSelectedTools(jobTools);
            } catch (err) {
                setError(err.message);
                setSelectedTools([]);
            }
        })();
    }, [accessToken, logout, id]);

    useEffect(() => {
        (async () => {
            try {
                setIsLoadingToolKits(true);
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
            } finally {
                setIsLoadingToolKits(false);
            }
        })();
    }, [accessToken, logout]);

    useEffect(() => {
        (async () => {
            try {
                setIsLoadingTools(true);
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
            } finally {
                setIsLoadingTools(false);
            }
        })();
    }, [accessToken, logout]);



    function isEmployeeSelected(employeeId) {
        return currentEmployees.some((emp) => emp.id === employeeId) ||
            addedEmployees.some((emp) => emp.id === employeeId);
    }

    async function toggleEmployee(employee) {
        if (currentEmployees.some((emp) => emp.id === employee.id)) {
            await handleRemoveEmployeeFromJob(employee.id);
            return;
        }

        setAddedEmployees((prev) => {
            const exists = prev.some((emp) => emp.id === employee.id);
            if (exists) return prev.filter((emp) => emp.id !== employee.id);
            return [...prev, employee];
        });
    }

    function toggleToolKit(toolKit) {
        const exists = selectedToolKits.some((kit) => kit.id === toolKit.id);

        setSelectedToolKits((prev) => {
            if (exists) return prev.filter((kit) => kit.id !== toolKit.id);
            return [...prev, toolKit];
        });

        if (exists) {
            // Clear excluded tools for this toolkit so re-selecting brings them back
            const kitTools = toolKitToolsCache.current[toolKit.id] ?? [];
            kitTools.forEach((kitTool) => {
                const toolId = kitTool.tool_id ?? kitTool.id;
                excludedToolIds.current.delete(toolId);
            });
            // Remove from initial set so re-selecting will add tools
            initialToolKitIds.current.delete(toolKit.id);

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

        addToolsFromToolKit(toolKit);
    }

    function isToolKitSelected(toolKitId) {
        return selectedToolKits.some((kit) => kit.id === toolKitId);
    }

    function toggleTool(tool) {
        setSelectedTools((prev) => {
            const exists = prev.some((t) => t.id === tool.id);
            if (!exists) {
                excludedToolIds.current.delete(tool.id);
                return [...prev, {
                    ...tool,
                    manual: true,
                    toolKitIds: [],
                    selectedQuantity: 1,
                    quantityLocked: true
                }];
            }

            excludedToolIds.current.add(tool.id);
            return prev.filter((t) => t.id !== tool.id);
        });
    }

    function isToolSelected(toolId) {
        return selectedTools.some((tool) => tool.id === toolId);
    }

    function setToolQuantity(toolId, qty) {
        const n = Math.max(1, Math.min(10, Number(qty) || 1));
        setSelectedTools((prev) =>
            prev.map((tool) =>
                tool.id === toolId ? { ...tool, selectedQuantity: n, quantityLocked: true, manual: true } : tool
            )
        );
    }

    async function addToolsFromToolKit(toolKit) {
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
                const updatedTools = prev.map((tool) => {
                    const kitTool = kitTools.find((kt) => (kt.tool_id ?? kt.id) === tool.id);
                    if (!kitTool) return tool;

                    const toolKitIds = tool.toolKitIds ?? [];
                    if (toolKitIds.includes(toolKit.id)) return tool;

                    const kitQty = kitTool.quantity ?? 1;
                    return {
                        ...tool,
                        toolKitIds: [...toolKitIds, toolKit.id],
                        selectedQuantity: tool.manual ? tool.selectedQuantity : kitQty
                    };
                });

                const newTools = kitTools
                    .filter((kitTool) => {
                        const toolId = kitTool.tool_id ?? kitTool.id;
                        return !prev.some((t) => t.id === toolId) && !excludedToolIds.current.has(toolId);
                    })
                    .map((kitTool) => ({
                        id: kitTool.tool_id ?? kitTool.id,
                        name: kitTool.tool_name ?? kitTool.name ?? "Unnamed tool",
                        selectedQuantity: kitTool.quantity ?? 1,
                        quantityLocked: true,
                        manual: false,
                        toolKitIds: [toolKit.id],
                    }));

                return [...updatedTools, ...newTools];
            });
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        if (selectedToolKits.length === 0) return;
        selectedToolKits.forEach((toolKit) => {
            // Skip toolkits that were loaded with the job - tools already loaded from job_tools
            if (initialToolKitIds.current.has(toolKit.id)) return;
            addToolsFromToolKit(toolKit);
        });
    }, [selectedToolKits]);

    async function handleRemoveEmployeeFromJob(employeeId) {
        try {
            const res = await fetch(`/api/loggedIn/jobs/${encodeURIComponent(id)}/employees/${encodeURIComponent(employeeId)}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (res.status !== 200) {
                const data= await res.json();
                if (data.error) {
                    throw new Error(data.error);
                }
            }

            setCurrentEmployees((prev) => prev.filter((e) => e.id !== employeeId));
        } catch(err) {
            setError(err.message);
        }
    }

    async function onSubmit(e) {
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
            e.preventDefault();

            const res = await fetch(`/api/loggedIn/jobs/${encodeURIComponent(id)}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json()
                if (data.error) {
                    throw new Error(data.error)
                }
            }
            
            navigate("/loggedIn/jobs");
        } catch(err) {
            setError(err.message);
        }
    }

    return (
        <main className="editJob-page">
        <section id="editJob-form">
            <Link id="editJob-form-closeBtn" className="editJob-page-backBtn" to="/loggedIn/jobs">
                <FontAwesomeIcon icon={faArrowLeft} className="icon" />
            </Link>

            <div id="editJob-container">
            <h1>Edit Job</h1>

            <form className="forms" onSubmit={onSubmit}>
                <div className="form-control">
                <label htmlFor="jobid">Job ID:</label>
                <input type="text" name="jobid" defaultValue={job?.jobid?? ""}/>
                </div>

                <div className="form-control">
                <label htmlFor="title">Title:</label>
                <input type="text" name="title" defaultValue={job?.title?? ""} />
                </div>

                <div className="form-control">
                <label htmlFor="date">Date:</label>
                <input id="editJobForm-date" type="date" name="date" defaultValue={job?.date?? ""} />
                </div>

                <div className="form-control">
                <label htmlFor="address">Address:</label>
                <input type="text" name="address" defaultValue={job?.address?? ""} />
                </div>

                <div className="form-control">
                <label htmlFor="phoneNumber">Phone #:</label>
                <input type="text" name="phoneNumber" defaultValue={job?.phoneNumber?? ""} />
                </div>

                <div className="form-control">
                <label htmlFor="notes">Notes:</label>
                <textarea id="editJob-notes" name="notes" defaultValue={job?.notes?? ""}></textarea>
                </div>

                {error && <p id="error" className="error">{error}</p>}

                {(employees || toolKits || tools) && (
                <>
                    <section className="tools-tabs editJob-tabs">
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
                        <section className="editJob-employeeSection">
                            <div className="editJob-selectionHeader">
                                <p>Select Employees:</p>
                            </div>

                            <div className="tools-section__cards editJob-selectionCards">
                                {isLoadingEmployees ? (
                                    <LoadingSpinner message="Loading employees..." />
                                ) : employees.length === 0 ? (
                                    <h6>No employees to display</h6>
                                ) : (
                                    employees.map((employee) => {
                                        const name = employee?.name ?? "";
                                        const firstLetter = name ? name.charAt(0).toUpperCase() : "?";
                                        const selected = isEmployeeSelected(employee.id);
                                        return (
                                            <article key={employee.id ?? employee.employeeid} className="tool-card tool-card--compact editJob-selectionCard editJob-employeeCard">
                                                <div className="tool-card__avatar">{firstLetter}</div>
                                                <div className="tool-card__body">
                                                    <h4 className="tool-card__title">{name || "Unnamed employee"}</h4>
                                                    <p className="editJob-selectionMeta">#{employee.employeeid} • {employee.role}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={`editJob-selectionSelectBtn ${selected ? "selected" : ""}`}
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
                        <section className="editJob-employeeSection">
                            <div className="editJob-selectionHeader">
                                <p>Select Tool Kits:</p>
                            </div>

                            <div className="tools-section__cards editJob-selectionCards">
                                {isLoadingToolKits ? (
                                    <LoadingSpinner message="Loading tool kits..." />
                                ) : toolKits.length === 0 ? (
                                    <h6>No tool kits to display</h6>
                                ) : (
                                    toolKits.map((toolKit) => {
                                        const name = toolKit?.name ?? "";
                                        const firstLetter = name ? name.charAt(0).toUpperCase() : "?";
                                        const selected = isToolKitSelected(toolKit.id);
                                        return (
                                            <article key={toolKit.id ?? name} className="tool-card tool-card--compact editJob-selectionCard">
                                                <div className="tool-card__avatar">{firstLetter}</div>
                                                <div className="tool-card__body">
                                                    <h4 className="tool-card__title">{name || "Unnamed tool kit"}</h4>
                                                    <p className="editJob-selectionMeta">Tool Kit</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={`editJob-selectionSelectBtn ${selected ? "selected" : ""}`}
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
                        <section className="editJob-employeeSection">
                            <div className="editJob-selectionHeader">
                                <p>Select Tools:</p>
                            </div>

                            <div className="addToolKitPage-toolsList">
                                {isLoadingTools ? (
                                    <LoadingSpinner message="Loading tools..." />
                                ) : tools.length === 0 ? (
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
                    <div id="editJob-hiddenEmployees">
                        {addedEmployees.map((emp) => (
                            <input
                                key={`hidden-${emp.employeeid}`}
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

                <hr id="editJobForm-hr" />
                <button id="editJob-addJobBtn" type="submit">Update Job</button>
            </form>
            </div>
        </section>
        </main>
    );
}
