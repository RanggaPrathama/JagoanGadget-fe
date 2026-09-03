import { api } from "@/lib/axios";
import { unwrapData, unwrapPaginated } from "@/lib/api-response";
import type { ApiResponse, PaginatedResponse } from "@/lib/api-response";
import type { UserEntity, UserFormInput, UserStats } from "../types";

export async function getUsers(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const response = await api.get<PaginatedResponse<UserEntity>>("admin/users", {
    params,
  });
  return unwrapPaginated<UserEntity>(response.data);
}

export async function getUser(id: string) {
  const response = await api.get<ApiResponse<UserEntity>>(`admin/users/${id}`);
  return unwrapData<UserEntity>(response.data);
}

export async function createUser(data: UserFormInput) {
  const response = await api.post<ApiResponse<UserEntity>>("admin/users", data);
  return unwrapData<UserEntity>(response.data);
}

export async function updateUser(id: string, data: UserFormInput) {
  const response = await api.put<ApiResponse<UserEntity>>(
    `admin/users/${id}`,
    data,
  );
  return unwrapData<UserEntity>(response.data);
}

export async function deleteUser(id: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(
    `admin/users/${id}`,
  );
  return unwrapData<{ success?: boolean }>(response.data);
}

export async function getStatisticsUser(){
  const response = await api.get<ApiResponse<UserStats>>("admin/users/statistics");
  return unwrapData<UserStats>(response.data);
}
