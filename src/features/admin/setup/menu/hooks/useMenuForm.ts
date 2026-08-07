import { useEffect, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import type { FieldOption } from "@/components/field/types";
import { getErrorMessage } from "@/utils/error";
import {
  createMenu,
  generateMenuCode,
  getMenuById,
  getMenusList,
  updateMenu,
  type MenuPayload,
} from "../service/menu.service";
import { menuListQueryKey } from "./useMenuList";
import { invalidateMe } from "@/features/auth/service/me.service";

const nullableTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .refine((value) => value === null || value.length <= maxLength, {
      message: `Maksimal ${maxLength} karakter.`,
    });

const menuFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama menu wajib diisi.")
    .max(100, "Maksimal 100 karakter."),
  code: z.string().trim().max(100, "Maksimal 100 karakter."),
  route: nullableTrimmedString(255),
  iconName: nullableTrimmedString(100),
  sortOrder: z
    .number()
    .min(0, "Sort order tidak boleh kurang dari 0.")
    .default(0),
  isActive: z.boolean().default(true),
  type: z.enum(["menu", "group"]).default("menu"),
  parentId: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .nullable(),
});

type MenuFormValues = z.input<typeof menuFormSchema>;

const defaultValues: MenuFormValues = {
  name: "",
  code: "",
  route: "",
  iconName: "",
  sortOrder: 0,
  isActive: true,
  type: "menu",
  parentId: "",
};

export const formValidators = {
  name: menuFormSchema.shape.name,
  code: menuFormSchema.shape.code,
  route: menuFormSchema.shape.route,
  iconName: menuFormSchema.shape.iconName,
  sortOrder: menuFormSchema.shape.sortOrder,
  isActive: menuFormSchema.shape.isActive,
  type: menuFormSchema.shape.type,
  parentId: menuFormSchema.shape.parentId,
};

type UseMenuFormOptions = {
  menuId?: string;
};

function toPayload(values: MenuFormValues): MenuPayload {
  const parsed = menuFormSchema.parse(values);

  return {
    name: parsed.name,
    code: parsed.code,
    route: parsed.route,
    iconName: parsed.iconName,
    sortOrder: parsed.sortOrder,
    isActive: parsed.isActive,
    type: parsed.type,
    parentId: parsed.parentId,
  };
}

function buildSignature(name: string, parentId: string | null | undefined) {
  return `${name.trim()}::${parentId ?? ""}`;
}

export function useMenuForm({ menuId }: UseMenuFormOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(menuId);
  const skipNextGenerateRef = useRef(isEditMode);
  const generateRequestIdRef = useRef(0);
  const lastGeneratedSignatureRef = useRef("");

  const menusQuery = useQuery({
    queryKey: menuListQueryKey,
    queryFn: () => getMenusList(),
  });

  const menuDetailQuery = useQuery({
    queryKey: [...menuListQueryKey, menuId],
    queryFn: () => getMenuById(menuId as string),
    enabled: isEditMode,
  });

  const mutation = useMutation({
    mutationFn: async (values: MenuFormValues) => {
      const trimmedName = values.name.trim();
      const normalizedParentId = values.parentId || null;
      const signature = buildSignature(trimmedName, normalizedParentId);

      let payloadValues = values;

      if (
        !values.code.trim() ||
        lastGeneratedSignatureRef.current !== signature
      ) {
        const generated = await generateMenuCode({
          name: trimmedName,
          parentId: normalizedParentId,
        });

        payloadValues = {
          ...values,
          code: generated.code,
          route: generated.route,
        };
        lastGeneratedSignatureRef.current = signature;
        form.setFieldValue("code", generated.code);
        form.setFieldValue("route", generated.route);
      }

      const payload = toPayload(payloadValues);

      if (isEditMode && menuId) {
        return updateMenu(menuId, payload);
      }

      return createMenu(payload);
    },
    onSuccess: async () => {
      toast.success(
        isEditMode ? "Menu berhasil diperbarui." : "Menu berhasil ditambahkan.",
      );
      await queryClient.invalidateQueries({ queryKey: menuListQueryKey });

      if (menuId) {
        await queryClient.invalidateQueries({
          queryKey: [...menuListQueryKey, menuId],
        });
      }

      await invalidateMe(queryClient);
      void navigate({ to: "/admin/setup/menu" });
    },
    onError: (error) => {
      const msg = getErrorMessage(
        error,
        isEditMode ? "Gagal memperbarui menu." : "Gagal menambahkan menu.",
      );
      toast.error(msg, { id: msg });
    },
  });

  const generateCodeMutation = useMutation({
    mutationFn: generateMenuCode,
    onError: (error) => {
      const msg = getErrorMessage(
        error,
        "Gagal membuat kode menu secara otomatis.",
      );
      toast.error(msg, { id: msg });
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  const generateCode = generateCodeMutation.mutateAsync;
  const formSignature = useStore(
    form.store,
    (state: { values: MenuFormValues }) =>
      buildSignature(state.values.name ?? "", state.values.parentId ?? null),
  );

  useEffect(() => {
    if (!menuDetailQuery.data) {
      return;
    }

    const data = menuDetailQuery.data;
    form.setFieldValue("name", data.name ?? "");
    form.setFieldValue("code", data.code ?? "");
    form.setFieldValue("route", data.route ?? "");
    form.setFieldValue("iconName", data.iconName ?? "");
    form.setFieldValue("sortOrder", data.sortOrder ?? 0);
    form.setFieldValue("isActive", data.isActive ?? true);
    const resolvedType =
      data.type === "menu" || data.type === "group" ? data.type : ("menu" as const);
    form.setFieldValue("type", resolvedType);
    form.setFieldValue("parentId", data.parentId ?? "");

    lastGeneratedSignatureRef.current = buildSignature(
      data.name ?? "",
      data.parentId ?? null,
    );
    skipNextGenerateRef.current = true;
  }, [form, menuDetailQuery.data]);

  useEffect(() => {
    if (skipNextGenerateRef.current) {
      skipNextGenerateRef.current = false;
      return;
    }

    const [name, parentId] = formSignature.split("::");
    const trimmedName = name.trim();

    if (!trimmedName) {
      lastGeneratedSignatureRef.current = "";
      return;
    }

    const signature = buildSignature(trimmedName, parentId || null);

    if (signature === lastGeneratedSignatureRef.current) {
      return;
    }

    const requestId = generateRequestIdRef.current + 1;
    generateRequestIdRef.current = requestId;

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await generateCode({
          name: trimmedName,
          parentId: parentId || null,
        });

        console.log(`test ${generateRequestIdRef.current} ${requestId}`);
        if (generateRequestIdRef.current !== requestId) {
          return;
        }

        form.setFieldValue("code", result.code);
        form.setFieldValue("route", result.route);
        lastGeneratedSignatureRef.current = signature;
      } catch {
        // Error toast handled by mutation; keep the last valid code value.
      }
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [form, formSignature, generateCode]);

  const rawMenus = menusQuery.data?.items ?? [];

  const parentOptions: FieldOption[] = [
    { label: "Tidak Ada", value: "" },
    ...rawMenus
      .filter((menu) => menu.id !== menuId)
      .map((menu) => ({
        label: `${menu.name} (${menu.code})`,
        value: menu.id,
      })),
  ];


  return {
    form,
    isEditMode,
    isGeneratingCode: generateCodeMutation.isPending,
    isSubmitting: mutation.isPending,
    isLoadingDetail: menuDetailQuery.isLoading,
    parentOptions,
    parentOptionsLoading: menusQuery.isLoading,
  };
}
