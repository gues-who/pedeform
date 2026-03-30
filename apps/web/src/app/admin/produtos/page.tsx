"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { MenuCategoryId, SharedMenuItem } from "@pedeform/shared";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { MENU_CATEGORIES, formatBRL } from "@/data/mock-menu";
import {
  createMenuItem,
  deleteMenuItem,
  fetchMenuItems,
  updateMenuItem,
  uploadMenuItemPhoto,
} from "@/lib/api-client";

type ProductFormState = {
  id: string;
  category: MenuCategoryId;
  name: string;
  description: string;
  price: string;
  sommelierNote: string;
  imageGradient: string;
};

const DEFAULT_FORM: ProductFormState = {
  id: "",
  category: "entradas",
  name: "",
  description: "",
  price: "",
  sommelierNote: "",
  imageGradient: "from-zinc-900/40 to-zinc-950",
};

function centsToInput(value: number) {
  return (value / 100).toFixed(2).replace(".", ",");
}

function inputToCents(value: string) {
  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100);
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Falha ao ler arquivo."));
    reader.readAsDataURL(file);
  });
}

function toForm(item: SharedMenuItem): ProductFormState {
  return {
    id: item.id,
    category: item.category,
    name: item.name,
    description: item.description,
    price: centsToInput(item.priceCents),
    sommelierNote: item.sommelierNote ?? "",
    imageGradient: item.imageGradient,
  };
}

export default function AdminProdutosPage() {
  const [items, setItems] = useState<SharedMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ProductFormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProductFormState | null>(null);
  const [busyById, setBusyById] = useState<Record<string, boolean>>({});

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const category = a.category.localeCompare(b.category);
        if (category !== 0) return category;
        return a.name.localeCompare(b.name);
      }),
    [items],
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMenuItems();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateCreateField = (field: keyof ProductFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateEditField = (field: keyof ProductFormState, value: string) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const markBusy = (id: string, value: boolean) => {
    setBusyById((prev) => ({ ...prev, [id]: value }));
  };

  const clearFeedback = () => {
    setMessage(null);
    setError(null);
  };

  const handleCreate = async () => {
    clearFeedback();
    const priceCents = inputToCents(form.price);
    if (!priceCents) {
      setError("Preço inválido. Use um valor maior que zero.");
      return;
    }

    setSaving(true);
    try {
      const created = await createMenuItem({
        id: form.id.trim() || undefined,
        category: form.category,
        name: form.name,
        description: form.description,
        priceCents,
        sommelierNote: form.sommelierNote || undefined,
        imageGradient: form.imageGradient || undefined,
      });
      setItems((prev) => [created, ...prev]);
      setForm(DEFAULT_FORM);
      setMessage("Produto adicionado.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível adicionar produto.");
    } finally {
      setSaving(false);
    }
  };

  const beginEdit = (item: SharedMenuItem) => {
    clearFeedback();
    setEditingId(item.id);
    setEditForm(toForm(item));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editForm) return;
    clearFeedback();
    const priceCents = inputToCents(editForm.price);
    if (!priceCents) {
      setError("Preço inválido. Use um valor maior que zero.");
      return;
    }

    markBusy(id, true);
    try {
      const updated = await updateMenuItem(id, {
        category: editForm.category,
        name: editForm.name,
        description: editForm.description,
        priceCents,
        sommelierNote: editForm.sommelierNote || undefined,
        imageGradient: editForm.imageGradient || undefined,
      });
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setMessage("Produto atualizado.");
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível atualizar produto.");
    } finally {
      markBusy(id, false);
    }
  };

  const handleDelete = async (id: string) => {
    clearFeedback();
    if (!window.confirm("Excluir este produto?")) return;
    markBusy(id, true);
    try {
      await deleteMenuItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) cancelEdit();
      setMessage("Produto removido.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível excluir produto.");
    } finally {
      markBusy(id, false);
    }
  };

  const handleUpload = async (id: string, file: File | null) => {
    clearFeedback();
    if (!file) return;
    markBusy(id, true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const updated = await uploadMenuItemPhoto(id, {
        fileName: file.name,
        dataUrl,
      });
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      if (editingId === id && editForm) {
        setEditForm(toForm(updated));
      }
      setMessage(`Foto atualizada para ${updated.name}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no upload da foto.");
    } finally {
      markBusy(id, false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Produtos
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Adicione, edite, exclua e envie fotos dos itens do cardápio.
          </p>
        </div>
        <Badge tone="success">Mock ativo</Badge>
      </header>

      {message ? (
        <p className="rounded-xl border border-emerald-300/60 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-red-300/70 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700/70 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <Card>
        <CardTitle>Novo produto</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input
            label="ID (opcional)"
            placeholder="ex.: risoto-camaroes"
            value={form.id}
            onChange={(e) => updateCreateField("id", e.target.value)}
          />
          <Select
            label="Categoria"
            value={form.category}
            onChange={(e) => updateCreateField("category", e.target.value as MenuCategoryId)}
          >
            {MENU_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </Select>
          <Input
            label="Nome"
            placeholder="Nome do produto"
            value={form.name}
            onChange={(e) => updateCreateField("name", e.target.value)}
          />
          <Input
            label="Preço (R$)"
            placeholder="0,00"
            value={form.price}
            onChange={(e) => updateCreateField("price", e.target.value)}
          />
          <Input
            className="md:col-span-2"
            label="Descrição"
            placeholder="Descrição do prato"
            value={form.description}
            onChange={(e) => updateCreateField("description", e.target.value)}
          />
          <Input
            className="md:col-span-2"
            label="Nota do sommelier (opcional)"
            placeholder="Sugestão de harmonização"
            value={form.sommelierNote}
            onChange={(e) => updateCreateField("sommelierNote", e.target.value)}
          />
          <Input
            className="md:col-span-2"
            label="Gradiente fallback"
            value={form.imageGradient}
            onChange={(e) => updateCreateField("imageGradient", e.target.value)}
          />
        </div>
        <div className="mt-4">
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? "Salvando..." : "Adicionar produto"}
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Itens cadastrados</CardTitle>
        {loading ? (
          <p className="mt-4 text-sm text-zinc-500">Carregando produtos...</p>
        ) : sortedItems.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">Nenhum produto encontrado.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {sortedItems.map((item) => {
              const editing = editingId === item.id && editForm;
              const busy = !!busyById[item.id];
              return (
                <li
                  key={item.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">{item.category}</p>
                      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</h2>
                      <p className="text-sm text-zinc-500">ID: {item.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{formatBRL(item.priceCents)}</p>
                      <p className="text-xs text-zinc-500">{item.imageUrl ? "com foto" : "sem foto"}</p>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{item.description}</p>
                  {item.sommelierNote ? (
                    <p className="mt-1 text-xs text-zinc-500">Sommelier: {item.sommelierNote}</p>
                  ) : null}

                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={800}
                      height={320}
                      unoptimized
                      className="mt-3 h-32 w-full rounded-xl object-cover"
                    />
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => beginEdit(item)} disabled={busy}>
                      Editar
                    </Button>
                    <Button variant="ghost" onClick={() => void handleDelete(item.id)} disabled={busy}>
                      Excluir
                    </Button>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900">
                      Upload de foto
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => void handleUpload(item.id, e.target.files?.[0] ?? null)}
                        disabled={busy}
                      />
                    </label>
                  </div>

                  {editing ? (
                    <div className="mt-4 grid gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                      <Select
                        label="Categoria"
                        value={editForm.category}
                        onChange={(e) => updateEditField("category", e.target.value as MenuCategoryId)}
                      >
                        {MENU_CATEGORIES.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.label}
                          </option>
                        ))}
                      </Select>
                      <Input
                        label="Nome"
                        value={editForm.name}
                        onChange={(e) => updateEditField("name", e.target.value)}
                      />
                      <Input
                        label="Preço (R$)"
                        value={editForm.price}
                        onChange={(e) => updateEditField("price", e.target.value)}
                      />
                      <Input
                        label="Descrição"
                        value={editForm.description}
                        onChange={(e) => updateEditField("description", e.target.value)}
                      />
                      <Input
                        label="Sommelier (opcional)"
                        value={editForm.sommelierNote}
                        onChange={(e) => updateEditField("sommelierNote", e.target.value)}
                      />
                      <Input
                        label="Gradiente fallback"
                        value={editForm.imageGradient}
                        onChange={(e) => updateEditField("imageGradient", e.target.value)}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => void handleSaveEdit(item.id)} disabled={busy}>
                          Salvar alterações
                        </Button>
                        <Button variant="ghost" onClick={cancelEdit} disabled={busy}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
