import {
  FieldInput,
  FieldTextarea,
  FieldSwitch,
  FieldSelectAsync,
  FieldSelectAdd,
  getFieldError,
} from "@/components/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AdminFormActions,
  AdminFormHeader,
  FormSkeleton,
} from "@/components/admin";
import { AnimatedContainer } from "@/components/motion";
import { formValidators, useProductForm } from "../hooks/useProductForm";
import { SkusBuilder } from "../components/SkusBuilder";
import { getCategoriesList } from "@/features/admin/category/service/index";
import { getBrandsList, createBrand } from "@/features/admin/brand/service/index";

type ProductFormViewProps = {
  productId?: string;
  mode?: "edit" | "readonly";
};

export function ProductFormView({
  productId,
  mode = "edit",
}: ProductFormViewProps) {
  const readonly = mode === "readonly";
  const { form, isEditMode, isSubmitting, isLoadingDetail } = useProductForm({
    productId,
  });

  const title = readonly
    ? "Detail Produk"
    : isEditMode
      ? "Edit Produk"
      : "Create Produk";
  const description = readonly
    ? "Melihat detail produk dalam mode baca saja. Tidak ada perubahan yang dapat dilakukan."
    : isEditMode
      ? "Perbarui informasi produk. Catatan: varian / SKU tidak dapat diubah melalui edit — hanya kolom informasi produk yang diperbarui."
      : "Tambahkan produk baru beserta varian (SKU), harga, dan attribute-nya.";

  if (isEditMode && isLoadingDetail) {
    return <FormSkeleton />;
  }

  return (
    <div className="space-y-4 pb-10 lg:space-y-5 lg:pb-14">
      <form
        id="product-form"
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        {/* Header section: back button, badge, title, description, and edit/readonly indicators. */}
        <AdminFormHeader
          backTo="/admin/master/products"
          badge="Product Setup"
          title={title}
          description={description}
          readonly={readonly}
          isEditMode={isEditMode}
        />

        {/* Form card: "Informasi Produk" section with name, category, brand, description, and status fields. */}
        <AnimatedContainer>
          <Card className="admin-form-panel overflow-hidden p-0 gap-0">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
              <CardTitle className="text-base">Informasi Produk</CardTitle>
              <CardDescription className="text-sm">
                Lengkapi identitas produk. Kategori wajib dipilih, brand opsional.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 px-5 py-5 sm:px-7 sm:py-7 mb-5 md:grid-cols-2">
              {/* Product name (max 150). */}
              <div className="md:col-span-2">
                <form.Field
                  name="name"
                  validators={{ onBlur: formValidators.name, onSubmit: formValidators.name }}
                >
                  {(field) => (
                    <FieldInput
                      label="Nama Produk"
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      error={getFieldError(field.state.meta)}
                      placeholder="ASUS Zenbook 14 OLED (UX3405)"
                      disabled={readonly}
                    />
                  )}
                </form.Field>
              </div>

              {/* Category — required, searchable select. */}
              <form.Field
                name="categoryId"
                validators={{ onBlur: formValidators.categoryId, onSubmit: formValidators.categoryId }}
              >
                {(field) => (
                  <div className="md:col-span-1">
                    <FieldSelectAsync
                      label="Kategori"
                      required
                      searchable
                      placeholder="Pilih kategori..."
                      value={field.state.value || null}
                      disabled={readonly}
                      onValueChange={(value) => field.handleChange(value)}
                      error={getFieldError(field.state.meta)}
                      queryKey={["categories"]}
                      queryFn={async ({
                        search = "",
                      }: { search?: string } = {}) => {
                        const { items } = await getCategoriesList({
                          search,
                          limit: 100,
                        });
                        return items;
                      }}
                      mapOption={(cat) => ({ label: cat.name, value: cat.id })}
                    />
                  </div>
                )}
              </form.Field>

              {/* Brand — optional, searchable select with inline add. */}
              <form.Field
                name="brandId"
                validators={{ onBlur: formValidators.brandId, onSubmit: formValidators.brandId }}
              >
                {(field) => (
                  <div className="md:col-span-1">
                    <FieldSelectAdd
                      label="Brand"
                      searchable
                      placeholder="Pilih brand..."
                      value={field.state.value || null}
                      disabled={readonly}
                      onValueChange={(value) => field.handleChange(value)}
                      error={getFieldError(field.state.meta)}
                      queryKey={["brands"]}
                      queryFn={async ({
                        search = "",
                      }: { search?: string } = {}) => {
                        const { items } = await getBrandsList({
                          search,
                          limit: 25,
                        });
                        return items;
                      }}
                      mapOption={(brand) => ({
                        label: brand.name,
                        value: brand.id,
                      })}
                      createFn={(input) =>
                        createBrand({ name: input, logoUrl: null }).then(
                          (r) => r!,
                        )
                      }
                      createLabel="+ Tambah"
                      onCreated={(item) => field.handleChange(item.id)}
                    />
                  </div>
                )}
              </form.Field>

              {/* Description — optional, multi-line. */}
              <div className="md:col-span-2">
                <form.Field
                  name="description"
                  validators={{
                    onBlur: formValidators.description,
                    onSubmit: formValidators.description,
                  }}
                >
                  {(field) => (
                    <FieldTextarea
                      label="Deskripsi"
                      rows={4}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      error={getFieldError(field.state.meta)}
                      placeholder="Deskripsi singkat produk..."
                      disabled={readonly}
                    />
                  )}
                </form.Field>
              </div>

              {/* Status — whether the product is active/selectable. */}
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
                    checked={field.state.value ?? false}
                    onCheckedChange={(value) => field.handleChange(value)}
                    error={getFieldError(field.state.meta)}
                    disabled={readonly}
                    switchLabel={field.state.value ? "Aktif" : "Non-Aktif"}
                  />
                )}
              </form.Field>
            </CardContent>
          </Card>
        </AnimatedContainer>

        {/* Variants / SKU matrix section */}
        <AnimatedContainer delay={0.15}>
          <Card className="admin-form-panel overflow-hidden p-0 gap-0">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
              <CardTitle className="text-base">Variants / SKU</CardTitle>
              <CardDescription className="text-sm">
                {isEditMode
                  ? "Tampilan hanya-baca. Edit produk tidak mengubah daftar varian."
                  : "Tambahkan varian produk. Setiap varian punya SKU code, nama, harga, dan attribute."}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-5 py-5 sm:px-7 sm:py-7">
              <SkusBuilder form={form} readonly={readonly || isEditMode} />
            </CardContent>
          </Card>
        </AnimatedContainer>

        {/* Render form values so the store subscription stays alive for child builders. */}
        <form.Subscribe selector={(state) => state.values}>
          {() => null}
        </form.Subscribe>

        <AdminFormActions
          formId="product-form"
          readonly={readonly}
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
          backTo="/admin/master/products"
          hint="Pastikan nama, kategori, dan minimal satu varian SKU sudah terisi sebelum disimpan."
          basePermissionCode="product"
        />
      </form>
    </div>
  );
}
