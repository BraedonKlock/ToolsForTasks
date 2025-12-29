import { Link } from "react-router-dom";
import "../styles/addEmployeePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";


export default function() {
    function onSubmit() {

    }
    
    return (
        <main className="addEmployee-page">
            <Link id="addJob-form-closeBtn" className="jobDetails-backBtn" to="/loggedIn/manage-employees">
            <FontAwesomeIcon icon={faArrowLeft} className="icon" />
            </Link>

            <div id="addEmployeePage-addEmployeeContainer">
                <h1>Add Employee</h1>

                {/* {error } */}

                <form className="forms" onSubmit={onSubmit}>
                <input type="hidden" />

                <div className="form-control">
                    <label htmlFor="employeeid">ID:</label>
                    <input id="employeeid" type="text" name="employeeid" required />
                </div>

                <div className="form-control">
                    <label htmlFor="name">Name:</label>
                    <input id="name" type="text" name="name" required />
                </div>

                <div className="form-control">
                    <label htmlFor="role">Role:</label>
                    <select name="role" id="addEmployeePage-roleSelect" required defaultValue="">
                    <option value="" disabled hidden>
                        Select
                    </option>
                    <option value="manager">manager</option>
                    <option value="crew">Crew</option>
                    </select>
                </div>

                <div className="form-control">
                    <label htmlFor="email">Email:</label>
                    <input id="email" type="text" name="email" required />
                </div>

                <div className="form-control">
                    <label htmlFor="password">Password:</label>
                    <input id="password" type="text" name="password" required />
                </div>

                <hr id="addEmployeePage-hr" />
                <button type="submit" id="addEmployeePage-addBtn">
                    Add
                </button>
                </form>
            </div>
        </main>
    );
}