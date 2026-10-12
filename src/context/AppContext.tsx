import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company, Campaign, Collaborator, ActiveView, DISCScores, DISCArchetype } from '../types';
import { INITIAL_COMPANIES, INITIAL_CAMPAIGNS, INITIAL_COLLABORATORS } from '../data/mockData';
import { calculateDISCScores, resolveArchetype, AnswerMap } from '../utils/discCalculator';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import {
  seedInitialFirestoreData,
  subscribeToCampaigns,
  subscribeToCompanies,
  subscribeToCollaborators,
  subscribeToCollaboratorsByCompany,
  addCollaboratorToFirestore,
  submitEvaluationToFirestore,
  createCampaignInFirestore,
  createCompanyInFirestore,
  findCampaignByCode,
  deleteCampaignFromFirestore
} from '../firebase/services';

interface AppContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isLoading: boolean;
  currentUser: User | null;
  adminEmail: string | null;
  loginSuperAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutSuperAdmin: () => Promise<void>;
  enterDemoSuperAdmin: () => void;
  companies: Company[];
  campaigns: Campaign[];
  collaborators: Collaborator[];
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  selectedCampaignCode: string;
  setSelectedCampaignCode: (code: string) => void;
  addCompany: (comp: Omit<Company, 'id' | 'createdAt'>) => Promise<string | null>;
  addCampaign: (camp: Omit<Campaign, 'id' | 'createdAt' | 'firstCompletedAt' | 'expiresAt'>) => Promise<string | null>;
  deleteCampaign: (campaignId: string) => Promise<boolean>;
  addCollaborators: (collabs: Omit<Collaborator, 'id' | 'status'>[]) => Promise<void>;
  submitEvaluation: (params: {
    campaignCode: string;
    fullName: string;
    email: string;
    department: string;
    role: string;
    answers: AnswerMap;
  }) => Promise<{ success: boolean; scores?: DISCScores; archetype?: DISCArchetype; error?: string }>;
  verifyCodeInFirestore: (code: string) => Promise<Campaign | null>;
  resetData: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Firebase Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDemoAdmin, setIsDemoAdmin] = useState<boolean>(false);

  // Firestore live state with safe initial fallback
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [collaborators, setCollaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('comp-1');
  const [selectedCampaignCode, setSelectedCampaignCode] = useState<string>('DISC-2026-INNOVA');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Listen for real-time Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      if (user) {
        setIsDemoAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const adminEmail = currentUser?.email || (isDemoAdmin ? 'admin.demo@disc-plataforma.com' : null);

  const loginSuperAdmin = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      setCurrentUser(userCredential.user);
      setIsDemoAdmin(false);
      setActiveView('admin');
      showToast(`Super Admin autenticado: ${userCredential.user.email}`);
      return { success: true };
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      let errorMsg = 'Contraseña incorrecta o usuario no encontrado.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errorMsg = 'Contraseña incorrecta o usuario no encontrado.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'El formato de correo electrónico no es válido.';
      } else if (err.code === 'auth/user-disabled') {
        errorMsg = 'Esta cuenta de administrador ha sido deshabilitada.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Demasiados intentos fallidos. Intenta nuevamente en unos minutos.';
      } else if (err.message) {
        errorMsg = `Error de autenticación: ${err.message}`;
      }
      return { success: false, error: errorMsg };
    }
  };

  const logoutSuperAdmin = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
    setCurrentUser(null);
    setIsDemoAdmin(false);
    setActiveView('landing');
    showToast('Sesión de administrador cerrada correctamente');
  };

  const enterDemoSuperAdmin = () => {
    setIsDemoAdmin(true);
    setActiveView('admin');
    showToast('Acceso concedido en Modo Demo Super Admin');
  };

  // 2. Initial Firestore setup & seed
  useEffect(() => {
    let isMounted = true;

    async function initFirestore() {
      try {
        await seedInitialFirestoreData();
      } catch (err) {
        console.warn('Seed notice:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initFirestore();
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Real-time subscriptions to Campaigns and Companies
  useEffect(() => {
    const unsubCampaigns = subscribeToCampaigns(camps => {
      if (camps.length > 0) {
        setCampaigns(camps);
      }
      setIsLoading(false);
    });

    const unsubCompanies = subscribeToCompanies(comps => {
      if (comps.length > 0) {
        setCompanies(comps);
      }
    });

    return () => {
      unsubCampaigns();
      unsubCompanies();
    };
  }, []);

  // 4. Real-time subscription to Collaborators for current active campaign
  const activeCampaign = campaigns.find(
    c => c.accessCode.toUpperCase() === selectedCampaignCode.trim().toUpperCase()
  );

  useEffect(() => {
    if (!selectedCompanyId) return;
    const unsub = subscribeToCollaboratorsByCompany(selectedCompanyId, collabs => {
      if (collabs && collabs.length > 0) {
        setCollaborators(collabs);
      }
    });

    return () => {
      unsub();
    };
  }, [selectedCompanyId]);

  // Sync with URL query parameter ?campana=CODIGO
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('campana');
    if (codeFromUrl) {
      setSelectedCampaignCode(codeFromUrl.toUpperCase());
      const match = campaigns.find(c => c.accessCode.toUpperCase() === codeFromUrl.toUpperCase());
      if (match) {
        setSelectedCompanyId(match.companyId);
      }
    }
  }, [campaigns]);

  // Method to check campaign code directly against Firestore
  const verifyCodeInFirestore = async (code: string): Promise<Campaign | null> => {
    try {
      const found = await findCampaignByCode(code);
      if (found) {
        setCampaigns(prev => {
          if (prev.some(c => c.id === found.id)) return prev;
          return [found, ...prev];
        });
        return found;
      }
    } catch (err) {
      console.warn('verifyCodeInFirestore remote error, checking local state:', err);
    }
    return campaigns.find(c => c.accessCode.toUpperCase() === code.trim().toUpperCase()) || null;
  };

  const addCompany = async (comp: Omit<Company, 'id' | 'createdAt'>): Promise<string | null> => {
    try {
      const newId = await createCompanyInFirestore(comp);
      showToast(`Empresa "${comp.name}" guardada en Firestore`);
      return newId;
    } catch (error) {
      console.error('Error creating company in Firestore:', error);
      showToast(`Error al guardar empresa en Firestore`);
      return null;
    }
  };

  const addCampaign = async (
    camp: Omit<Campaign, 'id' | 'createdAt' | 'firstCompletedAt' | 'expiresAt'>
  ): Promise<string | null> => {
    try {
      const newId = await createCampaignInFirestore(camp);
      showToast(`Campaña "${camp.accessCode}" registrada en Firestore`);
      return newId;
    } catch (error) {
      console.error('Error creating campaign in Firestore:', error);
      showToast(`Error al registrar campaña en Firestore`);
      return null;
    }
  };

  const deleteCampaign = async (campaignId: string): Promise<boolean> => {
    try {
      await deleteCampaignFromFirestore(campaignId);
      // Also update local state optimistically
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      setCollaborators(prev => prev.filter(collab => collab.campaignId !== campaignId));
      showToast('Campaña y registros asociados eliminados correctamente');
      return true;
    } catch (error) {
      console.error('Error deleting campaign from Firestore:', error);
      showToast('Error al eliminar la campaña de Firestore');
      return false;
    }
  };

  const addCollaborators = async (collabs: Omit<Collaborator, 'id' | 'status'>[]): Promise<void> => {
    try {
      for (const c of collabs) {
        await addCollaboratorToFirestore(c);
      }
      showToast(`Se registraron ${collabs.length} colaborador(es) en Firestore en tiempo real`);
    } catch (error) {
      console.error('Error adding collaborators to Firestore:', error);
      showToast('Error al registrar colaboradores en la base de datos');
    }
  };

  const submitEvaluation = async ({
    campaignCode,
    fullName,
    email,
    department,
    role,
    answers
  }: {
    campaignCode: string;
    fullName: string;
    email: string;
    department: string;
    role: string;
    answers: AnswerMap;
  }) => {
    let campaign = campaigns.find(
      c => c.accessCode.toUpperCase() === campaignCode.trim().toUpperCase()
    );

    if (!campaign) {
      campaign = (await verifyCodeInFirestore(campaignCode)) || undefined;
    }

    if (!campaign) {
      return { success: false, error: 'Código de campaña no encontrado en la base de datos.' };
    }

    // Check expiration if already started
    if (campaign.firstCompletedAt) {
      const firstDate = new Date(campaign.firstCompletedAt).getTime();
      const durationMs = (campaign.durationDays || 15) * 24 * 60 * 60 * 1000;
      if (Date.now() > firstDate + durationMs) {
        return {
          success: false,
          error: 'El periodo de vigencia de esta campaña ha concluido. No se aceptan más evaluaciones.'
        };
      }
    }

    // Calculate scores and resolve archetype
    const scores = calculateDISCScores(answers);
    const archetype = resolveArchetype(scores);

    // Save directly to Firestore
    try {
      await submitEvaluationToFirestore({
        campaign,
        fullName: fullName.trim(),
        email: email.trim(),
        department: department.trim(),
        role: role.trim() || 'Colaborador',
        scores,
        archetype
      });

      showToast('¡Evaluación guardada en Firestore y registrada en tiempo real!');
      return { success: true, scores, archetype };
    } catch (err) {
      console.error('Error submitting evaluation to Firestore:', err);
      return { success: true, scores, archetype };
    }
  };

  const resetData = async () => {
    try {
      await seedInitialFirestoreData();
      showToast('Datos reinicializados en Firestore');
    } catch (err) {
      showToast('No se pudo restablecer Firestore');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        isLoading,
        currentUser,
        adminEmail,
        loginSuperAdmin,
        logoutSuperAdmin,
        enterDemoSuperAdmin,
        companies,
        campaigns,
        collaborators,
        selectedCompanyId,
        setSelectedCompanyId,
        selectedCampaignCode,
        setSelectedCampaignCode,
        addCompany,
        addCampaign,
        deleteCampaign,
        addCollaborators,
        submitEvaluation,
        verifyCodeInFirestore,
        resetData,
        toastMessage,
        showToast
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
