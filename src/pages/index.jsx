import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Agenda from "./Agenda";

import Onboarding from "./Onboarding";

import Configuracoes from "./Configuracoes";

import Financeiro from "./Financeiro";

import ClienteApp from "./ClienteApp";

import ConfiguracoesWhatsApp from "./ConfiguracoesWhatsApp";

import Marketplace from "./Marketplace";

import Estoque from "./Estoque";

import Academy from "./Academy";

import ConteudoDetalhe from "./ConteudoDetalhe";

import ModoSalao from "./ModoSalao";

import CheckInCliente from "./CheckInCliente";

import CanalInterativo from "./CanalInterativo";

import Home from "./Home";

import LandingPage from "./LandingPage";

import Assinatura from "./Assinatura";

import AgendamentoPublico from "./AgendamentoPublico";

import Clientes from "./Clientes";

import ClienteDetalhe from "./ClienteDetalhe";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Agenda: Agenda,
    
    Onboarding: Onboarding,
    
    Configuracoes: Configuracoes,
    
    Financeiro: Financeiro,
    
    ClienteApp: ClienteApp,
    
    ConfiguracoesWhatsApp: ConfiguracoesWhatsApp,
    
    Marketplace: Marketplace,
    
    Estoque: Estoque,
    
    Academy: Academy,
    
    ConteudoDetalhe: ConteudoDetalhe,
    
    ModoSalao: ModoSalao,
    
    CheckInCliente: CheckInCliente,
    
    CanalInterativo: CanalInterativo,
    
    Home: Home,
    
    LandingPage: LandingPage,
    
    Assinatura: Assinatura,
    
    AgendamentoPublico: AgendamentoPublico,
    
    Clientes: Clientes,
    
    ClienteDetalhe: ClienteDetalhe,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Agenda" element={<Agenda />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/Configuracoes" element={<Configuracoes />} />
                
                <Route path="/Financeiro" element={<Financeiro />} />
                
                <Route path="/ClienteApp" element={<ClienteApp />} />
                
                <Route path="/ConfiguracoesWhatsApp" element={<ConfiguracoesWhatsApp />} />
                
                <Route path="/Marketplace" element={<Marketplace />} />
                
                <Route path="/Estoque" element={<Estoque />} />
                
                <Route path="/Academy" element={<Academy />} />
                
                <Route path="/ConteudoDetalhe" element={<ConteudoDetalhe />} />
                
                <Route path="/ModoSalao" element={<ModoSalao />} />
                
                <Route path="/CheckInCliente" element={<CheckInCliente />} />
                
                <Route path="/CanalInterativo" element={<CanalInterativo />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/LandingPage" element={<LandingPage />} />
                
                <Route path="/Assinatura" element={<Assinatura />} />
                
                <Route path="/AgendamentoPublico" element={<AgendamentoPublico />} />
                
                <Route path="/Clientes" element={<Clientes />} />
                
                <Route path="/ClienteDetalhe" element={<ClienteDetalhe />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}