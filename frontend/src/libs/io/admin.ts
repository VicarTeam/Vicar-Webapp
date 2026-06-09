import { del, get, patch, put } from "@/libs/io/rest"

/** Client für die Admin-Endpunkte (/admin/*). Nur für Admins erreichbar (Backend erzwingt 403). */

export interface AdminUser {
  id: string
  username: string
  discordId: string
  isAdmin: boolean
  characterCount: number
}

export interface AdminCharacterSummary {
  id: string
  name?: string
  game?: string
  avatar?: string
}

export async function listUsers(): Promise<AdminUser[]> {
  const [status, data] = await get<AdminUser[]>("/admin/users")
  return status === 200 ? data : []
}

export async function getUserCharacters(userId: string): Promise<AdminCharacterSummary[]> {
  const [status, data] = await get<AdminCharacterSummary[]>(`/admin/users/${userId}/characters`)
  return status === 200 ? data : []
}

export async function getCharacter(id: string): Promise<any | null> {
  const [status, data] = await get<any>(`/admin/characters/${id}`)
  return status === 200 ? data : null
}

export function saveCharacter(id: string, data: any): Promise<[number, any]> {
  return put(`/admin/characters/${id}`, data)
}

export function setUserAdmin(id: string, isAdmin: boolean): Promise<[number, any]> {
  return patch(`/admin/users/${id}`, { isAdmin })
}

export function deleteCharacter(id: string): Promise<[number, any]> {
  return del(`/admin/characters/${id}`)
}

export function deleteUser(id: string): Promise<[number, any]> {
  return del(`/admin/users/${id}`)
}
