import { Ticket, TicketStatus, TicketType } from '../types';
import { tickets, getTicketById } from '../mocks/tickets';

const LATENCY = 420;

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface TicketFilter {
  type?: TicketType;
  status?: TicketStatus;
  organizationId?: string;
}

export const ticketService = {
  async list(filter: TicketFilter = {}): Promise<Ticket[]> {
    let result = [...tickets];
    if (filter.type) result = result.filter((t) => t.type === filter.type);
    if (filter.status) result = result.filter((t) => t.status === filter.status);
    if (filter.organizationId) result = result.filter((t) => t.organizationId === filter.organizationId);
    return delay(result);
  },
  async get(id: string): Promise<Ticket | undefined> {
    return delay(getTicketById(id));
  },
};
