import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MockDataStore } from '../mock/mock-data.store';

@Injectable()
export class TablesService {
  constructor(private readonly store: MockDataStore) {}

  getTables() {
    return this.store.tables;
  }

  getTable(id: string) {
    const table = this.store.findTable(id);
    if (!table) throw new NotFoundException(`Mesa ${id} não encontrada`);
    return table;
  }

  listReservations() {
    return this.store.reservations;
  }

  reserveTable(
    tableId: string,
    input: {
      guestName: string;
      guests: number;
      reservedFor: string;
      notes?: string;
    },
  ) {
    const table = this.store.findTable(tableId);
    if (!table) throw new NotFoundException(`Mesa ${tableId} não encontrada`);
    if (table.status !== 'livre' && table.status !== 'reservada') {
      throw new BadRequestException(
        'Mesa indisponível para reserva neste momento.',
      );
    }
    if (!input.guestName?.trim()) {
      throw new BadRequestException('Nome do responsável é obrigatório.');
    }
    if (!Number.isFinite(input.guests) || input.guests < 1) {
      throw new BadRequestException('Quantidade de convidados inválida.');
    }
    if (!input.reservedFor || Number.isNaN(Date.parse(input.reservedFor))) {
      throw new BadRequestException('Data/hora da reserva inválida.');
    }

    table.status = 'reservada';
    table.convidados = Math.round(input.guests);
    table.tempoMinutos = null;

    return this.store.createReservation({
      tableId,
      guestName: input.guestName.trim(),
      guests: Math.round(input.guests),
      reservedFor: new Date(input.reservedFor).toISOString(),
      notes: input.notes?.trim() || undefined,
    });
  }
}
