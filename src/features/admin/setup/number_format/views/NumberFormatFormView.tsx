import {
  AdminFormActions,
  AdminFormHeader,
  FormSkeleton,
} from "@/components/admin";
import { AnimatedContainer } from "@/components/motion";
import { useNumberFormatForm } from "../hooks/useNumberFormatForm";
import { useNumberFormatSegments } from "../hooks/useNumberFormatSegments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FieldInput,
  FieldSelectAsync,
  FieldSwitch,
  getFieldError,
} from "@/components/field";
import {
  getMenusList,
  getMenusListQueryKey,
} from "@/features/admin/setup/menu/service";
import { SegmentsBuilder } from "../components/SegmentsBuilder";

type NumberFormatFormViewProps = {
  numberFormatId?: string;
  mode?: "edit" | "readonly";
};

export const NumberFormatFormView = ({
  numberFormatId,
  mode = "edit",
}: NumberFormatFormViewProps) => {
  const readonly = mode === "readonly";
  const title = readonly
    ? "View Number Format"
    : numberFormatId
      ? "Edit Number Format"
      : "Create Number Format";

  const { isEditMode, form, formValidators, isLoadingDetail, isSubmitting } =
    useNumberFormatForm({ numberFormatId });

  const {
    segments,
    prefixMap,
    handlePrefixesAdded,
    handleSegmentsChange,
    preview,
  } = useNumberFormatSegments({ form });

  if (isEditMode && isLoadingDetail) {
    return <FormSkeleton count={2} />;
  }

  return (
    <div className="flex flex-col gap-4 pb-10 lg:gap-5 lg:pb-14">
      <form
        id="number-format-form"
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          // Handle form submission logic here
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <AdminFormHeader
          badge="Setup"
          title={title}
          description="Manage number format settings for your application."
          backTo="/admin/setup/number-format"
          readonly={readonly}
          isEditMode={isEditMode}
        />

        {/* Basic Information */}
        <AnimatedContainer delay={0}>
        <Card className="admin-form-panel overflow-hidden p-0 gap-0">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
            <CardTitle className="text-base">Basic Information</CardTitle>
            <CardDescription>
              Fill in the basic information for the number format
            </CardDescription>
          </CardHeader>

          <CardContent className="grid md:grid-cols-2 gap-4 px-5 sm:px-7 sm:py-7">
            <form.Field
              name="menuId"
              validators={{
                onBlur: formValidators.menuId,
                onSubmit: formValidators.menuId,
              }}
            >
              {(field) => (
                <FieldSelectAsync
                  label="Menu"
                  disabled={readonly}
                  placeholder="Select a menu"
                  value={field.state.value ?? ""}
                  onValueChange={(value: string) => field.handleChange(value)}
                  error={getFieldError(field.state.meta)}
                  queryKey={getMenusListQueryKey()}
                  queryFn={(params) =>
                    getMenusList({ search: params?.search }).then(
                      (r) => r.items,
                    )
                  }
                  mapOption={(menu) => ({
                    label: `${menu.name} (${menu.code})`,
                    value: menu.id,
                  })}
                  serverSearch
                  queryErrorMessage="Failed to load menus."
                />
              )}
            </form.Field>

            <FieldInput
              label="Preview"
              readOnly
              value={preview ?? ""}
              placeholder="Preview akan muncul setelah menambahkan segmen"
              disabled={readonly}
              className="font-mono"
            />

            <form.Field
              name="isActive"
              validators={{
                onBlur: formValidators.isActive,
                onSubmit: formValidators.isActive,
              }}
            >
              {(field) => (
                <FieldSwitch
                  label="Status"
                  hint="Number format aktif dapat digunakan untuk penomoran."
                  checked={field.state.value ?? false}
                  onCheckedChange={(value) => field.handleChange(value)}
                  error={getFieldError(field.state.meta)}
                  disabled={readonly}
                  switchLabel={field.state.value ? "Active" : "Inactive"}
                />
              )}
            </form.Field>
          </CardContent>
        </Card>
        </AnimatedContainer>

        {/* Segments Builder */}
        <AnimatedContainer delay={0.05}>
        <Card className="admin-form-panel overflow-hidden p-0 gap-0">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
            <CardTitle className="text-base">Segments</CardTitle>
            <CardDescription>
              Pilih prefix dan atur urutan segmen penomoran.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-5 py-5 sm:px-7 sm:py-7">
            <SegmentsBuilder
              segments={segments}
              prefixMap={prefixMap}
              readonly={readonly}
              onSegmentsChange={handleSegmentsChange}
              onPrefixesAdded={handlePrefixesAdded}
            />
          </CardContent>
        </Card>
        </AnimatedContainer>

        <AdminFormActions
          formId="number-format-form"
          readonly={readonly}
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
          backTo="/admin/setup/number-format"
          hint="Pastikan number format dan segments sudah sesuai sebelum disimpan."
          disabled={readonly || isSubmitting}
          basePermissionCode="setup.number-format"
        />
      </form>
    </div>
  );
};
