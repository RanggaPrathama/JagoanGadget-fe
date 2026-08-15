import { useStore } from "@tanstack/react-store";
import {
  ChevronRight,
  Grid2X2,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldInput } from "@/components/field/FieldInput";
import { FieldSwitch } from "@/components/field/FieldSwitch";
import { FieldTextarea } from "@/components/field/FieldTextarea";
import { ButtonSelect } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AdminFormActions,
  AdminFormHeader,
  FormSkeleton,
} from "@/components/admin";
import { cn } from "@/lib/utils";
import { getMenusList } from "@/features/admin/setup/menu/service/menu.service";
import type { MenuItem } from "@/features/admin/setup/menu/service/menu.service";
import { RoleSummary } from "../components/RoleSummary";
import {
  formValidators,
  useRoleForm,
  type RoleFormValues,
} from "../hooks/useRoleForm";
import { useRolePermissions } from "../hooks/useRolePermissions";

type RoleFormViewProps = {
  roleId?: string;
  mode?: "edit" | "readonly";
};

function getErrorMessage(error: string | { message?: string } | undefined) {
  if (!error) return undefined;
  return typeof error === "string" ? error : error.message;
}

export function RoleFormView({ roleId, mode = "edit" }: RoleFormViewProps) {
  const readonly = mode === "readonly";

  const {
    form,
    isEditMode,
    isSubmitting,
    isLoadingDetail,
    initialMenuIds,
    submitForm,
  } = useRoleForm({ roleId });

  const formValues = useStore(
    form.store,
    (state: { values: RoleFormValues }) => state.values,
  );
  const selectedPermissionIds = formValues.permissionIds ?? [];

  const setPermissionIds = (ids: string[]) => {
    form.setFieldValue("permissionIds", ids);
  };

  const {
    selectedMenuIds,
    setSelectedMenuIds,
    handleMenusChange,
    filteredMenuIds,
    menuSearch,
    setMenuSearch,
    menuPermissionsMap,
    selectedPermissionSet,
    selectedModules,
    isPermissionsLoading,
    togglePermission,
    toggleMenuPermissions,
  } = useRolePermissions({
    selectedPermissionIds,
    setPermissionIds,
    initialMenuIds,
  });

  const removeMenu = (menuId: string) => {
    const group = menuPermissionsMap.get(menuId);
    const permIds = new Set((group?.permissions ?? []).map((p) => p.id));
    setPermissionIds(selectedPermissionIds.filter((id) => !permIds.has(id)));
    setSelectedMenuIds((prev) => prev.filter((id) => id !== menuId));
  };

  const title = readonly
    ? "Detail Role"
    : isEditMode
      ? "Edit Role"
      : "Create New Role";
  const description = readonly
    ? "Melihat detail role dan permission dalam mode baca saja."
    : isEditMode
      ? "Perbarui role dan sesuaikan permission yang diberikan."
      : "Set up a new role and assign its specific access permissions in one step.";

  if (isEditMode && isLoadingDetail) {
    return <FormSkeleton count={2} />;
  }

  return (
    <div className="flex flex-col gap-4 pb-10 lg:gap-5 lg:pb-14">
      <form
        id="role-form"
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void submitForm();
        }}
      >
        <AdminFormHeader
          backTo="/admin/setup/role"
          badge="Access Control"
          title={title}
          description={description}
          readonly={readonly}
          isEditMode={isEditMode}
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          {/* Basic info card — name, code, description, status */}
          <Card className="admin-form-panel overflow-hidden p-0 gap-0">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
              <CardTitle className="text-base">Basic Information</CardTitle>
              <CardDescription>
                Lengkapi identitas role sebelum memilih permission.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 px-5 py-5 sm:px-7 sm:py-7 md:grid-cols-2">
              <form.Field
                name="name"
                validators={{ onChange: formValidators.name }}
              >
                {(field) => (
                  <FieldInput
                    label="Role Name"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    error={getErrorMessage(field.state.meta.errors[0])}
                    placeholder="Inventory Manager"
                    disabled={readonly}
                  />
                )}
              </form.Field>

              <form.Field
                name="code"
                validators={{ onChange: formValidators.code }}
              >
                {(field) => (
                  <FieldInput
                    label="Role Code"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    error={getErrorMessage(field.state.meta.errors[0])}
                    placeholder="INV_MGR"
                    disabled={readonly}
                  />
                )}
              </form.Field>

              <div className="md:col-span-2">
                <form.Field
                  name="description"
                  validators={{ onChange: formValidators.description }}
                >
                  {(field) => (
                    <FieldTextarea
                      label="Description"
                      rows={4}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      error={getErrorMessage(field.state.meta.errors[0])}
                      placeholder="Briefly describe the responsibilities and scope of this role..."
                      disabled={readonly}
                    />
                  )}
                </form.Field>
              </div>

              <div className="md:col-span-2">
                <form.Field
                  name="isActive"
                  validators={{ onChange: formValidators.isActive }}
                >
                  {(field) => (
                    <FieldSwitch
                      label="Role Status"
                      hint="Active roles can be assigned to users immediately."
                      checked={field.state.value ?? false}
                      onCheckedChange={(value) => field.handleChange(value)}
                      error={getErrorMessage(field.state.meta.errors[0])}
                      disabled={readonly}
                      switchLabel={field.state.value ? "Active" : "Inactive"}
                    />
                  )}
                </form.Field>
              </div>
            </CardContent>
          </Card>

          {/* Summary card — shows active status, permission count, and selected modules */}
          <div className="flex flex-col gap-3">
            <RoleSummary
              isActive={formValues.isActive ?? true}
              selectedPermissionIds={selectedPermissionIds}
              selectedModules={selectedModules}
            />
          </div>
        </div>

        {/* Permission Assignment — select menus, then toggle individual permissions per menu */}
        <Card className="admin-form-panel overflow-hidden p-0 gap-0">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-base">
                  Permissions Assignment
                </CardTitle>
                <CardDescription>
                  Pilih menu terlebih dahulu, lalu centang permission yang
                  diperlukan.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {!readonly && (
                  <ButtonSelect<MenuItem>
                    triggerText="Pilih Menu"
                    title="Pilih Menu yang Memiliki Permission"
                    queryKey={["menus"]}
                    queryFn={({ search, page, limit }) =>
                      getMenusList({
                        search,
                        isActive: true,
                        hasPermission: true,
                        page,
                        limit,
                      })
                    }
                    columns={[
                      { header: "Menu", accessorKey: "name" },
                      {
                        header: "Route",
                        accessorKey: "route",
                        cell: (row: MenuItem) => row.route ?? "-",
                      },
                    ]}
                    getRowId={(row: MenuItem) => row.id}
                    value={selectedMenuIds}
                    onChange={handleMenusChange}
                    emptyMessage="Tidak ada menu dengan permission"
                  />
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-5 py-5 sm:px-7 sm:py-7">
            {selectedMenuIds.length === 0 ? (
              <div className="flex min-h-[8rem] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-center">
                <ShieldCheck className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Klik &quot;Pilih Menu&quot; untuk memilih menu yang akan
                  diberikan permission.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Search filter */}
                {selectedMenuIds.length > 1 && (
                  <FieldInput
                    startIcon={<Search className="size-4" />}
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Cari menu..."
                    inputClassName="rounded-xl"
                  />
                )}

                {filteredMenuIds.length === 0 ? (
                  <div className="flex min-h-[6rem] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                    Tidak ada menu yang sesuai dengan pencarian &quot;
                    {menuSearch}&quot;.
                  </div>
                ) : (
                  filteredMenuIds.map((menuId) => {
                    const group = menuPermissionsMap.get(menuId);
                    const menuPerms = group?.permissions ?? [];
                    const menuName = group?.menuName ?? "Unknown Menu";
                    const selectedCount = menuPerms.filter((p) =>
                      selectedPermissionSet.has(p.id),
                    ).length;
                    const allSelected =
                      menuPerms.length > 0 &&
                      menuPerms.every((p) => selectedPermissionSet.has(p.id));

                    return (
                      <Collapsible key={menuId} defaultOpen>
                        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/70">
                          <div className="flex items-center bg-muted/50">
                            <CollapsibleTrigger className="flex flex-1 items-center justify-between px-4 py-3 text-left transition-colors ">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                                  <Grid2X2 className="size-4" />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="truncate text-sm font-semibold text-foreground">
                                    {menuName}
                                  </h3>
                                  {!isPermissionsLoading && (
                                    <p className="text-xs text-muted-foreground">
                                      {selectedCount} / {menuPerms.length}{" "}
                                      permissions
                                    </p>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="size-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-90" />
                            </CollapsibleTrigger>
                            {!readonly && (
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => removeMenu(menuId)}
                                className="mr-3 rounded-lg p-1.5 text-destructive bg-destructive/10 transition-colors hover:bg-destructive/20 hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            )}
                          </div>

                          <CollapsibleContent>
                            {isPermissionsLoading ? (
                              <div className="grid gap-3 p-4 md:grid-cols-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <Skeleton
                                    key={i}
                                    className="h-24 rounded-2xl"
                                  />
                                ))}
                              </div>
                            ) : menuPerms.length === 0 ? (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                Tidak ada permission untuk menu ini.
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center justify-between border-t border-border/50 px-4 py-2">
                                  <span className="text-xs text-muted-foreground">
                                    {selectedCount} / {menuPerms.length} dipilih
                                  </span>
                                  {!readonly && (
                                    <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                                      <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={(checked) =>
                                          toggleMenuPermissions(
                                            menuPerms,
                                            checked === true,
                                          )
                                        }
                                      />
                                      Select All
                                    </label>
                                  )}
                                </div>

                                <div className="grid gap-3 p-4 pt-0 md:grid-cols-2">
                                  {menuPerms.map((permission) => {
                                    const isSelected =
                                      selectedPermissionSet.has(permission.id);

                                    return (
                                      <label
                                        key={permission.id}
                                        className={cn(
                                          "flex min-h-20 items-start gap-3 rounded-2xl border border-border/60 bg-card/80 p-3 transition-colors",
                                          isSelected &&
                                            "border-primary/40 bg-primary/5",
                                          readonly
                                            ? "cursor-not-allowed opacity-75"
                                            : "cursor-pointer hover:bg-muted/60",
                                        )}
                                      >
                                        <Checkbox
                                          checked={isSelected}
                                          disabled={readonly}
                                          onCheckedChange={(checked) =>
                                            togglePermission(
                                              permission.id,
                                              checked === true,
                                            )
                                          }
                                        />
                                        <span className="flex min-w-0 flex-col gap-1">
                                          <span className="text-sm font-semibold text-foreground">
                                            {permission.name}
                                          </span>
                                          <span className="break-all text-xs font-medium text-primary">
                                            {permission.code}
                                          </span>
                                          {permission.description ? (
                                            <span className="line-clamp-2 text-xs text-muted-foreground">
                                              {permission.description}
                                            </span>
                                          ) : null}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sticky Footer */}
        <AdminFormActions
          formId="role-form"
          readonly={readonly}
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
          backTo="/admin/setup/role"
          hint="Pastikan nama, code, dan status role sudah sesuai sebelum disimpan."
          entityLabels={{ create: "Simpan Role", update: "Update Role" }}
          basePermissionCode="setup.role"
        />
      </form>
    </div>
  );
}
