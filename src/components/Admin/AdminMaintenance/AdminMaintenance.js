import React, { useState, useEffect } from "react";
import "./AdminMaintenance.css";
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from "../AdminNavbar/AdminNavbar";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminMaintenance() {
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [editedStatusId, setEditedStatusId] = useState(null);
    const [editedStatus, setEditedStatus] = useState("");
    const [cookies] = useCookies(['userId', 'userType']);
    const navigate = useNavigate();

    useEffect(() => {
        if (cookies.userType !== "ADMIN") {
            navigate('/sign-in');
            return;
        }

        fetchMaintenanceRequests();
    }, [cookies.userType, navigate]);

    const fetchMaintenanceRequests = () => {
        axios.get(`http://localhost:8083/communityhub/user/maintenance/all`)
            .then((response) => {
                setMaintenanceRequests(response.data.reverse());
            })
            .catch((error) =>
                console.error("Error fetching maintenance requests:", error)
            );
    };

    const handleUpdateStatus = (requestId, currentStatus) => {
        if (editedStatusId === requestId) {
            updateStatus(requestId);
        } else {
            setEditedStatusId(requestId);
            setEditedStatus(currentStatus);
        }
    };

    const updateStatus = (requestId) => {
        axios.put(`http://localhost:8083/communityhub/user/maintenance/update`, {
            requestId: requestId,
            newStatus: editedStatus
        })
            .then(response => {
                if (response.status === 200) {
                    updateMaintenanceRequests(requestId);
                    resetEditedStatus();
                    toast.success('Successfully Updated');
                } else {
                    throw new Error("Failed to update status");
                }
            })
            .catch((error) => console.error("Error updating status:", error));
    };

    const updateMaintenanceRequests = (requestId) => {
        setMaintenanceRequests(prevRequests => {
            return prevRequests.map(request => {
                if (request.id === requestId) {
                    return {
                        ...request,
                        status: editedStatus
                    };
                }
                return request;
            });
        });
    };

    const resetEditedStatus = () => {
        setEditedStatusId(null);
        setEditedStatus("");
    };

    const handleStatusChange = (e) => {
        setEditedStatus(e.target.value);
    };

    return (
        <div>
            <AdminNavbar />
            <div className="admin-table-container">
                <h2>Maintenance Requests</h2>
                <table aria-label="Maintenance Requests" className="admin-table">
                    <thead>
                        <tr>
                            <th>REQUESTER NAME</th>
                            <th>ROOM NUMBER</th>
                            <th>BUILDING NUMBER</th>
                            <th>REQUEST HEADING</th>
                            <th>DESCRIPTION</th>
                            <th>DATE OF ISSUE</th>
                            <th>STATUS</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {maintenanceRequests.map((row) => (
                            <tr key={row.id}>
                                <td>{row.requesterName}</td>
                                <td>{row.roomNumber}</td>
                                <td>{row.buildingNumber}</td>
                                <td>{row.requestHeading}</td>
                                <td>{row.description}</td>
                                <td>{new Date(row.dateOfIssue).toDateString()}</td>
                                <td>
                                    {editedStatusId === row.id ? (
                                        <input
                                            type="text"
                                            value={editedStatus}
                                            onChange={handleStatusChange}
                                        />
                                    ) : (
                                        row.status
                                    )}
                                </td>
                                <td>
                                    <button onClick={() => handleUpdateStatus(row.id, row.status)}>
                                        {editedStatusId === row.id ? "Save" : "Update"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ToastContainer />
        </div>
    );
}

