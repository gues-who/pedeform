import { Injectable } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { MenuCategoryId, SharedMenuItem } from '@pedeform/shared';
import { MockDataStore } from '../mock/mock-data.store';
import { promises as fs } from 'node:fs';
import path from 'node:path';

interface CreateMenuItemInput {
  id?: string;
  category: MenuCategoryId;
  name: string;
  description: string;
  priceCents: number;
  sommelierNote?: string;
  imageGradient?: string;
  imageUrl?: string;
}

interface UpdateMenuItemInput {
  category?: MenuCategoryId;
  name?: string;
  description?: string;
  priceCents?: number;
  sommelierNote?: string;
  imageGradient?: string;
  imageUrl?: string;
}

@Injectable()
export class MenuService {
  constructor(private readonly store: MockDataStore) {}

  getCategories() {
    return this.store.menuCategories;
  }

  getItems(category?: string) {
    if (category) {
      return this.store.menuItems.filter((i) => i.category === category);
    }
    return this.store.menuItems;
  }

  createItem(dto: CreateMenuItemInput) {
    if (!dto.name?.trim())
      throw new BadRequestException('Nome do produto é obrigatório.');
    if (!dto.description?.trim())
      throw new BadRequestException('Descrição do produto é obrigatória.');
    if (!Number.isFinite(dto.priceCents) || dto.priceCents <= 0) {
      throw new BadRequestException('priceCents deve ser um número positivo.');
    }
    const id = this.normalizeId(dto.id || dto.name);
    if (!id) throw new BadRequestException('ID inválido para o produto.');
    if (this.store.menuItems.some((item) => item.id === id)) {
      throw new BadRequestException(`Já existe um produto com id "${id}".`);
    }
    const item: SharedMenuItem = {
      id,
      category: dto.category,
      name: dto.name.trim(),
      description: dto.description.trim(),
      priceCents: Math.round(dto.priceCents),
      sommelierNote: dto.sommelierNote?.trim() || undefined,
      imageGradient:
        dto.imageGradient?.trim() || 'from-zinc-900/40 to-zinc-950',
      imageUrl: dto.imageUrl?.trim() || undefined,
    };
    return this.store.addMenuItem(item);
  }

  updateItem(id: string, dto: UpdateMenuItemInput) {
    const patch: Partial<Omit<SharedMenuItem, 'id'>> = {};
    if (dto.category) patch.category = dto.category;
    if (dto.name !== undefined) {
      const value = dto.name.trim();
      if (!value)
        throw new BadRequestException('Nome do produto é obrigatório.');
      patch.name = value;
    }
    if (dto.description !== undefined) {
      const value = dto.description.trim();
      if (!value)
        throw new BadRequestException('Descrição do produto é obrigatória.');
      patch.description = value;
    }
    if (dto.priceCents !== undefined) {
      if (!Number.isFinite(dto.priceCents) || dto.priceCents <= 0) {
        throw new BadRequestException(
          'priceCents deve ser um número positivo.',
        );
      }
      patch.priceCents = Math.round(dto.priceCents);
    }
    if (dto.sommelierNote !== undefined) {
      patch.sommelierNote = dto.sommelierNote.trim() || undefined;
    }
    if (dto.imageGradient !== undefined) {
      patch.imageGradient =
        dto.imageGradient.trim() || 'from-zinc-900/40 to-zinc-950';
    }
    if (dto.imageUrl !== undefined) {
      patch.imageUrl = dto.imageUrl.trim() || undefined;
    }
    const updated = this.store.updateMenuItem(id, patch);
    if (!updated) throw new NotFoundException('Produto não encontrado.');
    return updated;
  }

  deleteItem(id: string) {
    const deleted = this.store.deleteMenuItem(id);
    if (!deleted) throw new NotFoundException('Produto não encontrado.');
    return { ok: true, deletedId: id };
  }

  async uploadPhoto(id: string, fileName: string, dataUrl: string) {
    const item = this.store.menuItems.find((menuItem) => menuItem.id === id);
    if (!item) throw new NotFoundException('Produto não encontrado.');
    if (!dataUrl.startsWith('data:image/')) {
      throw new BadRequestException(
        'Arquivo inválido. Envie uma imagem válida.',
      );
    }

    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) throw new BadRequestException('Formato de upload inválido.');

    const [, mimeType, base64Body] = match;
    const ext = this.extFromMime(mimeType);
    const safeName = this.normalizeId(fileName || item.name || id) || id;
    const file = `${id}-${safeName}-${Date.now()}.${ext}`;
    const destinationDir = path.resolve(
      process.cwd(),
      '..',
      'web',
      'public',
      'uploads',
      'menu',
    );
    const destinationPath = path.join(destinationDir, file);

    await fs.mkdir(destinationDir, { recursive: true });
    await fs.writeFile(destinationPath, Buffer.from(base64Body, 'base64'));

    const imageUrl = `/uploads/menu/${file}`;
    const updated = this.store.updateMenuItem(id, { imageUrl });
    if (!updated) throw new NotFoundException('Produto não encontrado.');
    return updated;
  }

  private normalizeId(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private extFromMime(mime: string) {
    switch (mime) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      case 'image/avif':
        return 'avif';
      default:
        throw new BadRequestException(
          `Formato de imagem não suportado: ${mime}`,
        );
    }
  }
}
