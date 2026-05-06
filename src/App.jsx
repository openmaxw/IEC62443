import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { Header } from './components/Layout';
import { Footer } from './components/Footer/Footer';
import { Home } from './pages/Home/Home';
import { Landing } from './pages/Landing/Landing';
import { OwnerInterview } from './pages/Owner/OwnerInterview';
import { OwnerResult } from './pages/Owner/OwnerResult';
import { IntegratorWorkspace } from './pages/Integrator/IntegratorWorkspace';
import { IntegratorResult } from './pages/Integrator/IntegratorResult';
import { VendorCapability } from './pages/Vendor/VendorCapability';
import { VendorResult } from './pages/Vendor/VendorResult';
import { SelectionMatrix } from './pages/Selection/SelectionMatrix';
import { ReportCenter } from './pages/Report/ReportCenter';
import { LearningMode } from './pages/Learning/LearningMode';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { TranslationCenter } from './pages/TranslationCenter/TranslationCenter';
import './index.css';

const basename = import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, '');

export default function App() {
  return (
    <ProjectProvider>
      <BrowserRouter basename={basename}>
        <Header />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/project" element={<Home />} />
            <Route path="/owner" element={<OwnerInterview />} />
            <Route path="/owner/result" element={<OwnerResult />} />
            <Route path="/integrator" element={<IntegratorWorkspace />} />
            <Route path="/integrator/result" element={<IntegratorResult />} />
            <Route path="/vendor" element={<VendorCapability />} />
            <Route path="/vendor/result" element={<VendorResult />} />
            <Route path="/selection" element={<SelectionMatrix />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/translation-center" element={<TranslationCenter />} />
            <Route path="/report" element={<ReportCenter />} />
            <Route path="/learning" element={<LearningMode />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </ProjectProvider>
  );
}
