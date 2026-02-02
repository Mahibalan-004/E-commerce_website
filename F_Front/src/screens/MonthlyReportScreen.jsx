// import { useEffect, useState } from "react";
// import API from "../utils/api.ts";
// import { Table } from "react-bootstrap";

// const monthNames = [
//   "Jan","Feb","Mar","Apr","May","Jun",
//   "Jul","Aug","Sep","Oct","Nov","Dec",
// ];

// const MonthlyReportScreen = () => {
//   const [reports, setReports] = useState([]);

//   useEffect(() => {
//     const fetchMonthly = async () => {
//       const { data } = await API.get("/reports/monthly");
//       setReports(data);
//     };
//     fetchMonthly();
//   }, []);

//   return (
//     <>
//       <h3>Monthly Sales Report</h3>

//       <Table striped bordered>
//         <thead>
//           <tr>
//             <th>Month</th>
//             <th>Total Orders</th>
//             <th>Total Sales</th>
//           </tr>
//         </thead>
//         <tbody>
//           {reports.map((r, i) => (
//             <tr key={i}>
//               <td>
//                 {monthNames[r._id.month - 1]} {r._id.year}
//               </td>
//               <td>{r.totalOrders}</td>
//               <td>₹{r.totalSales}</td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//     </>
//   );
// };

// export default MonthlyReportScreen;


// src/screens/MonthlyReportScreen.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { listOrders } from '../actions/orderActions';
import Loader from '../components/Loader';
import Message from '../components/Message';

const MonthlyReportScreen = () => {
  const dispatch = useDispatch();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());

  const orderList = useSelector((state) => state.orderList);
  const { loading, error, orders } = orderList;

  useEffect(() => {
    dispatch(listOrders());
  }, [dispatch]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // Filter orders by selected day
  const getDailyOrders = (date) => {
    if (!orders) return [];
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      return orderDate === date;
    });
  };

  // Filter orders by selected month
  const getMonthlyOrders = (month, year) => {
    if (!orders) return [];
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === month && orderDate.getFullYear() === year;
    });
  };

  // Get day-wise breakdown for a month
  const getDaysInMonth = (month, year) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dailyData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOrders = getDailyOrders(date);
      
      dailyData.push({
        date,
        day,
        totalOrders: dayOrders.length,
        paidOrders: dayOrders.filter(o => o.isPaid).length,
        deliveredOrders: dayOrders.filter(o => o.isDelivered).length,
        totalAmount: dayOrders.reduce((sum, o) => sum + o.totalPrice, 0),
        paidAmount: dayOrders.filter(o => o.isPaid).reduce((sum, o) => sum + o.totalPrice, 0)
      });
    }
    return dailyData;
  };

  // Download as Excel (CSV)
  const downloadExcel = () => {
    const monthData = getDaysInMonth(selectedMonth, selectedYear);
    const data = monthData.map(d => 
      `${d.date},Day ${d.day},${d.totalOrders},${d.paidOrders},${d.deliveredOrders},₹${d.totalAmount.toFixed(2)},₹${d.paidAmount.toFixed(2)}`
    );
    data.unshift('Date,Day,Total Orders,Paid Orders,Delivered Orders,Total Amount,Paid Amount');
    
    const blob = new Blob(['\uFEFF' + data.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Monthly_Report_${monthNames[selectedMonth]}_${selectedYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Download as PDF
  const downloadPDF = () => {
    const content = document.getElementById('monthly-report-content');
    const printWindow = window.open('', '', 'width=800,height=600');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Monthly Report - ${monthNames[selectedMonth]} ${selectedYear}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1, h2 { color: #1f2937; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
            th { background-color: #3b82f6; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .stats { text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const currentOrders = getMonthlyOrders(selectedMonth, selectedYear);
  const totalAmount = currentOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const paidAmount = currentOrders.filter(o => o.isPaid).reduce((sum, o) => sum + o.totalPrice, 0);
  const paidOrders = currentOrders.filter(o => o.isPaid).length;
  const deliveredOrders = currentOrders.filter(o => o.isDelivered).length;

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <div className="py-4">
      {/* Header */}
      <div className="card mb-4 shadow">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="mb-0">📆 Monthly Order Report</h1>
            <div className="d-flex gap-2">
              <Link to="/admin/reports/daily" className="btn btn-outline-primary">
                📅 Daily Report
              </Link>
              <button className="btn btn-success" onClick={downloadExcel}>
                📥 Excel
              </button>
              <button className="btn btn-danger" onClick={downloadPDF}>
                📄 PDF
              </button>
            </div>
          </div>

          {/* Month Selector */}
          <div className="d-flex align-items-center">
            <span className="me-2" style={{fontSize: '1.2rem'}}>📅</span>
            <select
              className="form-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{ maxWidth: '250px' }}
            >
              {monthNames.map((month, idx) => (
                <option key={idx} value={idx}>{month} {selectedYear}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Total Orders</p>
                  <h3 className="mb-0">{currentOrders.length}</h3>
                </div>
                <h1 style={{fontSize: '2.5rem'}}>📦</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Paid Orders</p>
                  <h3 className="mb-0 text-success">{paidOrders}</h3>
                </div>
                <h1 style={{fontSize: '2.5rem'}}>✅</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Delivered</p>
                  <h3 className="mb-0 text-info">{deliveredOrders}</h3>
                </div>
                <h1 style={{fontSize: '2.5rem'}}>🚚</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Total Revenue</p>
                  <h4 className="mb-0">₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h4>
                  <small className="text-success">Paid: ₹{paidAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</small>
                </div>
                <h1 style={{fontSize: '2.5rem'}}>💰</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="card shadow" id="monthly-report-content">
        <div className="card-body">
          <h2 className="mb-4">
            📆 Monthly Report - {monthNames[selectedMonth]} {selectedYear}
          </h2>

          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead className="table-primary">
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Total Orders</th>
                  <th>Paid Orders</th>
                  <th>Delivered</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                </tr>
              </thead>
              <tbody>
                {getDaysInMonth(selectedMonth, selectedYear).map((day) => (
                  <tr key={day.date} className={day.totalOrders === 0 ? 'table-secondary' : ''}>
                    <td>{day.date}</td>
                    <td className="text-center">{day.day}</td>
                    <td className="text-center"><strong>{day.totalOrders}</strong></td>
                    <td className="text-center text-success">{day.paidOrders}</td>
                    <td className="text-center text-info">{day.deliveredOrders}</td>
                    <td className="text-end"><strong>₹{day.totalAmount.toFixed(2)}</strong></td>
                    <td className="text-end text-success">₹{day.paidAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-primary">
                <tr>
                  <td colSpan="2" className="text-end"><strong>TOTAL:</strong></td>
                  <td className="text-center"><strong>{currentOrders.length}</strong></td>
                  <td className="text-center text-success"><strong>{paidOrders}</strong></td>
                  <td className="text-center text-info"><strong>{deliveredOrders}</strong></td>
                  <td className="text-end"><strong>₹{totalAmount.toFixed(2)}</strong></td>
                  <td className="text-end text-success"><strong>₹{paidAmount.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReportScreen;