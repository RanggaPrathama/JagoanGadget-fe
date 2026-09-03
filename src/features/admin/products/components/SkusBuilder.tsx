import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FieldInput, FieldSelectAdd } from "@/components/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@tanstack/react-store";
import { getAttributesList, createAttribute } from "../service/index";
import { defaultSku, type ProductFormValues } from "../hooks/useProductForm";

type SkusBuilderProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TanStack Form generics are too complex to type narrowly
  form: any;
  readonly?: boolean;
};

// Builder managing the nested SKU matrix (variants + per-SKU attribute values).
// Rows are stored in the form store as `values.skus` and mutated immutably here.
function SkusBuilder({ form, readonly = false }: SkusBuilderProps) {
  const skus: ProductFormValues["skus"] = useStore(
    form.store,
    (state: { values: ProductFormValues }) => state.values.skus,
  );

  const setSkus = (next: ProductFormValues["skus"]) =>
    form.setFieldValue("skus", next);

  const addSku = () => setSkus([...skus, { ...defaultSku }]);

  const removeSku = (index: number) =>
    setSkus(skus.filter((_, i) => i !== index));

  const patchSku = (
    index: number,
    patch: Partial<ProductFormValues["skus"][number]>,
  ) =>
    setSkus(
      skus.map((sku, i) => (i === index ? { ...sku, ...patch } : sku)),
    );

  const addAttributeValue = (skuIndex: number) =>
    patchSku(skuIndex, {
      attributeValues: [
        ...(skus[skuIndex]?.attributeValues ?? []),
        { attributeId: "", value: "" },
      ],
    });

  const patchAttributeValue = (
    skuIndex: number,
    avIndex: number,
    patch: Partial<{ attributeId: string; value: string }>,
  ) =>
    setSkus(
      skus.map((sku, i) =>
        i === skuIndex
          ? {
              ...sku,
              attributeValues: (sku.attributeValues ?? []).map((av, j) =>
                j === avIndex ? { ...av, ...patch } : av,
              ),
            }
          : sku,
      ),
    );

  const removeAttributeValue = (skuIndex: number, avIndex: number) =>
    setSkus(
      skus.map((sku, i) =>
        i === skuIndex
          ? {
              ...sku,
              attributeValues: (sku.attributeValues ?? []).filter(
                (_, j) => j !== avIndex,
              ),
            }
          : sku,
      ),
    );

  const hasAttribute = skus.some((s) => (s.attributeValues ?? []).length > 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Header + add button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {skus.length > 0
            ? `${skus.length} varian / SKU`
            : "Belum ada SKU. Tambahkan minimal satu varian."}
        </p>
        {!readonly && (
          <Button type="button" size="sm" className="rounded-lg" onClick={addSku}>
            <Plus className="mr-1.5 size-4" />
            Tambah SKU
          </Button>
        )}
      </div>

      {skus.length === 0 ? (
        <div className="flex min-h-[6rem] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {readonly
              ? "Produk ini tidak memiliki varian / SKU."
              : 'Klik "Tambah SKU" untuk menambahkan varian pertama.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {skus.map((sku, skuIndex) => (
            <div
              key={skuIndex}
              className="overflow-hidden rounded-xl border border-border/70"
            >
              {/* SKU header */}
              <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span className="flex size-6 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-xs font-bold text-primary">
                    {skuIndex + 1}
                  </span>
                  Varian {skuIndex + 1}
                </span>
                {!readonly && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeSku(skuIndex)}
                    className="h-8 w-8 rounded-lg p-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    title="Hapus varian"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>

              {/* SKU body */}
              <div className="space-y-4 px-4 py-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <FieldInput
                      label="SKU Code"
                      required
                      value={sku.skuCode}
                      disabled={readonly}
                      onChange={(e) =>
                        patchSku(skuIndex, { skuCode: e.target.value })
                      }
                      placeholder="UX3405-U7-32"
                    />
                  </div>
                  <div>
                    <FieldInput
                      label="Nama Varian"
                      required
                      value={sku.variantName}
                      disabled={readonly}
                      onChange={(e) =>
                        patchSku(skuIndex, { variantName: e.target.value })
                      }
                      placeholder="Core Ultra 7 / 32GB"
                    />
                  </div>
                  <div>
                    <FieldInput
                      label="Harga"
                      required
                      type="number"
                      min={0}
                      step="any"
                      value={sku.price}
                      disabled={readonly}
                      onChange={(e) =>
                        patchSku(skuIndex, { price: e.target.value })
                      }
                      placeholder="12999000"
                    />
                  </div>
                </div>

                {/* Attribute values sub-table */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      Attribute
                    </p>
                    {!readonly && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => addAttributeValue(skuIndex)}
                      >
                        <Plus className="mr-1.5 size-4" />
                        Tambah Attribute
                      </Button>
                    )}
                  </div>

                  {(sku.attributeValues ?? []).length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/70 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
                      {readonly
                        ? "Tidak ada attribute untuk varian ini."
                        : "Belum ada attribute. Tambahkan pasangan attribute-value (mis. RAM → 32GB)."}
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-border/70">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/2">Attribute</TableHead>
                            <TableHead>Nilai</TableHead>
                            {!readonly && <TableHead className="w-12" />}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(sku.attributeValues ?? []).map((av, avIndex) => (
                            <TableRow key={avIndex}>
                              <TableCell>
                                <FieldSelectAdd
                                  name={`attribute-${skuIndex}-${avIndex}`}
                                  searchable
                                  placeholder="Pilih attribute..."
                                  value={av.attributeId || null}
                                  disabled={readonly}
                                  onValueChange={(val) =>
                                    patchAttributeValue(skuIndex, avIndex, {
                                      attributeId: val,
                                    })
                                  }
                                  queryKey={["attributes"]}
                                  queryFn={async ({
                                    search = "",
                                  }: { search?: string } = {}) => {
                                    const { items } = await getAttributesList({
                                      search,
                                      no_pagination: true,
                                    });
                                    return items;
                                  }}
                                  mapOption={(attr) => ({
                                    label: attr.name,
                                    value: attr.id,
                                  })}
                                  createFn={(input) =>
                                    createAttribute({ name: input }).then(
                                      (r) => r!,
                                    )
                                  }
                                  createLabel="+ Tambah"
                                  onCreated={(item) =>
                                    patchAttributeValue(skuIndex, avIndex, {
                                      attributeId: item.id,
                                    })
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <FieldInput
                                  value={av.value}
                                  disabled={readonly}
                                  onChange={(e) =>
                                    patchAttributeValue(skuIndex, avIndex, {
                                      value: e.target.value,
                                    })
                                  }
                                  placeholder={hasAttribute ? "32GB" : "nilai attribute"}
                                />
                              </TableCell>
                              {!readonly && (
                                <TableCell className="w-12">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() =>
                                      removeAttributeValue(skuIndex, avIndex)
                                    }
                                    className="h-8 w-8 rounded-lg p-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    title="Hapus attribute"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Read-only hint about variant constraint in edit mode */}
      {!readonly && (
        <Badge variant="secondary" className="w-fit">
          Setiap varian membutuhkan SKU code, nama varian, dan harga.
        </Badge>
      )}
    </div>
  );
}

export { SkusBuilder };
