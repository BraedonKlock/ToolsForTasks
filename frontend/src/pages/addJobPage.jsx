import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/addJobPage.css";
import "../styles/addToolKitPage.css";
import "../styles/toolsPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCamera } from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AddJob() {
    const { accessToken, logout } = useContext(AuthContext);
    const [employees, setEmployees] = useState([]);
    const [toolKits, setToolKits] = useState([]);
    const [tools, setTools] = useState([]);
    const [error, setError] = useState("");
    const [addedEmployees, setAddedEmployees] = useState([]);
    const [selectedToolKits, setSelectedToolKits] = useState([]);
    const [selectedTools, setSelectedTools] = useState([]);
    const excludedToolIds = useRef(new Set());
    const [tabState, setTabState] = useState("employees");
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    const [isLoadingToolKits, setIsLoadingToolKits] = useState(true);
    const [isLoadingTools, setIsLoadingTools] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const toolKitToolsCache = useRef({});
    const imageInputRef = useRef(null);
    const navigate = useNavigate();

    const isEmployees = tabState === "employees";
    const isToolKits = tabState === "toolKits";
    const isTools = tabState === "tools";

    useEffect(() => {
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
                    const data = await res.json().catch(() => ({}));
                    throw new Error("Failed to load employees, try again later.");
                }

                const data = await res.json();
                setEmployees(data.employees);
            } catch (err) {
                setError(err.message);
                setEmployees([]); // optional: reset state
            } finally {
                setIsLoadingEmployees(false);
            }
        })();
    }, [accessToken, logout]);

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
            // Clear excluded tools for this toolkit so re-selecting brings them back
            const kitTools = toolKitToolsCache.current[toolKit.id] ?? [];
            kitTools.forEach((kitTool) => {
                const toolId = kitTool.tool_id ?? kitTool.id;
                excludedToolIds.current.delete(toolId);
            });

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
        })();
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

    function handleImageChange(e) {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    async function onSubmit(e) {
        e.preventDefault();
        setError("");

        // Build FormData for multipart/form-data submission
        const formData = new FormData();
        const htmlForm = e.currentTarget;

        // Add text fields
        formData.append("jobid", htmlForm.jobid.value);
        formData.append("title", htmlForm.title.value);
        formData.append("date", htmlForm.date.value);
        formData.append("address", htmlForm.address.value);
        formData.append("phoneNumber", htmlForm.phoneNumber.value);
        formData.append("notes", htmlForm.notes.value);

        // Add image if selected
        if (imageFile) {
            formData.append("image", imageFile);
        }

        // Add arrays as JSON strings
        const employeeIds = addedEmployees.map(emp => emp.id);
        const toolKitIds = selectedToolKits.map(kit => kit.id);
        const toolSelections = selectedTools.map((tool) => ({
            tool_id: tool.id,
            quantity: tool.selectedQuantity ?? 1
        }));

        formData.append("employeeIds", JSON.stringify(employeeIds));
        formData.append("toolKitIds", JSON.stringify(toolKitIds));
        formData.append("toolSelections", JSON.stringify(toolSelections));

        try {
            const res = await fetch("/api/loggedIn/jobs", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                body: formData,
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
                <div id="addJob-imageDiv">
                    <label
                        className="job-image-upload-container"
                        onClick={() => imageInputRef.current?.click()}
                    >
                        {imagePreview ? (
                            <img src={imagePreview} alt="Job preview" className="job-image-preview" />
                        ) : (
                            <div className="job-image-placeholder">
                                <FontAwesomeIcon icon={faCamera} className="camera-icon" />
                                <span>Add Photo</span>
                            </div>
                        )}
                        <div className="job-image-upload-overlay">
                            <FontAwesomeIcon icon={faCamera} className="camera-icon" />
                        </div>
                    </label>
                    <input
                        type="file"
                        ref={imageInputRef}
                        className="job-image-file-input"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleImageChange}
                    />
                    <p className="job-image-upload-hint">
                        {imageFile ? imageFile.name : "Optional: Upload a job image"}
                    </p>
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
