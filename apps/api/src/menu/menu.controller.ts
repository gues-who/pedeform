import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { MenuCategoryId } from '@pedeform/shared';
import { MenuService } from './menu.service';

interface CreateMenuItemDto {
  id?: string;
  category: MenuCategoryId;
  name: string;
  description: string;
  priceCents: number;
  sommelierNote?: string;
  imageGradient?: string;
  imageUrl?: string;
}

interface UpdateMenuItemDto {
  category?: MenuCategoryId;
  name?: string;
  description?: string;
  priceCents?: number;
  sommelierNote?: string;
  imageGradient?: string;
  imageUrl?: string;
}

interface UploadMenuPhotoDto {
  fileName: string;
  dataUrl: string;
}

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('categories')
  getCategories() {
    return this.menuService.getCategories();
  }

  @Get('items')
  getItems(@Query('category') category?: string) {
    return this.menuService.getItems(category);
  }

  @Post('items')
  createItem(@Body() dto: CreateMenuItemDto) {
    return this.menuService.createItem(dto);
  }

  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuService.updateItem(id, dto);
  }

  @Delete('items/:id')
  deleteItem(@Param('id') id: string) {
    return this.menuService.deleteItem(id);
  }

  @Post('items/:id/photo')
  uploadPhoto(@Param('id') id: string, @Body() dto: UploadMenuPhotoDto) {
    return this.menuService.uploadPhoto(id, dto.fileName, dto.dataUrl);
  }
}
