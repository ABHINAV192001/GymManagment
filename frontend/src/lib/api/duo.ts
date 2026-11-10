import { fetchWithAuth } from './client';
import { CreateDuoChallengeRequest, DuoChallenge, DuoPartnership, DuoWhatsAppInvite } from '../../types/duo';

export async function sendPartnerInvite(addresseeUsernameOrEmail: string): Promise<DuoPartnership> {
  const res = await fetchWithAuth('/api/v1/duo/partners/invite', {
    method: 'POST',
    body: JSON.stringify({ addresseeUsernameOrEmail }),
  });
  return res.data;
}

export async function generateWhatsAppInvite(originUrl?: string): Promise<DuoWhatsAppInvite> {
  const res = await fetchWithAuth('/api/v1/duo/partners/generate-whatsapp-link', {
    method: 'POST',
    body: JSON.stringify({ originUrl: originUrl || window.location.origin }),
  });
  return res.data;
}

export async function claimDuoInviteCode(inviteCode: string): Promise<DuoPartnership> {
  const res = await fetchWithAuth('/api/v1/duo/partners/claim-invite', {
    method: 'POST',
    body: JSON.stringify({ inviteCode }),
  });
  return res.data;
}

export async function acceptPartnerInvite(partnershipId: string): Promise<DuoPartnership> {
  const res = await fetchWithAuth(`/api/v1/duo/partners/${partnershipId}/accept`, {
    method: 'POST',
  });
  return res.data;
}

export async function getMyPartner(): Promise<DuoPartnership | null> {
  const res = await fetchWithAuth('/api/v1/duo/partners/my-partner', {
    method: 'GET',
  });
  return res.data;
}

export async function getPendingInvites(): Promise<DuoPartnership[]> {
  const res = await fetchWithAuth('/api/v1/duo/partners/pending-invites', {
    method: 'GET',
  });
  return res.data || [];
}

export async function createDuoChallenge(payload: CreateDuoChallengeRequest): Promise<DuoChallenge> {
  const res = await fetchWithAuth('/api/v1/duo/challenges', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function joinDuoChallengeByCode(inviteCode: string): Promise<DuoChallenge> {
  const res = await fetchWithAuth('/api/v1/duo/challenges/join-code', {
    method: 'POST',
    body: JSON.stringify({ inviteCode }),
  });
  return res.data;
}

export async function getActiveChallenges(): Promise<DuoChallenge[]> {
  const res = await fetchWithAuth('/api/v1/duo/challenges/active', {
    method: 'GET',
  });
  return res.data || [];
}

export async function settleChallengePrize(challengeId: string): Promise<DuoChallenge> {
  const res = await fetchWithAuth('/api/v1/duo/challenges/settle-prize', {
    method: 'POST',
    body: JSON.stringify({ challengeId }),
  });
  return res.data;
}

export async function deleteDuoChallenge(challengeId: string): Promise<void> {
  await fetchWithAuth(`/api/v1/duo/challenges/${challengeId}`, {
    method: 'DELETE',
  });
}

export async function updateDuoChallenge(challengeId: string, payload: CreateDuoChallengeRequest): Promise<DuoChallenge> {
  const res = await fetchWithAuth(`/api/v1/duo/challenges/${challengeId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function removeParticipantFromChallenge(challengeId: string, participantUserId: string): Promise<DuoChallenge> {
  const res = await fetchWithAuth(`/api/v1/duo/challenges/${challengeId}/participants/${participantUserId}`, {
    method: 'DELETE',
  });
  return res.data;
}

export async function removeDuoPartnership(partnershipId: string): Promise<void> {
  await fetchWithAuth(`/api/v1/duo/partners/${partnershipId}`, {
    method: 'DELETE',
  });
}

export async function logDuoEvent(eventType: string, description?: string, targetUserId?: string): Promise<void> {
  await fetchWithAuth('/api/v1/duo/events/log', {
    method: 'POST',
    body: JSON.stringify({ eventType, description, targetUserId }),
  });
}
