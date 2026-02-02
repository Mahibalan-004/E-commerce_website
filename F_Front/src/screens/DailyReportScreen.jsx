// import { useEffect, useState } from "react";
// import API from "../utils/api.ts";
// import { Table, Button } from "react-bootstrap";

// const DailyReportScreen = () => {
//   const [reports, setReports] = useState([]);

//   useEffect(() => {
//     const fetchDaily = async () => {
//       const { data } = await API.get("/reports/daily");
//       setReports(data);
//     };
//     fetchDaily();
//   }, []);

//   return (
//     <>
//       <h3>Daily Sales Report</h3>

//       <Button className="mb-3">Download Excel</Button>
//       <Button variant="danger" className="mb-3 ms-2">
//         Download PDF
//       </Button>

//       <Table striped bordered>
//         <thead>
//           <tr>
//             <th>Date</th>
//             <th>Total Orders</th>
//             <th>Total Sales</th>
//           </tr>
//         </thead>
//         <tbody>
//           {reports.map((r, i) => (
//             <tr key={i}>
//               <td>
//                 {r._id.day}/{r._id.month}/{r._id.year}
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

// export default DailyReportScreen;


// src/screens/DailyReportScreen.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { listOrders } from '../actions/orderActions';
import Loader from '../components/Loader';
import Message from '../components/Message';

const DailyReportScreen = () => {
  const dispatch = useDispatch();
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);

  const orderList = useSelector((state) => state.orderList);
  const { loading, error, orders } = orderList;

  useEffect(() => {
    dispatch(listOrders());
  }, [dispatch]);

  // Filter orders by selected day
  const getDailyOrders = (date) => {
    if (!orders) return [];
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      return orderDate === date;
    });
  };

  // Download as Excel (CSV)
  const downloadExcel = () => {
    const dayOrders = getDailyOrders(selectedDay);
    const data = dayOrders.map(o => 
      `${o._id},${new Date(o.createdAt).toLocaleDateString()},${o.user?.name || 'N/A'},${o.user?.phone || 'N/A'},"${o.orderItems.map(item => `${item.name} x ${item.qty}`).join('; ')}",₹${o.totalPrice.toFixed(2)},${o.isPaid ? 'Yes' : 'No'},${o.isDelivered ? 'Yes' : 'No'},${o.trackingId || 'N/A'}`
    );
    data.unshift('Order ID,Date,Customer Name,Phone,Products,Total Amount,Paid,Delivered,Tracking ID');
    
    const blob = new Blob(['\uFEFF' + data.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Daily_Report_${selectedDay}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Download as PDF
  const downloadPDF = () => {
    const content = document.getElementById('daily-report-content');
    const printWindow = window.open('', '', 'width=800,height=600');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Daily Report - ${selectedDay}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1, h2 { color: #1f2937; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 11px; }
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

  const currentOrders = getDailyOrders(selectedDay);
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
            <h1 className="mb-0">📅 Daily Order Report</h1>
            <div className="d-flex gap-2">
              <Link to="/admin/reports/monthly" className="btn btn-outline-primary">
                📆 Monthly Report
              </Link>
              <button className="btn btn-success" onClick={downloadExcel}>
                📥 Excel
              </button>
              <button className="btn btn-danger" onClick={downloadPDF}>
                📄 PDF
              </button>
            </div>
          </div>

          {/* Date Selector */}
          <div className="d-flex align-items-center">
            <span className="me-2" style={{fontSize: '1.2rem'}}>📅</span>
            <input
              type="date"
              className="form-control"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              style={{ maxWidth: '250px' }}
            />
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
      <div className="card shadow" id="daily-report-content">
        <div className="card-body">
          <h2 className="mb-4">
            📅 Daily Report - {new Date(selectedDay).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>

          {currentOrders.length === 0 ? (
            <div className="text-center p-4">
              <Message variant="info">No orders found for this day</Message>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-bordered table-hover">
                <thead className="table-primary">
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Products</th>
                    <th>Amount</th>
                    <th>Paid</th>
                    <th>Delivered</th>
                    <th>Tracking ID</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <tr key={order._id}>
                      <td><small>{order._id}</small></td>
                      <td>{order.user?.name || 'N/A'}</td>
                      <td>{order.user?.phone || 'N/A'}</td>
                      <td>
                        <small>
                          {order.orderItems.map(item => 
                            `${item.name} (${item.qty})`
                          ).join(', ')}
                        </small>
                      </td>
                      <td><strong>₹{order.totalPrice.toFixed(2)}</strong></td>
                      <td className="text-center">
                        {order.isPaid ? (
                          <span className="badge bg-success">Yes</span>
                        ) : (
                          <span className="badge bg-danger">No</span>
                        )}
                      </td>
                      <td className="text-center">
                        {order.isDelivered ? (
                          <span className="badge bg-success">Yes</span>
                        ) : (
                          <span className="badge bg-warning">No</span>
                        )}
                      </td>
                      <td><small>{order.trackingId || 'N/A'}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyReportScreen;