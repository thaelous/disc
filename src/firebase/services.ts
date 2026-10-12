import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { Campaign, Collaborator, Company, DISCScores, DISCArchetype } from '../types';
import { INITIAL_COMPANIES, INITIAL_CAMPAIGNS, INITIAL_COLLABORATORS } from '../data/mockData';

const COLLECTIONS = {
  CAMPAIGNS: 'campanas',
  COLLABORATORS: 'colaboradores',
  COMPANIES: 'empresas'
};

/**
 * Check if the database has any campaigns. If empty, seed initial company,
 * campaign ('DISC-2026-INNOVA') and initial sample collaborators.
 */
export async function seedInitialFirestoreData(): Promise<void> {
  const campaignsRef = collection(db, COLLECTIONS.CAMPAIGNS);
  try {
    const snap = await getDocs(campaignsRef);
    if (!snap.empty) {
      // Already has data
      return;
    }
  } catch (err) {
    console.warn('Checking initial Firestore data error, will attempt seeding:', err);
  }

  try {
    console.log('Seeding initial Firestore database...');

    // 1. Seed initial company
    const defaultCompany = INITIAL_COMPANIES[0];
    await setDoc(doc(db, COLLECTIONS.COMPANIES, defaultCompany.id), {
      ...defaultCompany,
      updatedAt: new Date().toISOString()
    });

    // 2. Seed initial campaign DISC-2026-INNOVA
    const defaultCampaign = INITIAL_CAMPAIGNS[0];
    await setDoc(doc(db, COLLECTIONS.CAMPAIGNS, defaultCampaign.id), {
      ...defaultCampaign,
      updatedAt: new Date().toISOString()
    });

    // Also add secondary demo campaigns for convenience
    for (let i = 1; i < INITIAL_CAMPAIGNS.length; i++) {
      const camp = INITIAL_CAMPAIGNS[i];
      await setDoc(doc(db, COLLECTIONS.CAMPAIGNS, camp.id), {
        ...camp,
        updatedAt: new Date().toISOString()
      });
    }

    // 3. Seed initial collaborators for the default campaign
    const sampleCollabs = INITIAL_COLLABORATORS.slice(0, 9);
    for (const collab of sampleCollabs) {
      await setDoc(doc(db, COLLECTIONS.COLLABORATORS, collab.id), {
        ...collab,
        updatedAt: new Date().toISOString()
      });
    }

    console.log('Firestore initial seeding completed successfully.');
  } catch (err) {
    console.error('Error during initial seeding of Firestore:', err);
  }
}

/**
 * Find campaign directly by access code in Firestore
 */
export async function findCampaignByCode(accessCode: string): Promise<Campaign | null> {
  const normalized = accessCode.trim().toUpperCase();
  const path = COLLECTIONS.CAMPAIGNS;

  try {
    const q = query(collection(db, path), where('accessCode', '==', normalized));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const docData = snapshot.docs[0];
    return {
      ...(docData.data() as Campaign),
      id: docData.id
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Real-time listener for all campaigns
 */
export function subscribeToCampaigns(
  onUpdate: (campaigns: Campaign[]) => void,
  onError?: (err: Error) => void
) {
  const path = COLLECTIONS.CAMPAIGNS;
  return onSnapshot(
    collection(db, path),
    snapshot => {
      const camps: Campaign[] = snapshot.docs.map(d => ({
        ...(d.data() as Campaign),
        id: d.id
      }));
      onUpdate(camps);
    },
    error => {
      console.error('Error in subscribeToCampaigns:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time listener for collaborators of a specific campaign
 */
export function subscribeToCollaborators(
  campaignId: string | null,
  onUpdate: (collaborators: Collaborator[]) => void,
  onError?: (err: Error) => void
) {
  const path = COLLECTIONS.COLLABORATORS;
  
  if (!campaignId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(collection(db, path), where('campaignId', '==', campaignId));

  return onSnapshot(
    q,
    snapshot => {
      const list: Collaborator[] = snapshot.docs.map(d => ({
        ...(d.data() as Collaborator),
        id: d.id
      }));
      onUpdate(list);
    },
    error => {
      console.error('Error in subscribeToCollaborators:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time listener for all collaborators of a company (across all campaigns)
 */
export function subscribeToCollaboratorsByCompany(
  companyId: string | null,
  onUpdate: (collaborators: Collaborator[]) => void,
  onError?: (err: Error) => void
) {
  const path = COLLECTIONS.COLLABORATORS;
  
  if (!companyId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(collection(db, path), where('companyId', '==', companyId));

  return onSnapshot(
    q,
    snapshot => {
      const list: Collaborator[] = snapshot.docs.map(d => ({
        ...(d.data() as Collaborator),
        id: d.id
      }));
      onUpdate(list);
    },
    error => {
      console.error('Error in subscribeToCollaboratorsByCompany:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time listener for companies
 */
export function subscribeToCompanies(
  onUpdate: (companies: Company[]) => void,
  onError?: (err: Error) => void
) {
  const path = COLLECTIONS.COMPANIES;
  return onSnapshot(
    collection(db, path),
    snapshot => {
      const list: Company[] = snapshot.docs.map(d => ({
        ...(d.data() as Company),
        id: d.id
      }));
      onUpdate(list);
    },
    error => {
      console.error('Error in subscribeToCompanies:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Save new collaborator to Firestore in real-time
 */
export async function addCollaboratorToFirestore(
  data: Omit<Collaborator, 'id' | 'status'>
): Promise<string> {
  const path = COLLECTIONS.COLLABORATORS;
  try {
    const docRef = await addDoc(collection(db, path), {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Save test results and update campaign completion counter in Firestore
 */
export async function submitEvaluationToFirestore(params: {
  campaign: Campaign;
  fullName: string;
  email: string;
  department: string;
  role: string;
  scores: DISCScores;
  archetype: DISCArchetype;
  existingCollaboratorId?: string;
}): Promise<void> {
  const nowIso = new Date().toISOString();
  const { campaign, fullName, email, department, role, scores, archetype, existingCollaboratorId } = params;

  // 1. Save or update collaborator record
  try {
    if (existingCollaboratorId) {
      const collabRef = doc(db, COLLECTIONS.COLLABORATORS, existingCollaboratorId);
      await updateDoc(collabRef, {
        fullName,
        department,
        role: role || 'Colaborador',
        status: 'completed',
        completedAt: nowIso,
        scores,
        archetype
      });
    } else {
      // Check if collaborator with email exists in this campaign
      const q = query(
        collection(db, COLLECTIONS.COLLABORATORS),
        where('campaignId', '==', campaign.id),
        where('email', '==', email.trim().toLowerCase())
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const foundDoc = snap.docs[0];
        await updateDoc(foundDoc.ref, {
          fullName,
          department,
          role: role || 'Colaborador',
          status: 'completed',
          completedAt: nowIso,
          scores,
          archetype
        });
      } else {
        await addDoc(collection(db, COLLECTIONS.COLLABORATORS), {
          campaignId: campaign.id,
          companyId: campaign.companyId,
          fullName,
          email: email.trim().toLowerCase(),
          department,
          role: role || 'Colaborador',
          status: 'completed',
          createdAt: nowIso,
          completedAt: nowIso,
          scores,
          archetype
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.COLLABORATORS);
  }

  // 2. Update campaign: activate firstCompletedAt timer if null
  try {
    const campRef = doc(db, COLLECTIONS.CAMPAIGNS, campaign.id);
    const updates: Record<string, any> = {
      updatedAt: nowIso
    };

    if (!campaign.firstCompletedAt) {
      const durationMs = (campaign.durationDays || 15) * 24 * 60 * 60 * 1000;
      updates.firstCompletedAt = nowIso;
      updates.expiresAt = new Date(Date.now() + durationMs).toISOString();
    }

    await updateDoc(campRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, COLLECTIONS.CAMPAIGNS);
  }
}

/**
 * Create new campaign in Firestore
 */
export async function createCampaignInFirestore(
  campaignData: Omit<Campaign, 'id' | 'createdAt' | 'firstCompletedAt' | 'expiresAt'>
): Promise<string> {
  const path = COLLECTIONS.CAMPAIGNS;
  try {
    const docRef = await addDoc(collection(db, path), {
      ...campaignData,
      accessCode: campaignData.accessCode.trim().toUpperCase(),
      createdAt: new Date().toISOString(),
      firstCompletedAt: null,
      expiresAt: null
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Create new company in Firestore
 */
export async function createCompanyInFirestore(
  companyData: Omit<Company, 'id' | 'createdAt'>
): Promise<string> {
  const path = COLLECTIONS.COMPANIES;
  try {
    const docRef = await addDoc(collection(db, path), {
      ...companyData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Delete a campaign and its associated collaborators from Firestore
 */
export async function deleteCampaignFromFirestore(campaignId: string): Promise<void> {
  try {
    // 1. Delete associated collaborators in Firestore
    const collabsQuery = query(
      collection(db, COLLECTIONS.COLLABORATORS),
      where('campaignId', '==', campaignId)
    );
    const snapshot = await getDocs(collabsQuery);
    const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, COLLECTIONS.COLLABORATORS, docSnap.id)));
    await Promise.all(deletePromises);

    // 2. Delete campaign document
    await deleteDoc(doc(db, COLLECTIONS.CAMPAIGNS, campaignId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, COLLECTIONS.CAMPAIGNS);
  }
}
