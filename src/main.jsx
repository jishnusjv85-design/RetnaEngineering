import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
import './styles.css';
import Layout from './components/Layout';
import Home from './pages/Home';
import { Button } from './components/UI';
const About = lazy(() => import('./pages/About')); const Products = lazy(() => import('./pages/Products')); const Models = lazy(() => import('./pages/Models')); const Booking = lazy(() => import('./pages/Booking')); const Contact = lazy(() => import('./pages/Contact')); const Custom = lazy(() => import('./pages/Custom')); const Admin = lazy(() => import('./pages/Admin'));
class ErrorBoundary extends React.Component { state = { error: false }; static getDerivedStateFromError() { return { error: true }; } render() { return this.state.error ? <div className="container section"><h1>Let’s get you back on track.</h1><p>The page couldn’t load. Please refresh or call RECO on 0495 2303961.</p><Button href="/">Return home</Button></div> : this.props.children; } }
createRoot(document.getElementById('root')).render(<React.StrictMode><ErrorBoundary><BrowserRouter><Suspense fallback={<div className="page-loading" role="status">Loading RECO…</div>}><Routes><Route element={<Layout/>}><Route index element={<Home/>}/><Route path="about" element={<About/>}/><Route path="car-silencers" element={<Products/>}/><Route path="car-models" element={<Models/>}/><Route path="custom-silencers" element={<Custom/>}/><Route path="book-a-slot" element={<Booking/>}/><Route path="contact" element={<Contact/>}/><Route path="admin" element={<Admin/>}/><Route path="*" element={<div className="section container not-found"><span>404 / PAGE NOT FOUND</span><h1>Let’s find your way back.</h1><p>This page does not exist. Explore our car exhaust products or contact RECO.</p><Button to="/">Return Home</Button></div>}/></Route></Routes></Suspense></BrowserRouter></ErrorBoundary></React.StrictMode>);
