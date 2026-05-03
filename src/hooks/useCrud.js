import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";
import { toast } from "react-hot-toast";
import { useState } from "react";

export function useCrud(modulePath, queryKey) {
  const queryClient = useQueryClient();
  const [params, setParams] = useState({ page: 1, per_page: 10, q: "" });

  const { data, isLoading, refetch } = useQuery({
    queryKey: [queryKey, params],
    queryFn: async () => {
      const response = await api.get(modulePath, { params });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (newData) => api.post(modulePath, newData),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      toast.success("Berhasil menambahkan data");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menambahkan data");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updatedData }) => api.put(`${modulePath}/${id}`, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      toast.success("Berhasil memperbarui data");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui data");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`${modulePath}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      toast.success("Berhasil menghapus data");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menghapus data");
    },
  });

  return {
    data: data?.data || [],
    pagination: {
      total: data?.metadata?.total_row || 0,
      page: params.page,
      perPage: params.per_page,
    },
    isLoading,
    params,
    setParams,
    createMutation,
    updateMutation,
    deleteMutation,
    refetch,
  };
}
