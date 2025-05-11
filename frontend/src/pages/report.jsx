import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import {autoTable} from 'jspdf-autotable';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import Button from '../components/Button';
import { InputLabel } from '../components/InputLabel';

const Report = () => {
    const [reportData, setReportData] = useState([]);
    const [vaccineFilter, setVaccineFilter] = useState('');
    const [offset, setOffset] = useState(0);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await api.get('/drives/report', {
                params: {
                    vaccineName: vaccineFilter || undefined,
                    offset,
                    limit
                }
            });
            setReportData(res.data.data);
            setTotal(res.data.pagination.total);
        } catch (err) {
            console.error('Error loading report:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [vaccineFilter, offset]);

    const handleCSVDownload = () => {
        const csvRows = [
            ['Student ID', 'Name', 'Class', 'Vaccine', 'Status', 'Date'],
            ...reportData.map((r) => [
                r.student_id,
                r.name,
                r.class,
                r.vaccineName,
                r.status,
                r.date
            ])
        ];

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            csvRows.map((row) => row.join(',')).join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.href = encodedUri;
        link.download = 'vaccination_report.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePDFDownload = () => {
        const doc = new jsPDF();
        doc.text('Vaccination Report', 14, 16);

        const tableData = reportData.map((r) => [
            r.student_id,
            r.name,
            r.class,
            r.vaccineName,
            r.status,
            new Date(r.date).toLocaleDateString()
        ]);

        autoTable(doc, {
            head: [['Student ID', 'Name', 'Class', 'Vaccine', 'Status', 'Date']],
            body: tableData,
            startY: 20
        })

        doc.save('vaccination_report.pdf');
    };

    const handleExcelDownload = () => {
        const ws = XLSX.utils.json_to_sheet(reportData.map((r) => ({
            'Student ID': r.student_id,
            'Name': r.name,
            'Class': r.class,
            'Vaccine': r.vaccineName,
            'Status': r.status,
            'Date': new Date(r.date).toLocaleDateString()
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Vaccination Report');

        XLSX.writeFile(wb, 'vaccination_report.xlsx');
    };



    return (
        <div className='page-container'>
            <div className="content-box">
                <div className='header'>
                    <h2 className='heading'>Vaccination Report</h2>
                    <div className='nav-buttons'>
                        <Button
                            type="button"
                            children="Dashboard"
                            onClick={() => {
                                navigate('/dashboard');
                            }}
                        />
                        <Button
                            type="button"
                            children="Students"
                            onClick={() => {
                                navigate('/students');
                            }}
                        />
                        <Button
                            type="button"
                            children="Drives"
                            onClick={() => {
                                navigate('/drives');
                            }}
                        />
                        <Button
                            type="button"
                            children="Student Vaccination"
                            onClick={() => {
                                navigate('/vaccinations');
                            }}
                        />
                    </div>
                </div>


                <div style={{ marginBottom: '1rem' }}>
                    <InputLabel
                        label="Filter by Vaccine:"
                        name="filterByVaccine"
                        value={vaccineFilter}
                        onChange={(e) => { setVaccineFilter(e.target.value); setOffset(0) }}
                        placeholder="e.g. Covid19"
                    />
                    <div className='download-buttons'>
                    <Button disabled={!reportData.length} onClick={handleCSVDownload} style={{ marginLeft: '1rem' }}>
                        Download CSV
                    </Button>
                    <Button disabled={!reportData.length} onClick={handleExcelDownload} style={{ marginLeft: '1rem' }}>
                        Download Excel
                    </Button>
                    <Button disabled={!reportData.length} onClick={handlePDFDownload} style={{ marginLeft: '1rem' }}>
                        Download PDF
                    </Button>
                    </div>
                    
                </div>

                {loading ? (
                    <Loader />
                ) : (
                    <>
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Class</th>
                                    <th>Vaccine</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((r) => (
                                    <tr key={r.student_id + r.vaccine_name}>
                                        <td>{r.student_id}</td>
                                        <td>{r.name}</td>
                                        <td>{r.class}</td>
                                        <td>{r.vaccineName}</td>
                                        <td>{r.status}</td>
                                        <td>{new Date(r.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div>
                            Page: {(limit > total) ? total : offset+limit} / Total: {total}{' '}
                            <Button disabled={offset === 0} onClick={() => setOffset((prev) => Math.max(prev - limit, 0))}>
                                Prev
                            </Button>{' '}
                            <Button
                                disabled={limit > total}
                                onClick={() => {
                                    const next = offset + limit;
                                    if (next < total) setOffset(next);
                                }}
                            >
                                Next
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Report;
